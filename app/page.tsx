"use client";

import { useState } from "react";
import { useStellarWalletKit } from "@/hooks/useStellarWalletKit";
import { useStellarBalance } from "@/hooks/useStellarBalance";
import { sendXlmPayment } from "@/lib/sendXlmPayment";

export default function HomePage() {
  const { kit, publicKey, connect, disconnect, isReady } =
    useStellarWalletKit();
  const { balances, loading } = useStellarBalance(publicKey);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!kit || !publicKey) return;
    setSending(true);
    setError(null);
    try {
      const hash = await sendXlmPayment({
        kit,
        sourcePublicKey: publicKey,
        destinationPublicKey: destination,
        amount,
      });
      setTxHash(hash);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error sending transaction");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Stellar Testnet Payments</h1>

      {!isReady && <p>Loading wallet kit...</p>}

      {isReady && !publicKey && (
        <button
          onClick={connect}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}

      {publicKey && (
        <>
          <p className="text-gray-600 mb-2">
            Connected: {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
          </p>
          <button
            onClick={disconnect}
            className="text-sm text-gray-500 hover:underline mb-6"
          >
            Disconnect
          </button>

          <section className="mb-6">
            <h2 className="text-lg font-medium mb-2">Balances</h2>
            {loading && <p className="text-gray-500">Loading balances...</p>}
            {!loading && (
              <ul className="space-y-1">
                {balances.map((b) => (
                  <li key={b.asset}>
                    {b.asset}: {b.amount}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">Send XLM Payment</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Destination G-address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Payment"}
              </button>
            </div>

            {txHash && (
              <p className="mt-3">
                Tx:{" "}
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {txHash.slice(0, 12)}...
                </a>
              </p>
            )}

            {error && <p className="text-red-600 mt-2">{error}</p>}
          </section>
        </>
      )}
    </main>
  );
}
