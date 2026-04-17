import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { getConnection, loadKeypair } from "../utils/connection";
import {
  sendAndConfirmOptimisedTx,
  setupAddressLookupTable,
} from "../utils/helper";
import { adminFilePath, vaultAddress, lookupTableAddress } from "../variables";
import {
  LENDING_ADAPTOR_PROGRAM_ID,
  RAYDIUM_ADAPTOR_PROGRAM_ID,
  TRUSTFUL_ADAPTOR_PROGRAM_ID,
} from "../constants/programs";
import * as dotenv from "dotenv";

dotenv.config();

const main = async () => {
  if (!vaultAddress) throw new Error("VAULT_ADDRESS not set");

  const connection = getConnection();
  const vc = new VoltrClient(connection);
  const adminKp = loadKeypair(adminFilePath);
  const vault = new PublicKey(vaultAddress);

  const adaptors = [
    // Lending adaptor already added in previous run
    // { name: "Lending", programId: LENDING_ADAPTOR_PROGRAM_ID },
    { name: "Raydium CLMM", programId: RAYDIUM_ADAPTOR_PROGRAM_ID },
    { name: "Trustful", programId: TRUSTFUL_ADAPTOR_PROGRAM_ID },
  ];

  for (const adaptor of adaptors) {
    console.log(
      `Adding ${adaptor.name} adaptor (${adaptor.programId.toBase58()})...`
    );

    const addAdaptorIx = await vc.createAddAdaptorIx({
      vault,
      admin: adminKp.publicKey,
      payer: adminKp.publicKey,
      adaptorProgram: adaptor.programId,
    });

    const transactionIxs: TransactionInstruction[] = [addAdaptorIx];

    if (lookupTableAddress) {
      await setupAddressLookupTable(
        connection,
        adminKp.publicKey,
        adminKp.publicKey,
        [...new Set(addAdaptorIx.keys.map((k) => k.pubkey.toBase58()))],
        transactionIxs,
        new PublicKey(lookupTableAddress)
      );
    }

    const txSig = await sendAndConfirmOptimisedTx(
      transactionIxs,
      process.env.HELIUS_RPC_URL!,
      adminKp
    );

    console.log(`${adaptor.name} adaptor added: ${txSig}`);
  }

  console.log("\n=== ALL ADAPTORS ADDED ===");
};

main().catch(console.error);
