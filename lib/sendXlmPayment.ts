import {
  Asset,
  BASE_FEE,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { stellarServer } from "./stellarServer";

export type SendPaymentParams = {
  kit: StellarWalletsKit;
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
};

export async function sendXlmPayment({
  kit,
  sourcePublicKey,
  destinationPublicKey,
  amount,
}: SendPaymentParams): Promise<string> {
  const sourceAccount = await stellarServer.loadAccount(sourcePublicKey);

  const paymentOp = Operation.payment({
    destination: destinationPublicKey,
    asset: Asset.native(),
    amount,
  });

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(paymentOp)
    .setTimeout(30)
    .build();

  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
    networkPassphrase: WalletNetwork.TESTNET,
    address: sourcePublicKey,
  });

  const signedTx = TransactionBuilder.fromXDR(
    signedTxXdr,
    Networks.TESTNET
  ) as ReturnType<TransactionBuilder["build"]>;

  const res = await stellarServer.submitTransaction(signedTx);
  return res.hash;
}
