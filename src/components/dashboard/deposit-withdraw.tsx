"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VoltrClient } from "@voltr/vault-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
// @ts-expect-error bn.js is installed but this repo does not include @types/bn.js.
import BN from "bn.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

const VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  "7kQJhMKoGCGESbWjtaStqBi5YHzY8w6kTwLfoBqBDuhk";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const USDC_DECIMALS = 1_000_000;

export function DepositWithdraw() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSignature, setSuccessSignature] = useState<string | null>(null);
  const [lpPreview, setLpPreview] = useState<string | null>(null);

  const toAmountBn = (value: string) => {
    const parsedAmount = Number.parseFloat(value);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Enter a valid USDC amount");
    }

    return new BN(Math.round(parsedAmount * USDC_DECIMALS));
  };

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (!amount || Number(amount) <= 0) {
        setLpPreview(null);
        return;
      }

      try {
        const client = new VoltrClient(connection);
        const vaultPubkey = new PublicKey(VAULT_ADDRESS);
        const amountBN = toAmountBn(amount);
        const estimatedLp = await client.calculateLpForDeposit(vaultPubkey, amountBN);

        if (!cancelled) {
          setLpPreview(estimatedLp.toString());
        }
      } catch {
        if (!cancelled) {
          setLpPreview(null);
        }
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [amount, connection]);

  const handleDeposit = async () => {
    if (!publicKey || !amount) return;
    setLoading(true);
    setError(null);
    setSuccessSignature(null);

    try {
      const client = new VoltrClient(connection);
      const vaultPubkey = new PublicKey(VAULT_ADDRESS);
      const usdcMint = new PublicKey(USDC_MINT);
      const amountBN = toAmountBn(amount);
      const tokenProgram = new PublicKey(TOKEN_PROGRAM);

      // Derive the user's USDC ATA before sending so the wallet/account setup is validated.
      await getAssociatedTokenAddress(usdcMint, publicKey, false, tokenProgram);

      const depositIx = await client.createDepositVaultIx(amountBN, {
        userTransferAuthority: publicKey,
        vault: vaultPubkey,
        vaultAssetMint: usdcMint,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      });

      const tx = new Transaction().add(depositIx);
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);

      setSuccessSignature(signature);
      setAmount("");
      setLpPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey || !amount) return;
    setLoading(true);
    setError(null);
    setSuccessSignature(null);

    try {
      const client = new VoltrClient(connection);
      const vaultPubkey = new PublicKey(VAULT_ADDRESS);
      const usdcMint = new PublicKey(USDC_MINT);
      const amountBN = toAmountBn(amount);
      const tokenProgram = new PublicKey(TOKEN_PROGRAM);
      await getAssociatedTokenAddress(usdcMint, publicKey, false, tokenProgram);
      const lpAmount = await client.calculateLpForWithdraw(vaultPubkey, amountBN);

      const withdrawIx = await client.createInstantWithdrawVaultIx(
        {
          amount: lpAmount,
          isAmountInLp: true,
          isWithdrawAll: false,
        },
        {
          userTransferAuthority: publicKey,
          vault: vaultPubkey,
          vaultAssetMint: usdcMint,
          assetTokenProgram: TOKEN_PROGRAM_ID,
        },
      );

      const tx = new Transaction().add(withdrawIx);
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);

      setSuccessSignature(signature);
      setAmount("");
      setLpPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Deposit / Withdraw
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to deposit or withdraw
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Deposit / Withdraw
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="deposit" className="flex-1 gap-1.5">
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-1 gap-1.5">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount" className="text-sm">
                Amount (USDC)
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            {lpPreview && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  Estimated LP tokens: {lpPreview}
                </p>
              </div>
            )}
            <Button
              onClick={handleDeposit}
              disabled={loading || !amount || Number(amount) <= 0}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="mr-2 h-4 w-4" />
              )}
              Deposit USDC
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-sm">
                Amount (USDC)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={loading || !amount || Number(amount) <= 0}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
              )}
              Withdraw USDC
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {successSignature && (
          <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Success. Transaction submitted:{" "}
              <a
                href={`https://solscan.io/tx/${successSignature}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {successSignature.slice(0, 12)}...
                {successSignature.slice(-8)}
              </a>
            </p>
          </div>
        )}

        <div className="mt-4 rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Connected: {publicKey?.toBase58().slice(0, 6)}...
            {publicKey?.toBase58().slice(-4)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
