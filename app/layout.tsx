import type { Metadata } from "next";
import "./globals.css";
import Toolbar from "@/components/Toolbar";

export const metadata: Metadata = {
  title: "THINK OKR Tracker",
  description: "FY timeline with OKRs & KPIs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Toolbar />
        <main className="max-w-screen-2xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
