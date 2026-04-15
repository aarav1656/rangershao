import { SecurityConfig } from "../config/security-config";

interface CoboApiClient {
  setEnv(env: { DEV: string; PROD: string }): void;
  setPrivateKey(key: string): void;
}

interface CoboTransferParams {
  requestId: string;
  sourceWalletId: string;
  tokenId: string;
  destinationAddress: string;
  amount: string;
  memo?: string;
}

interface CoboTransactionResult {
  transactionId: string;
  status: string;
  rawTx?: string;
}

interface CoboWalletInfo {
  walletId: string;
  name: string;
  vaultId: string;
  addresses: { chainId: string; address: string }[];
}

interface CoboBalanceInfo {
  tokenId: string;
  balance: string;
  available: string;
  locked: string;
}

export class CoboMpcClient {
  private config: SecurityConfig["cobo"];
  private apiClient: any;
  private walletsApi: any;
  private transactionsApi: any;
  private initialized = false;

  constructor(config: SecurityConfig["cobo"]) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    const CoboWaas2 = await import("@cobo/cobo-waas2");

    this.apiClient = CoboWaas2.ApiClient.instance;

    if (this.config.env === "dev") {
      this.apiClient.setEnv(CoboWaas2.Env.DEV);
    } else {
      this.apiClient.setEnv(CoboWaas2.Env.PROD);
    }

    this.apiClient.setPrivateKey(this.config.apiSecret);

    this.walletsApi = new CoboWaas2.WalletsApi();
    this.transactionsApi = new CoboWaas2.TransactionsApi();
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("CoboMpcClient not initialized. Call initialize() first.");
    }
  }

  async getWalletInfo(): Promise<CoboWalletInfo> {
    this.ensureInitialized();
    const wallet = await this.walletsApi.getWalletById(this.config.walletId);
    return {
      walletId: wallet.wallet_id,
      name: wallet.name,
      vaultId: wallet.vault_id,
      addresses: (wallet.addresses || []).map((a: any) => ({
        chainId: a.chain_id,
        address: a.address,
      })),
    };
  }

  async getBalances(): Promise<CoboBalanceInfo[]> {
    this.ensureInitialized();
    const result = await this.walletsApi.listTokenBalancesForWallet(
      this.config.walletId
    );
    return (result.data || []).map((b: any) => ({
      tokenId: b.token_id,
      balance: b.balance?.total || "0",
      available: b.balance?.available || "0",
      locked: b.balance?.locked || "0",
    }));
  }

  async createTransferTransaction(
    params: CoboTransferParams
  ): Promise<CoboTransactionResult> {
    this.ensureInitialized();

    const CoboWaas2 = await import("@cobo/cobo-waas2");

    const transferParams = new CoboWaas2.TransferParams();
    transferParams.request_id = params.requestId;
    transferParams.source = {
      source_type: "Org-Controlled",
      wallet_id: params.sourceWalletId,
    };
    transferParams.token_id = params.tokenId;
    transferParams.destination = {
      destination_type: "Address",
      account_output: {
        address: params.destinationAddress,
        amount: params.amount,
        memo: params.memo,
      },
    };

    const result =
      await this.transactionsApi.createTransferTransaction(transferParams);

    return {
      transactionId: result.transaction_id,
      status: result.status,
      rawTx: result.raw_tx,
    };
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    this.ensureInitialized();
    const result =
      await this.transactionsApi.getTransactionById(transactionId);
    return result.status;
  }

  async listRecentTransactions(
    limit: number = 20
  ): Promise<CoboTransactionResult[]> {
    this.ensureInitialized();
    const result = await this.transactionsApi.listTransactions({
      wallet_id: this.config.walletId,
      limit,
      order_by: "created_timestamp",
      order: "DESC",
    });
    return (result.data || []).map((tx: any) => ({
      transactionId: tx.transaction_id,
      status: tx.status,
      rawTx: tx.raw_tx,
    }));
  }

  async createAddress(chainId: string): Promise<string> {
    this.ensureInitialized();
    const result = await this.walletsApi.createAddress(this.config.walletId, {
      chain_id: chainId,
      count: 1,
    });
    return result.data?.[0]?.address || "";
  }
}
