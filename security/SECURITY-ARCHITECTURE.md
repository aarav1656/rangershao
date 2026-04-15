# Ranger Vault Security Architecture

## Overview

Ranger uses a defense-in-depth security model where no single component failure can compromise vault funds. All transaction signing flows through Cobo MPC (Multi-Party Computation) wallets, eliminating private key exposure entirely.

## Key Management: Cobo WaaS 2.0 MPC

**Why MPC over traditional keypairs:**
Traditional DeFi vaults store a hot wallet private key on the server. If the server is compromised, all funds are at risk. With Cobo MPC, the private key never exists in complete form anywhere.

**Architecture:**
- 2-of-3 threshold signature scheme (TSS)
- Key shares distributed: Cobo (1), Ranger server-signer (1), disaster recovery (1)
- Transaction signing requires collaboration of at least 2 parties
- Organization-Controlled Wallet (OCW) model for institutional custody

**Integration Flow:**
1. Keeper bot builds unsigned `VersionedTransaction` with rebalance instructions
2. `CoboSolanaSigner` extracts instructions and converts to Cobo contract call format
3. Cobo MPC nodes collaboratively sign the transaction
4. Signed transaction is broadcast to Solana via RPC

**Cobo Transaction Policies:**
- Maximum single transaction amount limits
- Whitelisted destination addresses only
- Approval quorum for large transactions
- Automatic rejection of transactions to unknown addresses

## Circuit Breaker (9 Checks)

Every transaction passes through the circuit breaker before Cobo signing:

1. **Emergency pause check**: Manual kill switch for incidents
2. **Cooldown timer**: Enforced delay after any trip event
3. **Health factor emergency** (< 1.05): Triggers emergency pause, blocks all operations
4. **Health factor minimum** (< 1.2): Blocks rebalances, allows emergency withdrawals
5. **Single transaction limit**: Caps individual transaction size in USD
6. **Per-minute rate limit**: Max transactions per minute (default: 5)
7. **Per-hour rate limit**: Max transactions per hour (default: 30)
8. **Daily volume limit**: Maximum daily transaction volume in USD
9. **Rebalance interval**: Minimum time between rebalances (default: 60s)

## Monitoring Stack

### Helius Webhooks (On-Chain Events)
- Enhanced webhooks registered for vault address and all strategy accounts
- Real-time detection of:
  - Large SOL transfers (>1000 SOL triggers alert)
  - Large USDC transfers (>$10,000 triggers alert)
  - Transfers to unknown/unwhitelisted addresses (CRITICAL alert)
- HMAC signature verification on all incoming webhook payloads

### Health Factor Monitoring
- Periodic polling at configurable intervals (default: 30s)
- Automatic circuit breaker trip on health factor degradation
- Tiered alerting: WARNING at 1.2, CRITICAL at 1.05

### Alert Manager
- Severity levels: INFO, WARNING, CRITICAL, EMERGENCY
- Alert types: health warnings, anomalous transactions, circuit breaker trips, signing failures
- Webhook delivery to external alerting systems (Slack, PagerDuty)
- In-memory alert log with 100-entry ring buffer

## Security Audit Summary

Full codebase audit completed. Key findings:

**Passed:**
- No private keys or hardcoded secrets anywhere in codebase
- All signing flows through Cobo MPC, zero local key material
- Webhook routes verify HMAC signatures before processing payloads
- Transaction executor uses exponential backoff retry (not infinite loops)
- Withdrawal-first ordering in rebalance execution (safe pattern, reduces exposure window)
- `vault-api.ts` uses `NOT_IMPLEMENTED` errors for unfinished endpoints (fails loud, not fake)
- Circuit breaker gates every signing operation

**Accepted risks:**
- Public RPC fallback (`mainnet-beta`) is rate-limited but acceptable for fallback path
- Internal API responses not schema-validated (trusted internal boundary)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/security/status` | GET | Full security status (circuit breaker, health, signing stats) |
| `/api/security/emergency` | POST | Emergency pause/resume operations |
| `/api/webhooks/helius` | POST | Helius webhook receiver with HMAC verification |
| `/api/webhooks/cobo` | POST | Cobo transaction status webhook receiver |

## Rate Limiting

Token bucket rate limiter with two buckets:
- **rebalance**: Max N rebalances per day (default: 48)
- **rebalance-interval**: Minimum interval between rebalances

## Competitor Comparison

| Feature | Ranger | Competitors |
|---------|--------|-------------|
| Key Management | Cobo MPC (2-of-3 TSS) | Plain keypair on server |
| Transaction Policies | Cobo-enforced limits | None |
| Circuit Breaker | 9 automated checks | None or basic |
| On-chain Monitoring | Helius webhooks, real-time | Manual or none |
| Emergency Pause | Automated + manual | Manual only |
| Health Factor Guard | Automatic at 1.05/1.2 | None |
| Audit Trail | Full signing log | None |

## File Structure

```
security/
  config/security-config.ts    - Environment-based configuration
  cobo/
    cobo-mpc-client.ts         - Cobo WaaS 2.0 API client
    cobo-signing-service.ts    - Signing with circuit breaker checks
    cobo-solana-signer.ts      - Solana-specific contract call signing
    cobo-waas2.d.ts            - TypeScript declarations for Cobo SDK
  circuit-breaker/
    circuit-breaker.ts         - 9-check circuit breaker
    rate-limiter.ts            - Token bucket rate limiter
  monitoring/
    alert-manager.ts           - Alert creation and delivery
    health-monitor.ts          - Periodic health checks
    helius-monitor.ts          - Helius webhook event analysis
    helius-webhook.ts          - Helius API integration
  orchestrator.ts              - Central security coordinator
  index.ts                     - Public API exports
```
