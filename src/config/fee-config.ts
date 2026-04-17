export interface FeeConfig {
  performanceFeeBps: number;
  managementFeeBps: number;
  withdrawalFeeBps: number;
  feeRecipient: string;
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  performanceFeeBps: 2_000,
  managementFeeBps: 200,
  withdrawalFeeBps: 10,
  feeRecipient: "",
};

const BPS_DENOMINATOR = 10_000;
const DAYS_PER_YEAR = 365;

export function computePerformanceFee(
  profitAmount: number,
  feeConfig: FeeConfig = DEFAULT_FEE_CONFIG
): number {
  if (profitAmount <= 0) {
    return 0;
  }

  return (profitAmount * feeConfig.performanceFeeBps) / BPS_DENOMINATOR;
}

export function computeManagementFee(
  assetsUnderManagement: number,
  elapsedDays: number,
  feeConfig: FeeConfig = DEFAULT_FEE_CONFIG
): number {
  if (assetsUnderManagement <= 0 || elapsedDays <= 0) {
    return 0;
  }

  const annualFeeRate = feeConfig.managementFeeBps / BPS_DENOMINATOR;
  return assetsUnderManagement * annualFeeRate * (elapsedDays / DAYS_PER_YEAR);
}

export function computeWithdrawalFee(
  withdrawalAmount: number,
  feeConfig: FeeConfig = DEFAULT_FEE_CONFIG
): number {
  if (withdrawalAmount <= 0) {
    return 0;
  }

  return (withdrawalAmount * feeConfig.withdrawalFeeBps) / BPS_DENOMINATOR;
}
