import { AlertManager, AlertSeverity, AlertType } from './alert-manager';
import { CircuitBreaker } from '../circuit-breaker/circuit-breaker';

export enum DrawdownLevel {
  NORMAL = 'normal',
  WATCH = 'watch',
  CAUTION = 'caution',
  WARNING = 'warning',
  CRITICAL = 'critical',
  CIRCUIT_BREAKER = 'circuit_breaker',
}

export interface DrawdownThreshold {
  level: DrawdownLevel;
  pct: number;
  action: string;
}

export const DRAWDOWN_THRESHOLDS: DrawdownThreshold[] = [
  { level: DrawdownLevel.WATCH, pct: 0.005, action: 'Alert team, increase monitoring to 1-min' },
  { level: DrawdownLevel.CAUTION, pct: 0.01, action: 'Shift 15% from highest-risk to Ondo USDY' },
  { level: DrawdownLevel.WARNING, pct: 0.015, action: 'Shift 30% to Ondo USDY, pause new CLMM positions' },
  { level: DrawdownLevel.CRITICAL, pct: 0.02, action: 'Emergency exit all DeFi, 100% to Ondo USDY' },
  { level: DrawdownLevel.CIRCUIT_BREAKER, pct: 0.025, action: 'Full vault pause, manual review required' },
];

export interface DrawdownStatus {
  currentNav: number;
  highWaterMark: number;
  drawdownPct: number;
  level: DrawdownLevel;
  lastUpdated: number;
  navHistory: Array<{ timestamp: number; nav: number }>;
}

export interface DrawdownAction {
  level: DrawdownLevel;
  action: 'alert_only' | 'reduce_exposure' | 'pause_new_positions' | 'emergency_exit' | 'full_pause';
  shiftPct?: number;
  targetProtocol?: string;
}

export class DrawdownTracker {
  private highWaterMark: number = 0;
  private currentNav: number = 0;
  private currentLevel: DrawdownLevel = DrawdownLevel.NORMAL;
  private navHistory: Array<{ timestamp: number; nav: number }> = [];
  private readonly maxHistoryLength = 1440; // 24h at 1-min intervals
  private alertManager: AlertManager;
  private circuitBreaker: CircuitBreaker;
  private actionCallbacks: Array<(action: DrawdownAction) => void> = [];
  private lastAlertLevel: DrawdownLevel = DrawdownLevel.NORMAL;

  constructor(alertManager: AlertManager, circuitBreaker: CircuitBreaker, initialNav?: number) {
    this.alertManager = alertManager;
    this.circuitBreaker = circuitBreaker;
    if (initialNav && initialNav > 0) {
      this.highWaterMark = initialNav;
      this.currentNav = initialNav;
      this.navHistory.push({ timestamp: Date.now(), nav: initialNav });
    }
  }

  onAction(callback: (action: DrawdownAction) => void): void {
    this.actionCallbacks.push(callback);
  }

  updateNav(nav: number): DrawdownAction | null {
    if (nav <= 0) return null;

    this.currentNav = nav;
    this.navHistory.push({ timestamp: Date.now(), nav });

    if (this.navHistory.length > this.maxHistoryLength) {
      this.navHistory = this.navHistory.slice(-this.maxHistoryLength);
    }

    if (nav > this.highWaterMark) {
      this.highWaterMark = nav;
    }

    const drawdownPct = this.highWaterMark > 0
      ? (this.highWaterMark - nav) / this.highWaterMark
      : 0;

    const previousLevel = this.currentLevel;
    this.currentLevel = this.computeLevel(drawdownPct);

    if (this.currentLevel !== DrawdownLevel.NORMAL && this.currentLevel !== previousLevel) {
      const action = this.triggerAction(this.currentLevel, drawdownPct);
      return action;
    }

    if (this.currentLevel === DrawdownLevel.NORMAL && previousLevel !== DrawdownLevel.NORMAL) {
      this.lastAlertLevel = DrawdownLevel.NORMAL;
      this.alertManager.sendAlert({
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.INFO,
        title: 'Drawdown recovered',
        message: `NAV recovered above high-water mark region. Current: $${nav.toFixed(2)}, HWM: $${this.highWaterMark.toFixed(2)}`,
        data: { nav, highWaterMark: this.highWaterMark, drawdownPct },
      });
    }

    return null;
  }

