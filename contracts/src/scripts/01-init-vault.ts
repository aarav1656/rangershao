import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { getConnection, loadKeypair } from "../utils/connection";
import { sendAndConfirmOptimisedTx } from "../utils/helper";
import { vaultParams, adminFilePath, managerFilePath } from "../variables";
import { USDC_MINT } from "../constants/programs";
import * as dotenv from "dotenv";

dotenv.config();

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

  const uniqueAddresses = [
    ...new Set(createVaultIx.keys.map((key) => key.pubkey.toBase58())),
  ].map((address) => new PublicKey(address));

  console.log("\n--- Step 1: Create Address Lookup Table ---");
  const recentSlot = await connection.getSlot("finalized");
  const [createLookupTableIx, lutAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: adminKp.publicKey,
      payer: adminKp.publicKey,
      recentSlot,
    });
  const extendLookupTableIx = AddressLookupTableProgram.extendLookupTable({
    lookupTable: lutAddress,
    authority: adminKp.publicKey,
    payer: adminKp.publicKey,
    addresses: uniqueAddresses,
  });

  const lutIxs: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
    createLookupTableIx,
    extendLookupTableIx,
  ];

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const lutTx = new VersionedTransaction(
    new TransactionMessage({
      instructions: lutIxs,
      payerKey: adminKp.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
    }).compileToV0Message()
  );
  lutTx.sign([adminKp]);

  const lutTxSig = await connection.sendTransaction(lutTx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 5,
  });
  const lutConfirmStrategy: TransactionConfirmationStrategy = {
    signature: lutTxSig,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  };
  await connection.confirmTransaction(lutConfirmStrategy, "confirmed");
  console.log("LUT created:", lutTxSig);
  console.log("LUT address:", lutAddress.toBase58());

  console.log("Waiting for LUT activation (15s)...");
  await sleep(15000);

  let lutAccount = await connection.getAddressLookupTable(lutAddress);
  if (!lutAccount.value) {
    console.log("LUT not ready, waiting 15 more seconds...");
    await sleep(15000);
    lutAccount = await connection.getAddressLookupTable(lutAddress);
  }
  if (!lutAccount.value) {
    throw new Error(
      `Failed to fetch activated lookup table: ${lutAddress.toBase58()}`
    );
  }

  console.log("\n--- Step 2: Initialize Vault ---");
  const addressLookupTables: AddressLookupTableAccount[] = [lutAccount.value];
  const txSig = await sendAndConfirmOptimisedTx(
    [createVaultIx],
    process.env.HELIUS_RPC_URL!,
    adminKp,
    [vaultKp],
    addressLookupTables
  );

  console.log("\n=== VAULT INITIALIZED ===");
  console.log("LUT Setup Transaction:", lutTxSig);
  console.log("Vault Init Transaction:", txSig);
  console.log("Vault Address:", vaultKp.publicKey.toBase58());
  console.log("Lookup Table:", lutAddress.toBase58());
  console.log("\nUpdate your .env with:");
  console.log(`VAULT_ADDRESS=${vaultKp.publicKey.toBase58()}`);
  console.log(`LOOKUP_TABLE_ADDRESS=${lutAddress.toBase58()}`);
};

main().catch(console.error);
