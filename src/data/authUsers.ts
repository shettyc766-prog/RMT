import { AuthUser, UserRole } from '../types';
import { INITIAL_ENTERPRISE_USERS } from './initialUsers';

export const DEMO_USERS: AuthUser[] = INITIAL_ENTERPRISE_USERS.map((u) => ({
  ...u,
}));

export const DEFAULT_USER = DEMO_USERS[0];

export function findDemoUser(emailOrRole: string): AuthUser | undefined {
  const query = emailOrRole.trim().toLowerCase();
  return DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === query ||
      u.username.toLowerCase() === query ||
      u.role.toLowerCase() === query ||
      u.name.toLowerCase().includes(query)
  );
}
