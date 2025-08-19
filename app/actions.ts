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

export async function createStage(formData: FormData) {
  const schema = z.object({
    name: z.string().min(1),
    workstreamId: z.string().cuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
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
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
    }
  });
  revalidatePath('/');
}

export async function createObjective(formData: FormData) {
  const schema = z.object({
    title: z.string().min(1),
    stageId: z.string().cuid(),
    owner: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  });
  const d = schema.parse({
    title: formData.get('title'),
    stageId: formData.get('stageId'),
    owner: formData.get('owner') || undefined,
    dueDate: formData.get('dueDate') || undefined,
  });
  await prisma.objective.create({
    data: {
      title: d.title,
      stageId: d.stageId,
      owner: d.owner,
      dueDate: d.dueDate ? new Date(d.dueDate) : null,
    }
  });
  revalidatePath('/');
}

export async function createKR(formData: FormData) {
  const schema = z.object({
    objectiveId: z.string().cuid(),
    title: z.string().min(1),
    type: z.enum(['PERCENT', 'NUMERIC', 'HML']),
    percent: z.string().optional(),
    target: z.string().optional(),
    current: z.string().optional(),
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
      percent: d.type === 'PERCENT' ? Number(d.percent ?? 0) : null,
      target: d.type === 'NUMERIC' ? Number(d.target ?? 0) : null,
      current: d.type === 'NUMERIC' ? Number(d.current ?? 0) : null,
      unit: d.unit,
      hml: d.type === 'HML' ? (d.hml as any) : null,
    }
  });
  revalidatePath('/');
}

// Keep this if the KPI page is still present; otherwise you can delete it safely.
export async function createKPI(formData: FormData) {
  const schema = z.object({
    fiscalYearId: z.string().cuid(),
    workstreamId: z.string().optional(),
    title: z.string().min(1),
    type: z.enum(['PERCENT', 'NUMERIC', 'HML']),
    percent: z.string().optional(),
    target: z.string().optional(),
    current: z.string().optional(),
    unit: z.string().optional(),
    hml: z.enum(['HIGH','MEDIUM','LOW']).optional(),
  });
  const d = schema.parse({
    fiscalYearId: formData.get('fiscalYearId'),
    workstreamId: formData.get('workstreamId') || undefined,
    title: formData.get('title'),
    type: formData.get('type'),
    percent: formData.get('percent') || undefined,
    target: formData.get('target') || undefined,
    current: formData.get('current') || undefined,
    unit: formData.get('unit') || undefined,
    hml: formData.get('hml') || undefined,
  });
  await prisma.kPI.create({
    data: {
      fiscalYearId: d.fiscalYearId,
      workstreamId: d.workstreamId || null,
      title: d.title,
      type: d.type,
      percent: d.type === 'PERCENT' ? Number(d.percent ?? 0) : null,
      target: d.type === 'NUMERIC' ? Number(d.target ?? 0) : null,
      current: d.type === 'NUMERIC' ? Number(d.current ?? 0) : null,
      unit: d.unit,
      hml: d.type === 'HML' ? (d.hml as any) : null,
    }
  });
  revalidatePath('/kpis');
}
