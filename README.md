# Ranger: Secure Hybrid Alpha Optimizer

Institutional-grade USDC vault on Solana combining RWA base yield with ML-optimized DeFi allocation, secured by Cobo MPC.

**Target:** 15-20% APY on USDC | **Max Drawdown:** <2% | **Security:** Cobo MPC multi-party signing

Built for the [Ranger Build-a-Bear Hackathon](https://earn.superteam.fun/listing/build-a-bear-hackathon/) on Voltr vaults.

## Strategy

The vault stacks three yield layers:

| Layer | Source | APY Range | Allocation |
|-------|--------|-----------|------------|
| **Floor** | Ondo USDY (US Treasuries via Trustful adaptor) | 4-5% | 20-40% |
| **Core** | Kamino, Marginfi, Jupiter Lend (lending via Lending adaptor) | 8-15% | 30-50% |
| **Boost** | Raydium CLMM stable pairs (via Raydium adaptor) | 10-25% | 10-30% |

An ML model (PyTorch time-series) predicts optimal allocation weights across protocols every 30 minutes. A keeper bot executes rebalances through Cobo MPC-signed transactions on the Voltr vault.

**Why this wins:**
- Only vault combining RWA yield floor with DeFi alpha (novel architecture)
- No Drift dependency (zero disqualification risk)
- Trained ML model for allocation (not just LLM prompting)
- Cobo MPC security (institutional-grade, sponsor bonus)
- Live on Solana mainnet with verifiable performance

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard (Next.js)                    │
│  TVL · APY · PnL Chart · Allocations · Rebalance Log    │
│  Wallet Connect (Phantom) · Risk Metrics · Strategy Info │
└──────────────────────┬──────────────────────────────────┘
                       │ API
┌──────────────────────▼──────────────────────────────────┐
│                   Keeper Bot (TypeScript)                 │
│  Data Fetch → ML Inference → Allocation → Rebalance Tx  │
│  30-min cron · Greedy fallback · Circuit breakers        │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
  ┌────▼────┐   ┌──────▼──────┐   ┌──────▼──────┐
  │ ML Model│   │  Cobo MPC   │   │  Voltr SDK  │
  │ PyTorch │   │  Signing    │   │  Vault Ops  │
  └─────────┘   └─────────────┘   └──────┬──────┘
                                         │
                    ┌────────────────────┬┴────────────────┐
                    │                    │                  │
             ┌──────▼──────┐   ┌────────▼────┐   ┌───────▼───────┐
             │   Lending    │   │  Trustful   │   │   Raydium     │
             │   Adaptor    │   │  Adaptor    │   │   Adaptor     │
             │ Kamino/Mfi/  │   │ Ondo USDY   │   │  CLMM Pools   │
             │ Jupiter Lend │   │ (RWA)       │   │  Stable Pairs  │
             └──────────────┘   └─────────────┘   └───────────────┘
```

## Project Structure

```
ranger/
├── src/
│   ├── app/                  # Next.js dashboard and API routes
│   │   ├── page.tsx          # Main dashboard (TVL, APY, PnL, allocations)
│   │   └── api/
│   │       ├── vault/        # Vault data API
│   │       ├── security/     # Emergency controls, status endpoints
│   │       └── webhooks/     # Helius + Cobo webhook handlers
│   ├── components/
│   │   ├── dashboard/        # 9 dashboard components (TVL, APY, PnL, etc.)
│   │   └── ui/               # Reusable UI components (shadcn)
│   ├── keeper/               # Keeper bot (rebalance engine)
│   │   ├── index.ts          # Entry point, cron orchestration
│   │   ├── services/         # Transaction builder, executor
│   │   └── types/            # Type definitions
│   ├── lib/                  # Shared utilities, vault API, types
│   └── providers/            # Wallet provider (Phantom/Solana)
├── contracts/                # Voltr vault on-chain scripts
│   └── src/
│       ├── scripts/          # Init vault, add adaptors, deposit, withdraw, health check
│       ├── constants/        # Protocol addresses (Kamino, Marginfi, Drift, etc.)
│       └── utils/            # RPC connection, helpers
├── security/                 # Security infrastructure
│   ├── cobo/                 # Cobo WaaS 2.0 MPC client, signing service, Solana signer
│   ├── circuit-breaker/      # Drawdown limits, rate limiting
│   ├── monitoring/           # Health monitor, Helius webhooks, alert manager
│   └── config/               # Security configuration
├── ml/                       # ML allocation model (PyTorch)
│   ├── models/               # Trained model weights
│   ├── inference/            # Real-time inference engine
│   ├── backtest/             # Backtesting framework
│   └── data/                 # Training data pipeline
├── strategy/                 # Strategy documentation
│   ├── THESIS.md             # Strategy thesis and competitive analysis
│   ├── RISK_FRAMEWORK.md     # Risk taxonomy, stress tests, Monte Carlo params
│   ├── ALLOCATION_MODEL.md   # Portfolio constraints, regime-based allocation
│   ├── REBALANCING.md        # Rebalancing logic and execution rules
│   ├── backtest.py           # Backtest simulation with incentive model
│   └── backtest_results.json # Historical backtest results (14.15% mean APY)
└── docs/                     # Submission materials
    ├── ARCHITECTURE.md       # Technical architecture deep-dive
    ├── PITCH_SCRIPT.md       # 3-minute pitch video script
    └── SECURITY-ARCHITECTURE.md # Security design document
```

## Risk Management

Five-tier drawdown response system:

| Level | Drawdown | Action |
|-------|----------|--------|
| Watch | 0.5% | Increase monitoring to 1-min intervals |
| Caution | 1.0% | Shift 15% to Ondo USDY |
| Warning | 1.5% | Shift 30% to USDY, pause CLMM |
| Critical | 2.0% | Exit all DeFi, 100% to USDY |
| Circuit Breaker | 3.0% | Full vault pause, manual review |

Additional safeguards: per-protocol max allocation (60%), multi-oracle validation (Pyth/Switchboard), protocol TVL monitoring, USDC depeg detection.

See [strategy/RISK_FRAMEWORK.md](strategy/RISK_FRAMEWORK.md) for full details including stress test scenarios and Monte Carlo simulation parameters.

## Tech Stack

- **Vault:** Voltr SDK (USDC vault with Lending, Trustful, Raydium adaptors)
- **ML Model:** PyTorch time-series model for allocation optimization
- **Security:** Cobo WaaS 2.0 MPC (multi-party computation signing)
- **Dashboard:** Next.js, Tailwind CSS, Recharts, Solana Wallet Adapter
- **Keeper:** TypeScript, 30-min cron, Helius RPC
- **Chain:** Solana mainnet-beta

## Setup

### Prerequisites
- Node.js 20+
- Python 3.11+ (for ML model training)
- Solana CLI
- Cobo WaaS 2.0 account

### Environment Variables

Create `.env.local` at the project root:

```env
# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=<Helius RPC endpoint>
VAULT_ADDRESS=<Voltr vault public key>

# Cobo MPC
COBO_API_KEY=<your Cobo WaaS API key>
COBO_API_SECRET=<your Cobo WaaS API secret>
COBO_WALLET_ID=<MPC wallet ID>

# Keeper
KEEPER_INTERVAL_MS=1800000
KEEPER_FALLBACK_MODE=greedy
```

### Install & Run

```bash
# Dashboard
npm install
npm run dev

# Contracts (Voltr vault scripts)
cd contracts
npm install

# ML model dependencies (optional, for training)
cd ml
pip install -r requirements.txt
```

## On-Chain Verification

Devnet verification, admin keypair plus RPC path:
- Admin keypair: `DCUGehQb5GKW9eiQcQRCkpBsLUz3HpGzVjqskH78xCSD`
- Manager keypair: `2HMJK3s7RHVcZetj3ECmuNxPRMq3jEUQ7rERMAyhKVq2`
- Admin-signed devnet tx: [`2rYDMaAu...QSqos9`](https://solscan.io/tx/2rYDMaAuP78Zg1EUbySJjZPMJyM6M1jENFKt6uSgYEoR3kRkrbaCUcskCmc6qgJRyt8oFyAmuQQWLBq6MtQSqos9?cluster=devnet)

Vault deployment targets mainnet because the Voltr vault program (`vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8`) is mainnet-only. See [docs/E2E-STATUS.md](docs/E2E-STATUS.md) for the full verification log, gap analysis, and the deployment playbook for mainnet.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full deployment flow and verification guide.

## Team

Built by the Ranger team for the Build-a-Bear Hackathon (April 2026).

## License

MIT
