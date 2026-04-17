import { createHash } from "crypto";
import * as nacl from "tweetnacl";

const COBO_BASE_URLS = {
  dev: "https://api.dev.cobo.com/v2",
  prod: "https://api.cobo.com/v2",
} as const;

type CoboEnv = keyof typeof COBO_BASE_URLS;
type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface CoboDirectClientOptions {
  apiSecret: string;
  apiPubKey?: string;
  env?: CoboEnv;
  timeoutMs?: number;
}

interface CoboErrorBody {
  error_code?: string;
  error_message?: string;
  error_id?: string;
  message?: string;
}

export interface CoboListAddressesParams {
  [key: string]: QueryValue;
  chain_ids?: string;
  addresses?: string;
  limit?: number;
  before?: string;
  after?: string;
}

export interface CoboListBalancesParams {
  [key: string]: QueryValue;
  token_ids?: string;
  limit?: number;
  before?: string;
  after?: string;
}

export interface CoboCreateAddressParams {
  chain_id: string;
  count?: number;
}

export interface CoboCreateTransactionParams {
  request_id: string;
  source: {
    source_type: string;
    wallet_id?: string;
    address?: string;
  };
  token_id: string;
  destination: {
    destination_type: string;
    account_output?: {
      address: string;
      amount: string;
      memo?: string;
    };
    account_outputs?: Array<{
      address: string;
      amount: string;
      memo?: string;
    }>;
  };
  description?: string;
  fee?: Record<string, unknown>;
  transaction_process_type?: string;
  auto_fuel?: string;
  pre_check?: Record<string, unknown>;
  category_names?: string[];
}

export class CoboDirectClient {
  private readonly apiSecret: string;
  private readonly apiPubKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: CoboDirectClientOptions) {
    this.apiSecret = options.apiSecret;
    this.apiPubKey = this.derivePublicKey(options.apiSecret);
    this.baseUrl = COBO_BASE_URLS[options.env ?? "prod"];
    this.timeoutMs = options.timeoutMs ?? 60_000;

    if (
      options.apiPubKey &&
      options.apiPubKey.toLowerCase() !== this.apiPubKey.toLowerCase()
    ) {
      throw new Error("COBO_API_PUBKEY does not match COBO_API_SECRET");
    }
  }

  async listWallets(params: QueryParams = {}): Promise<any> {
    return this.request("GET", "/wallets", { query: params });
  }

  async getWallet(walletId: string): Promise<any> {
    return this.request("GET", `/wallets/${encodeURIComponent(walletId)}`);
  }

  async listAddresses(
    walletId: string,
    params: CoboListAddressesParams = {}
  ): Promise<any> {
    return this.request(
      "GET",
      `/wallets/${encodeURIComponent(walletId)}/addresses`,
      { query: params }
    );
  }

  async getBalance(
    walletId: string,
    params: CoboListBalancesParams = {}
  ): Promise<any> {
    return this.request(
      "GET",
      `/wallets/${encodeURIComponent(walletId)}/tokens`,
      { query: params }
    );
  }

  async createAddress(
    walletId: string,
    params: CoboCreateAddressParams
  ): Promise<any> {
    return this.request(
      "POST",
      `/wallets/${encodeURIComponent(walletId)}/addresses`,
      { body: { count: 1, ...params } }
    );
  }

  async createTransaction(params: CoboCreateTransactionParams): Promise<any> {
    return this.request("POST", "/transactions/transfer", { body: params });
  }

  async getTransaction(txId: string): Promise<any> {
    return this.request("GET", `/transactions/${encodeURIComponent(txId)}`);
  }

  private async request(
    method: string,
    path: string,
    options: { query?: QueryParams; body?: unknown } = {}
  ): Promise<any> {
    const nonce = String(Date.now());
    const queryString = this.buildSortedQueryString(options.query ?? {});
    const bodyString = options.body === undefined ? "" : JSON.stringify(options.body);
    const url = queryString ? `${this.baseUrl}${path}?${queryString}` : `${this.baseUrl}${path}`;
    const fullPath = new URL(url).pathname;
    const signingMessage = [method, fullPath, nonce, queryString, bodyString].join("|");
    const signature = this.sign(signingMessage);



    const headers: Record<string, string> = {
      Accept: "application/json",
      "BIZ-API-KEY": this.apiPubKey,
      "BIZ-API-NONCE": nonce,
      "BIZ-API-SIGNATURE": signature,
    };

    if (bodyString) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: bodyString || undefined,
          signal: controller.signal,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown network error";
        throw new Error(`Cobo API network failure for ${method} ${path}: ${message}`);
      }

      const text = await response.text();
      const payload = text ? this.safeJsonParse(text) : null;

      if (!response.ok) {
        throw this.buildHttpError(response.status, payload);
      }

      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildSortedQueryString(query: QueryParams): string {
    return Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
        if (leftKey === rightKey) {
          return String(leftValue).localeCompare(String(rightValue));
        }
        return leftKey.localeCompare(rightKey);
      })
      .map(([key, value]) => `${this.encodeQueryComponent(key)}=${this.encodeQueryComponent(String(value))}`)
      .join("&");
  }

  private encodeQueryComponent(value: string): string {
    return encodeURIComponent(value).replace(/%20/g, "+");
  }

  private sign(message: string): string {
    const firstHash = createHash("sha256").update(message).digest();
    const secondHash = createHash("sha256").update(firstHash).digest();
    const secretKey = Buffer.concat([
      Buffer.from(this.apiSecret, "hex"),
      Buffer.from(this.apiPubKey, "hex"),
    ]);
    const signature = nacl.sign.detached(
      new Uint8Array(secondHash),
      new Uint8Array(secretKey)
    );
    return Buffer.from(signature).toString("hex");
  }

  private derivePublicKey(secret: string): string {
    const secretSeed = new Uint8Array(Buffer.from(secret, "hex"));
    const publicKey = nacl.sign.keyPair.fromSeed(secretSeed).publicKey;
    return Buffer.from(publicKey).toString("hex");
  }

  private safeJsonParse(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private buildHttpError(status: number, payload: unknown): Error {
    const errorBody =
      typeof payload === "object" && payload !== null
        ? (payload as CoboErrorBody)
        : undefined;
    const message =
      errorBody?.error_message ||
      errorBody?.message ||
      errorBody?.error_code ||
      (typeof payload === "string" ? payload : "Unknown Cobo API error");

    const error = new Error(`Cobo API ${status}: ${message}`);
    (error as Error & { status?: number; payload?: unknown }).status = status;
    (error as Error & { status?: number; payload?: unknown }).payload = payload;
    return error;
  }
}
