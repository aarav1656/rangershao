# Ranger Architecture Audit - Build Roadmap

**Auditor:** arch-auditor-ranger (Pentagon agent)
**Date:** 2026-04-17
**Scope:** Solana program patterns, circuit breakers, admin/authority, emergency exits, oracle failsafes, defense-in-depth
**Directive:** Frame all findings as "what to build" - the goal is to BUILD UP to match our claims, not downplay them.

---

## Executive Summary

Ranger has strong architectural intent and a solid foundation: multi-protocol diversification, layered monitoring, Cobo MPC signing, and a 9-check circuit breaker. The architecture is DESIGNED correctly. What remains is completing the implementation so the running system matches what the design claims. This document is a BUILD CHECKLIST, not a critique.

---

## Build Priority 1: Wire Real Health Factor to Circuit Breaker

**Claim we're backing:** "Real-time risk monitoring with automatic circuit breakers"

**What's built:** 9-check circuit breaker with health factor threshold at 1.05 (critical) and 1.15 (warning).

**What to build:** The health factor input in `keeper-loop.ts` (~line 162) currently passes `1.0` as a placeholder. We need to fetch the real health factor from on-chain state before every check.

**Exact task:**
```typescript
// REPLACE placeholder in keeper-loop.ts:
healthFactor: 1.0  // placeholder

// WITH: real on-chain read, e.g. from MarginFi or Klend position account
const healthFactor = await this.fetchRealHealthFactor();
```
This is the highest-leverage single change - it makes the circuit breaker actually functional end-to-end.

---

## Build Priority 2: Implement IDL Deserialization for Voltr Vault State

**Claim we're backing:** "Live position tracking across all deployed strategies"

**What's built:** Voltr instruction builder, PDA derivation, deposit/withdraw flows.

**What to build:** `src/keeper/voltr/vault-api.ts` has a `NOT_IMPLEMENTED` stub for IDL deserialization. We need to:
1. Pull the Voltr IDL from the deployed program or SDK
2. Use `@coral-xyz/anchor`'s `BorshAccountsCoder` to decode vault state accounts
3. Feed decoded position sizes and health data to the monitoring stack

This unlocks real position sizes, real utilization rates, and real health factors across all three protocols.

---

## Build Priority 3: Persist Circuit Breaker State to Durable Store

**Claim we're backing:** "Enterprise-grade safety with persistent emergency controls"

**What's built:** In-memory circuit breaker with pause flag, cooldown, daily volume counter, trip counter.

**What to build:** Serialize state to Redis (or a Solana account PDA) on every state transition. On startup, rehydrate from the store. This means:
- Emergency pauses survive restarts
- Daily volume counters survive restarts
- Drawdown high-water mark survives restarts
- An active pause cannot be bypassed by crashing the keeper process

**Implementation target:** ~100 lines. Write state as JSON to Redis key `ranger:cb:state` on every `pause()`, `resume()`, and `recordTransaction()` call.

---

## Build Priority 4: Authenticate the Emergency Endpoint

**Claim we're backing:** "Secure operational controls with authenticated access"

**What's built:** `/api/security/emergency` endpoint with pause/resume actions.

**What to build:** Add API key middleware to the route handler. Check `Authorization: Bearer <EMERGENCY_API_KEY>` against an env variable. Reject unauthenticated requests with 401. This is ~10 lines and makes the endpoint match the security claim.

---

## Build Priority 5: Implement On-Chain Emergency Actions

**Claim we're backing:** "Automated emergency response with on-chain execution"

**What's built:** 5 emergency triggers (health factor, large outflow, USDC depeg, drawdown, TVL crash). Action labels defined in drawdown config.

**What to build:** Wire `onDrawdownAction` callback to real on-chain instructions:
1. "Shift 15% from highest-risk to safe strategy" = withdraw from highest-allocation strategy, deposit to Solend/Klend
2. "Emergency exit all DeFi" = withdraw all positions, leave in vault as USDC

**Also:** Add Ondo USDY as a real strategy adaptor in `voltr-instruction-builder.ts` to back the "Ondo USDY" action label already in the config.

---

