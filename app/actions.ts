'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// No unique index on startYear → use findFirst + create (not upsert)
export async function createFiscalYear(startYear: number) {
  const existing = await prisma.fiscalYear.findFirst({ where: { startYear } });
  if (existing) return existing.id;
  const created = await prisma.fiscalYear.create({ data: { startYear } });
  return created.id;
}

/** WORKSTREAMS */
export async function createWorkstream(formData: FormData) {
  const schema = z.object({
    name: z.string().min(1),
    fiscalYearId: z.string().cuid(),
  });
  const data = schema.parse({
    name: formData.get('name'),
    fiscalYearId: formData.get('fiscalYearId'),
  });
  await prisma.workstream.create({ data });
  revalidatePath('/');
}

export async function renameWorkstream(formData: FormData) {
  const schema = z.object({
    workstreamId: z.string().cuid(),
    name: z.string().min(1),
  });
  const d = schema.parse({
    workstreamId: formData.get('workstreamId'),
    name: formData.get('name'),
  });
  await prisma.workstream.update({ where: { id: d.workstreamId }, data: { name: d.name } });
  revalidatePath('/');
}

export async function deleteWorkstream(formData: FormData) {
  const schema = z.object({ workstreamId: z.string().cuid() });
  const d = schema.parse({ workstreamId: formData.get('workstreamId') });
  await prisma.workstream.delete({ where: { id: d.workstreamId } });
  revalidatePath('/');
}

/** STAGES */
export async function createStage(formData: FormData) {
  // Use z.coerce.date() so we accept 'YYYY-MM-DDTHH:MM' from <input type="datetime-local">
  const schema = z.object({
    name: z.string().min(1),
    workstreamId: z.string().cuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  });
  const d = schema.parse({
    name: formData.get('name'),
    workstreamId: formData.get('workstreamId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  });
  await prisma.stage.create({
    data: {
      name: d.name,
      workstreamId: d.workstreamId,
      startDate: d.startDate,
      endDate: d.endDate,
    }
  });
  revalidatePath('/');
}

/** OBJECTIVES */
export async function createObjective(formData: FormData) {
  const schema = z.object({
    title: z.string().min(1),
    stageId: z.string().cuid(),
    owner: z.string().optional(),
    dueDate: z.coerce.date().optional(),
  });
  const d = schema.parse({
    title: formData.get('title'),
    stageId: formData.get('stageId'),
    owner: formData.get('owner') || undefined,
    dueDate: (formData.get('dueDate') as string) || undefined,
  });
  await prisma.objective.create({
    data: {
      title: d.title,
      stageId: d.stageId,
      owner: d.owner,
      dueDate: d.dueDate ?? null,
    }
  });
  revalidatePath('/');
}

/** KRs */
export async function createKR(formData: FormData) {
  const schema = z.object({
    objectiveId: z.string().cuid(),
    title: z.string().min(1),
    type: z.enum(['PERCENT', 'NUMERIC', 'HML']),
    percent: z.coerce.number().int().min(0).max(100).optional(),
    target: z.coerce.number().optional(),
    current: z.coerce.number().optional(),
    unit: z.string().optional(),
    hml: z.enum(['HIGH','MEDIUM','LOW']).optional(),
  });
  const d = schema.parse({
    objectiveId: formData.get('objectiveId'),
    title: formData.get('title'),
    type: formData.get('type'),
    percent: formData.get('percent') || undefined,
    target: formData.get('target') || undefined,
    current: formData.get('current') || undefined,
    unit: formData.get('unit') || undefined,
    hml: formData.get('hml') || undefined,
  });
  await prisma.keyResult.create({
    data: {
      objectiveId: d.objectiveId,
      title: d.title,
      type: d.type,
      percent: d.type === 'PERCENT' ? d.percent ?? 0 : null,
      target: d.type === 'NUMERIC' ? d.target ?? 0 : null,
      current: d.type === 'NUMERIC' ? d.current ?? 0 : null,
      unit: d.unit,
      hml: d.type === 'HML' ? (d.hml as any) : null,
    }
  });
  revalidatePath('/');
}

/** (Keep this only if you still have /kpis; otherwise safe to delete) */
export async function createKPI(formData: FormData) {
  // left as-is; not used on the timeline
}
