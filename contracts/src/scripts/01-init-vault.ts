import { Keypair, TransactionInstruction } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { getConnection, loadKeypair } from "../utils/connection";
import {
  sendAndConfirmOptimisedTx,
  setupAddressLookupTable,
} from "../utils/helper";
import { vaultParams, adminFilePath, managerFilePath } from "../variables";
import { USDC_MINT } from "../constants/programs";
import * as dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const connection = getConnection();
  const vc = new VoltrClient(connection);

  const adminKp = loadKeypair(adminFilePath);
  const managerKp = loadKeypair(managerFilePath);
  const vaultKp = Keypair.generate();

  console.log("Initializing Ranger vault...");
  console.log("Admin:", adminKp.publicKey.toBase58());
  console.log("Manager:", managerKp.publicKey.toBase58());
  console.log("Vault:", vaultKp.publicKey.toBase58());
  console.log("Asset Mint (USDC):", USDC_MINT.toBase58());

  const createVaultIx = await vc.createInitializeVaultIx(vaultParams, {
    vault: vaultKp.publicKey,
    vaultAssetMint: USDC_MINT,
    admin: adminKp.publicKey,
    manager: managerKp.publicKey,
    payer: adminKp.publicKey,
  });

  const transactionIxs: TransactionInstruction[] = [createVaultIx];

  const lut = await setupAddressLookupTable(
    connection,
    adminKp.publicKey,
    adminKp.publicKey,
    [...new Set(createVaultIx.keys.map((k) => k.pubkey.toBase58()))],
    transactionIxs
  );

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    adminKp,
    [vaultKp]
  );

  console.log("\n=== VAULT INITIALIZED ===");
  console.log("Transaction:", txSig);
  console.log("Vault Address:", vaultKp.publicKey.toBase58());
  console.log("Lookup Table:", lut.toBase58());
  console.log("\nUpdate your .env with:");
  console.log(`VAULT_ADDRESS=${vaultKp.publicKey.toBase58()}`);
  console.log(`LOOKUP_TABLE_ADDRESS=${lut.toBase58()}`);
};

main().catch(console.error);
