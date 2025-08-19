'use client';
import React from "react";
import { Stage, Objective, KeyResult } from "@prisma/client";
import { stageRag, objectiveRag, objectiveOutOfRange } from "@/lib/status";
import { TrafficLight } from "../TrafficLight";

type StageWithChildren = Stage & { objectives: (Objective & { krs: KeyResult[] })[] };

export default function StageBar({ stage, startYear }: { stage: StageWithChildren; startYear: number }) {
  // Coerce serialized dates (string) into Date objects for math
  const stageStart = new Date(stage.startDate as any);
  const stageEnd   = new Date(stage.endDate as any);

  const yearStart = new Date(startYear, 6, 1);      // July 1
  const yearEnd   = new Date(startYear + 1, 5, 30); // June 30

  const leftPct  = Math.max(0, ((stageStart.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())) * 100);
  const rightPct = Math.max(0, ((yearEnd.getTime()   - stageEnd.getTime())   / (yearEnd.getTime() - yearStart.getTime())) * 100);
  const widthPct = Math.max(1, 100 - leftPct - rightPct);

  const stageForRange = { ...stage, startDate: stageStart, endDate: stageEnd } as Stage;

  const chips = stage.objectives.map(o => {
    const due = o.dueDate ? new Date(o.dueDate as any) : undefined;
    const obj = { ...o, dueDate: due } as Objective;
    const out = objectiveOutOfRange(obj, stageForRange);
    const rag = objectiveRag(obj, o.krs);
    return { ...o, _out: out, _rag: rag };
  });

  return (
    <div className="absolute inset-y-2" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
      <div className="h-8 rounded-xl border bg-white shadow-sm px-2 flex items-center gap-2">
        <TrafficLight status={stageRag(chips.map(c => c._rag))} />
        <span className="text-sm">{stage.name}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {chips.map(o => (
          <div
            key={o.id}
            className={`text-xs px-2 py-1 rounded-full border bg-white shadow-sm flex items-center gap-1 ${o._out ? 'ring-2 ring-red-400' : ''}`}
            title={o._out ? 'Objective due date outside stage range' : ''}
          >
            <TrafficLight status={o._rag} />
            <span>{o.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
