# Ranger Test Build Plan

**Current foundation: Strong simulation layer. Build target: Full protocol-grade test suite.**

---

## What We Already Have (Strong Foundation)

| Component | Status | Notes |
|-----------|--------|-------|
| Monte Carlo simulation | **Excellent** | 10,000 runs, OU mean-reverting APY, Cholesky correlation matrix |
| Stress scenarios | **Excellent** | 4 scenarios: exploit, rate crash, whipsaw, floor rates |
| Allocation invariants | **Good** | 7 invariants verified across 10k simulations |
| Walk-forward backtest | **Good** | ML vs 4 strategy baselines |
| Cobo E2E integration | **Present** | Signing workflow covered manually |

The quantitative simulation layer is legitimately impressive. Now we build the protocol-level layer to match.

---

## What to Build (Priority Order)

### Priority 1: Test Infrastructure (unlocks everything else)

```bash
npm i -D vitest @vitest/coverage-v8 fast-check
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Outcome:** `npm test` goes from crashing to running a full suite.

---

### Priority 2: Keeper Invariant Tests

Ranger's claim: "AI-driven rebalancing that never exceeds protocol risk limits."

To back this up, build:
- `keeper/tests/rebalance.test.ts`: Rebalance output never allocates >60% to a single protocol
- `keeper/tests/circuit-breaker.test.ts`: Circuit breaker triggers at correct APY deviation threshold
- `keeper/tests/allocations.test.ts`: All allocations sum to exactly 100% across all inputs

---

### Priority 3: Fast-Check Property Tests (Fuzz Layer)

Ranger's claim: "Robust allocation engine with enforced constraints."

To back this up, build:
- Property: for any valid APY input array, allocations always sum to 1.0
- Property: min/max per-protocol bounds always respected
- Property: Ondo floor allocation always >= configured minimum
- Property: deposit then withdraw round-trip invariant (returns >= original minus known fees)

Target: 50+ fuzz properties covering the allocation engine and keeper logic.

---

### Priority 4: HMAC Security Tests

Ranger's claim: "MPC-secured with Cobo for institutional-grade custody."

To back this up, build:
- Boundary: empty payload rejected
- Boundary: malformed JSON rejected
- Security: replay attack (same nonce) rejected
- Security: tampered payload signature fails verification

---

### Priority 5: Voltr SDK Integration Tests

Ranger's claim: "Live vault with real Solana deposits verified on mainnet."

To back this up, build automated tests for:
- Deposit → balance confirmed
- Withdraw → correct amount returned
- Strategy allocation matches configured weights

---

### Priority 6: CI Pipeline

Wire everything to GitHub Actions:
```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

**Outcome:** Every commit proves the protocol is safe. Judges see green badges.

---

## Build Sequence

| Step | Task | Unlocks Claim |
|------|------|---------------|
| 1 | Install Vitest + fast-check | Test infrastructure |
| 2 | Keeper invariant tests (3 files) | "Enforced risk limits" |
| 3 | Fast-check property tests (50+ fuzz) | "Robust allocation engine" |
| 4 | HMAC security boundary tests | "Institutional-grade custody" |
| 5 | Voltr SDK integration tests | "Live mainnet vault" |
| 6 | GitHub Actions CI | "Production-ready protocol" |

---

## Target Metrics (Post-Build)

| Metric | Today | Target |
|--------|-------|--------|
| Test:source ratio | 7.8% | 30%+ |
| Fuzz invariants | 0 (TS layer) | 50+ |
| Automated test files | 0 | 10+ |
| CI status | None | Green on every push |
| Monte Carlo runs | 10,000 | 10,000 (keep) |
| Property-based tests | 0 | 20+ |

The simulation layer already puts Ranger ahead of most submissions. Adding protocol-level tests makes every claim in the README backed by verifiable, runnable code — which is exactly what judges audit for.
