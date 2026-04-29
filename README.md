# Habit Tracker PWA

A mobile-first Habit Tracker Progressive Web App built from the Stage 3 technical requirements document. The app uses Next.js App Router, React, TypeScript, Tailwind CSS, localStorage persistence, Vitest, React Testing Library, and Playwright.

## Live Demo

Netlify: https://habittttrackerr.netlify.app/

GitHub: https://github.com/JAE5IVE/Habit-tracker

## Setup

```bash
npm install
```

If Playwright browsers are not installed locally:

```bash
npx playwright install chromium
```

On this Windows machine, the E2E suite was verified with installed Chrome by setting `PLAYWRIGHT_CHANNEL=chrome`.

## Run The App

```bash
npm run dev
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
npm run start
```

## Run Tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm test
```

`npm run test:unit` generates the coverage report. The required `src/lib` line coverage threshold is 80%; the current verified result is 95.8%.

## Local Persistence

The app stores all state in `localStorage` using the required keys:

- `habit-tracker-users`: JSON array of users with `id`, `email`, `password`, and `createdAt`.
- `habit-tracker-session`: `null` or a session object with `userId` and `email`.
- `habit-tracker-habits`: JSON array of habits with `id`, `userId`, `name`, `description`, `frequency: 'daily'`, `createdAt`, and unique `YYYY-MM-DD` completion dates.

Authentication is local and deterministic. Habits are filtered by the active session user, so users only see their own habits.

## PWA Support

PWA support is implemented with:

- `public/manifest.json`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `src/components/shared/ServiceWorkerRegister.tsx`

The service worker caches the app shell and navigation responses so the loaded app shell can render offline after the app has been opened once.

## Requirements Mapping

- Routes: `/`, `/login`, `/signup`, and `/dashboard` are implemented under `src/app`.
- Auth UI: `src/components/auth/LoginForm.tsx` and `src/components/auth/SignupForm.tsx`.
- Habit UI: `src/components/habits/HabitForm.tsx`, `HabitList.tsx`, and `HabitCard.tsx`.
- Shared UI: `src/components/shared/SplashScreen.tsx` and `ProtectedRoute.tsx`.
- Type contracts: `src/types/auth.ts` and `src/types/habit.ts`.
- Utility contracts: `src/lib/slug.ts`, `validators.ts`, `streaks.ts`, and `habits.ts`.

## Required Test Files

- `tests/unit/slug.test.ts`: verifies `getHabitSlug` lowercase, whitespace, hyphen, and character-removal behavior.
- `tests/unit/validators.test.ts`: verifies empty, too-long, and valid habit name validation.
- `tests/unit/streaks.test.ts`: verifies empty completions, missing today, consecutive days, duplicates, and broken streaks.
- `tests/unit/habits.test.ts`: verifies immutable completion toggling, add/remove behavior, and duplicate prevention.
- `tests/integration/auth-flow.test.tsx`: verifies signup, duplicate signup errors, login, and invalid login errors.
- `tests/integration/habit-form.test.tsx`: verifies validation, create, edit with immutable fields preserved, delete confirmation, and streak update after completion.
- `tests/e2e/app.spec.ts`: verifies splash redirects, protected routes, signup, login with user-scoped habits, create, complete, reload persistence, logout, and offline cached-shell behavior.

## Trade-Offs And Limitations

- Passwords are stored in localStorage because the specification requires deterministic local authentication and no remote auth service.
- Only daily habits are supported because the technical requirements limit this stage to `frequency: 'daily'`.
- The service worker implements a basic app-shell cache rather than advanced background sync or conflict handling.
