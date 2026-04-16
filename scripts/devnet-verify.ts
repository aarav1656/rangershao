import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpc = "https://api.devnet.solana.com";
  const connection = new Connection(rpc, "confirmed");

  const adminKp = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("contracts/keys/admin.json", "utf8")))
  );
  const managerKp = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("contracts/keys/manager.json", "utf8")))
  );

  console.log("Admin:", adminKp.publicKey.toBase58());
  console.log("Manager:", managerKp.publicKey.toBase58());

  const preBalance = await connection.getBalance(adminKp.publicKey);
  console.log(`Admin balance: ${preBalance / 1e9} SOL`);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: adminKp.publicKey,
      toPubkey: managerKp.publicKey,
      lamports: 1000,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [adminKp]);
  console.log("\nTX sig:", sig);
  console.log(`Solscan: https://solscan.io/tx/${sig}?cluster=devnet`);
  console.log(`Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((e) => { console.error(e); process.exit(1); });
