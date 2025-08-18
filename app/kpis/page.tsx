import { prisma } from "@/lib/db";
import { currentFY } from "@/lib/fy";
import { createKPI } from "../actions";

export default async function KPIsPage() {
  const fyParam = process.env.FY_START_YEAR ? Number(process.env.FY_START_YEAR) : currentFY().startYear;
  const fy = await prisma.fiscalYear.findFirst({ where: { startYear: fyParam } });
  if (!fy) {
    return <div className="text-sm text-gray-600">Create the fiscal year by visiting the Timeline first.</div>;
  }

  const kpis = await prisma.kPI.findMany({ where: { fiscalYearId: fy.id }, include: { workstream: true }, orderBy: { title: 'asc' } });
  const workstreams = await prisma.workstream.findMany({ where: { fiscalYearId: fy.id }, orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">KPIs — FY{fyParam}-{fyParam+1}</h1>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border-b">KPI</th>
              <th className="text-left p-2 border-b">Workstream</th>
              <th className="text-left p-2 border-b">Type</th>
              <th className="text-left p-2 border-b">Target</th>
              <th className="text-left p-2 border-b">Current</th>
              <th className="text-left p-2 border-b">Unit</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map(k => (
              <tr key={k.id} className="border-b">
                <td className="p-2">{k.title}</td>
                <td className="p-2">{k.workstream?.name ?? '—'}</td>
                <td className="p-2">{k.type}</td>
                <td className="p-2">{k.target ?? '—'}</td>
                <td className="p-2">{k.current ?? (k.percent ?? '—')}</td>
                <td className="p-2">{k.unit ?? '—'}</td>
              </tr>
            ))}
            {kpis.length === 0 && (
              <tr><td className="p-2 text-gray-500" colSpan={6}>No KPIs yet. Use the form below to add some.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-medium mb-2">Add KPI</h2>
        <form action={createKPI} className="grid gap-2">
          <input type="hidden" name="fiscalYearId" value={fy.id} />
          <input name="title" placeholder="KPI title" className="border rounded-md px-3 py-2" required />
          <select name="workstreamId" className="border rounded-md px-3 py-2">
            <option value="">(Optional) attach to workstream…</option>
            {workstreams.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
          </select>
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
  );
}
