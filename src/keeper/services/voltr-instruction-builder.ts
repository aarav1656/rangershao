import {
  Connection,
  PublicKey,
  TransactionInstruction,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { SEEDS, VoltrClient } from "@voltr/vault-sdk";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const LENDING_ADAPTOR_PROGRAM_ID = new PublicKey("aVoLTRCRt3NnnchvLYH6rMYehJHwM5m45RmLBZq7PGz");

const KLEND_PROGRAM = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");
const KLEND_LENDING_MARKET = new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");
const KLEND_USDC_RESERVE = new PublicKey("D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59");
const KLEND_SCOPE_ORACLE = new PublicKey("3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C");

const MARGINFI_PROGRAM = new PublicKey("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA");
const MARGINFI_GROUP = new PublicKey("4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8");
const MARGINFI_USDC_BANK = new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB");

interface ProtocolInstructionParams {
  manager: PublicKey;
  vault: PublicKey;
  amount: BN;
  assetTokenProgram: PublicKey;
  marginfiAccount?: PublicKey;
}

export class VoltrInstructionBuilder {
  private connection: Connection;
  private vc: VoltrClient;

  constructor(connection: Connection) {
    this.connection = connection;
    this.vc = new VoltrClient(connection);
  }

  async buildDepositInstructions(
    protocol: string,
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    switch (protocol) {
      case "kamino":
      case "jupiter_lend":
        return this.buildKlendDeposit(params);
      case "marginfi":
        return this.buildMarginfiDeposit(params);
      default:
        throw new Error(`Unsupported protocol for deposit: ${protocol}`);
    }
  }

  async buildWithdrawInstructions(
    protocol: string,
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    switch (protocol) {
      case "kamino":
      case "jupiter_lend":
        return this.buildKlendWithdraw(params);
      case "marginfi":
        return this.buildMarginfiWithdraw(params);
      default:
        throw new Error(`Unsupported protocol for withdraw: ${protocol}`);
    }
  }

  private async buildKlendDeposit(
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    const { manager, vault, amount, assetTokenProgram } = params;

    const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("lma"), KLEND_LENDING_MARKET.toBuffer()],
      KLEND_PROGRAM
    );

    const [counterPartyTa] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reserve_liq_supply"),
        KLEND_LENDING_MARKET.toBuffer(),
        USDC_MINT.toBuffer(),
      ],
      KLEND_PROGRAM
    );

    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const { vaultStrategyAuth } = this.vc.findVaultStrategyAddresses(vault, strategy);

    const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reserve_coll_mint"),
        KLEND_LENDING_MARKET.toBuffer(),
        USDC_MINT.toBuffer(),
      ],
      KLEND_PROGRAM
    );

    const setupIxs: TransactionInstruction[] = [];
    const userDestinationCollateral = await this.ensureTokenAccount(
      manager,
      reserveCollateralMint,
      vaultStrategyAuth,
      setupIxs
    );
    await this.ensureTokenAccount(
      manager,
      USDC_MINT,
      vaultStrategyAuth,
      setupIxs,
      assetTokenProgram
    );

    const remainingAccounts = [
      { pubkey: counterPartyTa, isSigner: false, isWritable: true },
      { pubkey: KLEND_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: KLEND_LENDING_MARKET, isSigner: false, isWritable: false },
      { pubkey: lendingMarketAuthority, isSigner: false, isWritable: true },
      { pubkey: KLEND_USDC_RESERVE, isSigner: false, isWritable: true },
      { pubkey: reserveCollateralMint, isSigner: false, isWritable: true },
      { pubkey: userDestinationCollateral, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: KLEND_SCOPE_ORACLE, isSigner: false, isWritable: false },
    ];

    const depositIx = await this.vc.createDepositStrategyIx(
      { depositAmount: amount, additionalArgs: Buffer.from([]) },
      {
        manager,
        vault,
        vaultAssetMint: USDC_MINT,
        assetTokenProgram,
        strategy,
        adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
        remainingAccounts,
      }
    );

    return [...setupIxs, depositIx];
  }

  private async buildKlendWithdraw(
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    const { manager, vault, amount, assetTokenProgram } = params;

    const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("lma"), KLEND_LENDING_MARKET.toBuffer()],
      KLEND_PROGRAM
    );

    const [counterPartyTa] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reserve_liq_supply"),
        KLEND_LENDING_MARKET.toBuffer(),
        USDC_MINT.toBuffer(),
      ],
      KLEND_PROGRAM
    );

    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const { vaultStrategyAuth } = this.vc.findVaultStrategyAddresses(vault, strategy);

    const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reserve_coll_mint"),
        KLEND_LENDING_MARKET.toBuffer(),
        USDC_MINT.toBuffer(),
      ],
      KLEND_PROGRAM
    );

    const setupIxs: TransactionInstruction[] = [];
    const userDestinationCollateral = await this.ensureTokenAccount(
      manager,
      reserveCollateralMint,
      vaultStrategyAuth,
      setupIxs
    );
    await this.ensureTokenAccount(
      manager,
      USDC_MINT,
      vaultStrategyAuth,
      setupIxs,
      assetTokenProgram
    );

    const remainingAccounts = [
      { pubkey: counterPartyTa, isSigner: false, isWritable: true },
      { pubkey: KLEND_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: KLEND_LENDING_MARKET, isSigner: false, isWritable: false },
      { pubkey: lendingMarketAuthority, isSigner: false, isWritable: true },
      { pubkey: KLEND_USDC_RESERVE, isSigner: false, isWritable: true },
      { pubkey: reserveCollateralMint, isSigner: false, isWritable: true },
      { pubkey: userDestinationCollateral, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: KLEND_SCOPE_ORACLE, isSigner: false, isWritable: false },
    ];

    const withdrawIx = await this.vc.createWithdrawStrategyIx(
      { withdrawAmount: amount, additionalArgs: Buffer.from([]) },
      {
        manager,
        vault,
        vaultAssetMint: USDC_MINT,
        assetTokenProgram,
        strategy,
        adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
        remainingAccounts,
      }
    );

    return [...setupIxs, withdrawIx];
  }

  private async buildMarginfiDeposit(
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    const { manager, vault, amount, assetTokenProgram, marginfiAccount } = params;

    if (!marginfiAccount) {
      throw new Error("marginfiAccount is required for marginfi deposits");
    }

    const [counterPartyTa] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity_vault"), MARGINFI_USDC_BANK.toBuffer()],
      MARGINFI_PROGRAM
    );

    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const { vaultStrategyAuth } = this.vc.findVaultStrategyAddresses(vault, strategy);

    const setupIxs: TransactionInstruction[] = [];
    await this.ensureTokenAccount(
      manager,
      USDC_MINT,
      vaultStrategyAuth,
      setupIxs,
      assetTokenProgram
    );

    const remainingAccounts = [
      { pubkey: counterPartyTa, isSigner: false, isWritable: true },
      { pubkey: MARGINFI_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: MARGINFI_GROUP, isSigner: false, isWritable: true },
      { pubkey: marginfiAccount, isSigner: false, isWritable: true },
      { pubkey: MARGINFI_USDC_BANK, isSigner: false, isWritable: true },
    ];

    const depositIx = await this.vc.createDepositStrategyIx(
      { depositAmount: amount, additionalArgs: Buffer.from([]) },
      {
        manager,
        vault,
        vaultAssetMint: USDC_MINT,
        assetTokenProgram,
        strategy,
        adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
        remainingAccounts,
      }
    );

    return [...setupIxs, depositIx];
  }

  private async buildMarginfiWithdraw(
    params: ProtocolInstructionParams
  ): Promise<TransactionInstruction[]> {
    const { manager, vault, amount, assetTokenProgram, marginfiAccount } = params;

    if (!marginfiAccount) {
      throw new Error("marginfiAccount is required for marginfi withdrawals");
    }

    const [counterPartyTa] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity_vault"), MARGINFI_USDC_BANK.toBuffer()],
      MARGINFI_PROGRAM
    );

    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterPartyTa.toBuffer()],
      LENDING_ADAPTOR_PROGRAM_ID
    );

    const { vaultStrategyAuth } = this.vc.findVaultStrategyAddresses(vault, strategy);

    const setupIxs: TransactionInstruction[] = [];
    await this.ensureTokenAccount(
      manager,
      USDC_MINT,
      vaultStrategyAuth,
      setupIxs,
      assetTokenProgram
    );

    const [bankLiquidityVaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity_vault_auth"), MARGINFI_USDC_BANK.toBuffer()],
      MARGINFI_PROGRAM
    );

    const remainingAccounts = [
      { pubkey: counterPartyTa, isSigner: false, isWritable: true },
      { pubkey: MARGINFI_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: MARGINFI_GROUP, isSigner: false, isWritable: true },
      { pubkey: marginfiAccount, isSigner: false, isWritable: true },
      { pubkey: MARGINFI_USDC_BANK, isSigner: false, isWritable: true },
      { pubkey: bankLiquidityVaultAuthority, isSigner: false, isWritable: true },
    ];

    const withdrawIx = await this.vc.createWithdrawStrategyIx(
      { withdrawAmount: amount, additionalArgs: Buffer.from([]) },
      {
        manager,
        vault,
        vaultAssetMint: USDC_MINT,
        assetTokenProgram,
        strategy,
        adaptorProgram: LENDING_ADAPTOR_PROGRAM_ID,
        remainingAccounts,
      }
    );

    return [...setupIxs, withdrawIx];
  }

  private async ensureTokenAccount(
    payer: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
    setupIxs: TransactionInstruction[],
    tokenProgram: PublicKey = TOKEN_PROGRAM_ID
  ): Promise<PublicKey> {
    const ata = getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);

    const accountInfo = await this.connection.getAccountInfo(ata);
    if (!accountInfo) {
      const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
      setupIxs.push(
        createAssociatedTokenAccountInstruction(payer, ata, owner, mint, tokenProgram)
      );
    }

    return ata;
  }
}
