"use client";

import { useCallback, useEffect, useState } from "react";
import { stellarServer } from "@/lib/stellarServer";
import type { ServerApi } from "@stellar/stellar-sdk";

const LIMIT = 10;

export type TxItem = {
  id: string;
  created_at: string;
  successful: boolean;
};

export function useStellarTransactions(publicKey: string | null) {
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const page = await stellarServer
        .transactions()
        .forAccount(publicKey)
        .order("desc")
        .limit(LIMIT)
        .call();

      const items: TxItem[] = (
        page as ServerApi.CollectionPage<ServerApi.TransactionRecord>
      ).records.map((tx) => ({
        id: tx.id,
        created_at: tx.created_at,
        successful: tx.successful,
      }));
      setTransactions(items);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      return;
    }
    fetchTransactions();
  }, [publicKey, fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}
