import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export type FY = { start: Date; end: Date; label: string; startYear: number };

export function currentFY(today = new Date()): FY {
  // FY runs July 1 – June 30
  const y = today.getFullYear();
  const isBeforeJuly = today.getMonth() < 6; // 0-based, June = 5
  const startYear = isBeforeJuly ? y - 1 : y;
  const start = new Date(startYear, 6, 1); // July 1
  const end = new Date(startYear + 1, 5, 30, 23, 59, 59, 999); // June 30
  return { start, end, label: `FY${startYear}-${startYear + 1}`, startYear };
}

export function monthsJulyToJune(startYear: number) {
  // Return an array of 12 months starting July of startYear
  const months: { start: Date; end: Date; label: string }[] = [];
  let d = new Date(startYear, 6, 1);
  for (let i = 0; i < 12; i++) {
    const s = startOfMonth(addMonths(d, i));
    const e = endOfMonth(s);
    const label = s.toLocaleDateString(undefined, { month: 'short' });
    months.push({ start: s, end: e, label });
  }
  return months;
}
