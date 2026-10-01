import React, { useState, useMemo } from 'react';
import { useRMT } from '../../context/RMTContext';
import { UserRole, UserAccountStatus, EnterpriseUser } from '../../types';
import {
  Users,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  HelpCircle,
  KeyRound,
  Shield,
  Smartphone,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Clock,
  MoreVertical,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    users,
    accessRequests,
    loginAttempts,
    auditLogs,
    currentRole,
    currentUser,
    canManageUsers,
    canApproveRequests,
    canCreateUsers,
    setIsCreateUserOpen,
    setIsSecurityDispatchesOpen,
    approveUser,
    rejectUser,
    toggleUserLock,
    toggleUserStatus,
    changeUserRole,
    setUserMFA,
    resetUserPassword,
    reviewAccessRequest,
    exportSecurityLogs,
    showToast,
  } = useRMT();

  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'logins' | 'audit'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal / Prompt State for Reviewing Request
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject' | 'More Info Requested' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('Resource');

  // Password reset result popup
  const [passwordResetResult, setPasswordResetResult] = useState<{ user: string; pass: string } | null>(null);

  // Metrics computation per Requirement 7:
  // - Total Users
  // - Active Users
  // - Pending Approval Users
  // - Locked Accounts
  // - Recent Login Activity
  // - Failed Login Attempts
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const pendingUsers = users.filter((u) => u.status === 'Pending Approval').length;
  const lockedAccounts = users.filter((u) => u.status === 'Locked').length;
  const recentLoginsCount = loginAttempts.length;
  const failedLoginsCount = loginAttempts.filter(
    (l) => l.status === 'FAILED' || l.status === 'BLOCKED_LOCKED'
  ).length;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.department.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, roleFilter, statusFilter]);

  const handleOpenReviewModal = (req: any, action: 'Approve' | 'Reject' | 'More Info Requested') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setAssignedRole(req.requestedRole);
    setReviewNotes('');
  };

  const handleConfirmReview = () => {
    if (!selectedRequest || !reviewAction) return;
    reviewAccessRequest(selectedRequest.id, reviewAction, reviewNotes, assignedRole);
    setSelectedRequest(null);
    setReviewAction(null);
  };

  const handleResetPassword = (user: EnterpriseUser) => {
    const res = resetUserPassword(user.id);
    if (res.success && res.tempPassword) {
      setPasswordResetResult({ user: user.name, pass: res.tempPassword });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Administration &amp; Security
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase tracking-wider">
              RBAC Governance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            User provisioning, access approval workflows, MFA policies, account lockout controls, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSecurityDispatchesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            <span>Security Emails</span>
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => exportSecurityLogs('csv')}
              title="Download Compliance CSV"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportSecurityLogs('json')}
              title="Download Compliance JSON"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>
          </div>

          {canCreateUsers && (
            <button
              onClick={() => setIsCreateUserOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: Metrics Cards (Requirement 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalUsers}
          </div>
          <span className="text-[11px] text-slate-400">Stored in database</span>
        </div>

        {/* Active Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Users</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {activeUsers}
          </div>
          <span className="text-[11px] text-slate-400">Validated access</span>
        </div>

        {/* Pending Approval */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingUsers}
          </div>
          <span className="text-[11px] text-slate-400">Requires activation</span>
        </div>

        {/* Locked Accounts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Locked Accounts</span>
            <Lock className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-red-600 dark:text-red-400">
            {lockedAccounts}
          </div>
          <span className="text-[11px] text-slate-400">5+ failed attempts</span>
        </div>

        {/* Recent Login Activity */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Recent Activity</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {recentLoginsCount}
          </div>
          <span className="text-[11px] text-slate-400">Audit transactions</span>
        </div>

        {/* Failed Login Attempts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Failed Logins</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {failedLoginsCount}
          </div>
          <span className="text-[11px] text-slate-400">Monitored attempts</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory &amp; RBAC</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Employee Access Requests</span>
          {accessRequests.filter((r) => r.status === 'Pending Review').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
              {accessRequests.filter((r) => r.status === 'Pending Review').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'logins'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Login Activity &amp; Telemetry</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {loginAttempts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2.5 px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance Audit Trail</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, username, email, department..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Role:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Resource">Resource</option>
                <option value="Viewer">Viewer</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Locked">Locked</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User &amp; Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">MFA</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No registered users match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {user.initials}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider ${
                              user.role === 'Super Admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : user.role === 'Admin'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : user.role === 'Project Manager'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : user.role === 'Team Lead'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : user.role === 'Viewer'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                          {user.department}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              user.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : user.status === 'Pending Approval'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : user.status === 'Locked'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Active'
                                  ? 'bg-emerald-500'
                                  : user.status === 'Pending Approval'
                                  ? 'bg-amber-500 animate-pulse'
                                  : user.status === 'Locked'
                                  ? 'bg-red-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {user.status}
                          </span>
                        </td>

                        {/* MFA */}
                        <td className="py-3 px-4">
                          <button
                            disabled={!canManageUsers}
                            onClick={() => setUserMFA(user.id, !user.mfaEnabled)}
                            title={user.mfaEnabled ? 'Click to disable MFA' : 'Click to enable MFA'}
                            className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                              user.mfaEnabled
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {user.lastLogin || 'Never'}
                          {user.lastLoginIp && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {user.lastLoginIp}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {/* If Pending Approval: Approve or Reject Action */}
                            {user.status === 'Pending Approval' && canApproveRequests && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => approveUser(user.id)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Approve User"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => rejectUser(user.id, 'Administrative review rejection')}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Reject User"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}

                            {/* Lock / Unlock */}
                            {canManageUsers && (
                              <button
                                onClick={() => toggleUserLock(user.id)}
                                title={user.status === 'Locked' ? 'Unlock Account' : 'Lock Account'}
                                className={`p-1.5 rounded transition-colors ${
                                  user.status === 'Locked'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {user.status === 'Locked' ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Reset Password */}
                            {canManageUsers && (
                              <button
                                onClick={() => handleResetPassword(user)}
                                title="Reset Temporary Password"
                                className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Role select quick changer */}
                            {canManageUsers && (
                              <select
                                value={user.role}
                                onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                                className="h-7 text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 text-slate-700 dark:text-slate-300"
                              >
                                <option value="Resource">Resource</option>
                                <option value="Team Lead">Team Lead</option>
                                <option value="Project Manager">Project Manager</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCESS REQUEST MANAGEMENT (Requirement 5) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Access Request Governance:</strong> Prospective team members and contractors submit access requests with Employee ID and Manager endorsement. Administrators and Project Managers can Approve, Reject, or Request More Information.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Manager</th>
                    <th className="py-3 px-4">Requested Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accessRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No access requests pending.
                      </td>
                    </tr>
                  ) : (
                    accessRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {req.id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {req.employeeName}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {req.employeeId}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {req.email}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {req.department}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {req.managerName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          {req.requestedRole}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              req.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'Pending Review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                                : req.status === 'More Info Requested'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'Pending Review' || req.status === 'More Info Requested' ? (
                            <div className="inline-flex items-center gap-1.5">
                              {canApproveRequests && (
                                <>
                                  <button
                                    onClick={() => handleOpenReviewModal(req, 'Approve')}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenReviewModal(req, 'More Info Requested')}
                                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-[11px] transition-colors"
                                  >
                                    Info Req.
                                  </button>
                                  <button
                                    onClick={() => handleOpenReviewModal(req, 'Reject')}
                                    className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 text-[11px] transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Reviewed by {req.reviewedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGIN ACTIVITY & TELEMETRY (Requirement 6, 7 & 9) */}
      {activeTab === 'logins' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Capturing full forensic audit headers: IP Address, Browser User-Agent, Device OS, and Authentication Gate.
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Security Telemetry Stream
            </span>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User / Identifier</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Browser &amp; Device</th>
                    <th className="py-3 px-4">Details / Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loginAttempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white font-mono">
                        {attempt.usernameOrEmail}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {attempt.userRole || 'Unauthenticated'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            attempt.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : attempt.status === 'BLOCKED_LOCKED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : attempt.status === 'BLOCKED_PENDING'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                        {attempt.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {attempt.browser} ({attempt.device})
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                        {attempt.reason || 'Authenticated session started'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE AUDIT TRAIL (Requirement 6 & 9) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Audit trail maintaining immutable timestamps for login attempts, user creation, role changes, project assignments, and user deactivation.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportSecurityLogs('csv')}
                className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export for Compliance (CSV)</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">IP / Workstation</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp.includes('T') ? new Date(log.timestamp).toLocaleString() : log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {log.user}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
                        {log.target}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {log.ipAddress || '10.24.118.xx'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Access Request Modal */}
      {selectedRequest && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {reviewAction === 'Approve'
                ? `Approve Access Request (${selectedRequest.id})`
                : reviewAction === 'Reject'
                ? `Reject Access Request (${selectedRequest.id})`
                : `Request More Information (${selectedRequest.id})`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Applicant: <strong>{selectedRequest.employeeName}</strong> ({selectedRequest.email}) · Department: <strong>{selectedRequest.department}</strong>
            </p>

            {reviewAction === 'Approve' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign RBAC Role:
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Resource">Resource (Individual Contributor)</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {reviewAction === 'Approve'
                  ? 'Welcome Notes (Optional):'
                  : 'Message / Reason to Applicant:'}
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'Approve'
                    ? 'Account has been activated with enterprise credentials.'
                    : 'Specify reason or required documents...'
                }
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewAction(null);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  reviewAction === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : reviewAction === 'Reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm {reviewAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Result Popup */}
      {passwordResetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Password Reset Dispatched
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Temporary password generated for <strong>{passwordResetResult.user}</strong> complying with password policy:
            </p>
            <div className="my-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-sm font-bold text-blue-600 dark:text-blue-400 select-all border border-slate-200 dark:border-slate-700">
              {passwordResetResult.pass}
            </div>
            <p className="text-[11px] text-slate-400">
              A secure email notification has been dispatched to the user's corporate address.
            </p>
            <button
              onClick={() => setPasswordResetResult(null)}
              className="mt-4 w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
