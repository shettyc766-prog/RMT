import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignUp?: () => void;
  initialEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignUp,
  initialEmail = '',
}) => {
  const { login, users, showToast } = useRMT();

  // Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const resolvedInitialEmail = React.useMemo(() => {
    if (!usernameOrEmail) return '';
    if (usernameOrEmail.includes('@')) return usernameOrEmail.trim();
    const matchingUser = users.find(
      (u) => u.username.toLowerCase() === usernameOrEmail.trim().toLowerCase()
    );
    return matchingUser ? matchingUser.email : '';
  }, [usernameOrEmail, users]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = usernameOrEmail.trim();
    if (!cleanId || !password) {
      setErrorMessage('Invalid username or password.');
      return;
    }

    setErrorMessage(null);
    setResetSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await login({
        usernameOrEmail: cleanId,
        password,
        rememberMe: true,
      });

      if (!res.success) {
        // Displays exact message from backend:
        // - "Your account is pending approval. Please contact the administrator."
        // - "Your account request has been rejected. Please contact the administrator."
        // - "Invalid username or password."
        setErrorMessage(res.error || 'Invalid username or password.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('Invalid username or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 selection:bg-blue-600/20 selection:text-blue-700">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sm:p-10 transition-all">
        {/* Company Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 mx-auto mb-3.5">
            <span className="material-symbols-outlined text-[26px]">hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            RMT Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resource Management Tool
          </p>
        </div>

        {/* Feedback Messages */}
        {resetSuccessMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="leading-snug">{resetSuccessMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          {/* Username or Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              required
              autoFocus
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Enter your username or email"
              autoComplete="username"
              className="w-full h-10.5 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-sans"
            />
          </div>

          {/* Password field with Show/Hide toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-10.5 pl-3 pr-10 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Forgot Password link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-blue-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Don't have an account? Sign Up Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Don't have an account?
          </p>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="w-full h-10.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={resolvedInitialEmail}
        onSuccess={(userEmail) => {
          setUsernameOrEmail(userEmail);
          setPassword('');
          setResetSuccessMessage(
            'Your password has been successfully reset. Please sign in with your new password.'
          );
          setErrorMessage(null);
          showToast('Password reset successfully. You can now sign in.');
        }}
      />
    </div>
  );
};
