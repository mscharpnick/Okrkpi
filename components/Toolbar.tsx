'use client';
import Link from "next/link";

export default function Toolbar() {
  return (
    <div className="flex items-center justify-between gap-3 p-3 border-b bg-white sticky top-0 z-10 no-print">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-semibold">THINK OKR Tracker</Link>
        <nav className="flex gap-3 text-sm">
          <Link href="/">Timeline</Link>
          <Link href="/kpis">KPIs</Link>
        </nav>
      </div>
      <div className="flex gap-2">
        <button onClick={() => window.print()} className="px-3 py-1.5 rounded-md border text-sm">Export PDF</button>
      </div>
    </div>
  );
}
