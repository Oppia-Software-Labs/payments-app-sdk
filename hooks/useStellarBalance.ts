"use client";

import { useEffect, useState } from "react";
import { stellarServer } from "@/lib/stellarServer";

export type Balance = {
  asset: string;
  amount: string;
};

export function useStellarBalance(publicKey: string | null) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalances([]);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const account = await stellarServer.loadAccount(publicKey);
        if (cancelled) return;
        const mapped = account.balances.map((b) => ({
          asset:
            b.asset_type === "native"
              ? "XLM"
              : `${(b as { asset_code: string }).asset_code}:${(b as { asset_issuer: string }).asset_issuer}`,
          amount: b.balance,
        }));
        setBalances(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  return { balances, loading };
}
