import React from "react";
import { Stage, Objective, KeyResult, Workstream } from "@prisma/client";
import StageBar from "./stage/StageBar";
import { renameWorkstream, deleteWorkstream } from "@/app/actions";

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
    <div
      className="grid items-stretch"
      style={{ gridTemplateColumns: `260px repeat(12, minmax(0, 1fr))` }}
    >
      <div className="border-r p-2 text-sm flex flex-col gap-2">
        <div className="font-medium">{workstream.name}</div>

        {/* Quick rename */}
        <form action={renameWorkstream} className="flex gap-1">
          <input type="hidden" name="workstreamId" value={workstream.id} />
          <input
            name="name"
            defaultValue={workstream.name}
            className="border rounded-md px-2 py-1 text-xs w-full"
          />
          <button className="px-2 py-1 border rounded-md text-xs">Rename</button>
        </form>

        {/* Quick delete */}
        <form action={deleteWorkstream}>
          <input type="hidden" name="workstreamId" value={workstream.id} />
          <button
            className="px-2 py-1 border rounded-md text-xs text-red-600"
            onClick={(e) => {
              if (!confirm("Delete this workstream and all its stages/objectives?")) {
                e.preventDefault();
              }
            }}
          >
            Delete
          </button>
        </form>
      </div>

      <div className="col-span-12 relative border-b">
        <div className="relative h-24">
          {stages.map((s) => (
            <StageBar key={s.id} stage={s} startYear={startYear} />
          ))}
        </div>
      </div>
    </div>
  );
}
