import { beforeEach, describe, expect, it } from 'vitest';
import { HABITS_STORAGE_KEY, SESSION_STORAGE_KEY, USERS_STORAGE_KEY } from '@/lib/constants';
import { getSession, getUsers, login, logout, signup } from '@/lib/auth';
import { readJson, writeJson } from '@/lib/storage';

describe('local auth and storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates users and sessions using the required storage keys', () => {
    const result = signup(' Test@Example.com ', 'secret');

    expect(result.error).toBeNull();
    expect(getUsers()).toHaveLength(1);
    expect(getUsers()[0].email).toBe('test@example.com');
    expect(getSession()).toEqual(result.session);
    expect(localStorage.getItem(USERS_STORAGE_KEY)).toContain('test@example.com');
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toContain('test@example.com');
  });

  it('rejects duplicate signup and invalid login while preserving deterministic storage', () => {
    signup('test@example.com', 'secret');

    expect(signup('test@example.com', 'secret').error).toBe('User already exists');
    expect(login('test@example.com', 'wrong').error).toBe('Invalid email or password');
    expect(login('test@example.com', 'secret').session?.email).toBe('test@example.com');
  });

  it('clears the active session on logout', () => {
    signup('test@example.com', 'secret');
    logout();

    expect(getSession()).toBeNull();
  });

  it('falls back when stored json is missing or invalid', () => {
    expect(readJson(HABITS_STORAGE_KEY, [])).toEqual([]);
    localStorage.setItem(HABITS_STORAGE_KEY, 'not-json');

    expect(readJson(HABITS_STORAGE_KEY, [])).toEqual([]);
    writeJson(HABITS_STORAGE_KEY, [{ id: 'habit-1' }]);
    expect(readJson(HABITS_STORAGE_KEY, [])).toEqual([{ id: 'habit-1' }]);
  });
});
