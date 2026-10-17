import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monello World — Certified Global Investment Partners Since 2013",
  description: "Monello World is a global certified investment company since 2013 with 11M+ members across Central Europe & Switzerland. Gold mining, Real Estate, Stocks, Oil, Energy & Crypto since 2015.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F5F0] text-[#0A1628] antialiased selection:bg-[#C9A86A]/30">
        {children}
      </body>
    </html>
  );
}
