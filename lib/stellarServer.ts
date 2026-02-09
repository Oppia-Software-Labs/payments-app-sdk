import { Horizon } from "@stellar/stellar-sdk";

export const stellarServer = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);
