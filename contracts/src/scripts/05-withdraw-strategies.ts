import {
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { SEEDS, VoltrClient } from "@voltr/vault-sdk";
import { LENDING_ADAPTOR_PROGRAM_ID } from "../constants/programs";
import { getConnection, loadKeypair } from "../utils/connection";
import { sendAndConfirmOptimisedTx, setupTokenAccount } from "../utils/helper";
import {
  managerFilePath,
  vaultAddress,
  assetTokenProgram,
  withdrawAssetAmountPerStrategy,
  marginfiAccount,
  validateAmount,
} from "../variables";
import { PROTOCOL_CONSTANTS, USDC_MINT } from "../constants";
import * as dotenv from "dotenv";

dotenv.config();

const connection = getConnection();
const vc = new VoltrClient(connection);

const withdrawKlendStrategy = async (
  managerKp: Keypair,
  vault: PublicKey,
  withdrawAmount: BN,
  protocolProgram: PublicKey,
  lendingMarket: PublicKey,
  reserve: PublicKey,
  scopePrices: PublicKey
) => {
  const outputMint = USDC_MINT;

  const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("lma"), lendingMarket.toBuffer()],
    protocolProgram
  );

  const [counterPartyTa] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reserve_liq_supply"),
      lendingMarket.toBuffer(),
      outputMint.toBuffer(),
    ],
    protocolProgram
  );

  const [strategy] = PublicKey.findProgramAddressSync(
    [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
    LENDING_ADAPTOR_PROGRAM_ID
  );

  const { vaultStrategyAuth } = vc.findVaultStrategyAddresses(vault, strategy);

  const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reserve_coll_mint"),
      lendingMarket.toBuffer(),
      outputMint.toBuffer(),
    ],
    protocolProgram
  );

  const transactionIxs: TransactionInstruction[] = [];

  const userDestinationCollateral = await setupTokenAccount(
    connection,
    managerKp.publicKey,
    reserveCollateralMint,
    vaultStrategyAuth,
    transactionIxs
  );
  await setupTokenAccount(
    connection,
    managerKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );

  const remainingAccounts = [
    { pubkey: counterPartyTa, isSigner: false, isWritable: true },
    { pubkey: protocolProgram, isSigner: false, isWritable: false },
    { pubkey: lendingMarket, isSigner: false, isWritable: false },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: true },
    { pubkey: reserve, isSigner: false, isWritable: true },
    { pubkey: reserveCollateralMint, isSigner: false, isWritable: true },
    {
      pubkey: userDestinationCollateral,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: scopePrices, isSigner: false, isWritable: false },
  ];

  const withdrawIx = await vc.createWithdrawStrategyIx(
    { withdrawAmount, additionalArgs: Buffer.from([]) },
    {
      manager: managerKp.publicKey,
      vault,
      vaultAssetMint: USDC_MINT,
      assetTokenProgram: new PublicKey(assetTokenProgram),
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }
  );

  transactionIxs.push(withdrawIx);

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    managerKp
  );
  console.log("Klend withdraw:", txSig);
};

const withdrawMarginfiStrategy = async (
  managerKp: Keypair,
  vault: PublicKey,
  withdrawAmount: BN,
  protocolProgram: PublicKey,
  bank: PublicKey,
  marginfiAccountPk: PublicKey,
  marginfiGroup: PublicKey
) => {
  const [counterPartyTa] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity_vault"), bank.toBuffer()],
    protocolProgram
  );

  const [strategy] = PublicKey.findProgramAddressSync(
    [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
    LENDING_ADAPTOR_PROGRAM_ID
  );

  const { vaultStrategyAuth } = vc.findVaultStrategyAddresses(vault, strategy);

  const transactionIxs: TransactionInstruction[] = [];

  await setupTokenAccount(
    connection,
    managerKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );

  const [bankLiquidityVaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity_vault_auth"), bank.toBuffer()],
    protocolProgram
  );

  const remainingAccounts = [
    { pubkey: counterPartyTa, isSigner: false, isWritable: true },
    { pubkey: protocolProgram, isSigner: false, isWritable: false },
    { pubkey: marginfiGroup, isSigner: false, isWritable: true },
    { pubkey: marginfiAccountPk, isSigner: false, isWritable: true },
    { pubkey: bank, isSigner: false, isWritable: true },
    {
      pubkey: bankLiquidityVaultAuthority,
      isSigner: false,
      isWritable: true,
    },
  ];

  const withdrawIx = await vc.createWithdrawStrategyIx(
    { withdrawAmount, additionalArgs: Buffer.from([]) },
    {
      manager: managerKp.publicKey,
      vault,
      vaultAssetMint: USDC_MINT,
      assetTokenProgram: new PublicKey(assetTokenProgram),
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }
  );

  transactionIxs.push(withdrawIx);

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    managerKp
  );
  console.log("Marginfi withdraw:", txSig);
};

