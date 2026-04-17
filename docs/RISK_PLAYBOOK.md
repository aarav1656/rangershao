# Risk Playbook

Operational procedures for risk scenarios in Ranger vault.

## Five-Tier Drawdown Response

| Tier | Trigger | Action | Automated |
|------|---------|--------|-----------|
| Watch | 0.5% drawdown | Increase monitoring frequency to 5min, alert team | Yes |
| Reduce | 1.0% drawdown | Shift 20% allocation to Ondo USDY (treasury floor) | Yes |
| Defensive | 2.0% drawdown | Exit all DeFi positions, 100% to USDY | Yes |
| Emergency | 3.0% drawdown | Pause vault, halt all keeper operations | Yes |
| Halt | 5.0% drawdown | Emergency admin intervention, manual recovery | Manual |

## Scenario 1: Protocol Exploit (e.g., Kamino lending exploit)

**Detection**: Circuit breaker TVL-drop check detects >15% TVL decline in a single protocol within one keeper cycle.

**Automated response**:
1. Circuit breaker trips, blocking any new deposits to the affected protocol
2. Keeper initiates emergency withdrawal from affected strategy
3. Funds routed to Ondo USDY (lowest-risk position)
4. Alert emitted via webhook

**Manual escalation**: If automated withdrawal fails (e.g., protocol contract paused), admin uses emergency endpoint (`POST /api/security/emergency`) with Bearer token to force vault pause.

**Recovery**: Once protocol is confirmed safe, admin can re-enable the strategy and keeper resumes normal allocation.

## Scenario 2: USDC Depeg

**Detection**: Depeg monitor (`security/monitoring/depeg-monitor.ts`) polls Pyth USDC/USD oracle and Hermes API. Triggers if price deviates >0.5% from $1.00.

**Automated response**:
1. Circuit breaker rate-anomaly check detects abnormal pricing
2. All rebalance operations halted immediately
3. No new deposits accepted
4. Existing positions held (selling during depeg would crystallize losses)

**Manual escalation**: If depeg exceeds 2%, admin evaluates whether to withdraw to a stable alternative or hold positions.

**Recovery**: When oracle price returns to $0.995-$1.005 range for 30+ minutes, normal operations resume automatically.

## Scenario 3: Ondo USDY Depeg / RWA Risk

**Detection**: USDY yield drops below 2% (normally 4-5%) or USDY price deviates from expected NAV.

**Automated response**:
1. Regime detection shifts to RATE_COMPRESSION allocation
2. USDY allocation reduced from 28% to minimum (10%)
3. Excess capital redistributed to lending protocols

**Manual escalation**: If USDY becomes illiquid or redemption gates activate, admin pauses USDY strategy entirely.

## Scenario 4: Keeper Bot Failure

**Impact**: Rebalances stop. Funds remain in current positions (safe, but not optimally allocated).

**Detection**: Health endpoint (`GET /api/security/status`) returns unhealthy if no rebalance in >2 hours.

**Response**: 
1. Restart keeper service
2. If persistent failure, fallback to manual rebalance via deployment scripts
3. Cobo MPC signing remains available for manual transactions

**Key point**: Keeper failure is a liveness issue, not a custody issue. Funds cannot be stolen because signing is externalized to Cobo MPC with policy constraints.

## Scenario 5: High Gas / Network Congestion

**Detection**: Transaction simulation shows CU cost exceeding safety limits.

**Automated response**:
1. Keeper retries with exponential backoff (3 attempts)
2. If all retries fail, rebalance is deferred to next cycle (30 min)
3. Priority fee adjustment based on network conditions

**No risk to funds**: Failed transactions don't execute, positions stay unchanged.

## Circuit Breaker Checks

The circuit breaker runs 9 independent checks before every rebalance:

1. **Health factor** - protocol-level health factor above 1.05
2. **TVL stability** - no sudden TVL drops in underlying protocols
3. **Rate anomaly** - APY rates within expected bounds
4. **Exposure limits** - no single protocol exceeds 60% allocation
5. **Drawdown threshold** - portfolio drawdown within tier limits
6. **Depeg monitor** - USDC price within acceptable range
7. **Volume check** - rolling 24h volume within normal bounds
8. **Cooldown period** - minimum time between rebalances respected
9. **Simulation check** - transaction simulation succeeds before broadcast

If any check fails, the rebalance is blocked and an alert is emitted.

## Emergency Procedures

### Emergency Endpoint
```
POST /api/security/emergency
Authorization: Bearer <EMERGENCY_SECRET>
Content-Type: application/json

{"action": "pause" | "resume" | "emergency_withdraw"}
```

### Manual Recovery Checklist
1. Verify the threat is real (check Solscan, protocol dashboards)
2. Pause keeper via emergency endpoint
3. Assess current positions via vault health check script
4. If funds at risk, execute emergency withdrawal via Cobo MPC
5. Document incident and timeline
6. Resume operations only after root cause identified

## File References

| File | Purpose |
|------|---------|
| `security/circuit-breaker/circuit-breaker.ts` | 9-check circuit breaker |
| `security/monitoring/depeg-monitor.ts` | USDC price monitoring |
| `security/monitoring/helius-webhook.ts` | On-chain event monitoring |
| `src/app/api/security/emergency/route.ts` | Emergency control endpoint |
| `src/app/api/security/status/route.ts` | Health status endpoint |
| `src/keeper/services/keeper-loop.ts` | Keeper orchestration |
| `security/cobo/cobo-mpc-client.ts` | MPC signing client |
