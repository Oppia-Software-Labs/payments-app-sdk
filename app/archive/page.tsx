"use client";

import { useStellarWalletKit } from "@/hooks/useStellarWalletKit";
import { useStellarTransactions } from "@/hooks/useStellarTransactions";
import Link from "next/link";

export default function ArchivePage() {
  const { publicKey, connect, isReady } = useStellarWalletKit();
  const { transactions, loading } = useStellarTransactions(publicKey);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Latest transactions</h1>

      {!isReady && <p>Loading wallet kit...</p>}
      {isReady && !publicKey && (
        <p>
          <button
            onClick={connect}
            className="text-blue-600 hover:underline"
          >
            Connect wallet
          </button>{" "}
          to see your transactions.
        </p>
      )}

      {publicKey && (
        <>
          {loading && <p className="text-gray-500">Loading transactions...</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-gray-500">No transactions yet.</p>
          )}
          {!loading && transactions.length > 0 && (
            <ul className="space-y-2 list-none p-0">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-200"
                >
                  <Link
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {tx.id.slice(0, 12)}...
                  </Link>
                  <span
                    className={
                      tx.successful ? "text-green-600" : "text-red-600"
                    }
                  >
                    {tx.successful ? "success" : "failed"}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {new Date(tx.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
