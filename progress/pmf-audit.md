# PMF Audit: Ranger - Build Gap Analysis

**Auditor:** pmf-auditor-ranger (Pentagon Agent)
**Date:** 2026-04-17
**Frame:** Every gap is a build item. Claims stay. We build up to meet them.

---

## Executive Summary

Ranger's claims are correct and ambitious. The architecture is coherent. The differentiation (RWA floor + ML allocation + Cobo MPC on Solana) is genuinely novel. The gaps are not in the claims — they are in the **evidence layer** that backs the claims. This document maps every gap to a concrete buildable artifact.

**Current State:** Strong technical foundation, missing demand validation layer.
**Strategy:** Build the evidence, not a smaller vision.

---

## 1. Persona: "Institutional Allocators" - What to Build

The pitch targets institutional allocators. That claim is correct and worth keeping. Here is what needs to exist to make it credible:

### BUILD: Institutional Onboarding Flow
- **Fireblocks / Cobo integration documentation** with a clear "how to custody with us" guide for treasury teams
- **Minimum viable compliance doc:** a 2-page memo explaining Ranger's legal structure, audit status, and risk disclosures that a DAO legal counsel can forward to their board
- **Whitelisting / KYB flow:** even a simple Google Form or Typeform that signals "we take institutional onboarding seriously"

### BUILD: Persona-Specific Landing Pages
- **Persona A (Crypto-Native Treasury Manager):** ROI calculator showing "you have $2M USDC sitting idle. At current Kamino rates you earn $60K/yr. Ranger targets $300K/yr with <2% drawdown risk."
- **Persona B (DeFi Power User):** Yield comparison dashboard showing live Ranger APY vs. Kamino, Marginfi, and Jupiter Lend
- **Persona C (Family Office / Fund):** A "Request Pilot Access" flow with a contact form and a one-pager PDF automatically emailed — signals institutional seriousness

### BUILD: Reference Customer Pipeline
- Draft 5 outreach emails targeting specific Solana DAOs (Mango, Drift, Marinade treasuries) with a "60-day pilot, $100K minimum" offer
- One signed LOI from any named protocol = more credibility than 100 lines of code

---

## 2. Differentiation - What to Build to Make It Undeniable

Current differentiation is real but needs proof artifacts:

### BUILD: Live Performance Dashboard (Public)
- Real-time APY tracker showing Ranger vault APY vs. single-protocol alternatives
- Drawdown counter: "Days since last >1% drawdown: 47" (once live data exists)
- Allocation chart: live breakdown of USDC deployed across Kamino, Marginfi, Jupiter Lend, Ondo USDY, and cash buffer
- This turns "ML-optimized" from a claim into a visible, verifiable fact

### BUILD: Backtesting Report (Public PDF)
- Export the Monte Carlo simulation and Sharpe ratio analysis as a polished PDF report
- Include methodology, assumptions, and limitations section (judges respect intellectual honesty more than overclaiming)
- Host at `ranger.finance/research` or equivalent
- Sharpe of 22+ and 99.95% probability of >10% APY are strong numbers — make them findable

### BUILD: Smart Contract Audit
- Initiate an audit request with OtterSec, Neodyme, or Halborn
- Even an "audit in progress" badge with a confirmed engagement is credible
- Unaudited smart contracts holding institutional capital is the #1 objection from Persona A/C

### BUILD: RWA Integration Proof
- Screenshot or tx proof of Ondo USDY integration working on mainnet
- A short demo video (2 min) showing: deposit USDC → automatic allocation across all 5 sources → yield accruing in real-time
- This makes "5 yield sources including RWA" tangible, not theoretical

---

## 3. Market Size - What to Build to Justify the Bet

The TAM claim needs a narrative anchor:

### BUILD: Market Narrative One-Pager
- **Frame:** Solana stablecoin TVL grew 4x from 2024 to 2026. At current trajectory, $10B+ by 2027. Ranger is positioned to be the default yield layer for that capital.
- **Reference data:** Cite DeFiLlama, Messari, or Solana Foundation reports
- **Comparable:** Yearn Finance peaked at $7B TVL on Ethereum. Ranger is the Solana-native equivalent with better risk management.
- One well-sourced market slide > a vague "TAM: $340M" claim

### BUILD: Fee Model Calculator
- Public spreadsheet or web calculator: "Enter your AUM → see projected annual fee revenue to Ranger"
- At $50M AUM and 0.5% fee = $250K/yr. Shows the unit economics are real.

---

## 4. Demand Evidence - What to Build (Highest Priority)

