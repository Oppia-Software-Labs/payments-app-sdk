import type { Metadata } from "next";
import "./globals.css";
import AppDock from "@/components/AppDock";
import { StellarWalletProvider } from "@/context/StellarWalletContext";

export const metadata: Metadata = {
  title: "Stellar Testnet Payments",
  description: "Send XLM payments on Stellar Testnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StellarWalletProvider>
          <div className="pb-24">{children}</div>
          <AppDock />
        </StellarWalletProvider>
      </body>
    </html>
  );
}
