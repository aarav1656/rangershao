#!/usr/bin/env python3
"""
Download historical rate data from DefiLlama for all target protocols.
Outputs aligned CSV ready for model training.
"""

import csv
import json
import os
import sys
from datetime import datetime
from typing import Dict, List

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

DEFILLAMA_CHART_URL = "https://yields.llama.fi/chart"

POOL_IDS = {
    "kamino": "d2141a59-c199-4be7-8d4b-c8223954836b",
    "jupiter_lend": "d783c8df-e2ed-44b4-8317-161ccc1b5f06",
    "raydium_clmm": "8ad76d42-6247-42f2-8281-5d59cb77b8b3",
    "ondo_usdy": "00b83068-9f87-4411-b5d7-5d2ff48c40c4",
}

OUTPUT_DIR = os.path.dirname(__file__)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "historical_rates.csv")


def fetch_pool_history(pool_id: str) -> List[Dict]:
    resp = requests.get(f"{DEFILLAMA_CHART_URL}/{pool_id}", timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return data.get("data", data) if isinstance(data, dict) else data


def align_by_date(all_history: Dict[str, List[Dict]]) -> List[Dict]:
    date_map = {}

    for protocol, history in all_history.items():
        for point in history:
            ts = point.get("timestamp", "")
            date = ts[:10]
            if date not in date_map:
                date_map[date] = {"date": date}

            apy_pct = float(point.get("apy", 0) or 0)
            tvl = float(point.get("tvlUsd", 0) or 0)
            apy_base = float(point.get("apyBase", 0) or 0)
            apy_reward = float(point.get("apyReward", 0) or 0)

            date_map[date][f"{protocol}_apy"] = apy_pct / 100.0
            date_map[date][f"{protocol}_apy_base"] = apy_base / 100.0
            date_map[date][f"{protocol}_apy_reward"] = apy_reward / 100.0
            date_map[date][f"{protocol}_tvl"] = tvl

    rows = sorted(date_map.values(), key=lambda x: x["date"])
    return rows


def main():
    print("Downloading historical data from DefiLlama...")
    all_history = {}

    for protocol, pool_id in POOL_IDS.items():
        print(f"  Fetching {protocol} ({pool_id})...")
        history = fetch_pool_history(pool_id)
        all_history[protocol] = history
        print(f"    Got {len(history)} data points")

    print("Aligning data by date...")
    rows = align_by_date(all_history)
    print(f"Total aligned rows: {len(rows)}")

    if not rows:
        print("ERROR: No data downloaded")
        sys.exit(1)

    protocols = list(POOL_IDS.keys())
    headers = ["date"]
    for p in protocols:
        headers.extend([f"{p}_apy", f"{p}_apy_base", f"{p}_apy_reward", f"{p}_tvl"])

    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f"Saved to {OUTPUT_FILE}")

    complete_rows = [r for r in rows if all(f"{p}_apy" in r for p in protocols)]
    print(f"Complete rows (all protocols have data): {len(complete_rows)}")

    if complete_rows:
        latest = complete_rows[-1]
        print(f"\nLatest complete data ({latest['date']}):")
        for p in protocols:
            apy = latest.get(f"{p}_apy", 0)
            tvl = latest.get(f"{p}_tvl", 0)
            print(f"  {p}: APY={apy*100:.2f}%, TVL=${tvl:,.0f}")

    with open(os.path.join(OUTPUT_DIR, "historical_summary.json"), "w") as f:
        json.dump({
            "download_date": datetime.utcnow().isoformat(),
            "total_rows": len(rows),
            "complete_rows": len(complete_rows),
            "date_range": {
                "start": rows[0]["date"] if rows else None,
                "end": rows[-1]["date"] if rows else None,
            },
            "protocols": {
                p: {
                    "pool_id": POOL_IDS[p],
                    "data_points": len(all_history.get(p, [])),
                }
                for p in protocols
            },
        }, f, indent=2)


if __name__ == "__main__":
    main()
