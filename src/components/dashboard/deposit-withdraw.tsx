"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";

export function DepositWithdraw() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!publicKey || !amount) return;
    setLoading(true);
    setError(null);

    try {
      const vaultProgramId = process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID;
      if (!vaultProgramId) {
        throw new Error("NOT_IMPLEMENTED: Vault program not deployed yet. Deposit will be enabled once contract is live.");
      }
      throw new Error("NOT_IMPLEMENTED: Deposit instruction pending IDL from contract team");
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

    try {
      const vaultProgramId = process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID;
      if (!vaultProgramId) {
        throw new Error("NOT_IMPLEMENTED: Vault program not deployed yet. Withdraw will be enabled once contract is live.");
      }
      throw new Error("NOT_IMPLEMENTED: Withdraw instruction pending IDL from contract team");
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
