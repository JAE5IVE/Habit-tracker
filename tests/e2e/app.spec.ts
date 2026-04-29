import { expect, test } from '@playwright/test';

const USERS_KEY = 'habit-tracker-users';
const SESSION_KEY = 'habit-tracker-session';
const HABITS_KEY = 'habit-tracker-habits';

async function clearStorage(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
}

async function seedStorage(
  page: import('@playwright/test').Page,
  value: { users?: unknown[]; session?: unknown; habits?: unknown[] },
) {
  await page.goto('/login');
  await page.evaluate(
    ({ users = [], session = null, habits = [] }) => {
      localStorage.setItem('habit-tracker-users', JSON.stringify(users));
      localStorage.setItem('habit-tracker-session', JSON.stringify(session));
      localStorage.setItem('habit-tracker-habits', JSON.stringify(habits));
    },
    value,
  );
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await seedStorage(page, {
      users: [{ id: 'user-1', email: 'user@example.com', password: 'secret', createdAt: 'now' }],
      session: { userId: 'user-1', email: 'user@example.com' },
    });

    await page.goto('/');

    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill(`new-${Date.now()}@example.com`);
    await page.getByTestId('auth-signup-password').fill('secret');
    await page.getByTestId('auth-signup-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await seedStorage(page, {
      users: [
        { id: 'user-1', email: 'one@example.com', password: 'secret', createdAt: 'now' },
        { id: 'user-2', email: 'two@example.com', password: 'secret', createdAt: 'now' },
      ],
      habits: [
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: '',
          frequency: 'daily',
          createdAt: 'now',
          completions: [],
        },
        {
          id: 'habit-2',
          userId: 'user-2',
          name: 'Read Books',
          description: '',
          frequency: 'daily',
          createdAt: 'now',
          completions: [],
        },
      ],
    });

    await page.goto('/login');
    await page.getByTestId('auth-login-email').fill('one@example.com');
    await page.getByTestId('auth-login-password').fill('secret');
    await page.getByTestId('auth-login-submit').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toHaveCount(0);
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await seedStorage(page, {
      users: [{ id: 'user-1', email: 'user@example.com', password: 'secret', createdAt: 'now' }],
      session: { userId: 'user-1', email: 'user@example.com' },
    });

    await page.goto('/dashboard');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('Two bottles');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.getByText('Two bottles')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await seedStorage(page, {
      users: [{ id: 'user-1', email: 'user@example.com', password: 'secret', createdAt: 'now' }],
      session: { userId: 'user-1', email: 'user@example.com' },
      habits: [
        {
          id: 'habit-1',
          userId: 'user-1',
          name: 'Drink Water',
          description: '',
          frequency: 'daily',
          createdAt: 'now',
          completions: [],
        },
      ],
    });

    await page.goto('/dashboard');
    await page.getByTestId('habit-complete-drink-water').click();

    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('Current streak: 1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await seedStorage(page, {
      users: [{ id: 'user-1', email: 'user@example.com', password: 'secret', createdAt: 'now' }],
      session: { userId: 'user-1', email: 'user@example.com' },
    });

    await page.goto('/dashboard');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Read Books');
    await page.getByTestId('habit-save-button').click();
    await page.reload();

    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await seedStorage(page, {
      users: [{ id: 'user-1', email: 'user@example.com', password: 'secret', createdAt: 'now' }],
      session: { userId: 'user-1', email: 'user@example.com' },
    });

    await page.goto('/dashboard');
    await page.getByTestId('auth-logout-button').click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.evaluate(() => localStorage.getItem('habit-tracker-session'))).resolves.toBe('null');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await page.goto('/login');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();

    await context.setOffline(true);
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();
    await context.setOffline(false);
  });
});
