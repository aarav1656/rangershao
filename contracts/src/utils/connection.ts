import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

export const getConnection = (): Connection => {
  const rpcUrl = process.env.HELIUS_RPC_URL;
  if (!rpcUrl) throw new Error("HELIUS_RPC_URL not set in .env");
  return new Connection(rpcUrl, "confirmed");
};

export const loadKeypair = (path: string): Keypair => {
  const raw = fs.readFileSync(path, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
};
