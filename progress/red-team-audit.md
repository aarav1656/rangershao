# Red Team Audit - Ranger DeFi Vault: Build-Up Plan

**Auditor:** red-team-ranger (adversarial security agent)
**Date:** 2026-04-17
**Scope:** Full codebase - hardcoded secrets, mocked data, unverified API calls, attack surfaces
**Strategy:** Every gap is a BUILD task. We raise the implementation to match the claims, never lower the claims.

---

## What Ranger Claims (and Must Deliver)

- Autonomous AI-driven rebalancing vault on Solana mainnet
- Real-time ML allocation engine with circuit breakers
- Institutional-grade security with emergency controls
- On-chain execution with verifiable transaction signatures
- Multi-protocol yield optimization (Kamino, MarginFi, Jupiter, Raydium)

All of these are strong, winnable claims. The gaps below are the exact engineering work needed to make every claim bulletproof.

---

## BUILD PRIORITY 1 - Critical (ship before next demo)

### B1 - Build: Admin Authentication Layer on Emergency Controls
**File to modify:** `src/app/api/security/emergency/route.ts:13-35`

**Claim it backs:** "Institutional-grade security with emergency controls"

The emergency pause/resume endpoint currently accepts calls from anyone. To back the security claim, build a proper admin auth layer:

```typescript
// Add before any action handling:
const authHeader = request.headers.get("Authorization");
const adminSecret = process.env.ADMIN_SECRET;
if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Also add rate limiting (max 5 calls/min) and an audit log entry for every pause/resume action. This turns a gap into a feature: "tamper-proof emergency controls with audit trail."

### B2 - Build: Real Health Factor Fetch in Circuit Breaker
**File to modify:** `src/keeper/services/keeper-loop.ts:161`

**Claim it backs:** "Real-time ML allocation engine with circuit breakers"

```typescript
healthFactor: 1.0, // TODO: fetch real health factor from protocol data
```

Build the actual fetch. Kamino and MarginFi both expose health factor through their SDKs. Wire it in:

```typescript
const healthFactor = await protocolDataFetcher.fetchHealthFactor(connection, vaultPubkey);
```

This makes the circuit breaker real. "Our circuit breaker monitors live protocol health and halts rebalancing if health factor drops below 1.05" is a strong, verifiable claim.

### B3 - Build: Verified On-Chain Transaction Return
**File to modify:** `src/app/api/vault/route.ts:99`

**Claim it backs:** "On-chain execution with verifiable transaction signatures"

Remove the `"backtest-simulated"` fallback string. On decode failure, return a proper error with context. When returning real data, always return the actual Solana transaction signature:

```typescript
// Replace silent fallback:
if (!vaultData) {
  return NextResponse.json(
    { error: "Vault data unavailable", code: "DECODE_FAILURE" },
    { status: 503 }
  );
}
```

Real tx signatures from mainnet are checkable on Solscan. That is live proof the system works.

---

## BUILD PRIORITY 2 - High (ship before judging)

### B4 - Build: Zod Validation on ML Model Responses
**File to modify:** `src/keeper/services/allocation-engine.ts:40-54`

**Claim it backs:** "AI-driven rebalancing with confidence scoring"

Add a Zod schema that validates weights sum to 1.0, confidence is in [0,1], and no NaN/Infinity:

```typescript
const MLResponseSchema = z.object({
  weights: z.record(z.number().min(0).max(1)),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});
