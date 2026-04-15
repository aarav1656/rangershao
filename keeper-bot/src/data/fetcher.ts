import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import BN from "bn.js";
import { PROTOCOL_CONSTANTS } from "../constants";
import { ProtocolMetrics, FetcherResult } from "./types";
import { createLogger } from "../monitoring/logger";

const logger = createLogger("info");

export class ProtocolDataFetcher {
  private connection: Connection;
  private heliusApiKey: string;

  constructor(connection: Connection, heliusApiKey: string) {
    this.connection = connection;
    this.heliusApiKey = heliusApiKey;
  }

  async fetchAll(): Promise<FetcherResult> {
    const errors: string[] = [];
    const metrics: ProtocolMetrics[] = [];
    const timestamp = Date.now();

    const fetchers = [
      { name: "solend", fn: () => this.fetchSolendMetrics() },
      { name: "marginfi", fn: () => this.fetchMarginfiMetrics() },
      { name: "klend", fn: () => this.fetchKlendMetrics() },
      { name: "drift", fn: () => this.fetchDriftMetrics() },
    ];

    const results = await Promise.allSettled(fetchers.map((f) => f.fn()));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const fetcherName = fetchers[i].name;
      if (result.status === "fulfilled") {
        metrics.push(result.value);
      } else {
        const errorMsg = `Failed to fetch ${fetcherName}: ${result.reason}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return { metrics, timestamp, errors };
  }

  async fetchSolendMetrics(): Promise<ProtocolMetrics> {
    const reserveKey =
      PROTOCOL_CONSTANTS.SOLEND.MAIN_MARKET.USDC.RESERVE;

    const accountInfo = await this.connection.getAccountInfo(reserveKey);
    if (!accountInfo) {
      throw new Error("Solend reserve account not found");
    }

    const data = accountInfo.data;

    // Solend reserve layout offsets (from Solend program source):
    // version: 1 byte (offset 0)
    // last_update: slot u64 (1) + stale bool (9) = 10 bytes
    // lending_market: 32 bytes (offset 10)
    // liquidity section starts at offset 42:
    //   mint_pubkey: 32, mint_decimals: 1, supply_pubkey: 32,
    //   fee_receiver: 32, oracle_pubkey: 32, available_amount: u64 (offset 171)
    //   borrowed_amount_wads: u128 (offset 179)
    //   cumulative_borrow_rate_wads: u128 (offset 195)
    //   market_price: u128 (offset 211)
    // collateral section starts at offset 227:
    //   mint_pubkey: 32, mint_total_supply: u64 (offset 259)
    // config section starts at offset 267:
    //   optimal_utilization_rate: u8, loan_to_value_ratio: u8
    //   liquidation_bonus: u8, liquidation_threshold: u8
    //   min_borrow_rate: u8, optimal_borrow_rate: u8, max_borrow_rate: u8

    const availableAmount = new BN(data.subarray(171, 179), "le");
    const borrowedAmountWads = new BN(data.subarray(179, 195), "le");
    const WAD = new BN(10).pow(new BN(18));
    const borrowedAmount = borrowedAmountWads.div(WAD);

    const totalLiquidity = availableAmount.add(borrowedAmount);
    const utilizationRate = totalLiquidity.isZero()
      ? 0
      : borrowedAmount.toNumber() / totalLiquidity.toNumber();

    // Config offsets for borrow rates
    const optimalUtilization = data[267] / 100;
    const minBorrowRate = data[271] / 100;
    const optimalBorrowRate = data[272] / 100;
    const maxBorrowRate = data[273] / 100;

    let borrowRate: number;
    if (utilizationRate <= optimalUtilization) {
      const normalizedRate =
        optimalUtilization > 0 ? utilizationRate / optimalUtilization : 0;
      borrowRate =
        minBorrowRate + normalizedRate * (optimalBorrowRate - minBorrowRate);
    } else {
      const excessUtilization =
        (utilizationRate - optimalUtilization) / (1 - optimalUtilization);
      borrowRate =
        optimalBorrowRate +
        excessUtilization * (maxBorrowRate - optimalBorrowRate);
    }

    // Supply APY = borrow rate * utilization * (1 - protocol take rate)
    const protocolTakeRate = data[274] / 100;
    const supplyApy = borrowRate * utilizationRate * (1 - protocolTakeRate);

    // TVL in token units (USDC has 6 decimals)
    const tvlUsdc = totalLiquidity.toNumber() / 1e6;

    return {
      protocol: "solend",
      strategyId: "solend-usdc-main",
      apy: supplyApy * 100,
      tvl: tvlUsdc,
      utilizationRate: utilizationRate * 100,
      lastUpdated: Date.now(),
    };
  }

  async fetchMarginfiMetrics(): Promise<ProtocolMetrics> {
    const bankKey = PROTOCOL_CONSTANTS.MARGINFI.MAIN_MARKET.USDC.BANK;

    const accountInfo = await this.connection.getAccountInfo(bankKey);
    if (!accountInfo) {
      throw new Error("Marginfi bank account not found");
    }

    const data = accountInfo.data;

    // Marginfi bank layout (from marginfi-v2 program):
    // discriminator: 8 bytes
    // mint: 32 bytes (offset 8)
    // mint_decimals: u8 (offset 40)
    // group: 32 bytes (offset 41)
    // asset_share_value: I80F48 (16 bytes, offset 73)
    //   (I80F48 is a fixed-point with 48 fractional bits)
    // liability_share_value: I80F48 (16 bytes, offset 89)
    // liquidity_vault: 32 bytes (offset 105)
    // liquidity_vault_bump: u8 (offset 137)
    // liquidity_vault_authority_bump: u8 (offset 138)
    // insurance_vault: 32 bytes (offset 139)
    // insurance_vault_bump: u8 (offset 171)
    // insurance_vault_authority_bump: u8 (offset 172)
    // collected_insurance_fees_outstanding: I80F48 (offset 173)
    // fee_vault: 32 bytes (offset 189)
    // fee_vault_bump: u8 (offset 221)
    // fee_vault_authority_bump: u8 (offset 222)
    // config section at offset 223:
    //   asset_weight_init: I80F48 (16), asset_weight_maint: I80F48 (16)
    //   liability_weight_init: I80F48 (16), liability_weight_maint: I80F48 (16)
    //   deposit_limit: u64 (8), interest_rate_config at offset 287:
    //     optimal_utilization_rate: I80F48 (16)
    //     plateau_interest_rate: I80F48 (16)
    //     max_interest_rate: I80F48 (16)

    // Read I80F48 helper
    const readI80F48 = (offset: number): number => {
      const raw = new BN(data.subarray(offset, offset + 16), "le");
      // I80F48: 80 integer bits, 48 fractional bits
      return raw.toNumber() / 2 ** 48;
    };

    const assetShareValue = readI80F48(73);
    const liabilityShareValue = readI80F48(89);

    // Total deposit/borrow shares are found from vault token balance
    // For a simpler approach, get the liquidity vault balance
    const liquidityVault = new PublicKey(data.subarray(105, 137));
    const vaultBalance = await this.connection.getTokenAccountBalance(
      liquidityVault
    );
    const availableLiquidity = Number(vaultBalance.value.amount) / 1e6;

    // Interest rate config
    const optimalUtilization = readI80F48(287);
    const plateauRate = readI80F48(303);
    const maxRate = readI80F48(319);

    // Estimate borrowed amount from liability share value relative to asset share value
    // This is approximate since we don't have total shares directly
    // Use the interest rate model parameters instead for APY calculation
    const tvl = availableLiquidity / (1 - 0.5); // Rough estimate
    const utilizationRate = 0.5; // Will be refined with real data

    // Calculate supply rate from utilization curve
    let borrowRate: number;
    if (utilizationRate <= optimalUtilization) {
      borrowRate =
        (utilizationRate / optimalUtilization) * plateauRate;
    } else {
      const excessUtil =
        (utilizationRate - optimalUtilization) /
        (1 - optimalUtilization);
      borrowRate = plateauRate + excessUtil * (maxRate - plateauRate);
    }

    const supplyApy = borrowRate * utilizationRate;

    return {
      protocol: "marginfi",
      strategyId: "marginfi-usdc-main",
      apy: supplyApy * 100,
      tvl: availableLiquidity,
      utilizationRate: utilizationRate * 100,
      lastUpdated: Date.now(),
    };
  }

  async fetchKlendMetrics(): Promise<ProtocolMetrics> {
    const reserveKey =
      PROTOCOL_CONSTANTS.KLEND.MAIN_MARKET.USDC.RESERVE;

    const accountInfo = await this.connection.getAccountInfo(reserveKey);
    if (!accountInfo) {
      throw new Error("Klend reserve account not found");
    }

    const data = accountInfo.data;

    // Klend (Kamino Lend) reserve layout:
    // discriminator: 8 bytes
    // version: u64 (8 bytes, offset 8)
    // last_update: LastUpdate (slot u64 + stale u8 + placeholder [7]u8 = 16 bytes, offset 16)
    // lending_market: Pubkey (32 bytes, offset 32)
    // liquidity section (offset 64):
    //   mint_pubkey: 32, supply_vault: 32, fee_vault: 32
    //   available_amount: u64 (offset 160)
    //   borrowed_amount_sf: u128 (offset 168)
    //   market_price_sf: u128 (offset 184)
    //   market_price_last_updated_ts: u64 (offset 200)
    //   mint_decimals: u64 (offset 208)
    // collateral section (offset 216):
    //   mint_pubkey: 32, mint_total_supply: u64 (offset 248), supply_vault: 32
    // config section (offset 288):
    //   ... interest rate model further in

    const availableAmount = new BN(data.subarray(160, 168), "le");
    // borrowed_amount_sf is a scaled fraction (scale factor = 2^60)
    const borrowedAmountSf = new BN(data.subarray(168, 184), "le");
    const SF = new BN(2).pow(new BN(60));
    const borrowedAmount = borrowedAmountSf.div(SF);

    const totalLiquidity = availableAmount.add(borrowedAmount);
    const mintDecimals = new BN(data.subarray(208, 216), "le").toNumber();
    const divisor = 10 ** mintDecimals;

    const utilizationRate = totalLiquidity.isZero()
      ? 0
      : borrowedAmount.toNumber() / totalLiquidity.toNumber();

    const tvl = totalLiquidity.toNumber() / divisor;

    // Klend uses a curve-based interest rate model
    // For now, estimate APY from on-chain data
    // The config section has the rate model parameters
    // Approximate with standard lending curve
    const baseRate = 0.02;
    const slope1 = 0.04;
    const slope2 = 3.0;
    const kink = 0.8;

    let borrowRate: number;
    if (utilizationRate <= kink) {
      borrowRate = baseRate + (utilizationRate / kink) * slope1;
    } else {
      borrowRate =
        baseRate + slope1 + ((utilizationRate - kink) / (1 - kink)) * slope2;
    }

    const supplyApy = borrowRate * utilizationRate * 0.85; // 15% protocol fee

    return {
      protocol: "klend",
      strategyId: "klend-usdc-main",
      apy: supplyApy * 100,
      tvl,
      utilizationRate: utilizationRate * 100,
      lastUpdated: Date.now(),
    };
  }

  async fetchDriftMetrics(): Promise<ProtocolMetrics> {
    const stateKey = PROTOCOL_CONSTANTS.DRIFT.SPOT.STATE;

    const accountInfo = await this.connection.getAccountInfo(stateKey);
    if (!accountInfo) {
      throw new Error("Drift state account not found");
    }

    // Drift spot market data is indexed by market_index
    // The state account contains references to spot market accounts
    // For USDC (market_index 0), we need to find the spot market account

    // Drift SpotMarket PDA: seeds = ["spot_market", market_index.to_le_bytes()]
    const marketIndex = PROTOCOL_CONSTANTS.DRIFT.SPOT.USDC.MARKET_INDEX;
    const [spotMarketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("spot_market"),
        Buffer.from(new Uint8Array(new Uint16Array([marketIndex]).buffer)),
      ],
      PROTOCOL_CONSTANTS.DRIFT.PROGRAM_ID
    );

    const spotMarketInfo =
      await this.connection.getAccountInfo(spotMarketPda);
    if (!spotMarketInfo) {
      throw new Error("Drift spot market account not found");
    }

    const data = spotMarketInfo.data;

    // Drift SpotMarket layout (simplified):
    // discriminator: 8 bytes
    // pubkey: 32 (offset 8)
    // oracle: 32 (offset 40)
    // mint: 32 (offset 72)
    // vault: 32 (offset 104)
    // name: [u8; 32] (offset 136)
    // historical_oracle_data: ... (offset 168)
    // historical_index_data: ...
    // revenue_pool: SpotBalance (offset ~300)
    // spot_fee_pool: SpotBalance
    // insurance_fund: InsuranceFund
    // total_spot_fee: u128
    // deposit_balance: u128 (at a variable offset, typically ~416)
    // borrow_balance: u128
    // cumulative_deposit_interest: u128
    // cumulative_borrow_interest: u128
    // total_social_loss: u128
    // total_quote_social_loss: u128
    // withdraw_guard_threshold: u64
    // max_token_deposits: u64
    // deposit_token_twap: u64
    // borrow_token_twap: u64
    // utilization_twap: u64
    // last_interest_ts: u64
    // last_twap_ts: u64
    // expiry_ts: i64
    // order_step_size: u64
    // order_tick_size: u64
    // min_order_size: u64
    // max_position_size: u64
    // next_fill_record_id: u64
    // next_deposit_record_id: u64
    // initial_asset_weight: u32
    // maintenance_asset_weight: u32
    // initial_liability_weight: u32
    // maintenance_liability_weight: u32
    // imf_factor: u32
    // liquidator_fee: u32
    // if_liquidation_fee: u32
    // optimal_utilization: u32
    // optimal_borrow_rate: u32
    // max_borrow_rate: u32
    // decimals: u32
    // market_index: u16

    // Use a rough approach: read utilization_twap and rate params from known offsets
    // These offsets vary by Drift version; we'll use the getAccountInfo approach
    // and read key fields

    // For production, use the Drift SDK to properly deserialize
    // Fallback: use Drift API
    try {
      const response = await axios.get(
        "https://mainnet-beta.api.drift.trade/stats/spotMarketStats",
        { timeout: 10000 }
      );

      const usdcMarket = response.data?.find(
        (m: any) => m.marketIndex === 0
      );
      if (usdcMarket) {
        return {
          protocol: "drift",
          strategyId: "drift-usdc-spot",
          apy: Number(usdcMarket.depositApy || 0) * 100,
          tvl: Number(usdcMarket.totalDeposits || 0) / 1e6,
          utilizationRate: Number(usdcMarket.utilization || 0) * 100,
          lastUpdated: Date.now(),
        };
      }
    } catch {
      logger.warn("Drift API fallback failed, using on-chain approximation");
    }

    // On-chain fallback with approximate offsets
    // optimal_utilization is a u32 at a late offset, representing percentage * PERCENTAGE_PRECISION
    const PERCENTAGE_PRECISION = 1_000_000;
    // Read from approximate known offsets for Drift v2.78
    const optimalUtil =
      data.readUInt32LE(data.length - 40) / PERCENTAGE_PRECISION;
    const optimalBorrowRate =
      data.readUInt32LE(data.length - 36) / PERCENTAGE_PRECISION;
    const maxBorrowRate =
      data.readUInt32LE(data.length - 32) / PERCENTAGE_PRECISION;

    const utilizationRate = optimalUtil * 0.7; // Rough estimate
    let borrowRate: number;
    if (utilizationRate <= optimalUtil) {
      borrowRate =
        (utilizationRate / optimalUtil) * optimalBorrowRate;
    } else {
      borrowRate =
        optimalBorrowRate +
        ((utilizationRate - optimalUtil) / (1 - optimalUtil)) *
          (maxBorrowRate - optimalBorrowRate);
    }

    const supplyApy = borrowRate * utilizationRate;

    return {
      protocol: "drift",
      strategyId: "drift-usdc-spot",
      apy: supplyApy * 100,
      tvl: 0,
      utilizationRate: utilizationRate * 100,
      lastUpdated: Date.now(),
    };
  }
}
