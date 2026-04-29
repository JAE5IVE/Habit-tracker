function parseCalendarDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function previousCalendarDate(date: string): string {
  const parsed = parseCalendarDate(date);
  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return formatCalendarDate(parsed);
}

export function calculateCurrentStreak(completions: string[], today?: string): number {
  const currentDate = today ?? formatCalendarDate(new Date());
  const uniqueCompletions = [...new Set(completions)].sort();
  const completedDates = new Set(uniqueCompletions);

  if (!completedDates.has(currentDate)) {
    return 0;
  }

  let streak = 0;
  let cursor = currentDate;

  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = previousCalendarDate(cursor);
  }

  return streak;
}
