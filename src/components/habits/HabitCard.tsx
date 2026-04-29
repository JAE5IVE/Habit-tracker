'use client';

import { useState } from 'react';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import type { Habit } from '@/types/habit';

type HabitCardProps = {
  habit: Habit;
  today: string;
  onToggle: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
};

export default function HabitCard({ habit, today, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const isCompletedToday = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <article
      data-testid={`habit-card-${slug}`}
      className={`rounded-lg border p-4 shadow-sm transition sm:p-5 ${
        isCompletedToday
          ? 'border-emerald-300 bg-emerald-50 shadow-emerald-100'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-xl font-bold text-slate-950">{habit.name}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isCompletedToday ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isCompletedToday ? 'Done today' : 'Open'}
            </span>
          </div>
          {habit.description ? <p className="mt-1 text-sm text-slate-600">{habit.description}</p> : null}
          <p data-testid={`habit-streak-${slug}`} className="mt-4 inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
            Current streak: {streak}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            data-testid={`habit-complete-${slug}`}
            type="button"
            onClick={() => onToggle(habit)}
            className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition ${
              isCompletedToday
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            {isCompletedToday ? 'Completed' : 'Complete'}
          </button>
          <button
            data-testid={`habit-edit-${slug}`}
            type="button"
            onClick={() => onEdit(habit)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            data-testid={`habit-delete-${slug}`}
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {confirmingDelete ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">Delete this habit?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              data-testid="confirm-delete-button"
              type="button"
              onClick={() => onDelete(habit)}
              className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Keep habit
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
