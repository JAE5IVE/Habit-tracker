import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { SESSION_STORAGE_KEY, USERS_STORAGE_KEY } from '@/lib/constants';

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    router.push.mockClear();
    router.replace.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'new@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'secret');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? '[]')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')).toMatchObject({
      email: 'new@example.com',
    });
    expect(router.push).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([{ id: 'user-1', email: 'new@example.com', password: 'secret', createdAt: 'now' }]),
    );
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'new@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'secret');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(screen.getByText('User already exists')).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify([{ id: 'user-1', email: 'login@example.com', password: 'secret', createdAt: 'now' }]),
    );
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'login@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'secret');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null')).toEqual({
      userId: 'user-1',
      email: 'login@example.com',
    });
    expect(router.push).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'missing@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'bad');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});
