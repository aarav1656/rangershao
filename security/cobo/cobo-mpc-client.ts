import { SecurityConfig } from "../config/security-config";
import { CoboDirectClient } from "./cobo-direct-client";

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
  private directClient?: CoboDirectClient;
  private transactionsApi: any;
  private initialized = false;

  constructor(config: SecurityConfig["cobo"]) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.directClient = new CoboDirectClient({
      apiSecret: this.config.apiSecret,
      apiPubKey: process.env.COBO_API_PUBKEY,
      env: this.config.env,
    });
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.directClient) {
      throw new Error("CoboMpcClient not initialized. Call initialize() first.");
    }
  }

  async getWalletInfo(): Promise<CoboWalletInfo> {
    this.ensureInitialized();
    const wallet = await this.directClient!.getWallet(this.config.walletId);
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
    const result = await this.directClient!.getBalance(this.config.walletId);
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
    const result = await this.directClient!.createTransaction({
      request_id: params.requestId,
      source: {
        source_type: "Org-Controlled",
        wallet_id: params.sourceWalletId,
      },
      token_id: params.tokenId,
      destination: {
        destination_type: "Address",
        account_output: {
          address: params.destinationAddress,
          amount: params.amount,
          memo: params.memo,
        },
      },
    });

    return {
      transactionId: result.transaction_id,
      status: result.status,
      rawTx: result.raw_tx,
    };
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    this.ensureInitialized();
    const result = await this.directClient!.getTransaction(transactionId);
    return result.status;
  }

  async listRecentTransactions(
    limit: number = 20
  ): Promise<CoboTransactionResult[]> {
    this.ensureInitialized();
    if (!this.transactionsApi) {
      const CoboWaas2 = await import("@cobo/cobo-waas2");
      const apiClient = CoboWaas2.ApiClient.instance;

      if (this.config.env === "dev") {
        apiClient.setEnv(CoboWaas2.Env.DEV);
      } else {
        apiClient.setEnv(CoboWaas2.Env.PROD);
      }

      apiClient.setPrivateKey(this.config.apiSecret);
      this.transactionsApi = new CoboWaas2.TransactionsApi();
    }

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
    const result = await this.directClient!.createAddress(this.config.walletId, {
      chain_id: chainId,
      count: 1,
    });
    return result.data?.[0]?.address || "";
  }
}
