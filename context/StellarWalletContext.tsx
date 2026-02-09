"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  allowAllModules,
  StellarWalletsKit,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";

const STORAGE_KEY = "stellar_wallet_public_key";

function getStoredPublicKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredPublicKey(address: string | null) {
  try {
    if (address) localStorage.setItem(STORAGE_KEY, address);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type StellarWalletContextValue = {
  kit: StellarWalletsKit | null;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isReady: boolean;
};

const StellarWalletContext = createContext<StellarWalletContextValue | null>(
  null
);

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const setPublicKeyRef = useRef(setPublicKey);
  setPublicKeyRef.current = setPublicKey;

  useEffect(() => {
    const k = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      modules: allowAllModules(),
    });
    setKit(k);
    setIsReady(true);
  }, []);

  // Restore session: try extension first, then localStorage (for other tabs/refresh)
  useEffect(() => {
    if (!kit || !isReady) return;
    kit
      .getAddress()
      .then(({ address }) => {
        setPublicKeyRef.current(address);
        setStoredPublicKey(address);
      })
      .catch(() => {
        const stored = getStoredPublicKey();
        if (stored) setPublicKeyRef.current(stored);
      });
  }, [kit, isReady]);

  const connect = useCallback(async () => {
    if (!kit) return;
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        setPublicKeyRef.current(address);
        setStoredPublicKey(address);
      },
    });
  }, [kit]);

  const disconnect = useCallback(async () => {
    if (!kit) return;
    await kit.disconnect();
    setPublicKeyRef.current(null);
    setStoredPublicKey(null);
  }, [kit]);

  const value: StellarWalletContextValue = {
    kit,
    publicKey,
    connect,
    disconnect,
    isReady,
  };

  return (
    <StellarWalletContext.Provider value={value}>
      {children}
    </StellarWalletContext.Provider>
  );
}

export function useStellarWalletKit(): StellarWalletContextValue {
  const ctx = useContext(StellarWalletContext);
  if (ctx == null) {
    throw new Error(
      "useStellarWalletKit must be used within StellarWalletProvider"
    );
  }
  return ctx;
}