This is the biggest gap. The builds here have the highest ROI for judge credibility:

### BUILD: User Interview Summaries (5 minimum)
- Conduct 5 interviews with actual DeFi treasury managers or power users
- Publish 1-paragraph summaries (with permission) at `ranger.finance/research`
- Template quote to target: *"I spend 3 hours/week manually rebalancing across Kamino and Marginfi and still underperform the market. I'd pay 0.5% for something that does this automatically."*
- Even 3 documented interviews upgrade the demand evidence significantly

### BUILD: Waitlist / Beta Access Page
- Simple form: email + approximate AUM + use case
- Even 50 signups is evidence of demand
- Publish signup count on the landing page: "247 allocators on waitlist" is compelling

### BUILD: Live Mainnet Performance Log
- Public GitHub or Notion page showing every rebalancing event with timestamps and tx hashes
- "Our vault has executed 143 rebalancing events since deployment with zero failed transactions" is a powerful credibility signal
- The 3 existing mainnet deposits become proof of concept, not embarrassment, if they're documented transparently

### BUILD: Community Validation
- Post a thread on Solana Twitter/X: "We built a multi-protocol yield optimizer with RWA floor. Is this something you'd use? APY target: 15-20%."
- Even 50 responses is demand signal
- DM the top 20 Solana DeFi Twitter accounts asking for feedback — 3 positive quote-tweets from respected accounts = social proof

---

## 5. Pitch Scrutiny - What to Build to Survive VC Follow-Up

**VC Question:** "Why not just use Kamino directly?"
**Build:** Yield comparison chart showing Ranger's multi-source diversification outperforms single-protocol by X% over the last 30 days. Concrete delta, not theoretical claim.

**VC Question:** "What happens if a protocol gets hacked?"
**Build:** One-pager on risk management framework: circuit breakers, max allocation caps per protocol (25%), insurance options (Nexus Mutual coverage if pursued), and the Cobo MPC custody layer. This is an engineering story, not a hedge.

**VC Question:** "15-20% sounds like Luna/Anchor. What's the catch?"
**Build:** Explicit comparison document: "How Ranger is different from Anchor Protocol." Anchor had a single yield source (staking), no diversification, unsustainable subsidies. Ranger has 5 yield sources with a TradFi floor (Ondo USDY). The RWA component is the key differentiator — it is yield from actual US Treasuries, not protocol emissions.

**VC Question:** "Have real customers deposited real money?"
**Build:** Document the mainnet deposits with tx hashes and AUM numbers. Even $10K from a non-team source with a name attached ("Drift DAO treasury pilot") changes the conversation.

---

## Build Priority Stack (Ranked by Judge Impact)

| Priority | Build Item | Effort | Impact |
|----------|-----------|--------|--------|
| 1 | Live public performance dashboard | Medium | Very High |
| 2 | Waitlist page + count | Low | High |
| 3 | Backtesting PDF report (public) | Low | High |
| 4 | 5 user interview summaries | Medium | Very High |
| 5 | Smart contract audit initiation | Low (admin) | High |
| 6 | DAO outreach + 1 signed LOI | Medium | Very High |
| 7 | Protocol hack FAQ one-pager | Low | High |
| 8 | Anchor vs. Ranger comparison | Low | High |
| 9 | ROI calculator for treasuries | Medium | Medium |
| 10 | Institutional onboarding flow | High | Medium (longer term) |

---

## Revised Scorecard (Current vs. Post-Build)

| Dimension | Now | After Priority Builds |
|-----------|-----|----------------------|
| Problem clarity | B+ | A- (user interviews add specificity) |
| User specificity | C | B+ (persona pages + interview quotes) |
| Market size | B- | B+ (sourced narrative + comparable) |
| Demand evidence | D | B (waitlist + interviews + live dashboard) |
| Differentiation | B+ | A- (backtesting PDF + live perf data) |
| 30-second pitch | B- | A- (scrutiny answers pre-built) |
| Competitive moat | C+ | B+ (audit + track record + first-mover docs) |

**Current Grade: C+. Post-build target: A-.**

The gap between C+ and A- is not more code. It is evidence, documentation, and one or two real customer relationships. None of these require architectural changes. They require 3-5 focused days of non-engineering work running in parallel with the technical build.

---

## Bottom Line

Ranger's claims are not wrong — they are ahead of the current evidence. The strategy is correct: build the evidence layer to match the ambition, not shrink the ambition to match what currently exists. The technical foundation is strong. The next sprint is building the credibility artifacts that let judges and allocators believe what the product already does.