  private computeLevel(drawdownPct: number): DrawdownLevel {
    for (let i = DRAWDOWN_THRESHOLDS.length - 1; i >= 0; i--) {
      if (drawdownPct >= DRAWDOWN_THRESHOLDS[i].pct) {
        return DRAWDOWN_THRESHOLDS[i].level;
      }
    }
    return DrawdownLevel.NORMAL;
  }

  private triggerAction(level: DrawdownLevel, drawdownPct: number): DrawdownAction {
    const threshold = DRAWDOWN_THRESHOLDS.find(t => t.level === level)!;
    let action: DrawdownAction;

    switch (level) {
      case DrawdownLevel.WATCH:
        action = { level, action: 'alert_only' };
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_WARNING,
          severity: AlertSeverity.WARNING,
          title: `Drawdown WATCH: ${(drawdownPct * 100).toFixed(2)}%`,
          message: threshold.action,
          data: { drawdownPct, nav: this.currentNav, highWaterMark: this.highWaterMark },
        });
        break;

      case DrawdownLevel.CAUTION:
        action = { level, action: 'reduce_exposure', shiftPct: 15, targetProtocol: 'ondo_usdy' };
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_WARNING,
          severity: AlertSeverity.WARNING,
          title: `Drawdown CAUTION: ${(drawdownPct * 100).toFixed(2)}%`,
          message: threshold.action,
          data: { drawdownPct, nav: this.currentNav, highWaterMark: this.highWaterMark, shiftPct: 15 },
        });
        break;

      case DrawdownLevel.WARNING:
        action = { level, action: 'pause_new_positions', shiftPct: 30, targetProtocol: 'ondo_usdy' };
        this.alertManager.sendAlert({
          type: AlertType.HEALTH_CRITICAL,
          severity: AlertSeverity.CRITICAL,
          title: `Drawdown WARNING: ${(drawdownPct * 100).toFixed(2)}%`,
          message: threshold.action,
          data: { drawdownPct, nav: this.currentNav, highWaterMark: this.highWaterMark, shiftPct: 30 },
        });
        break;

      case DrawdownLevel.CRITICAL:
        action = { level, action: 'emergency_exit', shiftPct: 100, targetProtocol: 'ondo_usdy' };
        this.alertManager.sendAlert({
          type: AlertType.EMERGENCY_PAUSE,
          severity: AlertSeverity.EMERGENCY,
          title: `Drawdown CRITICAL: ${(drawdownPct * 100).toFixed(2)}%`,
          message: threshold.action,
          data: { drawdownPct, nav: this.currentNav, highWaterMark: this.highWaterMark },
        });
        break;

      case DrawdownLevel.CIRCUIT_BREAKER:
        action = { level, action: 'full_pause' };
        this.circuitBreaker.emergencyPause(
          `Drawdown circuit breaker: ${(drawdownPct * 100).toFixed(2)}% exceeds 2.5% threshold`
        );
        this.alertManager.sendAlert({
          type: AlertType.CIRCUIT_BREAKER_TRIP,
          severity: AlertSeverity.EMERGENCY,
          title: `CIRCUIT BREAKER: ${(drawdownPct * 100).toFixed(2)}% drawdown`,
          message: threshold.action,
          data: { drawdownPct, nav: this.currentNav, highWaterMark: this.highWaterMark },
        });
        break;

      default:
        action = { level, action: 'alert_only' };
    }

    this.lastAlertLevel = level;

    for (const cb of this.actionCallbacks) {
      try { cb(action); } catch {}
    }

    return action;
  }

  resetHighWaterMark(nav: number): void {
    this.highWaterMark = nav;
    this.currentNav = nav;
    this.currentLevel = DrawdownLevel.NORMAL;
    this.lastAlertLevel = DrawdownLevel.NORMAL;
  }

  getStatus(): DrawdownStatus {
    const drawdownPct = this.highWaterMark > 0
      ? (this.highWaterMark - this.currentNav) / this.highWaterMark
      : 0;

    return {
      currentNav: this.currentNav,
      highWaterMark: this.highWaterMark,
      drawdownPct,
      level: this.currentLevel,
      lastUpdated: Date.now(),
      navHistory: this.navHistory.slice(-60),
    };
  }
}
