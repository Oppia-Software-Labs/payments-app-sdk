"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";
import { useStellarWalletKit } from "@/hooks/useStellarWalletKit";
import { useStellarBalance } from "@/hooks/useStellarBalance";

export default function ProfilePage() {
  const { publicKey, connect, disconnect, isReady } = useStellarWalletKit();
  const { balances, loading } = useStellarBalance(publicKey);
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [publicKey]);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      {!isReady && <p>Loading wallet kit...</p>}
      {isReady && !publicKey && (
        <p>
          <button
            onClick={connect}
            className="text-blue-600 hover:underline"
          >
            Connect wallet
          </button>{" "}
          to see your account.
        </p>
      )}

      {publicKey && (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">
              Connected account
            </h2>
            <div className="flex items-start gap-2">
              <p className="font-mono text-sm break-all bg-gray-100 p-3 rounded flex-1 min-w-0">
                {publicKey}
              </p>
              <button
                onClick={copyAddress}
                className="shrink-0 p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                title="Copy address"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-1">Copied to clipboard</p>
            )}
            <button
              onClick={disconnect}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Disconnect
            </button>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-2">Balances</h2>
            {loading && <p className="text-gray-500">Loading balances...</p>}
            {!loading && (
              <ul className="space-y-1">
                {balances.map((b) => (
                  <li key={b.asset} className="flex justify-between">
                    <span className="font-medium">{b.asset}</span>
                    <span>{b.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
