# Demo Integrity Audit - Ranger Frontend

**Date:** 2026-04-17
**Auditor:** demo-integrity-ranger (Pentagon agent)
**Vault:** `7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk` (mainnet)

---

## Grade: MIXED (leaning BROKEN at runtime)

The frontend does NOT fake live data with Math.random() or setTimeout tricks. But the vault is deployed and can't be decoded, so the live path returns a 501 error and the dashboard shows an error state, not data.

---

## Check 1: Hardcoded / Fake Data Patterns

| Pattern | Found | Location | Verdict |
|---------|-------|----------|---------|
| `Math.random()` | NO | - | CLEAN |
| `setTimeout` faking async | NO | keeper retry logic only (legitimate) | CLEAN |
| `DEMO_` constants | NO | - | CLEAN |
| Static mock arrays | NO | - | CLEAN |
| `backtest-simulated` tx hash | YES | `src/app/api/vault/route.ts:99` | FLAG |
| `healthFactor: 2.85` hardcoded | YES | `src/app/api/vault/route.ts:121` | FLAG |
| `correlationToSol: 0.12` hardcoded | YES | `src/app/api/vault/route.ts:125` | FLAG |
| `totalDepositors: 0` hardcoded | YES | `src/app/api/vault/route.ts:113` | FLAG |
| `setInterval` every 30s | YES | `src/app/page.tsx:74` | LEGITIMATE (real poll) |

**Verdict:** No Math.random fakes. Some hardcoded constants in backtest mode that would look suspicious to judges.

---

## Check 2: Real Solana RPC Integration

| Item | Status | Notes |
|------|--------|-------|
| `@solana/web3.js` imported | YES | `vault-api.ts`, `api/vault/route.ts` |
| Helius RPC URL configured | YES | `.env` has real Helius key |
| VAULT_ADDRESS configured | YES | `.env` has `VAULT_ADDRESS=7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk` |
| RPC connection attempted | YES | `connection.getAccountInfo(vaultPubkey)` |
| Vault account decoded | NO | Returns `NOT_IMPLEMENTED: Vault account deserialization pending IDL` |
| Wallet adapter integration | YES | `useWallet`, `useConnection` from `@solana/wallet-adapter-react` |

**Critical:** The vault account EXISTS on-chain and can be fetched. But the account data cannot be deserialized because the IDL integration is missing. The API returns HTTP 501.

---

## Check 3: Runtime Data Flow

```
User visits dashboard
  -> fetch /api/vault
  -> VAULT_ADDRESS is set (from .env)
  -> Connection.getAccountInfo() called with real RPC
  -> Vault account found (lamports, owner, dataLength returned)
  -> return 501 NOT_IMPLEMENTED (deserialization not done)
  -> Frontend: res.ok === false → throws "API error: 501"
  -> Dashboard shows: "Connecting to Vault / API error: 501"
```

**The dashboard does NOT show backtest data in production** - it shows an error state. Backtest data is only served when `VAULT_ADDRESS` env var is empty.

The backtest fallback path (when VAULT_ADDRESS is unset):
- Reads `strategy/backtest_results.json` (90-day Python simulation with seed 42)
- Returns `dataSource: "backtest"` - frontend shows "Strategy Validated / 90-day backtest" banner
- This IS properly labeled, not claiming to be live

---

## Check 4: User Flows

### Deposit
- Wallet adapter: REAL
- Transaction building: NOT_IMPLEMENTED (throws immediately)
- Error displayed to user: YES (shown in red error box)
- Silently fakes success: NO

### Withdraw
- Same as deposit - properly fails with NOT_IMPLEMENTED

### View Strategies / Allocations
- Live data: BROKEN (501 error → error state)
- Backtest fallback: Only active if VAULT_ADDRESS env var is unset

### Performance Monitoring
- APY chart: BROKEN at runtime (same 501 path)
- PnL chart: BROKEN at runtime
- Monte Carlo stats: From backtest JSON only

---

## Critical Blockers

1. **Missing Voltr IDL deserialization** (`src/app/api/vault/route.ts:139`): The vault exists on-chain but account data can't be decoded. This is the single biggest blocker. Vault owner is Voltr protocol - need their SDK or IDL.

2. **Deposit/Withdraw NOT_IMPLEMENTED** (`src/components/dashboard/deposit-withdraw.tsx:29-31`): Both actions throw immediately. The program ID isn't even configured (`NEXT_PUBLIC_VAULT_PROGRAM_ID` is not in `.env`).

3. **Hardcoded risk metrics** in backtest path: `healthFactor: 2.85`, `correlationToSol: 0.12` are not derived from any data. Judges will ask where these come from.

---

## What's Legitimate

- No fake data masquerading as live data
- Errors fail loudly (NOT_IMPLEMENTED), not silently
- Backtest data is properly labeled as "backtest" with a banner
- Wallet integration is real (@solana/wallet-adapter-react)
- Helius RPC is configured with a real API key
- Vault address is the real deployed address

---

## Recommended Fixes (Priority Order)

1. **Integrate Voltr SDK** to read vault TVL, positions, and strategy allocations from on-chain state. The vault is managed by Voltr protocol - check their npm package `@voltr/vault-sdk`.

2. **Wire NEXT_PUBLIC_VAULT_PROGRAM_ID** in `.env` and implement deposit/withdraw using Voltr's CPI instructions.

3. **Replace hardcoded risk constants** with computed values from on-chain position data.

4. **Add Voltr API fallback** - if RPC deserialization is blocked, Voltr may have a public API for vault metrics.