```

This makes the ML pipeline production-grade. Judges who inspect the code will see defensive engineering, not raw data access.

### B5 - Build: Zod Validation on All Protocol API Responses
**File to modify:** `src/keeper/services/protocol-data-fetcher.ts:120-351`

**Claim it backs:** "Multi-protocol yield optimization"

Add typed schemas for Kamino, MarginFi, Jupiter, Raydium responses. Each external call should decode through a schema before any field access. Zero raw `.data.strategies[0]` patterns.

### B6 - Build: Auth on Security Status Endpoint
**File to modify:** `src/app/api/security/status/route.ts:13-27`

**Claim it backs:** "Institutional-grade security"

Same Bearer token check as B1. Security posture data should only be visible to authenticated operators, not public. Add a read-only `MONITOR_SECRET` tier separate from `ADMIN_SECRET` so dashboards can read without write access.

### B7 - Build: Bounded Allocation Scoring
**File to modify:** `src/keeper/services/allocation-engine.ts:79`

Clamp all inputs before scoring: `utilizationRate` to [0, 1], APY to a max ceiling (e.g., 500%), TVL to a minimum floor before division. Document the bounds in a comment. This is standard quantitative finance defensive coding.

---

## BUILD PRIORITY 3 - Medium (polish round)

### B8 - Build: Strict CORS Config on ML Service
**File to modify:** `ml/inference/service.py:33-35`

Replace wildcard with explicit frontend domains. Add the production Vercel URL and localhost for dev. Removes a spec violation and tightens the attack surface.

### B9 - Build: Configurable Slippage in Rebalance Engine
**File to modify:** `src/keeper/services/rebalance-engine.ts:96`

Wire `config.maxSlippageBps` into the actual calculation instead of the hardcoded 0.1%. This makes the "configurable risk parameters" claim accurate and lets the demo show live slippage adjustment.

### B10 - Build: Strategy Config Validation on Startup
**File to modify:** `src/keeper/config.ts:79-109`

Validate on load: allocations must be in [0, 1], min <= max, sum of minimums <= 100%. Throw on startup if invalid. "Fails fast with clear errors" is better than silent misconfiguration.

### B11 - Build: ML Fallback Alerting
**File to modify:** `src/keeper/services/allocation-engine.ts:20-31`

When ML model fails and greedy fallback activates, emit a structured log event AND a webhook/alert. This supports the claim of "observable AI system" and gives operators real-time visibility.

### B12 - Build: Protocol Partial-Failure Surface
**File to modify:** `src/keeper/services/protocol-data-fetcher.ts:66-71`

When fewer than N protocols respond, surface this to the caller as a `partialData: true` flag with a list of which protocols failed. Let the keeper decide whether to proceed or pause. Documents resilience, not fragility.

### B13 - Build: Dynamic Kamino Market ID Resolution
**File to modify:** `src/keeper/services/protocol-data-fetcher.ts:118`

Fetch the current market ID from Kamino's on-chain registry at startup instead of hardcoding. Cache it with a 1-hour TTL. This makes the integration resilient to Kamino protocol upgrades, a real operational concern for a live vault.

### B14 - Build: Proper Error Response When Vault Decode Fails
**File to modify:** `src/app/api/vault/route.ts:99-104`

Already covered in B3. Remove silent backtest fallback entirely.

### B15 - Build: Dust Collection in Rebalance Engine
**File to modify:** `src/keeper/services/rebalance-engine.ts:99`

Implement a dust sweep: track cumulative floor-rounding loss per strategy. When accumulated dust exceeds a threshold (e.g., 1 USDC), include it in the next rebalance. This is a real yield optimization detail that impresses technical judges.

---

## BUILD PRIORITY 4 - Low

### B16 - Build: Singleton Initialization Guard
**File to modify:** `src/app/api/security/emergency/route.ts:3-11`

Add a mutex or Promise-based once-guard on orchestrator initialization to prevent double-init on concurrent cold starts. One-liner fix.

---

## Verified Strengths (Keep and Highlight)

- `.env` file with secrets is **not git-tracked** - secrets hygiene is correct, mention this in the README
- Mainnet deployment scripts exist with real vault + strategy deposits (per recent commits)
- Devnet deployment with auto `.env` updates shows operational maturity

---

## What This Build Plan Delivers

After completing Priority 1 and 2:

| Claim | Status After Build |
|-------|--------------------|
| Institutional-grade security | Authenticated emergency controls + audit log |
| Real-time circuit breakers | Live health factor fetch from protocol |
| Verifiable on-chain execution | Real tx signatures, no fake fallbacks |
| AI allocation with confidence | Validated ML response pipeline |
| Multi-protocol optimization | Schema-validated external API layer |

Every item above is something a judge can verify in the code and on-chain. That is the goal.

---

## Execution Order

1. B1, B2, B3 - one session, unblocks all security claims
2. B4, B5, B6 - one session, hardens the AI and multi-protocol claims
3. B7, B9, B10, B11 - polish session, config and observability
4. B8, B12, B13, B15, B16 - final hardening pass
