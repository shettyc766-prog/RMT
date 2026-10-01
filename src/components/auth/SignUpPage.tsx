import React, { useState, useMemo } from 'react';
import { useRMT } from '../../context/RMTContext';
import { validatePasswordPolicy } from '../../utils/security';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Briefcase,
  Phone,
  BadgeAlert,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

interface SignUpPageProps {
  onNavigateToLogin: (prefilledEmail?: string) => void;
}

const DEPARTMENTS = [
  'Embedded Systems',
  'Hardware Engineering',
  'Software Development',
  'Cloud Platforms & Infrastructure',
  'QA & Hardware Validation',
  'UX Design & Product Strategy',
  'IT Infrastructure & Security',
  'Governance, Risk & Compliance',
  'Project Management Office (PMO)',
];

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateToLogin }) => {
  const { registerUser, users } = useRMT();

  // Personal Information fields
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState('');

  // Account Information fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Password rules validation
  const passwordCheck = useMemo(() => validatePasswordPolicy(password), [password]);

  // Password Strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' };
    let metCount = 0;
    if (passwordCheck.minLength) metCount++;
    if (passwordCheck.hasUppercase) metCount++;
    if (passwordCheck.hasLowercase) metCount++;
    if (passwordCheck.hasNumber) metCount++;
    if (passwordCheck.hasSpecialChar) metCount++;

    if (metCount <= 2) {
      return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    }
    if (metCount <= 4) {
      return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [password, passwordCheck]);

  // Confirm password validation
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Real-time Email uniqueness validation
  const isEmailTaken = useMemo(() => {
    const clean = email.trim().toLowerCase();
    if (!clean) return false;
    return users.some((u) => u.email.toLowerCase() === clean);
  }, [email, users]);

  // Real-time Username uniqueness validation
  const isUsernameTaken = useMemo(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) return false;
    return users.some((u) => u.username.toLowerCase() === clean);
  }, [username, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic required check
    if (
      !fullName.trim() ||
      !employeeId.trim() ||
      !email.trim() ||
      !mobileNumber.trim() ||
      !department.trim() ||
      !designation.trim() ||
      !username.trim() ||
      !password
    ) {
      setErrorMessage('Please fill in all required fields marked with an asterisk (*).');
      return;
    }

    // Email format
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Email uniqueness
    if (isEmailTaken) {
      setErrorMessage('An account with this email address already exists. Please sign in or use another email.');
      return;
    }

    // Username uniqueness
    if (isUsernameTaken) {
      setErrorMessage('This username is already taken. Please choose another username.');
      return;
    }

    // Password rules validation
    if (!passwordCheck.isValid) {
      setErrorMessage(`Password does not meet enterprise security requirements: ${passwordCheck.errorMessages.join(', ')}.`);
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = registerUser({
        fullName,
        employeeId,
        email,
        mobileNumber,
        department,
        designation,
        username,
        password,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to submit registration request.');
        setIsSubmitting(false);
        return;
      }

      setRegisteredEmail(email.trim());
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch {
      setErrorMessage('An unexpected error occurred during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render Success Confirmation Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Account Status: Pending Approval
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
            Registration Submitted Successfully
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-md mx-auto">
            Your corporate registration has been recorded in the database. As per security policy, your account requires authorization from an <strong>Administrator</strong> or <strong>Project Manager</strong> before login access is activated.
          </p>

          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Employee Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Employee ID:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{employeeId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Username:</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">@{username}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Email:</span>
              <span className="font-medium text-slate-900 dark:text-white">{email}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Initial Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Approval
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigateToLogin(registeredEmail)}
              className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 selection:bg-blue-600/20 selection:text-blue-700">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-10 transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Enterprise Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                RMT Workforce Management &bull; New User Sign Up
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToLogin()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Personal Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-2045"
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {email && isEmailTaken && (
                    <span className="text-[10px] text-rose-500 font-medium">Already registered</span>
                  )}
                  {email && !isEmailTaken && email.includes('@') && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Available
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="name@company.com"
                    className={`w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      isEmailTaken
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600/20'
                    }`}
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Firmware Engineer"
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Account Information */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Account Credentials
              </h2>
            </div>

            {/* Username */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Username <span className="text-rose-500">*</span>
                </label>
                {username && isUsernameTaken && (
                  <span className="text-[10px] text-rose-500 font-medium">Username already taken</span>
                )}
                {username && !isUsernameTaken && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Available
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. john.doe"
                  className={`w-full h-10 pl-8 pr-3 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    isUsernameTaken
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Lowercase letters, numbers, periods, and hyphens only.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Create enterprise password"
                    className="w-full h-10 pl-9 pr-10 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  {confirmPassword && passwordsMatch === true && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Passwords match
                    </span>
                  )}
                  {confirmPassword && passwordsMatch === false && (
                    <span className="text-[10px] text-rose-500 font-medium">Do not match</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Confirm your password"
                    className={`w-full h-10 pl-9 pr-10 text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      confirmPassword && passwordsMatch === false
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator & Rules Checklist */}
            {password && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                {/* Visual Strength Meter */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                      } ${passwordStrength.score === 1 ? 'w-1/3' : passwordStrength.score === 2 ? 'w-2/3' : 'w-full'}`}
                    />
                  </div>
                </div>

                {/* Password Rules Checklist */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Password Security Policy:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCheck.minLength
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {passwordCheck.minLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>Minimum 8 characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCheck.hasUppercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {passwordCheck.hasUppercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>At least 1 uppercase letter</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCheck.hasLowercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {passwordCheck.hasLowercase ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>At least 1 lowercase letter</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCheck.hasNumber
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {passwordCheck.hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>At least 1 numeric digit (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 sm:col-span-2 ${
                        passwordCheck.hasSpecialChar
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {passwordCheck.hasSpecialChar ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                      <span>At least 1 special character (!@#$%^&* etc.)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Governance Notice */}
          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Access Governance:</strong> Registration creates an account with status <strong>Pending Approval</strong>. Your profile will be reviewed by an Administrator or Project Manager before sign-in is granted.
            </span>
          </div>

          {/* Action Buttons: [ Register ] & [ Back to Login ] */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="h-11 px-6 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
