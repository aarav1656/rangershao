import {
  AddressLookupTableProgram,
  Keypair,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { createWithSeedSync } from "@coral-xyz/anchor/dist/cjs/utils/pubkey";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SEEDS, VoltrClient } from "@voltr/vault-sdk";
import { LENDING_ADAPTOR_PROGRAM_ID } from "../constants/programs";
import { getConnection, loadKeypair } from "../utils/connection";
import {
  sendAndConfirmOptimisedTx,
  setupTokenAccount,
  setupAddressLookupTable,
} from "../utils/helper";
import {
  adminFilePath,
  vaultAddress,
  assetTokenProgram,
  lookupTableAddress,
} from "../variables";
import { PROTOCOL_CONSTANTS, USDC_MINT } from "../constants";
import * as dotenv from "dotenv";

dotenv.config();

const connection = getConnection();
const vc = new VoltrClient(connection);

const initKlendStrategy = async (
  adminKp: Keypair,
  vault: PublicKey,
  protocolProgram: PublicKey,
  lendingMarket: PublicKey
) => {
  const outputMint = USDC_MINT;

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

  const [userMetadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_meta"), vaultStrategyAuth.toBuffer()],
    protocolProgram
  );

  const [_lookupTableIxs, lutAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: vaultStrategyAuth,
      payer: adminKp.publicKey,
      recentSlot: await connection.getSlot("confirmed"),
    });

  const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reserve_coll_mint"),
      lendingMarket.toBuffer(),
      outputMint.toBuffer(),
    ],
    protocolProgram
  );

  const transactionIxs: TransactionInstruction[] = [];

  await setupTokenAccount(
    connection,
    adminKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );
  await setupTokenAccount(
    connection,
    adminKp.publicKey,
    reserveCollateralMint,
    vaultStrategyAuth,
    transactionIxs
  );

  const initIx = await vc.createInitializeStrategyIx(
    {},
    {
      payer: adminKp.publicKey,
      vault,
      manager: adminKp.publicKey,
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts: [
        { pubkey: protocolProgram, isSigner: false, isWritable: false },
        { pubkey: userMetadata, isSigner: false, isWritable: true },
        { pubkey: lutAddress, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
    }
  );

  transactionIxs.push(initIx);

  if (lookupTableAddress) {
    await setupAddressLookupTable(
      connection,
      adminKp.publicKey,
      adminKp.publicKey,
      [...new Set(initIx.keys.map((k) => k.pubkey.toBase58()))],
      transactionIxs,
      new PublicKey(lookupTableAddress)
    );
  }

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    adminKp
  );
  console.log("Klend strategy initialized:", txSig);
  return strategy;
};

const initMarginfiStrategy = async (
  adminKp: Keypair,
  vault: PublicKey,
  protocolProgram: PublicKey,
  bank: PublicKey,
  group: PublicKey
) => {
  const [counterPartyTa] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity_vault"), bank.toBuffer()],
    protocolProgram
  );

  const [strategy] = PublicKey.findProgramAddressSync(
    [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
    LENDING_ADAPTOR_PROGRAM_ID
  );

  const marginfiAccountKp = Keypair.generate();
  const { vaultStrategyAuth } = vc.findVaultStrategyAddresses(vault, strategy);

  const transactionIxs: TransactionInstruction[] = [];

  await setupTokenAccount(
    connection,
    adminKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );

  const initIx = await vc.createInitializeStrategyIx(
    {},
    {
      payer: adminKp.publicKey,
      vault,
      manager: adminKp.publicKey,
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts: [
        { pubkey: protocolProgram, isSigner: false, isWritable: false },
        { pubkey: group, isSigner: false, isWritable: false },
        {
          pubkey: marginfiAccountKp.publicKey,
          isSigner: true,
          isWritable: true,
        },
      ],
    }
  );

  transactionIxs.push(initIx);

  if (lookupTableAddress) {
    await setupAddressLookupTable(
      connection,
      adminKp.publicKey,
      adminKp.publicKey,
      [...new Set(initIx.keys.map((k) => k.pubkey.toBase58()))],
      transactionIxs,
      new PublicKey(lookupTableAddress)
    );
  }

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    adminKp,
    [marginfiAccountKp]
  );
  console.log("Marginfi strategy initialized:", txSig);
  console.log("Marginfi account:", marginfiAccountKp.publicKey.toBase58());
  console.log(
    `Update .env: MARGINFI_ACCOUNT=${marginfiAccountKp.publicKey.toBase58()}`
  );
  return strategy;
};

const initSolendStrategy = async (
  adminKp: Keypair,
  vault: PublicKey,
  protocolProgram: PublicKey,
  counterPartyTa: PublicKey,
  lendingMarket: PublicKey,
  collateralMint: PublicKey
) => {
  const [strategy] = PublicKey.findProgramAddressSync(
    [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
    LENDING_ADAPTOR_PROGRAM_ID
  );

  const { vaultStrategyAuth } = vc.findVaultStrategyAddresses(vault, strategy);

  const obligation = createWithSeedSync(
    vaultStrategyAuth,
    lendingMarket.toBase58().slice(0, 32),
    protocolProgram
  );

  const transactionIxs: TransactionInstruction[] = [];

  await setupTokenAccount(
    connection,
    adminKp.publicKey,
    collateralMint,
    vaultStrategyAuth,
    transactionIxs
  );
  await setupTokenAccount(
    connection,
    adminKp.publicKey,
    USDC_MINT,
    vaultStrategyAuth,
    transactionIxs,
    new PublicKey(assetTokenProgram)
  );

  const initIx = await vc.createInitializeStrategyIx(
    {},
    {
      payer: adminKp.publicKey,
      vault,
      manager: adminKp.publicKey,
      strategy,
      adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts: [
        { pubkey: protocolProgram, isSigner: false, isWritable: false },
        { pubkey: obligation, isSigner: false, isWritable: true },
        { pubkey: lendingMarket, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_CLOCK_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
    }
  );

  transactionIxs.push(initIx);

  if (lookupTableAddress) {
    await setupAddressLookupTable(
      connection,
      adminKp.publicKey,
      adminKp.publicKey,
      [...new Set(initIx.keys.map((k) => k.pubkey.toBase58()))],
      transactionIxs,
      new PublicKey(lookupTableAddress)
    );
  }

  const txSig = await sendAndConfirmOptimisedTx(
    transactionIxs,
    process.env.HELIUS_RPC_URL!,
    adminKp
  );
  console.log("Solend strategy initialized:", txSig);
  return strategy;
};

const main = async () => {
  if (!vaultAddress) throw new Error("VAULT_ADDRESS not set");

  const adminKp = loadKeypair(adminFilePath);
  const vault = new PublicKey(vaultAddress);

  console.log("Initializing strategies for vault:", vault.toBase58());

  console.log("\n--- Kamino (Klend) Strategy ---");
  await initKlendStrategy(
    adminKp,
    vault,
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.KLEND.MAIN_MARKET.LENDING_MARKET)
  );

  console.log("\n--- MarginFi Strategy ---");
  await initMarginfiStrategy(
    adminKp,
    vault,
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.USDC.BANK),
    new PublicKey(PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.GROUP)
  );

  console.log("\n--- Solend Strategy ---");
  await initSolendStrategy(
    adminKp,
    vault,
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.PROGRAM_ID),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.COUNTERPARTY_TA),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.LENDING_MARKET),
    new PublicKey(PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.COLLATERAL_MINT)
  );

  console.log("\n=== ALL STRATEGIES INITIALIZED (Kamino, MarginFi, Solend) ===");
};

main().catch(console.error);
