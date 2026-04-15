import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Keypair,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import axios from "axios";
import { createLogger } from "../monitoring/logger";

const logger = createLogger("info");

export function createConnection(rpcUrl: string): Connection {
  return new Connection(rpcUrl, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
}

export async function sendAndConfirmOptimizedTx(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  signers: Keypair[],
  lookupTables: AddressLookupTableAccount[] = [],
  heliusApiKey?: string
): Promise<string> {
  // Step 1: Simulate to get compute units consumed
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const simMessage = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
      ...instructions,
    ],
  }).compileToV0Message(lookupTables);

  const simTx = new VersionedTransaction(simMessage);

  const simResult = await connection.simulateTransaction(simTx, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  });

  if (simResult.value.err) {
    throw new Error(
      `Simulation failed: ${JSON.stringify(simResult.value.err)}`
    );
  }

  const unitsConsumed = simResult.value.unitsConsumed ?? 200_000;
  const computeUnitLimit = Math.ceil(unitsConsumed * 1.2); // 20% buffer

  // Step 2: Estimate priority fee via Helius
  let priorityFee = 50_000; // Default 50k microLamports
  if (heliusApiKey) {
    try {
      const feeResponse = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
        {
          jsonrpc: "2.0",
          id: "priority-fee",
          method: "getPriorityFeeEstimate",
          params: [
            {
              accountKeys: instructions
                .flatMap((ix) => ix.keys.map((k) => k.pubkey.toBase58()))
                .slice(0, 10),
              options: { priorityLevel: "Medium" },
            },
          ],
        },
        { timeout: 5000 }
      );

      const estimatedFee =
        feeResponse.data?.result?.priorityFeeEstimate;
      if (estimatedFee && estimatedFee > 0) {
        priorityFee = Math.ceil(estimatedFee);
      }
    } catch (err) {
      logger.warn("Failed to estimate priority fee, using default", {
        error: String(err),
      });
    }
  }

  // Step 3: Build the optimized transaction
  const finalInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    }),
    ...instructions,
  ];

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: finalInstructions,
  }).compileToV0Message(lookupTables);

  const tx = new VersionedTransaction(messageV0);
  tx.sign(signers);

  // Step 4: Send and confirm
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
    preflightCommitment: "confirmed",
  });

  logger.info(`Transaction sent: ${signature}`, {
    computeUnits: computeUnitLimit,
    priorityFee,
  });

  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  if (confirmation.value.err) {
    throw new Error(
      `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
    );
  }

  logger.info(`Transaction confirmed: ${signature}`);
  return signature;
}

export async function setupTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID
): Promise<PublicKey> {
  const ata = getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);

  const accountInfo = await connection.getAccountInfo(ata);
  if (accountInfo) {
    return ata;
  }

  // Create the ATA
  const ix = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    ata,
    owner,
    mint,
    tokenProgram
  );

  await sendAndConfirmOptimizedTx(connection, [ix], payer.publicKey, [payer]);

  return ata;
}

export async function fetchAddressLookupTable(
  connection: Connection,
  address: PublicKey
): Promise<AddressLookupTableAccount | null> {
  const result = await connection.getAddressLookupTable(address);
  return result.value;
}

export async function fetchMultipleLookupTables(
  connection: Connection,
  addresses: PublicKey[]
): Promise<AddressLookupTableAccount[]> {
  const tables: AddressLookupTableAccount[] = [];

  for (const addr of addresses) {
    const table = await fetchAddressLookupTable(connection, addr);
    if (table) {
      tables.push(table);
    } else {
      logger.warn(`Address lookup table not found: ${addr.toBase58()}`);
    }
  }

  return tables;
}
