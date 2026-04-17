import { describe, it, expect } from 'vitest';

// Fee calculation functions (mirroring src/config/fee-config.ts)
function computePerformanceFee(yieldAmount: number, feeBps: number = 1000): number {
  return yieldAmount * (feeBps / 10_000);
}

function computeManagementFee(tvl: number, daysElapsed: number, feeBps: number = 50): number {
  return tvl * (feeBps / 10_000) * (daysElapsed / 365);
}

function computeWithdrawalFee(amount: number, feeBps: number = 10): number {
  return amount * (feeBps / 10_000);
}

describe('Fee Calculations', () => {
  it('computes 10% performance fee correctly', () => {
    const fee = computePerformanceFee(10_000, 1000);
    expect(fee).toBe(1000);
  });

  it('computes 0.5% annual management fee correctly', () => {
    const fee = computeManagementFee(1_000_000, 365, 50);
    expect(fee).toBeCloseTo(5000, 0);
  });

  it('computes management fee proportionally for partial year', () => {
    const fullYear = computeManagementFee(1_000_000, 365, 50);
    const halfYear = computeManagementFee(1_000_000, 182.5, 50);
    expect(halfYear).toBeCloseTo(fullYear / 2, 0);
  });

  it('computes 0.1% withdrawal fee correctly', () => {
    const fee = computeWithdrawalFee(100_000, 10);
    expect(fee).toBe(100);
  });

  it('handles zero amounts', () => {
    expect(computePerformanceFee(0)).toBe(0);
    expect(computeManagementFee(0, 365)).toBe(0);
    expect(computeWithdrawalFee(0)).toBe(0);
  });

  it('fee invariant: performance fee < yield', () => {
    for (let yield_amount = 100; yield_amount <= 100_000; yield_amount *= 10) {
      const fee = computePerformanceFee(yield_amount, 1000);
      expect(fee).toBeLessThan(yield_amount);
    }
  });

  it('fee invariant: management fee grows linearly with time', () => {
    const fee30 = computeManagementFee(1_000_000, 30, 50);
    const fee60 = computeManagementFee(1_000_000, 60, 50);
    expect(fee60).toBeCloseTo(fee30 * 2, 2);
  });
});
