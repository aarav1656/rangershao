# Demo Readiness Audit - Ranger

**Date:** 2026-04-17  
**Grade: DEMO-BROKEN**

---

## Verdict

The dashboard renders but shows **backtest simulation data, not live on-chain state**. Vault deserialization is `NOT_IMPLEMENTED`. Deposit/Withdraw throws immediately. No deployed URL. A judge clicking around will see pretty charts backed by a pre-baked JSON file.

---

## Checklist

| Check | Status | Evidence |
|-------|--------|----------|
| Live deployed URL | FAIL | No vercel.json, no deployment config, README points to localhost only |
| Frontend reads real chain data | FAIL | `/api/vault` returns 501 then falls back to `strategy/backtest_results.json` |
| Hardcoded demo data | YES (killer) | `src/app/api/vault/route.ts:153` returns `NOT_IMPLEMENTED`, line 163 loads backtest JSON |
| setTimeout/Math.random() faking | CLEAN | setTimeout only for retry backoff logic |
| One-command demo | YES | `npm install && npm run dev` → localhost:3000 |
| Deployed addresses with explorer links | PARTIAL | Vault `7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk` exists in .env but no explorer links in UI |
| Refresh queries the chain | FAIL | No manual refresh button; auto-poll hits `/api/vault` which serves backtest data |
| Deposit/Withdraw works | FAIL | `deposit-withdraw.tsx:27,29,47` - throws `NOT_IMPLEMENTED` immediately |

---

## Critical Breaks (Judge Killers)

### 1. Vault data is a JSON file, not the chain
`src/app/api/vault/route.ts:153` - When VAULT_ADDRESS is set, the code tries `connection.getAccountInfo()`, then hits this:
```typescript
return NextResponse.json({ error: "NOT_IMPLEMENTED: vault deserialization" }, { status: 501 });
```
Falls back to `strategy/backtest_results.json` at line 163. The UI shows a `BacktestBanner` but the data is static.

### 2. Deposit/Withdraw is dead code
`src/components/dashboard/deposit-withdraw.tsx:27`:
```typescript
throw new Error("NOT_IMPLEMENTED: waiting on Voltr vault deserialization");
```
Clicking Deposit or Withdraw does nothing useful.

### 3. No live URL to share
Zero deployment. A judge cannot click a link. They must clone and run locally, which means they won't.

### 4. Voltr vault program mainnet-only
`docs/E2E-STATUS.md:11` - Voltr program not available on devnet. Vault state cannot be read in a safe testnet environment.

### 5. Cobo MPC signing broken
`docs/E2E-STATUS.md:12` - WaaS 2.0 credentials unauthorized. Keeper bot cannot execute rebalances end-to-end.

---

## What Actually Works

- Dashboard UI renders (with backtest data)
- Keeper bot dry-run mode (protocol data fetch, ML inference, rebalance planning)
- Real RPC calls exist in keeper loop (`connection.getAccountInfo()`, `sendRawTransaction`)
- Real protocol API calls (Kamino, MarginFi, Jupiter, Raydium)
- Vault address `7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk` is live on mainnet

---

## Fix Priority to Reach SHIP-READY

1. **Deploy to Vercel** - `npx vercel --prod` - gives a shareable URL. Frontend works with backtest data, at minimum judges can click around.
2. **Implement vault deserialization** - Use Voltr IDL/SDK to read real vault state from `7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk` on mainnet RPC.
3. **Add explorer links** - Embed Solana Explorer links for vault + strategy accounts in the UI.
4. **Wire Refresh button** - Simple button calling `fetchData()` already exposed as `refetch` in `page.tsx:90`.
5. **Implement Deposit/Withdraw** - At minimum show a disabled state with "mainnet only" tooltip rather than silent failure.
