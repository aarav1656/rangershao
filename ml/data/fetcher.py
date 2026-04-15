"""
Real-time rate fetcher for Solana DeFi protocols.
Primary source: DefiLlama yields API (reliable, covers all protocols).
Fallback: protocol-specific APIs.
"""

import json
import time
import os
from typing import Dict, Optional, List
from dataclasses import dataclass, asdict
import requests

DEFILLAMA_POOLS_URL = "https://yields.llama.fi/pools"
DEFILLAMA_CHART_URL = "https://yields.llama.fi/chart"

POOL_IDS = {
    "kamino": "d2141a59-c199-4be7-8d4b-c8223954836b",
    "jupiter_lend": "d783c8df-e2ed-44b4-8317-161ccc1b5f06",
    "raydium_clmm": "8ad76d42-6247-42f2-8281-5d59cb77b8b3",
    "ondo_usdy": "00b83068-9f87-4411-b5d7-5d2ff48c40c4",
}

MARGINFI_API = "https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json"


@dataclass
class ProtocolSnapshot:
    protocol: str
    supply_apy: float
    borrow_apy: float
    utilization: float
    tvl_usd: float
    timestamp: float

    def to_dict(self):
        return asdict(self)


def fetch_defillama_pools() -> Dict[str, ProtocolSnapshot]:
    results = {}
    try:
        resp = requests.get(DEFILLAMA_POOLS_URL, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        pools = data.get("data", data) if isinstance(data, dict) else data

        pool_id_to_protocol = {v: k for k, v in POOL_IDS.items()}
        now = time.time()

        for pool in pools:
            pid = pool.get("pool", "")
            if pid in pool_id_to_protocol:
                protocol = pool_id_to_protocol[pid]
                apy_pct = float(pool.get("apy", 0) or 0)
                apy_decimal = apy_pct / 100.0
                tvl = float(pool.get("tvlUsd", 0) or 0)

                results[protocol] = ProtocolSnapshot(
                    protocol=protocol,
                    supply_apy=apy_decimal,
                    borrow_apy=0.0,
                    utilization=0.0,
                    tvl_usd=tvl,
                    timestamp=now,
                )
    except Exception as e:
        print(f"[fetcher] DefiLlama fetch failed: {e}", flush=True)

    return results


def fetch_marginfi_rates() -> Optional[ProtocolSnapshot]:
    try:
        resp = requests.get(MARGINFI_API, timeout=10)
        resp.raise_for_status()
        banks = resp.json()

        items = banks if isinstance(banks, list) else banks.values() if isinstance(banks, dict) else []
        for bank in items:
            token = bank.get("tokenSymbol", "") or bank.get("symbol", "")
            if "USDC" in token.upper():
                lending_rate = float(bank.get("lendingRate", 0))
                borrowing_rate = float(bank.get("borrowingRate", 0))
                total_deposits = float(bank.get("totalDeposits", 0))
                total_borrows = float(bank.get("totalBorrows", 0))
                util = total_borrows / total_deposits if total_deposits > 0 else 0
                return ProtocolSnapshot(
                    protocol="marginfi",
                    supply_apy=lending_rate,
                    borrow_apy=borrowing_rate,
                    utilization=util,
                    tvl_usd=total_deposits,
                    timestamp=time.time(),
                )
    except Exception as e:
        print(f"[fetcher] Marginfi fetch failed: {e}", flush=True)
    return None


def fetch_defillama_marginfi() -> Optional[ProtocolSnapshot]:
    try:
        resp = requests.get(DEFILLAMA_POOLS_URL, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        pools = data.get("data", data) if isinstance(data, dict) else data

        for pool in pools:
            if (pool.get("chain") == "Solana"
                and "marginfi" in pool.get("project", "").lower()
                and pool.get("symbol", "") == "USDC"):
                apy_pct = float(pool.get("apy", 0) or 0)
                return ProtocolSnapshot(
                    protocol="marginfi",
                    supply_apy=apy_pct / 100.0,
                    borrow_apy=0.0,
                    utilization=0.0,
                    tvl_usd=float(pool.get("tvlUsd", 0) or 0),
                    timestamp=time.time(),
                )
    except Exception as e:
        print(f"[fetcher] DefiLlama marginfi search failed: {e}", flush=True)
    return None


PROTOCOL_DEFAULTS = {
    "kamino": ProtocolSnapshot("kamino", 0.032, 0.0, 0.72, 14_460_000, 0),
    "marginfi": ProtocolSnapshot("marginfi", 0.04, 0.0, 0.68, 120_000_000, 0),
    "jupiter_lend": ProtocolSnapshot("jupiter_lend", 0.036, 0.0, 0.65, 453_000_000, 0),
    "raydium_clmm": ProtocolSnapshot("raydium_clmm", 0.050, 0.0, 0.45, 4_600_000, 0),
    "ondo_usdy": ProtocolSnapshot("ondo_usdy", 0.036, 0.0, 0.0, 180_000_000, 0),
}


def fetch_all_rates() -> Dict[str, ProtocolSnapshot]:
    results = fetch_defillama_pools()

    if "marginfi" not in results:
        marginfi = fetch_marginfi_rates()
        if marginfi is None:
            marginfi = fetch_defillama_marginfi()
        if marginfi is not None:
            results["marginfi"] = marginfi

    for protocol in ["kamino", "marginfi", "jupiter_lend", "raydium_clmm", "ondo_usdy"]:
        if protocol not in results:
            default = PROTOCOL_DEFAULTS[protocol]
            default.timestamp = time.time()
            results[protocol] = default
            print(f"[fetcher] Using default rates for {protocol}", flush=True)

    return results


def fetch_historical_rates(pool_id: str) -> List[Dict]:
    try:
        resp = requests.get(f"{DEFILLAMA_CHART_URL}/{pool_id}", timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", data) if isinstance(data, dict) else data
    except Exception as e:
        print(f"[fetcher] Historical fetch failed for {pool_id}: {e}", flush=True)
        return []


def fetch_all_historical() -> Dict[str, List[Dict]]:
    all_history = {}
    for protocol, pool_id in POOL_IDS.items():
        history = fetch_historical_rates(pool_id)
        all_history[protocol] = history
        print(f"[fetcher] {protocol}: {len(history)} historical data points", flush=True)
    return all_history


if __name__ == "__main__":
    print("Fetching live rates from all protocols via DefiLlama...")
    rates = fetch_all_rates()
    output = {name: snap.to_dict() for name, snap in rates.items()}
    print(json.dumps(output, indent=2))
