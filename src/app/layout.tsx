import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mutual Fund Investment Decision Engine PRO",
  description: "Enterprise-grade AI investment decision support for 15-fund long-term portfolio management",
  keywords: ["mutual fund", "AI investment", "portfolio management", "SIP", "India"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
