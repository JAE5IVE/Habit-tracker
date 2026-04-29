import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitList from '@/components/habits/HabitList';
import { HABITS_STORAGE_KEY, SESSION_STORAGE_KEY } from '@/lib/constants';
import type { Habit } from '@/types/habit';

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

const session = { userId: 'user-1', email: 'user@example.com' };

function seedSession() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function seedHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
    router.push.mockClear();
    router.replace.mockClear();
    seedSession();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitList />);

    await user.click(screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('habit-save-button'));

    expect(screen.getByText('Habit name is required')).toBeInTheDocument();
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    render(<HabitList />);

    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Two bottles');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    expect(screen.getByText('Two bottles')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]')[0]).toMatchObject({
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Two bottles',
      frequency: 'daily',
      completions: [],
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    const original: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Two bottles',
      frequency: 'daily',
      createdAt: '2026-04-29T00:00:00.000Z',
      completions: ['2026-04-29'],
    };
    seedHabits([original]);
    render(<HabitList />);

    await user.click(await screen.findByTestId('habit-edit-drink-water'));
    const form = screen.getByTestId('habit-form');
    await user.clear(within(form).getByTestId('habit-name-input'));
    await user.type(within(form).getByTestId('habit-name-input'), 'Read Books');
    await user.clear(within(form).getByTestId('habit-description-input'));
    await user.type(within(form).getByTestId('habit-description-input'), '20 pages');
    await user.click(within(form).getByTestId('habit-save-button'));

    const updated = JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]')[0] as Habit;
    expect(updated).toMatchObject({
      id: original.id,
      userId: original.userId,
      createdAt: original.createdAt,
      completions: original.completions,
      name: 'Read Books',
      description: '20 pages',
      frequency: 'daily',
    });
    expect(screen.getByTestId('habit-card-read-books')).toBeInTheDocument();
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    seedHabits([
      {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: '2026-04-29T00:00:00.000Z',
        completions: [],
      },
    ]);
    render(<HabitList />);

    await user.click(await screen.findByTestId('habit-delete-drink-water'));
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const today = new Date().toISOString().slice(0, 10);
    seedHabits([
      {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: '2026-04-29T00:00:00.000Z',
        completions: [],
      },
    ]);
    render(<HabitList />);

    expect(await screen.findByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 0');
    await user.click(screen.getByTestId('habit-complete-drink-water'));

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 1');
    expect(JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) ?? '[]')[0].completions).toEqual([today]);
  });
});
