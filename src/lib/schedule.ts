/**
 * Business-day scheduling — port of _add_business_days from the wizard page.
 * Skips weekends. Holiday skipping (python-holidays equivalent) is a noted
 * follow-up: the selected region is stored in the payload; add the
 * `date-holidays` package to enforce it here.
 */
import type { WizardPayload } from "../types/wizardPayload";

type Item = WizardPayload["timeline"]["items"][number];

export function addBusinessDays(start: Date, n: number): Date {
  const d = new Date(start);
  let remaining = n;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return d;
}

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Recompute start/end for every milestone row from the project start date. */
export function scheduleItems(startDate: string, items: Item[]): {
  items: Item[]; totalBd: number; projectedCompletion: string | null;
} {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  let cursor = new Date(start);
  // start on a business day
  while (cursor.getDay() === 0 || cursor.getDay() === 6) cursor.setDate(cursor.getDate() + 1);

  let totalBd = 0;
  const out = items.map((item) => {
    const dur = Math.max(0, item.duration_bd || 0);
    const s = new Date(cursor);
    const e = dur > 0 ? addBusinessDays(s, Math.max(0, dur - 1)) : new Date(s);
    cursor = dur > 0 ? addBusinessDays(s, dur) : new Date(s);
    totalBd += dur;
    return { ...item, start: iso(s), end: iso(e) };
  });

  const projectedCompletion = out.length ? out[out.length - 1].end : null;
  return { items: out, totalBd, projectedCompletion };
}

/** Human-scale duration summary, mirroring the months/years callout. */
export function approxDuration(totalBd: number): string {
  const months = totalBd / 21;
  if (months < 1) return `${totalBd} business days (~${Math.round(months * 4.33)} weeks)`;
  if (months < 12) return `~${months.toFixed(1)} months`;
  return `~${(months / 12).toFixed(1)} years`;
}
