declare module "@cobo/cobo-waas2" {
  export const ApiClient: {
    instance: {
      setEnv(env: any): void;
      setPrivateKey(key: string, algorithm?: string): void;
    };
  };

  export const Env: {
    DEV: string;
    PROD: string;
  };

  export class WalletsApi {
    getWalletById(walletId: string): Promise<any>;
    listTokenBalancesForWallet(walletId: string): Promise<any>;
    createAddress(walletId: string, params: any): Promise<any>;
  }

  export class TransactionsApi {
    createTransferTransaction(params: any): Promise<any>;
    createContractCallTransaction(params: any): Promise<any>;
    getTransactionById(txId: string): Promise<any>;
    listTransactions(params: any): Promise<any>;
  }

  export class WalletsMPCWalletsApi {
    createMpcVault(params?: any): Promise<any>;
    getMpcVaultById(vaultId: string): Promise<any>;
    listMpcVaults(vaultType: string, opts?: any): Promise<any>;
    createKeyShareHolderGroup(vaultId: string, opts?: any): Promise<any>;
    createTssRequest(vaultId: string, opts?: any): Promise<any>;
    getTssRequestById(vaultId: string, tssRequestId: string): Promise<any>;
  }

  export class TransferParams {
    request_id: string;
    source: any;
    token_id: string;
    destination: any;
  }

  export class ContractCallParams {
    request_id: string;
    source: any;
    chain_id: string;
    destination: any;
  }

  export const WalletType: { MPC: string };
  export const WalletSubtype: { ORG_CONTROLLED: string };
}
