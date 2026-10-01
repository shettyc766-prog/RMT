import React, { useState, useEffect, useRef } from 'react';
import { useRMT } from '../../context/RMTContext';
import { validatePasswordPolicy } from '../../utils/security';
import {
  Mail,
  CheckCircle2,
  X,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Timer,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (userEmailOrUsername: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const {
    users,
    sendPasswordResetVerificationCode,
    verifyPasswordResetCode,
    resetPasswordWithCode,
    showToast,
  } = useRMT();

  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string>('');
  const [targetUserName, setTargetUserName] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Countdown timer for 15-minute code expiration (900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(900);
  // Cooldown for resending code (30 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial email when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEmail) {
        setEmail(initialEmail);
      }
      setStep('email');
      setError(null);
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialEmail]);

  // Handle expiration countdown when in 'code' step
  useEffect(() => {
    if (step === 'code') {
      setSecondsRemaining(900);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  const passwordPolicy = validatePasswordPolicy(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Calculate password strength score (0-5)
  const getStrengthScore = () => {
    let score = 0;
    if (passwordPolicy.minLength) score += 1;
    if (passwordPolicy.hasUppercase) score += 1;
    if (passwordPolicy.hasLowercase) score += 1;
    if (passwordPolicy.hasNumber) score += 1;
    if (passwordPolicy.hasSpecialChar) score += 1;
    return score;
  };
  const strengthScore = getStrengthScore();

  // Step 1: Submit email to dispatch verification code
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const res = sendPasswordResetVerificationCode(cleanEmail);

      if (!res.success) {
        setError(res.error || 'Failed to dispatch verification code. Please check your email.');
        return;
      }

      setDispatchedCode(res.verificationCode || '');
      setTargetUserName(res.user?.name || res.user?.username || cleanEmail);
      setResendCooldown(30);
      setStep('code');
      showToast(`Verification code dispatched to ${cleanEmail}`);
    }, 500);
  };

  // Resend code handler
  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const res = sendPasswordResetVerificationCode(email);
      if (res.success && res.verificationCode) {
        setDispatchedCode(res.verificationCode);
        setSecondsRemaining(900);
        setResendCooldown(30);
        showToast(`A new 6-digit code was dispatched to ${email}`);
      } else {
        setError(res.error || 'Failed to resend verification code.');
      }
    }, 400);
  };

  // Step 2: Submit and verify 6-digit code
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = verificationCode.trim();
    if (!cleanCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (secondsRemaining === 0) {
      setError('Verification code has expired. Please click "Resend code" to generate a new token.');
      return;
    }

    const res = verifyPasswordResetCode(email, cleanCode);
    if (!res.success) {
      setError(res.error || 'Invalid verification code. Please try again.');
      return;
    }

    setStep('password');
  };

  // Step 3: Set and encrypt new password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordPolicy.isValid) {
      setError('Password does not satisfy the enterprise security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const res = resetPasswordWithCode(email, newPassword, verificationCode);
      if (!res.success) {
        setError(res.error || 'Failed to update password.');
        return;
      }

      setStep('success');
    }, 600);
  };

  // Copy code to clipboard helper
  const handleCopyCode = () => {
    if (!dispatchedCode) return;
    navigator.clipboard.writeText(dispatchedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Auto-fill code helper
  const handleAutoFillCode = () => {
    if (dispatchedCode) {
      setVerificationCode(dispatchedCode);
      setError(null);
    }
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    onClose();
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    onClose();
    if (onSuccess) {
      onSuccess(email);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden relative flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Self-Service Password Reset
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  MFA / Email Auth
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enterprise Zero-Trust Credential Recovery
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <div
              className={`flex items-center gap-1.5 ${
                step === 'email'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                1
              </span>
              <span>1. Verify Email</span>
            </div>

            <span className="h-px w-6 bg-slate-200 dark:bg-slate-800" />

            <div
              className={`flex items-center gap-1.5 ${
                step === 'code'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : step === 'password' || step === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 'code'
                    ? 'bg-blue-600 text-white'
                    : step === 'password' || step === 'success'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                2
              </span>
              <span>2. Security Code</span>
            </div>

            <span className="h-px w-6 bg-slate-200 dark:bg-slate-800" />

            <div
              className={`flex items-center gap-1.5 ${
                step === 'password'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : step === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 'password'
                    ? 'bg-blue-600 text-white'
                    : step === 'success'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                3
              </span>
              <span>3. New Password</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* STEP 1: Enter Registered Email */}
          {step === 'email' && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Enter your registered corporate email
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We will dispatch a secure 6-digit one-time verification code to verify your identity.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. alex.vance@company.com"
                      required
                      autoFocus
                      className="w-full h-10.5 pl-9 pr-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Must match an active or locked user account in the directory.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-700/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Enter & Verify 6-digit Code */}
          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter 6-digit verification code
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  A one-time verification token was dispatched to{' '}
                  <strong className="text-slate-900 dark:text-slate-200">{email}</strong>.
                </p>
              </div>

              {/* Simulated Email Notification / Inbox Preview */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                    <Inbox className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Incoming Security Email Notification</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Delivered
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40 font-mono">
                  <div className="truncate">
                    <span className="text-slate-400">From:</span> Security Operations &lt;security-no-reply@company.com&gt;
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400">Subject:</span> Enterprise Password Reset Verification Code - RMT Security
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 font-sans font-medium">Verification Code: </span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300 tracking-wider">
                        {dispatchedCode || '482910'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2 py-1 text-[10px] font-sans font-medium rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAutoFillCode}
                        className="px-2 py-1 text-[10px] font-sans font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-fill</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      6-Digit Security Token
                    </label>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Expires in {formatTimer(secondsRemaining)}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                      setError(null);
                    }}
                    placeholder="••••••"
                    className="w-full h-12 text-center tracking-[0.6em] text-xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
                    >
                      Change email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={verificationCode.length !== 6}
                    className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-700/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Set New Enterprise Password */}
          {step === 'password' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Set new enterprise password
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Enforce strict cryptographic complexity. Password will be salted and hashed with bcrypt.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                {/* New Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        strengthScore <= 2
                          ? 'text-red-500'
                          : strengthScore <= 4
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {newPassword.length === 0
                        ? ''
                        : strengthScore <= 2
                        ? 'Weak'
                        : strengthScore <= 4
                        ? 'Good'
                        : 'Enterprise Strong'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. EnterpriseSecure2026!"
                      className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Visual Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="mt-1.5 flex gap-1 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 2
                            ? 'bg-red-500 w-1/3'
                            : strengthScore <= 4
                            ? 'bg-amber-500 w-2/3'
                            : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    {confirmPassword.length > 0 && (
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                          passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {passwordsMatch ? (
                          <>
                            <Check className="w-3 h-3" /> Passwords match
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Passwords do not match
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                      }}
                      placeholder="Re-type new password"
                      className="w-full h-10 pl-3 pr-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mandatory Password Policy Checklist (Requirement 2) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enterprise Password Requirements:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                    <span
                      className={`flex items-center gap-1.5 transition-colors ${
                        passwordPolicy.minLength
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordPolicy.minLength ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span>Min 8 characters</span>
                    </span>

                    <span
                      className={`flex items-center gap-1.5 transition-colors ${
                        passwordPolicy.hasUppercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordPolicy.hasUppercase ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span>Uppercase letter (A-Z)</span>
                    </span>

                    <span
                      className={`flex items-center gap-1.5 transition-colors ${
                        passwordPolicy.hasLowercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordPolicy.hasLowercase ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span>Lowercase letter (a-z)</span>
                    </span>

                    <span
                      className={`flex items-center gap-1.5 transition-colors ${
                        passwordPolicy.hasNumber
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordPolicy.hasNumber ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span>Numeric digit (0-9)</span>
                    </span>

                    <span
                      className={`flex items-center gap-1.5 sm:col-span-2 transition-colors ${
                        passwordPolicy.hasSpecialChar
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          passwordPolicy.hasSpecialChar ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                      <span>Special character (!@#$%^&amp;* etc.)</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('code');
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:underline cursor-pointer"
                  >
                    Back to code
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !passwordPolicy.isValid || !passwordsMatch}
                    className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-700/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Encrypting &amp; Updating...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Save &amp; Encrypt Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Password Successfully Reset!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your new credentials have been salted and encrypted using <strong>bcrypt (10 rounds)</strong>. If your account was previously locked, it is now unlocked and active.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Target Identity:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{targetUserName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Registered Corporate Email:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{email}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Security Audit Trail:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Logged &amp; Verified
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Outgoing Security Email:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                    Confirmation Delivered
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Sign In with New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
