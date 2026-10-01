import {
  EnterpriseUser,
  AccessRequest,
  LoginAttempt,
  SecurityEmailDispatch,
} from '../types';
import { hashPassword } from '../utils/security';

// Root Super Admin bootstrap user for platform administration
export const INITIAL_ENTERPRISE_USERS: EnterpriseUser[] = [
  {
    id: 'USR-SA-01',
    username: 'superadmin',
    name: 'Chethan',
    email: 'chethan.shetty@aumovio.com',
    role: 'Super Admin',
    title: 'Chief Information Security Officer (CISO)',
    department: 'Global Security & Operations',
    employeeId: 'EMP-0001',
    mobileNumber: '+1 555-0100',
    managerName: 'Board of Directors',
    avatar: '',
    initials: 'C',
    status: 'Active',
    passwordHash: hashPassword('EnterpriseRoot2026!'),
    failedLoginAttempts: 0,
    lockoutUntil: null,
    mfaEnabled: false,
    createdAt: '2024-01-10T08:00:00.000Z',
    approvedAt: '2024-01-10T08:30:00.000Z',
    approvedBy: 'System Bootstrap',
    lastLogin: 'Today, 09:12 AM',
    lastLoginIp: '10.24.118.15',
  },
];

export const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [];
export const INITIAL_LOGIN_ATTEMPTS: LoginAttempt[] = [];
export const INITIAL_SECURITY_DISPATCHES: SecurityEmailDispatch[] = [];
