'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitCard from '@/components/habits/HabitCard';
import HabitForm from '@/components/habits/HabitForm';
import { HABITS_STORAGE_KEY } from '@/lib/constants';
import { getSession, logout } from '@/lib/auth';
import { readJson, writeJson } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';
import type { Session } from '@/types/auth';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `habit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitList() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = todayIsoDate();

  useEffect(() => {
    setSession(getSession());
    setHabits(readJson<Habit[]>(HABITS_STORAGE_KEY, []));
  }, []);

  const userHabits = useMemo(
    () => habits.filter((habit) => habit.userId === session?.userId),
    [habits, session],
  );

  function persistHabits(nextHabits: Habit[]): void {
    setHabits(nextHabits);
    writeJson(HABITS_STORAGE_KEY, nextHabits);
  }

  function handleCreate(values: { name: string; description: string; frequency: 'daily' }): void {
    if (!session) {
      return;
    }

    const habit: Habit = {
      id: createId(),
      userId: session.userId,
      name: values.name,
      description: values.description,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      completions: [],
    };

    persistHabits([...habits, habit]);
    setIsFormOpen(false);
  }

  function handleEdit(values: { name: string; description: string; frequency: 'daily' }): void {
    if (!editingHabit) {
      return;
    }

    persistHabits(
      habits.map((habit) =>
        habit.id === editingHabit.id
          ? {
              ...habit,
              name: values.name,
              description: values.description,
              frequency: 'daily',
            }
          : habit,
      ),
    );
    setEditingHabit(null);
  }

  function handleToggle(habitToToggle: Habit): void {
    persistHabits(
      habits.map((habit) => (habit.id === habitToToggle.id ? toggleHabitCompletion(habit, today) : habit)),
    );
  }

  function handleDelete(habitToDelete: Habit): void {
    persistHabits(habits.filter((habit) => habit.id !== habitToDelete.id));
  }

  function handleLogout(): void {
    logout();
    router.push('/login');
  }

  return (
    <main data-testid="dashboard-page" className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Habit Tracker</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
          {session ? <p className="mt-1 text-sm text-slate-600">{session.email}</p> : null}
        </div>
        <button
          data-testid="auth-logout-button"
          type="button"
          onClick={handleLogout}
          className="w-fit rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
        >
          Log out
        </button>
      </header>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">Your habits</h2>
          <button
            data-testid="create-habit-button"
            type="button"
            onClick={() => {
              setEditingHabit(null);
              setIsFormOpen(true);
            }}
            className="rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            New habit
          </button>
        </div>

        {isFormOpen ? <div className="mt-4"><HabitForm onSave={handleCreate} onCancel={() => setIsFormOpen(false)} /></div> : null}
        {editingHabit ? <div className="mt-4"><HabitForm habit={editingHabit} onSave={handleEdit} onCancel={() => setEditingHabit(null)} /></div> : null}

        {userHabits.length === 0 ? (
          <div data-testid="empty-state" className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-semibold text-slate-800">No habits yet</p>
            <p className="mt-1 text-sm text-slate-600">Create your first daily habit to begin.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {userHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={handleToggle}
                onEdit={setEditingHabit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
