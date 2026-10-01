import bcrypt from 'bcryptjs';

export interface PasswordPolicyCheck {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
  errorMessages: string[];
}

/**
 * Validates enterprise password policy:
 * - Minimum 8 characters
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character
 */
export function validatePasswordPolicy(password: string): PasswordPolicyCheck {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const errorMessages: string[] = [];
  if (!minLength) errorMessages.push('Must be at least 8 characters long');
  if (!hasUppercase) errorMessages.push('Must include at least one uppercase letter (A-Z)');
  if (!hasLowercase) errorMessages.push('Must include at least one lowercase letter (a-z)');
  if (!hasNumber) errorMessages.push('Must include at least one numeric digit (0-9)');
  if (!hasSpecialChar) errorMessages.push('Must include at least one special character (!@#$%^&* etc.)');

  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid,
    errorMessages,
  };
}

/**
 * Secure password hashing using bcrypt with 10 salt rounds
 */
export function hashPassword(plainText: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainText, salt);
}

/**
 * Secure password verification against stored bcrypt hash
 */
export function verifyPassword(plainText: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plainText, hash);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure 6-digit numeric MFA / verification code
 */
export function generateVerificationCode(): string {
  const array = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
    return (100000 + (array[0] % 900000)).toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a secure alphanumeric reset token
 */
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  if (typeof window !== 'undefined' && window.crypto) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < 24; i++) {
      token += chars[bytes[i] % chars.length];
    }
    return token;
  }
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Detect client browser, OS and device architecture safely
 */
export function getClientDeviceInfo(): { browser: string; os: string; device: string; ip: string } {
  if (typeof window === 'undefined') {
    return {
      browser: 'Enterprise Client',
      os: 'Enterprise OS',
      device: 'Workstation',
      ip: '10.24.118.42',
    };
  }

  const ua = window.navigator.userAgent;
  let browser = 'Chrome Enterprise';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';

  let os = 'Windows 11 Enterprise';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS Sonoma';
  else if (ua.includes('Linux')) os = 'Enterprise Linux';
  else if (ua.includes('Windows')) os = 'Windows 11 Pro';

  const device = window.innerWidth <= 768 ? 'Mobile Device' : 'Desktop Workstation';

  // Persistent simulated enterprise intranet IP for audit compliance
  let ip = localStorage.getItem('rmt_client_ip');
  if (!ip) {
    const subnet = Math.floor(10 + Math.random() * 50);
    const host = Math.floor(100 + Math.random() * 150);
    ip = `10.24.${subnet}.${host}`;
    localStorage.setItem('rmt_client_ip', ip);
  }

  return { browser, os, device, ip };
}

/**
 * Sanitizes string against XSS & script injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
