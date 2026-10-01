import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { UserRole } from '../../types';
import { validatePasswordPolicy } from '../../utils/security';
import {
  UserPlus,
  X,
  Mail,
  User,
  Shield,
  Building,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CreateUserModal: React.FC = () => {
  const { isCreateUserOpen, setIsCreateUserOpen, createUser } = useRMT();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Resource');
  const [department, setDepartment] = useState('Embedded Systems');
  const [managerName, setManagerName] = useState('');
  const [password, setPassword] = useState('WorkspaceSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreateUserOpen) return null;

  const passwordCheck = validatePasswordPolicy(password);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnpqrstuvwxyz';
    const nums = '23456789';
    const specs = '!@#$%^&*';
    let pass = '';
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += lower.charAt(Math.floor(Math.random() * lower.length));
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += specs.charAt(Math.floor(Math.random() * specs.length));
    pass += 'Secure2026!';
    setPassword(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !name.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!passwordCheck.isValid) {
      setError('Password does not satisfy enterprise complexity requirements.');
      return;
    }

    const res = createUser({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      managerName: managerName.trim() || undefined,
      password,
    });

    if (res.success) {
      setIsCreateUserOpen(false);
      setUsername('');
      setName('');
      setEmail('');
      setPassword('WorkspaceSecure2026!');
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create User Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Account will default to <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Approval</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateUserOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!username) {
                      setUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                    }
                  }}
                  placeholder="e.g. Rachel Adams"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unique Username *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rachel.adams"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.adams@company.com"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RBAC Workspace Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Resource">Resource (Individual Contributor)</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Embedded Systems">Embedded Systems (DTCO)</option>
                  <option value="Vehicle Electronics">Vehicle Electronics</option>
                  <option value="Connected Mobility">Connected Mobility</option>
                  <option value="Program Management">Program Management</option>
                  <option value="Quality & Verification">Quality & Verification</option>
                  <option value="Global Security & Operations">Global Security & Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manager / Approver
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Password with Policy Checker */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Initial Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Generate Strong
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Strong enterprise password"
                className="w-full h-9 pl-9 pr-10 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time policy requirements list */}
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-1 text-[11px]">
              <span className={`flex items-center gap-1.5 ${passwordCheck.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" /> Min 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCheck.hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" /> Uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCheck.hasLowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" /> Lowercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${passwordCheck.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" /> Numeric digit
              </span>
              <span className={`flex items-center gap-1.5 col-span-2 ${passwordCheck.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3 h-3" /> Special character (!@#$%^&* etc.)
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Security Workflow:</strong> The account will be created in <strong>Pending Approval</strong> state. The user cannot log in until explicitly approved and activated. An automated "Account Created" notification will be dispatched.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!passwordCheck.isValid}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
