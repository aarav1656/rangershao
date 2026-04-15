import { PublicKey } from "@solana/web3.js";

export const PROTOCOL_CONSTANTS = {
  SOLEND: {
    PROGRAM_ID: new PublicKey("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"),
    LOOKUP_TABLE_ADDRESSES: [
      new PublicKey("89ig7Cu6Roi9mJMqpY8sBkPYL2cnqzpgP16sJxSUbvct"),
    ],
    MAIN_MARKET: {
      LENDING_MARKET: new PublicKey(
        "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY"
      ),
      USDC: {
        COUNTERPARTY_TA: new PublicKey(
          "8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf"
        ),
        RESERVE: new PublicKey(
          "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw"
        ),
        COLLATERAL_MINT: new PublicKey(
          "993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk"
        ),
        PYTH_ORACLE: new PublicKey(
          "Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"
        ),
        SWITCHBOARD_ORACLE: new PublicKey(
          "BjUgj6YCnFBZ49wF54ddBVA9qu8TeqkFtkbqmZcee8uW"
        ),
      },
    },
  },

  MARGINFI: {
    PROGRAM_ID: new PublicKey("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA"),
    LOOKUP_TABLE_ADDRESSES: [
      new PublicKey("HGmknUTUmeovMc9ryERNWG6UFZDFDVr9xrum3ZhyL4fC"),
    ],
    MAIN_MARKET: {
      GROUP: new PublicKey("4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8"),
      USDC: {
        BANK: new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB"),
        ORACLE: new PublicKey(
          "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
        ),
      },
    },
  },

  KLEND: {
    PROGRAM_ID: new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD"),
    SCOPE_ORACLE: new PublicKey(
      "3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C"
    ),
    LOOKUP_TABLE_ADDRESSES: [
      new PublicKey("284iwGtA9X9aLy3KsyV8uT2pXLARhYbiSi5SiM2g47M2"),
    ],
    MAIN_MARKET: {
      LENDING_MARKET: new PublicKey(
        "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF"
      ),
      USDC: {
        RESERVE: new PublicKey(
          "D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59"
        ),
      },
    },
  },

  DRIFT: {
    PROGRAM_ID: new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"),
    LOOKUP_TABLE_ADDRESSES: [
      new PublicKey("Fpys8GRa5RBWfyeN7AaDUwFGD1zkDCA4z3t4CJLV8dfL"),
    ],
    SUB_ACCOUNT_ID: 0,
    SPOT: {
      STATE: new PublicKey("5zpq7DvB6UdFFvpmBPspGPNfUGoBRRCE2HHg5u3gxcsN"),
      USDC: {
        MARKET_INDEX: 0,
        ORACLE: new PublicKey(
          "9VCioxmni2gDLv11qufWzT3RDERhQE4iY5Gf7NTfYyAV"
        ),
      },
    },
  },
} as const;

export type ProtocolName = keyof typeof PROTOCOL_CONSTANTS;
