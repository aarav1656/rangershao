import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RebalanceEngine } from '../src/keeper/services/rebalance-engine';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';

vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual('@solana/web3.js');
  return {
    ...actual,
    Connection: vi.fn().mockImplementation(() => ({
      getAccountInfo: vi.fn().mockResolvedValue(null),
    })),
  };
});

// Use the system program ID and a second well-known program as valid pubkeys
const PUBKEY_A = '11111111111111111111111111111111';
const PUBKEY_B = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const mockConfig = {
  vaultPubkey: PUBKEY_A,
  managerPubkey: PUBKEY_A,
  driftThresholdPct: 0.05,
  apyChangeThresholdPct: 0.02,
  strategies: [
    { id: 'kamino-usdc', protocol: 'kamino', pubkey: PUBKEY_A, enabled: true },
    { id: 'marginfi-usdc', protocol: 'marginfi', pubkey: PUBKEY_B, enabled: true },
  ],
} as any;

describe('RebalanceEngine', () => {
  let engine: RebalanceEngine;

  beforeEach(() => {
    const conn = new Connection('https://fake.rpc');
    const manager = new PublicKey(PUBKEY_A);
    engine = new RebalanceEngine(mockConfig, conn, manager);
  });

  it('detects drift-based rebalance need', () => {
    const allocations = [
      { strategyId: 'kamino-usdc', strategyPubkey: new PublicKey(PUBKEY_A), protocol: 'kamino', currentWeight: 0.7, targetWeight: 0.5, currentAmountUsdc: 7000, targetAmountUsdc: 5000 },
      { strategyId: 'marginfi-usdc', strategyPubkey: new PublicKey(PUBKEY_B), protocol: 'marginfi', currentWeight: 0.3, targetWeight: 0.5, currentAmountUsdc: 3000, targetAmountUsdc: 5000 },
    ];

    const result = engine.shouldRebalance(allocations, new Map(), new Map());
    expect(result.should).toBe(true);
    expect(result.trigger).toBe('drift');
  });

  it('detects APY change trigger', () => {
    const allocations = [
      { strategyId: 'kamino-usdc', strategyPubkey: new PublicKey(PUBKEY_A), protocol: 'kamino', currentWeight: 0.5, targetWeight: 0.5, currentAmountUsdc: 5000, targetAmountUsdc: 5000 },
    ];

    const prev = new Map([['kamino-usdc', 0.10]]);
    const curr = new Map([['kamino-usdc', 0.15]]);

    const result = engine.shouldRebalance(allocations, prev, curr);
    expect(result.should).toBe(true);
    expect(result.trigger).toBe('apy_change');
  });

  it('reports no rebalance needed when within threshold', () => {
    const allocations = [
      { strategyId: 'kamino-usdc', strategyPubkey: new PublicKey(PUBKEY_A), protocol: 'kamino', currentWeight: 0.50, targetWeight: 0.51, currentAmountUsdc: 5000, targetAmountUsdc: 5100 },
    ];

    const result = engine.shouldRebalance(allocations, new Map(), new Map());
    expect(result.should).toBe(false);
  });
});
