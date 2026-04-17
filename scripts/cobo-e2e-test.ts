import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { CoboDirectClient } from "../security/cobo/cobo-direct-client";

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function main() {
  const walletId = requiredEnv("COBO_WALLET_ID");
  const selfAddress = requiredEnv("COBO_SOL_ADDRESS");
  const client = new CoboDirectClient({
    apiSecret: requiredEnv("COBO_API_SECRET"),
    apiPubKey: requiredEnv("COBO_API_PUBKEY"),
    env: process.env.COBO_ENV === "dev" ? "dev" : "prod",
  });

  console.log("=== Cobo Direct Client E2E Test ===");
  console.log(`Environment: ${process.env.COBO_ENV === "dev" ? "DEV" : "PROD"}`);
  console.log(`Wallet ID: ${walletId}`);
  console.log(`Self address: ${selfAddress}`);

  console.log("\n1. Listing wallets...");
  const wallets = await client.listWallets();
  console.log(JSON.stringify(wallets, null, 2));

  console.log("\n2. Fetching wallet details...");
  const wallet = await client.getWallet(walletId);
  console.log(JSON.stringify(wallet, null, 2));

  console.log("\n3. Listing wallet addresses...");
  const addresses = await client.listAddresses(walletId, { limit: 20 });
  console.log(JSON.stringify(addresses, null, 2));

  console.log("\n4. Listing token balances...");
  const balances = await client.getBalance(walletId, { limit: 50 });
  console.log(JSON.stringify(balances, null, 2));

  console.log("\n5. Attempting self-transfer signing test (0.001 SOL)...");
  try {
    const transfer = await client.createTransaction({
      request_id: randomUUID(),
      source: {
        source_type: "Org-Controlled",
        address: selfAddress,
        wallet_id: walletId,
      },
      token_id: "SOL",
      destination: {
        destination_type: "Address",
        account_output: {
          address: selfAddress,
          amount: "0.001",
        },
      },
      description: "Ranger Cobo direct client signing test",
    });

    console.log(JSON.stringify(transfer, null, 2));

    const transactionId =
      transfer?.transaction_id ??
      transfer?.data?.transaction_id ??
      transfer?.id;

    if (transactionId) {
      console.log("\n6. Fetching created transaction...");
      const transaction = await client.getTransaction(transactionId);
      console.log(JSON.stringify(transaction, null, 2));
    } else {
      console.log("Transaction created but no transaction_id was present in the response.");
    }
  } catch (error) {
    console.error(`Transfer attempt failed: ${parseError(error)}`);
  }
}

main().catch((error) => {
  console.error(parseError(error));
  process.exitCode = 1;
});
