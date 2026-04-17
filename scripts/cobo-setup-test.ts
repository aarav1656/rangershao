import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const CoboWaas2 = await import("@cobo/cobo-waas2");

  const apiSecret = process.env.COBO_API_SECRET!;
  const env = process.env.COBO_ENV === "prod"
    ? CoboWaas2.Env.PROD
    : CoboWaas2.Env.DEV;

  console.log("=== Cobo MPC Setup Test ===\n");
  console.log("Environment:", process.env.COBO_ENV === "prod" ? "PRODUCTION" : "DEV (sandbox)");
  console.log("Org ID:", process.env.COBO_ORG_ID);
  console.log("API Public Key (register this in Cobo dashboard):");
  console.log(`  ${process.env.COBO_API_PUBKEY}\n`);

  const apiClient = CoboWaas2.ApiClient.instance;
  apiClient.setEnv(env);
  apiClient.setPrivateKey(apiSecret);

  const parseError = (e: any) => {
    if (!e.body) return e.message || String(e);
    const b = typeof e.body === "string" ? JSON.parse(e.body) : e.body;
    return b?.error_message || b?.error_code || JSON.stringify(b);
  };

  // Step 1: Test auth by listing wallets
  console.log("Step 1: Testing API authentication (list wallets)...");
  try {
    const walletsApi = new CoboWaas2.WalletsApi();
    const result = await walletsApi.listWallets({});
    const wallets = result.data ?? [];
    console.log(`  OK: Found ${wallets.length} wallets`);
    for (const w of wallets) {
      const info = typeof w === "object" ? JSON.stringify(w, null, 2) : String(w);
      console.log(`  - ${info}`);
    }
  } catch (e: any) {
    console.error(`  FAIL: ${parseError(e)}`);
    return;
  }

  // Step 2: Check if we have a Solana MPC wallet
  console.log("\nStep 2: Looking for MPC wallets with Solana support...");
  try {
    const walletsApi = new CoboWaas2.WalletsApi();
    const result = await walletsApi.listWallets({
      wallet_type: CoboWaas2.WalletType.MPC,
    });
    const mpcWallets = result.data ?? [];
    console.log(`  Found ${mpcWallets.length} MPC wallet(s)`);

    if (mpcWallets.length === 0) {
      console.log("\n  >>> No MPC wallets found. Create one in Cobo Portal:");
      console.log("  >>> Cobo Portal > Wallets > Create Wallet > MPC Wallet");
      console.log("  >>> Add Solana (SOL) chain support");
      console.log("  >>> Then set COBO_WALLET_ID in .env\n");
      return;
    }

    for (const w of mpcWallets) {
      const info = typeof w === "object" ? JSON.stringify(w, null, 2) : String(w);
      console.log(`  - ${info}`);
    }

    // Step 3: List addresses for the first MPC wallet
    const firstWallet = mpcWallets[0] as any;
    const walletId = process.env.COBO_WALLET_ID || firstWallet?.wallet_id || firstWallet?.id;
    console.log(`\nStep 3: Listing addresses for wallet ${walletId}...`);
    let addrs: any[] = [];
    try {
      const addrsResult = await walletsApi.listAddresses({
        wallet_id: walletId!,
      });
      addrs = addrsResult.data ?? [];
      console.log(`  Found ${addrs.length} address(es)`);
      for (const a of addrs) {
        const info = typeof a === "object" ? JSON.stringify(a, null, 2) : String(a);
        console.log(`  - ${info}`);
      }
    } catch (addrErr: any) {
      console.log(`  Address listing failed: ${parseError(addrErr)}`);
      console.log("  (This is OK if the wallet hasn't generated addresses yet)");
    }

    if (addrs.length === 0) {
      console.log("\n  >>> No addresses yet. Generate one in Cobo Portal for SOL chain.");
    }

    console.log("\n=== Setup looks good! ===");
    console.log(`COBO_WALLET_ID=${walletId}`);
    console.log(`COBO_VAULT_ID=${firstWallet?.vault_id}`);
    console.log("The keeper bot can now use Cobo MPC signing for vault rebalances.");

  } catch (e: any) {
    console.error(`  FAIL: ${parseError(e)}`);
  }
}

main().catch(console.error);
