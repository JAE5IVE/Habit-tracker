import { describe, expect, it } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2026-04-29T00:00:00.000Z',
  completions: ['2026-04-28'],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2026-04-29');

    expect(result.completions).toEqual(['2026-04-28', '2026-04-29']);
  });

  it('removes a completion date when the date already exists', () => {
    const result = toggleHabitCompletion(baseHabit, '2026-04-28');

    expect(result.completions).toEqual([]);
  });

  it('does not mutate the original habit object', () => {
    const original = { ...baseHabit, completions: [...baseHabit.completions] };

    toggleHabitCompletion(baseHabit, '2026-04-29');

    expect(baseHabit).toEqual(original);
  });

  it('does not return duplicate completion dates', () => {
    const result = toggleHabitCompletion(
      { ...baseHabit, completions: ['2026-04-28', '2026-04-28'] },
      '2026-04-29',
    );

    expect(result.completions).toEqual(['2026-04-28', '2026-04-29']);
  });
});
