import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const sendAndConfirmOptimisedTx = async (
  instructions: TransactionInstruction[],
  rpcUrl: string,
  payerKp: Keypair,
  signers: Keypair[] = [],
  addressLookupTableAccounts: AddressLookupTableAccount[] = []
): Promise<string> => {
  const connection = new Connection(rpcUrl);

  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  ];

  const { blockhash } = await connection.getLatestBlockhash();
  const cuTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payerKp.publicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message(addressLookupTableAccounts)
  );
  cuTransaction.sign([payerKp, ...signers]);

  const rpcResponse = await connection.simulateTransaction(cuTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });

  const requiredCUs = rpcResponse.value.unitsConsumed;
  if (!requiredCUs) {
    console.error("Simulation logs:", rpcResponse.value.logs);
    throw new Error("Failed to get required CUs from simulation");
  }

  const optimalCUs = Math.ceil(requiredCUs * 1.2);
  const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: optimalCUs,
  });
  instructions.push(computeUnitIx);

  const feTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions,
      payerKey: payerKp.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message(addressLookupTableAccounts)
  );
  feTransaction.sign([payerKp, ...signers]);

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          transaction: bs58.encode(feTransaction.serialize()),
          options: { priorityLevel: "High" },
        },
      ],
    }),
  });
  const data = await response.json();
  const feeEstimate = data.result;

  let priorityFee = 50000;
  if (feeEstimate?.priorityFeeEstimate) {
    priorityFee = feeEstimate.priorityFeeEstimate;
  }

  const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityFee,
  });
  instructions.push(computePriceIx);

  const latestBlockhash = await connection.getLatestBlockhash();
  const transaction = new VersionedTransaction(
    new TransactionMessage({
      instructions,
      payerKey: payerKp.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
    }).compileToV0Message(addressLookupTableAccounts)
  );
  transaction.sign([payerKp, ...signers]);

  const txSig = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 5,
  });

  const confirmationStrategy: TransactionConfirmationStrategy = {
    signature: txSig,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  };
  await connection.confirmTransaction(confirmationStrategy, "confirmed");
  return txSig;
};

export const setupTokenAccount = async (
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  txIxs: TransactionInstruction[],
  programId: PublicKey = TOKEN_PROGRAM_ID
): Promise<PublicKey> => {
  const tokenAccount = getAssociatedTokenAddressSync(
    mint,
    owner,
    true,
    programId
  );
  const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
  if (!tokenAccountInfo) {
    txIxs.push(
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        tokenAccount,
        owner,
        mint,
        programId
      )
    );
  }
  return tokenAccount;
};

export const setupAddressLookupTable = async (
  connection: Connection,
  authority: PublicKey,
  payer: PublicKey,
  addresses: string[],
  txIxs: TransactionInstruction[],
  lookupTable?: PublicKey
): Promise<PublicKey> => {
  let lut: PublicKey;
  const lutAddressesStr: string[] = [];

  if (lookupTable) {
    lut = lookupTable;
    const lutData = await connection.getAddressLookupTable(lut);
    lutAddressesStr.push(
      ...(lutData.value?.state.addresses.map((a) => a.toBase58()) ?? [])
    );
  } else {
    const [createLUTIx, lutTemp] =
      AddressLookupTableProgram.createLookupTable({
        authority,
        payer,
        recentSlot: await connection.getSlot(),
      });
    lut = lutTemp;
    txIxs.push(createLUTIx);
  }

  const filteredUniqueIxsPubkeys = addresses
    .filter((pubkey) => !lutAddressesStr.includes(pubkey))
    .map((pubkey) => new PublicKey(pubkey));

  if (filteredUniqueIxsPubkeys.length > 0) {
    txIxs.push(
      AddressLookupTableProgram.extendLookupTable({
        lookupTable: lut,
        authority: payer,
        addresses: filteredUniqueIxsPubkeys,
        payer,
      })
    );
  }
  return lut;
};
