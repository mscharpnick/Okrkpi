import { differenceInCalendarDays, isAfter } from "date-fns";
import type { KeyResult, Objective, Stage } from "@prisma/client";

export type RAG = 'GREEN' | 'AMBER' | 'RED';

/**
 * Objective RAG:
 * - If dueDate passed and not mostly complete -> RED
 * - If due in ≤ 14 days and < 80% complete -> AMBER
 * - Else GREEN
 */
export function objectiveRag(obj: Objective, krs: KeyResult[]): RAG {
  const percent = krPercent(krs);
  if (obj.dueDate && isAfter(new Date(), obj.dueDate) && percent < 100) return 'RED';
  if (obj.dueDate && differenceInCalendarDays(obj.dueDate, new Date()) <= 14 && percent < 80) return 'AMBER';
  return 'GREEN';
}

/** KR → percent complete (best-effort across types) */
export function krPercent(krs: KeyResult[]): number {
  if (!krs.length) return 0;
  let scores: number[] = [];
  for (const kr of krs) {
    switch (kr.type) {
      case 'PERCENT':
        scores.push(Math.max(0, Math.min(100, kr.percent ?? 0)));
        break;
      case 'NUMERIC':
        if (kr.target && kr.target !== 0) {
          const pct = ((kr.current ?? 0) / kr.target) * 100;
          scores.push(Math.max(0, Math.min(100, pct)));
        } else scores.push(0);
        break;
      case 'HML':
        // Map H/M/L to 100/60/20
        const map: Record<string, number> = { HIGH: 100, MEDIUM: 60, LOW: 20 };
        scores.push(map[kr.hml ?? 'LOW'] ?? 20);
        break;
    }
  }
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Stage RAG = worst (RED > AMBER > GREEN) across its objectives */
export function stageRag(objectiveRags: RAG[]): RAG {
  if (objectiveRags.includes('RED')) return 'RED';
  if (objectiveRags.includes('AMBER')) return 'AMBER';
  return 'GREEN';
}

/** Is objective out of its stage range? */
export function objectiveOutOfRange(obj: Objective, stage: Stage): boolean {
  const s = stage.startDate, e = stage.endDate;
  if (!obj.dueDate) return false;
  return obj.dueDate < s || obj.dueDate > e;
}
