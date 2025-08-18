import React from "react";
import { monthsJulyToJune } from "@/lib/fy";

export default function TimelineGrid({ startYear }: { startYear: number }) {
  const months = monthsJulyToJune(startYear);
  return (
    <div className="grid" style={{ gridTemplateColumns: `160px repeat(12, minmax(0, 1fr))` }}>
      <div className="border-b bg-gray-50 p-2 text-xs font-medium">Workstream</div>
      {months.map((m, idx) => (
        <div key={idx} className="border-b bg-gray-50 p-2 text-xs text-center">{m.label}</div>
      ))}
    </div>
  );
}
