// src/lib/utils/recurrence.ts
// PR2-053 AT-23: Client-side recurring event generation engine
// Design Decision AD-01: Compute recurring instances on the client, not stored in DB

import type { MetronomeKeyDateRow, MetronomeRecurrenceRule } from '@/lib/db/metronome';

export interface VirtualKeyDate extends MetronomeKeyDateRow {
  isVirtualInstance: boolean;    // true = generated from recurrence
  parentId: string | null;       // original recurring event's ID
  instanceDate: string;          // this specific instance's date
}

/**
 * Expands recurring key dates into individual instances within a view range.
 * Non-recurring events are passed through with isVirtualInstance=false.
 * Safety cap: max 500 total instances to prevent infinite loops.
 */
export function expandRecurringEvents(
  keyDates: MetronomeKeyDateRow[],
  viewStart: Date,
  viewEnd: Date
): VirtualKeyDate[] {
  const results: VirtualKeyDate[] = [];

  for (const kd of keyDates) {
    if (!kd.recurrence_rule) {
      // Non-recurring: include as-is if within view range
      const d = new Date(kd.date);
      if (d >= viewStart && d <= viewEnd) {
        results.push({
          ...kd,
          isVirtualInstance: false,
          parentId: null,
          instanceDate: kd.date,
        });
      }
      continue;
    }

    // Recurring: generate instances within view range
    const startDate = new Date(kd.date);
    const endDate = kd.recurrence_end ? new Date(kd.recurrence_end) : viewEnd;
    const effectiveEnd = endDate < viewEnd ? endDate : viewEnd;

    let current = new Date(startDate);
    let instanceCount = 0;

    while (current <= effectiveEnd) {
      if (current >= viewStart && current <= viewEnd) {
        const dateStr = current.toISOString().split('T')[0];
        results.push({
          ...kd,
          isVirtualInstance: current.getTime() !== startDate.getTime(),
          parentId: kd.id,
          instanceDate: dateStr,
          // Override the date field for display
          date: dateStr,
        });
      }

      // Advance to next occurrence
      current = advanceDate(current, kd.recurrence_rule);
      instanceCount++;

      // Safety: break if we've generated more than 500 instances (prevents infinite loop)
      if (instanceCount > 500) break;
    }
  }

  return results;
}

/**
 * Advance a date by one recurrence interval.
 */
function advanceDate(date: Date, rule: MetronomeRecurrenceRule): Date {
  const next = new Date(date);
  switch (rule) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

/**
 * Get human-readable label for a recurrence rule.
 */
export function getRecurrenceLabel(rule: MetronomeRecurrenceRule | null): string {
  if (!rule) return 'Does not repeat';
  switch (rule) {
    case 'weekly': return 'Repeats weekly';
    case 'biweekly': return 'Repeats every 2 weeks';
    case 'monthly': return 'Repeats monthly';
  }
}