## Build Priority 6: Extend Cobo MPC Scope to Admin Operations

**Claim we're backing:** "MPC-secured key management for all vault operations"

**What's built:** Cobo 2-of-3 TSS protects the operational signer (rebalances).

**What to build:** Move admin keypair operations under MPC protection as well:
- Fee parameter changes
- MaxCap changes
- Adding/removing strategy adaptors

Option A: Use a Cobo MPC-derived key as the admin authority.
Option B: Add a Squads multisig as the admin authority, with the Cobo key as one signer.

This fully backs the "MPC-secured" claim for ALL vault operations, not just rebalances.

---

## Build Priority 7: Add Pyth Oracle Staleness and Confidence Checks

**Claim we're backing:** "Battle-tested oracle failsafes with multi-source validation"

**What's built:** On-chain Pyth read with Hermes fallback. Depeg monitor with 5% threshold.

**What to build:**
1. Read `publishTime` from offset 200 in Pyth account. Reject if `Date.now()/1000 - publishTime > 60`.
2. Read confidence interval. Reject if `confidence / |price| > 0.01` (1% uncertainty).
3. On oracle outage, trigger circuit breaker pause instead of silently continuing.

Three additions that make the oracle stack production-grade and fully match the claim.

---

## Build Priority 8: Add Bounds Checking to ML Allocation Weights

**Claim we're backing:** "ML-optimized allocation with safety guardrails"

**What's built:** ML model integration that returns `{ weights, confidence }` and applies to allocation.

**What to build:** Before applying weights:
- Assert each weight is in `[0, 1]`
- Assert weights sum to `~1.0` (within 0.001)
- Assert no single protocol exceeds 60% (enforce `MAX_SINGLE_STRATEGY_PCT` in the live loop, not just the health check script)
- Reject and fall back to current allocation if confidence < threshold

This makes the ML system match the "safety guardrails" claim.

---

## Build Priority 9: Replace Raw Byte-Offset Account Reads

**Claim we're backing:** "Robust on-chain state reading across all protocols"

**What's built:** SPL token balance reads using byte offsets (offset 64 for amount).

**What to build:** Replace raw offset reads with proper account deserialization:
- Use `SPL_TOKEN_ACCOUNT_SIZE` constant and validated layout
- Add account discriminator check before reading
- Add account owner check (verify it's owned by the Token program)

Prevents silent misreads that would corrupt position tracking.

---

## Build Priority 10: Enforce HELIUS_WEBHOOK_SECRET

**Claim we're backing:** "Authenticated webhook-based monitoring"

**What's built:** HMAC verification code is present in `helius-webhook.ts`.

**What to build:** Change `optional("HELIUS_WEBHOOK_SECRET", "")` to `required("HELIUS_WEBHOOK_SECRET")`. Add a startup assertion that rejects launch if the secret is empty. This turns the verification code that already exists into something that's always active.

---

## What We Have (Foundation is Strong)

| Component | Status |
|-----------|--------|
| 9-check circuit breaker logic | Built - needs real health factor input |
| Multi-protocol support (Klend, MarginFi, Solend) | Built - needs IDL deserialization |
| Cobo MPC for operational signing | Built - needs extended to admin |
| 5 emergency triggers | Built - needs on-chain action handlers |
| Pyth + Hermes oracle with fallback | Built - needs staleness/confidence checks |
| Drawdown tracker | Built - needs persistent high-water mark |
| TVL monitor with 20%/50% thresholds | Built |
| USDC depeg monitor | Built - needs oracle hardening |
| Rate limiting (token bucket + window) | Built - needs wiring to circuit breaker |
| Helius webhook with HMAC verification | Built - needs mandatory secret |

---

## Build Sprint Summary

10 targeted builds. No removal of any existing claim. Each build makes the running system match what the architecture already promises.

**Highest leverage (do first):**
1. Real health factor → circuit breaker (makes CB functional)
2. IDL deserialization → Voltr vault state (unlocks real position data)
3. Persist CB state → Redis (makes emergency controls durable)
4. Authenticate emergency endpoint (closes the biggest security gap)
5. Wire emergency action handlers (makes emergency response real end-to-end)
