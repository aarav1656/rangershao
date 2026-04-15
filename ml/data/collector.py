#!/usr/bin/env python3
"""
Historical rate data collector. Runs periodically to build training dataset.
Usage: python3 ml/data/collector.py [--interval 300] [--output ml/data/historical_rates.csv]
"""

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from data.fetcher import fetch_all_rates

PROTOCOLS = ["ondo_usdy", "kamino", "marginfi", "jupiter_lend", "raydium_clmm"]

CSV_HEADERS = (
    ["timestamp", "epoch"]
    + [f"{p}_supply_apy" for p in PROTOCOLS]
    + [f"{p}_borrow_apy" for p in PROTOCOLS]
    + [f"{p}_utilization" for p in PROTOCOLS]
    + [f"{p}_tvl" for p in PROTOCOLS]
)


def collect_once(output_path: str):
    snapshots = fetch_all_rates()
    now = datetime.now(timezone.utc)

    row = {
        "timestamp": now.isoformat(),
        "epoch": int(now.timestamp()),
    }
    for p in PROTOCOLS:
        snap = snapshots.get(p)
        if snap:
            row[f"{p}_supply_apy"] = snap.supply_apy
            row[f"{p}_borrow_apy"] = snap.borrow_apy
            row[f"{p}_utilization"] = snap.utilization
            row[f"{p}_tvl"] = snap.tvl_usd
        else:
            row[f"{p}_supply_apy"] = ""
            row[f"{p}_borrow_apy"] = ""
            row[f"{p}_utilization"] = ""
            row[f"{p}_tvl"] = ""

    file_exists = os.path.exists(output_path)
    with open(output_path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    return row


def main():
    parser = argparse.ArgumentParser(description="Collect DeFi rate data")
    parser.add_argument("--interval", type=int, default=0, help="Collection interval in seconds (0=once)")
    parser.add_argument("--output", type=str, default=os.path.join(os.path.dirname(__file__), "historical_rates.csv"))
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)

    if args.interval <= 0:
        row = collect_once(args.output)
        print(json.dumps(row, indent=2))
    else:
        print(f"Collecting every {args.interval}s to {args.output}")
        while True:
            try:
                row = collect_once(args.output)
                print(f"[{row['timestamp']}] Collected rates for {len(PROTOCOLS)} protocols")
            except Exception as e:
                print(f"[ERROR] Collection failed: {e}")
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
