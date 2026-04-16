import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const CoboWaas2 = await import("@cobo/cobo-waas2");

  const env = (process.env.COBO_ENV || "dev").toLowerCase();
  const apiClient = (CoboWaas2 as any).ApiClient.instance;
  apiClient.setEnv(env === "prod" ? (CoboWaas2 as any).Env.PROD : (CoboWaas2 as any).Env.DEV);
  apiClient.setPrivateKey(process.env.COBO_API_SECRET!);

  const walletsApi = new (CoboWaas2 as any).WalletsApi();

  console.log(`Env: ${env.toUpperCase()}`);
  console.log(`Org ID: ${process.env.COBO_ORG_ID}`);

  console.log("\n--- listWallets ---");
  try {
    const wallets = await walletsApi.listWallets({ limit: 50 });
    const items = wallets.data || [];
    console.log(`Found ${items.length} wallet(s).`);
    for (const w of items) {
      console.log(JSON.stringify({
        wallet_id: w.wallet_id,
        vault_id: w.vault_id,
        name: w.name,
        wallet_type: w.wallet_type,
        wallet_subtype: w.wallet_subtype,
      }, null, 2));
    }
    if (items[0]) {
      const w = items[0];
      console.log("\n--- listAddresses (first wallet) ---");
      const addresses = await walletsApi.listAddresses(w.wallet_id, { limit: 50 });
      const addrList = addresses.data || [];
      console.log(`Found ${addrList.length} address(es).`);
      for (const a of addrList) {
        console.log(JSON.stringify({ chain_id: a.chain_id, address: a.address }, null, 2));
      }
    }
  } catch (e: any) {
    console.error("listWallets failed:", e?.response?.text || e?.message || e);
  }

  console.log("\n--- listEnabledChains (Solana filter) ---");
  try {
    const chains = await walletsApi.listEnabledChains({ limit: 50 });
    const solChains = (chains.data || []).filter((c: any) => /SOL/i.test(c.chain_id) || /solana/i.test(c.chain_name));
    for (const c of solChains) {
      console.log(JSON.stringify({ chain_id: c.chain_id, chain_name: c.chain_name }, null, 2));
    }
  } catch (e: any) {
    console.error("listEnabledChains failed:", e?.response?.text || e?.message || e);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
