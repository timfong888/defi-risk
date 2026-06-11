import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">
                Matrix
              </Link>
              <Link href="/methodology" className="hover:text-gray-900">
                Methodology
              </Link>
              <a
                href="https://github.com/timfong888/defi-risk"
                className="hover:text-gray-900"
              >
                GitHub
              </a>
            </nav>
            <span className="ml-auto hidden sm:inline text-xs text-gray-400">
              No composite scoring — feed assessments shown verbatim
            </span>
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
