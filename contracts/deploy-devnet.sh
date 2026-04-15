#!/bin/bash
set -euo pipefail

# Ranger Vault Devnet Deployment Script
# Prerequisites:
#   1. Funded keypair at ~/.config/solana/id.json (or ADMIN/MANAGER keypair paths in .env)
#   2. HELIUS_RPC_URL set in contracts/.env (devnet RPC)
#   3. cd contracts && npm install already done
#
# Usage: cd contracts && bash deploy-devnet.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  Ranger Vault Devnet Deployment"
echo "============================================"
echo ""

# Check .env exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example and fill in values."
  echo "  cp .env.example .env"
  exit 1
fi

source .env 2>/dev/null || true

# Check RPC
if [ -z "${HELIUS_RPC_URL:-}" ]; then
  echo "ERROR: HELIUS_RPC_URL not set in .env"
  exit 1
fi

# Check keypairs exist
ADMIN_PATH="${ADMIN_KEYPAIR_PATH:-./keys/admin.json}"
MANAGER_PATH="${MANAGER_KEYPAIR_PATH:-./keys/manager.json}"

if [ ! -f "$ADMIN_PATH" ]; then
  echo "ERROR: Admin keypair not found at $ADMIN_PATH"
  echo "  Generate with: solana-keygen new -o $ADMIN_PATH"
  echo "  Fund with: solana airdrop 5 \$(solana-keygen pubkey $ADMIN_PATH) --url devnet"
  exit 1
fi

if [ ! -f "$MANAGER_PATH" ]; then
  echo "ERROR: Manager keypair not found at $MANAGER_PATH"
  echo "  Generate with: solana-keygen new -o $MANAGER_PATH"
  exit 1
fi

echo "Admin:   $(solana-keygen pubkey "$ADMIN_PATH" 2>/dev/null || echo 'install solana CLI to verify')"
echo "Manager: $(solana-keygen pubkey "$MANAGER_PATH" 2>/dev/null || echo 'install solana CLI to verify')"
echo ""

# Step 1: Init Vault
echo "============================================"
echo "  STEP 1: Initialize Vault"
echo "============================================"
npx ts-node src/scripts/01-init-vault.ts 2>&1 | tee /tmp/ranger-01.log

# Extract vault address and LUT from output
VAULT_ADDR=$(grep "VAULT_ADDRESS=" /tmp/ranger-01.log | tail -1 | cut -d= -f2)
LUT_ADDR=$(grep "LOOKUP_TABLE_ADDRESS=" /tmp/ranger-01.log | tail -1 | cut -d= -f2)

if [ -n "$VAULT_ADDR" ]; then
  echo ""
  echo "Updating .env with vault address..."
  if grep -q "^VAULT_ADDRESS=" .env; then
    sed -i.bak "s|^VAULT_ADDRESS=.*|VAULT_ADDRESS=$VAULT_ADDR|" .env
  else
    echo "VAULT_ADDRESS=$VAULT_ADDR" >> .env
  fi
fi

if [ -n "$LUT_ADDR" ]; then
  if grep -q "^LOOKUP_TABLE_ADDRESS=" .env; then
    sed -i.bak "s|^LOOKUP_TABLE_ADDRESS=.*|LOOKUP_TABLE_ADDRESS=$LUT_ADDR|" .env
  else
    echo "LOOKUP_TABLE_ADDRESS=$LUT_ADDR" >> .env
  fi
fi

# Reload env
source .env 2>/dev/null || true

echo ""
echo "Waiting 5s for LUT activation..."
sleep 5

# Step 2: Add Adaptors
echo "============================================"
echo "  STEP 2: Add Adaptors (Lending, Raydium CLMM, Trustful)"
echo "============================================"
npx ts-node src/scripts/02-add-adaptors.ts 2>&1 | tee /tmp/ranger-02.log

echo ""
echo "Waiting 3s..."
sleep 3

# Step 3: Init Strategies
echo "============================================"
echo "  STEP 3: Init Strategies (Kamino, MarginFi, Solend)"
echo "============================================"
npx ts-node src/scripts/03-init-strategies.ts 2>&1 | tee /tmp/ranger-03.log

# Extract marginfi account
MFIACCT=$(grep "MARGINFI_ACCOUNT=" /tmp/ranger-03.log | tail -1 | cut -d= -f2)
if [ -n "$MFIACCT" ]; then
  if grep -q "^MARGINFI_ACCOUNT=" .env; then
    sed -i.bak "s|^MARGINFI_ACCOUNT=.*|MARGINFI_ACCOUNT=$MFIACCT|" .env
  else
    echo "MARGINFI_ACCOUNT=$MFIACCT" >> .env
  fi
fi

source .env 2>/dev/null || true

echo ""
echo "Waiting 3s..."
sleep 3

# Step 4: Test Deposit (1 USDC split across strategies)
echo "============================================"
echo "  STEP 4: Test Deposit (1 USDC = 1000000 lamports per strategy)"
echo "============================================"
npx ts-node src/scripts/04-deposit-strategies.ts 2>&1 | tee /tmp/ranger-04.log

# Step 5: Health Check
echo ""
echo "============================================"
echo "  STEP 5: Health Check"
echo "============================================"
npx ts-node src/scripts/06-health-check.ts 2>&1 | tee /tmp/ranger-06.log

echo ""
echo "============================================"
echo "  DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "Collect Solscan links from transaction signatures above."
echo "Solscan devnet base: https://solscan.io/tx/TX_SIG?cluster=devnet"
echo ""
echo "Key addresses saved in .env:"
cat .env | grep -E "^(VAULT_ADDRESS|LOOKUP_TABLE_ADDRESS|MARGINFI_ACCOUNT)="
echo ""
echo "All transaction logs saved to /tmp/ranger-0*.log"
