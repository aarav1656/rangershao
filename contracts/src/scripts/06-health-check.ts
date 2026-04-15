import { PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { getConnection } from "../utils/connection";
import * as dotenv from "dotenv";

dotenv.config();

interface HealthReport {
  vaultAddress: string;
  totalValue: number;
  strategies: Array<{
    strategyId: string;
    amount: number;
    percentage: string;
  }>;
  assetPerLp: string;
  pendingWithdrawals: number;
  riskFlags: string[];
}

const MAX_SINGLE_STRATEGY_PCT = 60;
const MIN_STRATEGIES_ACTIVE = 2;

const main = async () => {
  const vaultAddr = process.env.VAULT_ADDRESS;
  if (!vaultAddr) throw new Error("VAULT_ADDRESS not set");

  const connection = getConnection();
  const vc = new VoltrClient(connection);
  const vault = new PublicKey(vaultAddr);

  console.log("Running vault health check...\n");

  const vaultAccount = await vc.fetchVaultAccount(vault);
  console.log("Vault:", vault.toBase58());
  console.log("Admin:", vaultAccount.admin.toBase58());
  console.log("Manager:", vaultAccount.manager.toBase58());

  const positionData = await vc.getPositionAndTotalValuesForVault(vault);

  const totalValue = positionData.totalValue;
  const strategies = positionData.strategies;

  const riskFlags: string[] = [];

  if (totalValue === 0) {
    riskFlags.push("CRITICAL: Vault has zero total value");
  }

  let activeStrategies = 0;
  const strategyReport: HealthReport["strategies"] = [];

  for (const pos of strategies) {
    if (pos.amount > 0) activeStrategies++;

    const pct = totalValue > 0 ? (pos.amount / totalValue) * 100 : 0;

    if (pct > MAX_SINGLE_STRATEGY_PCT) {
      riskFlags.push(
        `WARNING: Strategy ${pos.strategyId} at ${pct.toFixed(2)}% exceeds ${MAX_SINGLE_STRATEGY_PCT}% max`
      );
    }

    strategyReport.push({
      strategyId: pos.strategyId,
      amount: pos.amount,
      percentage: pct.toFixed(2) + "%",
    });
  }

  if (activeStrategies < MIN_STRATEGIES_ACTIVE && totalValue > 0) {
    riskFlags.push(
      `WARNING: Only ${activeStrategies} active strategies (min ${MIN_STRATEGIES_ACTIVE})`
    );
  }

  const assetPerLp = await vc.getCurrentAssetPerLpForVault(vault);
  const pendingWithdrawals =
    await vc.getAllPendingWithdrawalsForVault(vault);

  const report: HealthReport = {
    vaultAddress: vault.toBase58(),
    totalValue,
    strategies: strategyReport,
    assetPerLp: assetPerLp.toString(),
    pendingWithdrawals: pendingWithdrawals.length,
    riskFlags,
  };

  console.log("\n=== HEALTH REPORT ===");
  console.log(JSON.stringify(report, null, 2));

  if (riskFlags.length > 0) {
    console.log("\n=== RISK FLAGS ===");
    riskFlags.forEach((flag) => console.log(`  ${flag}`));
  } else {
    console.log("\nAll health checks passed.");
  }
};

main().catch(console.error);
