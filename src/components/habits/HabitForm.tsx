'use client';

import { FormEvent, useEffect, useState } from 'react';
import { validateHabitName } from '@/lib/validators';
import type { Habit } from '@/types/habit';

type HabitFormProps = {
  habit?: Habit | null;
  onSave: (values: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel?: () => void;
};

export default function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(habit?.name ?? '');
    setDescription(habit?.description ?? '');
    setError(null);
  }, [habit]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateHabitName(name);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    onSave({
      name: validation.value,
      description: description.trim(),
      frequency: 'daily',
    });

    if (!habit) {
      setName('');
      setDescription('');
    }
  }

  return (
    <form data-testid="habit-form" onSubmit={handleSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-slate-800">
          Habit name
        </label>
        <input
          id="habit-name"
          data-testid="habit-name-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
        />
      </div>
      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-slate-800">
          Description
        </label>
        <textarea
          id="habit-description"
          data-testid="habit-description-input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
        />
      </div>
      <div>
        <label htmlFor="habit-frequency" className="block text-sm font-medium text-slate-800">
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          value="daily"
          onChange={() => undefined}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3"
        >
          <option value="daily">Daily</option>
        </select>
      </div>
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="flex gap-3">
        <button
          data-testid="habit-save-button"
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Save habit
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
