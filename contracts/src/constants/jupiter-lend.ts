// Jupiter Perpetuals JLP lending uses Klend's program with a separate market.
// The program ID is intentionally the same as Klend because JLP lending
// is built on top of the Klend protocol with its own isolated market.
export const JUPITER_LEND = {
  PROGRAM_ID: "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD",
  SCOPE_ORACLE: "3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C",
  LOOKUP_TABLE_ADDRESSES: ["284iwGtA9X9aLy3KsyV8uT2pXLARhYbiSi5SiM2g47M2"],
  JLP_MARKET: {
    LENDING_MARKET: "DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek",
    USDC: {
      RESERVE: "Ga4rZytCpFkCBVo4FW8wSgjLKMRvmJpBMkN67Apys4nV",
    },
  },
};
