import { PublicKey } from "@solana/web3.js";
import { VoltrClient, VaultConfigField } from "@voltr/vault-sdk";
import { getConnection, loadKeypair } from "../utils/connection";
import { sendAndConfirmOptimisedTx } from "../utils/helper";
import { adminFilePath } from "../variables";
import * as dotenv from "dotenv";

dotenv.config();

const serializeU64 = (value: string): Buffer => {
  const buf = Buffer.alloc(8);
  const bn = BigInt(value);
  buf.writeBigUInt64LE(bn);
  return buf;
};

const serializeU16 = (value: number): Buffer => {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(value);
  return buf;
};

const FIELD_MAP: Record<
  string,
  { field: VaultConfigField; serialize: (v: string) => Buffer }
> = {
  MaxCap: {
    field: VaultConfigField.MaxCap,
    serialize: serializeU64,
  },
  WithdrawalWaitingPeriod: {
    field: VaultConfigField.WithdrawalWaitingPeriod,
    serialize: serializeU64,
  },
  ManagerPerformanceFee: {
    field: VaultConfigField.ManagerPerformanceFee,
    serialize: (v) => serializeU16(parseInt(v)),
  },
  AdminPerformanceFee: {
    field: VaultConfigField.AdminPerformanceFee,
    serialize: (v) => serializeU16(parseInt(v)),
  },
  RedemptionFee: {
    field: VaultConfigField.RedemptionFee,
    serialize: (v) => serializeU16(parseInt(v)),
  },
  IssuanceFee: {
    field: VaultConfigField.IssuanceFee,
    serialize: (v) => serializeU16(parseInt(v)),
  },
  LockedProfitDegradationDuration: {
    field: VaultConfigField.LockedProfitDegradationDuration,
    serialize: serializeU64,
  },
};

const main = async () => {
  const vaultAddr = process.env.VAULT_ADDRESS;
  if (!vaultAddr) throw new Error("VAULT_ADDRESS not set");

  const connection = getConnection();
  const vc = new VoltrClient(connection);
  const adminKp = loadKeypair(adminFilePath);
  const vault = new PublicKey(vaultAddr);

  const fieldName = process.argv[2];
  const value = process.argv[3];

  if (!fieldName || !value) {
    console.log("Usage: ts-node 07-update-config.ts <field> <value>");
    console.log("Fields:", Object.keys(FIELD_MAP).join(", "));
    console.log("\nExamples:");
    console.log(
      '  ts-node 07-update-config.ts MaxCap 18446744073709551615'
    );
    console.log(
      "  ts-node 07-update-config.ts ManagerPerformanceFee 1500"
    );
    console.log(
      "  ts-node 07-update-config.ts WithdrawalWaitingPeriod 7776000"
    );
    process.exit(1);
  }

  const fieldConfig = FIELD_MAP[fieldName];
  if (!fieldConfig) {
    console.error(`Unknown field: ${fieldName}`);
    console.log("Available fields:", Object.keys(FIELD_MAP).join(", "));
    process.exit(1);
  }

  console.log(`Updating vault config: ${fieldName} = ${value}`);

  const data = fieldConfig.serialize(value);

  const updateIx = await vc.createUpdateVaultConfigIx(fieldConfig.field, data, {
    vault,
    admin: adminKp.publicKey,
  });

  const txSig = await sendAndConfirmOptimisedTx(
    [updateIx],
    process.env.HELIUS_RPC_URL!,
    adminKp
  );

  console.log("Config updated:", txSig);
};

main().catch(console.error);
