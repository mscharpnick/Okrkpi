import { prisma } from "@/lib/db";
import TimelineGrid from "@/components/Timeline";
import WorkstreamRow from "@/components/WorkstreamRow";
import { currentFY } from "@/lib/fy";
import { createStage, createWorkstream, createObjective, createKR } from "./actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const fyParam = process.env.FY_START_YEAR ? Number(process.env.FY_START_YEAR) : currentFY().startYear;

  // Ensure FY row exists
  let fy = await prisma.fiscalYear.findFirst({ where: { startYear: fyParam } });
  if (!fy) fy = await prisma.fiscalYear.create({ data: { startYear: fyParam } });

  const workstreams = await prisma.workstream.findMany({
    where: { fiscalYearId: fy.id },
    include: {
      stages: {
        orderBy: { startDate: 'asc' },
        include: { objectives: { include: { krs: true } } }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Timeline — FY{fyParam}-{fyParam + 1} (weeks start Sun)</h1>

      <div className="rounded-xl border bg-white overflow-hidden">
        <TimelineGrid startYear={fyParam} />
        <div className="divide-y">
          {workstreams.map(ws => (
            <WorkstreamRow
              key={ws.id}
              workstream={ws}
              stages={ws.stages as any}
              startYear={fyParam}
            />
          ))}
          {workstreams.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              No workstreams yet. Use the forms below to add some.
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium mb-2">Add Workstream</h2>
          <form action={createWorkstream} className="grid gap-2">
            <input type="hidden" name="fiscalYearId" value={fy.id} />
            <input name="name" placeholder="Workstream name" className="border rounded-md px-3 py-2" required />
            <button className="px-3 py-2 rounded-md border bg-gray-50 w-fit">Add</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium mb-2">Add Stage</h2>
          <form action={createStage} className="grid gap-2">
            <select name="workstreamId" required className="border rounded-md px-3 py-2">
              <option value="">Select workstream…</option>
              {workstreams.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
            </select>
            <input name="name" placeholder="Stage name" className="border rounded-md px-3 py-2" required />
            <label className="text-xs text-gray-500">Start</label>
            <input type="datetime-local" name="startDate" className="border rounded-md px-3 py-2" required />
            <label className="text-xs text-gray-500">End</label>
            <input type="datetime-local" name="endDate" className="border rounded-md px-3 py-2" required />
            <button className="px-3 py-2 rounded-md border bg-gray-50 w-fit">Add</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium mb-2">Add Objective</h2>
          <form action={createObjective} className="grid gap-2">
            <select name="stageId" required className="border rounded-md px-3 py-2">
              <option value="">Select stage…</option>
              {workstreams.flatMap(ws => ws.stages).map(s =>
                <option key={s.id} value={s.id}>
                  {s.name} — {workstreams.find(w => w.id === s.workstreamId)?.name}
                </option>
              )}
            </select>
            <input name="title" placeholder="Objective title" className="border rounded-md px-3 py-2" required />
            <input name="owner" placeholder="Owner" className="border rounded-md px-3 py-2" />
            <label className="text-xs text-gray-500">Due date</label>
            <input type="datetime-local" name="dueDate" className="border rounded-md px-3 py-2" />
            <button className="px-3 py-2 rounded-md border bg-gray-50 w-fit">Add</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-medium mb-2">Add Key Result</h2>
          <form action={createKR} className="grid gap-2">
            <select name="objectiveId" required className="border rounded-md px-3 py-2">
              <option value="">Select objective…</option>
              {workstreams.flatMap(ws => ws.stages).flatMap(s => s.objectives).map(o =>
                <option key={o.id} value={o.id}>{o.title}</option>
              )}
            </select>
            <input name="title" placeholder="KR title" className="border rounded-md px-3 py-2" required />
            <select name="type" className="border rounded-md px-3 py-2">
              <option value="PERCENT">Percent</option>
              <option value="NUMERIC">Numeric</option>
              <option value="HML">High/Med/Low</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input name="percent" placeholder="% complete (0–100)" className="border rounded-md px-3 py-2" />
              <input name="unit" placeholder="Unit (%, #, hrs…)" className="border rounded-md px-3 py-2" />
              <input name="target" placeholder="Target (numeric)" className="border rounded-md px-3 py-2" />
              <input name="current" placeholder="Current (numeric)" className="border rounded-md px-3 py-2" />
              <select name="hml" className="border rounded-md px-3 py-2">
                <option value="">—</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <button className="px-3 py-2 rounded-md border bg-gray-50 w-fit">Add</button>
          </form>
        </section>
      </div>
    </div>
  );
}