const withdrawSolendStrategy = async (
  managerKp: Keypair,
  vault: PublicKey,
  withdrawAmount: BN,
  protocolProgram: PublicKey,
  counterPartyTaPk: PublicKey,
  lendingMarket: PublicKey,
  reserve: PublicKey,
  collateralMint: PublicKey,
  pythOracle: PublicKey,
  switchboardOracle: PublicKey
) => {
  const [strategy] = PublicKey.findProgramAddressSync(
    [SEEDS.STRATEGY, counterPartyTaPk.toBuffer()],
    LENDING_ADAPTOR_PROGRAM_ID
  );

  const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
    [lendingMarket.toBytes()],
    protocolProgram
  );

  const { vaultStrategyAuth } = vc.findVaultStrategyAddresses(vault, strategy);

  const transactionIxs: TransactionInstruction[] = [];

  const vaultCollateralAta = await setupTokenAccount(
    connection,
    managerKp.publicKey,
    collateralMint,
    vaultStrategyAuth,
    transactionIxs
  );
  await setupTokenAccount(
    connection,
    managerKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );

  const remainingAccounts = [
    { pubkey: counterPartyTaPk, isSigner: false, isWritable: true },
    { pubkey: protocolProgram, isSigner: false, isWritable: false },
    { pubkey: vaultCollateralAta, isSigner: false, isWritable: true },
    { pubkey: reserve, isSigner: false, isWritable: true },
    { pubkey: collateralMint, isSigner: false, isWritable: true },
    { pubkey: lendingMarket, isSigner: false, isWritable: true },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
    { pubkey: pythOracle, isSigner: false, isWritable: false },
    { pubkey: switchboardOracle, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  const withdrawIx = await vc.createWithdrawStrategyIx(
    { withdrawAmount, additionalArgs: Buffer.from([]) },
    {
      manager: managerKp.publicKey,
      vault,
      vaultAssetMint: USDC_MINT,
      assetTokenProgram: new PublicKey(assetTokenProgram),
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }
  );

  transactionIxs.push(withdrawIx);

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    managerKp
  );
  console.log("Solend withdraw:", txSig);
};

const main = async () => {
  if (!vaultAddress) throw new Error("VAULT_ADDRESS not set");
  if (!marginfiAccount) throw new Error("MARGINFI_ACCOUNT not set");

  const managerKp = loadKeypair(managerFilePath);
  const vault = new PublicKey(vaultAddress);
  const withdrawAmount = new BN(withdrawAssetAmountPerStrategy);
  validateAmount(withdrawAssetAmountPerStrategy, "WITHDRAW_AMOUNT");

  console.log("Withdrawing from strategies...");

  console.log("\n--- Kamino (Klend) Withdraw ---");
  await withdrawKlendStrategy(
    managerKp,
    vault,
    withdrawAmount,
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.MAIN_MARKET.LENDING_MARKET),
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.MAIN_MARKET.USDC.RESERVE),
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.SCOPE_ORACLE)
  );

  console.log("\n--- MarginFi Withdraw ---");
  await withdrawMarginfiStrategy(
    managerKp,
    vault,
    withdrawAmount,
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.USDC.BANK),
    new PublicKey(marginfiAccount),
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.GROUP)
  );

  console.log("\n--- Solend Withdraw ---");
  await withdrawSolendStrategy(
    managerKp,
    vault,
    withdrawAmount,
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.COUNTERPARTY_TA),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.LENDING_MARKET),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.RESERVE),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.COLLATERAL_MINT),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.PYTH_ORACLE),
    new PublicKey(
      PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.SWITCHBOARD_ORACLE
    )
  );

  console.log("\n=== ALL WITHDRAWALS COMPLETE (Kamino, MarginFi, Solend) ===");
};

main().catch(console.error);
