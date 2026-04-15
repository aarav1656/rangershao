import {
  VersionedTransaction,
  TransactionInstruction,
  PublicKey,
  MessageCompiledInstruction,
} from "@solana/web3.js";
import { SecurityConfig } from "../config/security-config";
import { TransactionSigner, UnsignedTransaction } from "../../src/keeper/types";

interface CoboSolInstruction {
  program_id: string;
  accounts: Array<{
    pubkey: string;
    is_signer: boolean;
    is_writable: boolean;
  }>;
  data: string;
}

interface CoboContractCallParams {
  request_id: string;
  source: {
    source_type: string;
    org_id: string;
  };
  chain_id: string;
  destination: {
    destination_type: string;
    sol_contract_call_instruction: {
      instructions: CoboSolInstruction[];
      address_lookup_tables?: string[];
    };
  };
}

interface CoboTransactionResponse {
  transaction_id: string;
  status: string;
  failure_reason?: string;
}

export class CoboSolanaSigner implements TransactionSigner {
  private config: SecurityConfig["cobo"];
  private sourceAddress: string;
  private apiClient: any;
  private transactionsApi: any;
  private initialized = false;

  constructor(config: SecurityConfig["cobo"], sourceAddress: string) {
    this.config = config;
    this.sourceAddress = sourceAddress;
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
    this.transactionsApi = new CoboWaas2.TransactionsApi();
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "CoboSolanaSigner not initialized. Call initialize() first."
      );
    }
  }

  private convertInstructionToCoboFormat(
    instruction: TransactionInstruction
  ): CoboSolInstruction {
    const programId = instruction.programId.toBase58();
    const accounts = instruction.keys.map((key) => ({
      pubkey: key.pubkey.toBase58(),
      is_signer: key.isSigner,
      is_writable: key.isWritable,
    }));
    const data = instruction.data.toString("base64");

    return {
      program_id: programId,
      accounts,
      data,
    };
  }

  private extractInstructions(
    transaction: VersionedTransaction
  ): TransactionInstruction[] {
    const message = transaction.message;
    const instructions: TransactionInstruction[] = [];

    const compiledInstructions = message.compiledInstructions;
    const accountKeys = message.getAccountKeys();

    for (const compiledIx of compiledInstructions) {
      const programIdIndex = compiledIx.programIdIndex;
      const programId = accountKeys.get(programIdIndex);

      if (!programId) {
        throw new Error(
          `Invalid program ID index ${programIdIndex} in compiled instruction`
        );
      }

      const keys = compiledIx.accountKeyIndexes.map((keyIndex) => {
        const pubkey = accountKeys.get(keyIndex);
        if (!pubkey) {
          throw new Error(
            `Invalid account key index ${keyIndex} in instruction`
          );
        }

        return {
          pubkey,
          isSigner: message.isAccountSigner(keyIndex),
          isWritable: message.isAccountWritable(keyIndex),
        };
      });

      const data = Buffer.from(compiledIx.data);

      instructions.push(
        new TransactionInstruction({
          programId,
          keys,
          data,
        })
      );
    }

    return instructions;
  }

  private extractAddressLookupTables(
    transaction: VersionedTransaction
  ): string[] {
    const message = transaction.message;

    if ("addressTableLookups" in message) {
      const lookups = (message as any).addressTableLookups || [];
      return lookups.map((lookup: any) =>
        typeof lookup.accountKey === "string"
          ? lookup.accountKey
          : lookup.accountKey.toBase58()
      );
    }

    return [];
  }

  async sign(tx: UnsignedTransaction): Promise<VersionedTransaction> {
    this.ensureInitialized();

    const instructions = this.extractInstructions(tx.transaction);
    const coboInstructions = instructions.map((ix) =>
      this.convertInstructionToCoboFormat(ix)
    );

    const addressLookupTables = this.extractAddressLookupTables(tx.transaction);

    const CoboWaas2 = await import("@cobo/cobo-waas2");
    const contractCallParams = new CoboWaas2.ContractCallParams();

    contractCallParams.request_id = tx.id;
    contractCallParams.source = {
      source_type: "Org-Controlled",
      org_id: this.config.orgId,
    };
    contractCallParams.chain_id = "SOL";
    contractCallParams.destination = {
      destination_type: "SOL_Contract",
      sol_contract_call_instruction: {
        instructions: coboInstructions,
        address_lookup_tables:
          addressLookupTables.length > 0 ? addressLookupTables : undefined,
      },
    };

    const response =
      await this.transactionsApi.createContractCallTransaction(
        contractCallParams
      );

    const transactionId: string = response.transaction_id;

    const finalTx = await this.pollTransactionStatus(transactionId, 120000);

    if (finalTx.status === "Completed") {
      return tx.transaction;
    } else {
      throw new Error(
        `Cobo transaction failed with status ${finalTx.status}. Reason: ${finalTx.failure_reason || "Unknown"}`
      );
    }
  }

  async pollTransactionStatus(
    txId: string,
    timeoutMs: number
  ): Promise<CoboTransactionResponse> {
    this.ensureInitialized();

    const startTime = Date.now();
    const pollIntervalMs = 2000;

    while (Date.now() - startTime < timeoutMs) {
      const response =
        await this.transactionsApi.getTransactionById(txId);

      const status = response.status;

      if (status === "Completed" || status === "Failed") {
        return {
          transaction_id: response.transaction_id,
          status,
          failure_reason: response.failure_reason,
        };
      }

      await new Promise((resolve) =>
        globalThis.setTimeout(resolve, pollIntervalMs)
      );
    }

    throw new Error(
      `Transaction ${txId} did not complete within ${timeoutMs}ms`
    );
  }
}
