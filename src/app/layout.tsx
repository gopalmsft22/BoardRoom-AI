import type { Metadata } from "next";
import "./globals.css";
import { Background } from "@/components/Background";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Boardroom AI — Where AI leaders debate, challenge, and decide",
  description:
    "An AI executive council that debates your startup idea from six perspectives, challenges assumptions, simulates futures, and delivers a consensus-backed recommendation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Background />
        <SiteHeader />
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="no-print relative z-10 border-t border-white/5 py-6 text-center text-xs text-white/35">
          Boardroom AI · Multi-agent decision intelligence · Runs in demo mode with
          no API key
        </footer>
      </body>
    </html>
  );
}
