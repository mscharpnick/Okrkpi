import React from "react";
import { Stage, Objective, KeyResult, Workstream } from "@prisma/client";
import StageBar from "./stage/StageBar";

type StageWithChildren = Stage & { objectives: (Objective & { krs: KeyResult[] })[] };

export default function WorkstreamRow({
  workstream,
  stages,
  startYear,
}: {
  workstream: Workstream;
  stages: StageWithChildren[];
  startYear: number;
}) {
  return (
    <div className="grid items-stretch" style={{ gridTemplateColumns: `160px repeat(12, minmax(0, 1fr))` }}>
      <div className="border-r p-2 text-sm font-medium">{workstream.name}</div>
      <div className="col-span-12 relative border-b">
        <div className="relative h-24">
          {stages.map(s => (
            <StageBar key={s.id} stage={s} startYear={startYear} />
          ))}
        </div>
      </div>
    </div>
  );
}
