import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const VAULT_ADDRESS = process.env.VAULT_ADDRESS || process.env.NEXT_PUBLIC_VAULT_ADDRESS || "";

export async function GET() {
  try {
    if (!VAULT_ADDRESS) {
      return NextResponse.json(
        {
          error: "Vault not deployed yet",
          overview: {
            tvl: 0,
            tvlChange24h: 0,
            currentApy: 0,
            totalDepositors: 0,
            lastRebalance: "",
          },
          apyHistory: [],
          allocations: [],
          rebalances: [],
          riskMetrics: null,
          pnlHistory: [],
        },
        { status: 200 }
      );
    }

    const connection = new Connection(RPC_URL, "confirmed");
    const vaultPubkey = new PublicKey(VAULT_ADDRESS);
    const accountInfo = await connection.getAccountInfo(vaultPubkey);

    if (!accountInfo) {
      return NextResponse.json(
        { error: "Vault account not found on-chain" },
        { status: 404 }
      );
    }

    // Once the Solana Contract Engineer provides the IDL, decode vault state here.
    // For now, return the raw account existence confirmation.
    return NextResponse.json(
      {
        error: "NOT_IMPLEMENTED: Vault deserialization pending IDL from contract team",
        vaultExists: true,
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toBase58(),
        dataLength: accountInfo.data.length,
      },
      { status: 501 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
