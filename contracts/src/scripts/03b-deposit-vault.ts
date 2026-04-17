import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { VoltrClient } from "@voltr/vault-sdk";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { getConnection, loadKeypair } from "../utils/connection";
import { sendAndConfirmOptimisedTx } from "../utils/helper";
import {
  adminFilePath,
  vaultAddress,
  depositAssetAmountPerStrategy,
  validateAmount,
} from "../variables";
import { USDC_MINT } from "../constants/programs";
import * as dotenv from "dotenv";

dotenv.config();

const main = async () => {
  if (!vaultAddress) throw new Error("VAULT_ADDRESS not set");

  const connection = getConnection();
  const vc = new VoltrClient(connection);
  const adminKp = loadKeypair(adminFilePath);
  const vault = new PublicKey(vaultAddress);
  const depositAmountRaw =
    process.env.DEPOSIT_AMOUNT || depositAssetAmountPerStrategy || "1000000";

  validateAmount(depositAmountRaw, "DEPOSIT_AMOUNT");

  const depositAmount = new BN(depositAmountRaw);

  const { vaultLpMint } = vc.findVaultAddresses(vault);
  console.log("Vault LP Mint:", vaultLpMint.toBase58());

  const userLpAta = getAssociatedTokenAddressSync(
    vaultLpMint,
    adminKp.publicKey,
    false,
    TOKEN_PROGRAM_ID
  );
  console.log("User LP ATA:", userLpAta.toBase58());

  const transactionIxs: TransactionInstruction[] = [];

  const lpAtaInfo = await connection.getAccountInfo(userLpAta);
  if (!lpAtaInfo) {
    console.log("Creating LP token account...");
    transactionIxs.push(
      createAssociatedTokenAccountIdempotentInstruction(
        adminKp.publicKey,
        userLpAta,
        adminKp.publicKey,
        vaultLpMint,
        TOKEN_PROGRAM_ID
      )
    );
  }

  console.log("Depositing into vault...");
  console.log("Admin:", adminKp.publicKey.toBase58());
  console.log("Vault:", vault.toBase58());
  console.log("Asset Mint (USDC):", USDC_MINT.toBase58());
  console.log("Deposit Amount:", depositAmount.toString(), "lamports");

  const depositIx = await vc.createDepositVaultIx(depositAmount, {
    userTransferAuthority: adminKp.publicKey,
    vault,
    vaultAssetMint: USDC_MINT,
    assetTokenProgram: TOKEN_PROGRAM_ID,
  });

  transactionIxs.push(depositIx);

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    adminKp
  );

  console.log("Vault deposit:", txSig);
};

main().catch(console.error);
