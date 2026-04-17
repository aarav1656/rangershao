# Audit Readiness

## Architecture Security Model

Ranger separates decisioning, transaction construction, and signing so that no single application component can move funds on its own.

- Keeper bot fetches protocol data, computes target allocations, and builds unsigned rebalance transactions.
- Voltr vault logic remains the on-chain enforcement point for asset accounting and strategy adapters.
- Circuit breaker checks gate every rebalance before any signing request leaves the keeper boundary.
- Cobo MPC is the only signing path for production vault authority, so there is no server-resident hot private key.
- Helius-backed monitoring and authenticated webhooks provide external event visibility and incident response triggers.

## Audited Dependencies

| Dependency / Control Plane | Role in System | Audit / Assurance Status | Notes |
|---|---|---|---|
| Voltr vault framework | Vault primitive and strategy adapter orchestration | External protocol chosen for prior audit posture | Ranger inherits audited vault mechanics instead of introducing a custom vault program |
| Solana core programs | Settlement, SPL token movement, transaction execution | Battle-tested ecosystem dependency | Exposure limited to standard token and transaction flows |
| Cobo WaaS 2.0 MPC | Vault authority signing and policy enforcement | Vendor security review and institutional custody controls | Threshold signing removes single-key compromise risk |
| Helius RPC / webhooks | Chain data, webhook delivery, event monitoring | Infrastructure provider with signed webhook support | HMAC verification required on inbound events |
| Axios / TypeScript runtime stack | Off-chain networking and keeper runtime | Standard open-source dependency review required before release | Pin versions and include SCA output in audit package |

## Security Controls

### Circuit Breaker: 9 Checks

1. Emergency pause check
2. Cooldown timer after trip events
3. Health factor emergency threshold
4. Health factor minimum operating threshold
5. Single transaction USD limit
6. Per-minute transaction rate limit
7. Per-hour transaction rate limit
8. Daily volume limit
9. Minimum rebalance interval enforcement

### Cobo MPC

- 2-of-3 threshold signing model for vault authority
- No complete private key material on the keeper host
- Policy-based approval controls for transaction size and allowed destinations
- Signed transaction trail available for compliance and incident review

### HMAC Webhooks

- All Helius webhook payloads must be authenticated before processing
- Reject unsigned or mismatched payloads before any state transition
- Log verification failures as security events
- Treat webhook ingestion as an untrusted boundary even when the sender is known

## Risk Vectors

| Risk Vector | Impact | Mitigation |
|---|---|---|
| Protocol exploit in an allocation target | Principal loss or frozen liquidity | Per-strategy caps, emergency pause, rapid rebalance or exit path, protocol allowlist |
| ML or ensemble model error | Misallocation and reduced risk-adjusted return | Post-inference constraints, fallback greedy allocator, human-configurable strategy limits |
| Keeper host compromise | Unauthorized transaction construction attempt | MPC-only signing, circuit breaker gating, webhook and API secret isolation |
| Webhook forgery or replay | False alerts or incorrect automation triggers | HMAC verification, timestamp validation, replay protection in receiver |
| RPC / data source degradation | Stale rates or delayed execution | Timeouts, fallback allocation path, monitored provider health |
| Dependency supply-chain issue | Runtime compromise or silent regression | Lockfile review, pinned versions, software composition analysis before release |

## Pre-Deployment Checklist

- Confirm all production signing flows route through Cobo MPC only.
- Validate circuit breaker thresholds against current vault size and liquidity assumptions.
- Verify Helius and Cobo webhook secrets are configured and tested with invalid-signature cases.
- Freeze dependency versions and export current SCA / vulnerability scan results.
- Run `npx tsc --noEmit` and the full keeper test suite on the release candidate.
- Review per-strategy allocation caps, fallback behavior, and emergency pause runbook.
- Confirm monitoring destinations for CRITICAL and EMERGENCY alerts.
- Archive architecture, threat model, and operational runbooks in the audit package.
