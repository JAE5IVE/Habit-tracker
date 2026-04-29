import { SESSION_STORAGE_KEY, USERS_STORAGE_KEY } from '@/lib/constants';
import { readJson, writeJson } from '@/lib/storage';
import type { Session, User } from '@/types/auth';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getUsers(): User[] {
  return readJson<User[]>(USERS_STORAGE_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeJson(USERS_STORAGE_KEY, users);
}

export function getSession(): Session | null {
  return readJson<Session | null>(SESSION_STORAGE_KEY, null);
}

export function saveSession(session: Session | null): void {
  writeJson(SESSION_STORAGE_KEY, session);
}

export function signup(email: string, password: string): { session: Session | null; error: string | null } {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { session: null, error: 'Email and password are required' };
  }

  const users = getUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    return { session: null, error: 'User already exists' };
  }

  const user: User = {
    id: createId(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };
  const session = { userId: user.id, email: user.email };

  saveUsers([...users, user]);
  saveSession(session);

  return { session, error: null };
}

export function login(email: string, password: string): { session: Session | null; error: string | null } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find(
    (candidate) => candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!user) {
    return { session: null, error: 'Invalid email or password' };
  }

  const session = { userId: user.id, email: user.email };
  saveSession(session);

  return { session, error: null };
}

export function logout(): void {
  saveSession(null);
}
