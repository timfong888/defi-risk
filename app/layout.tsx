import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeFi Risk Intelligence Aggregator",
  description:
    "Neutral, open-source aggregation of what every major DeFi risk feed says about a protocol — side by side, verbatim, with no composite scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-baseline gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              DeFi Risk Intelligence Aggregator
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-200 text-xs text-gray-500">
          <div className="mx-auto max-w-screen-2xl px-4 py-4 flex flex-wrap gap-x-6 gap-y-1">
            <span>AGPL-3.0 · open data, community-correctable</span>
            <span>
              A public-good prototype for the Ethereum Foundation App Relations
              RFP
            </span>
            <span>
              This site never produces its own risk scores. See the{" "}
              <Link href="/methodology" className="underline">
                methodology
              </Link>
              .
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
