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
          <div className="pb-24 min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <footer className="py-4 text-center text-sm text-gray-500">
              Made by{" "}
              <a
                href="https://github.com/villarley"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                villarley
              </a>{" "}
              &{" "}
              <a
                href="https://oppiasoftwarelabs.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Oppia
                <br/>
              </a>{" "}
              for Impacta Bootcamp
            </footer>
          </div>
          <AppDock />
        </StellarWalletProvider>
      </body>
    </html>
  );
}
