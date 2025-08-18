'use client';
import React, { useMemo } from "react";
import { addMonths, differenceInCalendarDays } from "date-fns";
import { Stage, Objective, KeyResult } from "@prisma/client";
import { stageRag, objectiveRag, objectiveOutOfRange } from "@/lib/status";
import { TrafficLight } from "../TrafficLight";

type StageWithChildren = Stage & { objectives: (Objective & { krs: KeyResult[] })[] };

export default function StageBar({ stage, startYear }: { stage: StageWithChildren; startYear: number }) {
  const monthsStart = new Date(startYear, 6, 1); // July 1
  const monthsEnd = new Date(startYear + 1, 5, 30);
  const totalDays = differenceInCalendarDays(monthsEnd, monthsStart) + 1;

  const leftPct = Math.max(0, ( (stage.startDate.getTime() - monthsStart.getTime()) / (monthsEnd.getTime() - monthsStart.getTime()) ) * 100);
  const rightPct = Math.max(0, ( (monthsEnd.getTime() - stage.endDate.getTime()) / (monthsEnd.getTime() - monthsStart.getTime()) ) * 100);
  const widthPct = Math.max(1, 100 - leftPct - rightPct);

  const objectiveRags = stage.objectives.map(o => objectiveRag(o, o.krs));
  const rag = stageRag(objectiveRags);

  return (
    <div className="absolute inset-y-2" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
      <div className="h-8 rounded-xl border bg-white shadow-sm px-2 flex items-center gap-2">
        <TrafficLight status={rag} />
        <span className="text-sm">{stage.name}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {stage.objectives.map(o => {
          const out = objectiveOutOfRange(o, stage);
          const orag = objectiveRag(o, o.krs);
          return (
            <div key={o.id} className={`text-xs px-2 py-1 rounded-full border bg-white shadow-sm flex items-center gap-1 ${out ? 'ring-2 ring-red-400' : ''}`} title={out ? 'Objective due date outside stage range' : ''}>
              <TrafficLight status={orag} />
              <span>{o.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
