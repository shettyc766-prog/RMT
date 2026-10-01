import React, { useState, useRef, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { UserRole } from '../../types';
import {
  Bell,
  Moon,
  Sun,
  Search,
  ChevronDown,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  X,
  LogOut,
  User,
  Settings,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const {
    currentUser,
    logout,
    switchAccount,
    currentRole,
    setCurrentRole,
    darkMode,
    setDarkMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentTab,
    setIsGlobalSearchOpen,
    searchQuery,
    setSearchQuery,
    setIsSettingsOpen,
    users,
    canManageUsers,
    canApproveRequests,
  } = useRMT();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; desc: string; icon: string; badgeColor: string }[] = [
    {
      role: 'Super Admin',
      desc: 'Full system access, user provisioning, security policies & audit export',
      icon: 'security',
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      role: 'Admin',
      desc: 'User management, resource directory, project management & system audits',
      icon: 'admin_panel_settings',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      role: 'Project Manager',
      desc: 'Create & manage projects, assign resources, review & approve access requests',
      icon: 'manage_accounts',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      role: 'Team Lead',
      desc: 'Manage squad tasks, workload distribution, and deliverable execution',
      icon: 'groups',
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      role: 'Resource',
      desc: 'Individual contributor: view assigned projects and deliverables (read-only)',
      icon: 'person',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      role: 'Viewer',
      desc: 'Read-only access across all repositories for compliance and executive review',
      icon: 'visibility',
      badgeColor: 'bg-slate-600 text-white',
    },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs h-16 flex justify-between items-center w-full px-4 sm:px-6 sticky top-0 z-40">
      {/* Brand & Global Search */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-2xl">
        <div
          onClick={() => setCurrentTab('Dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Resource Management Tool
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              v2.4 Enterprise Suite
            </span>
          </div>
        </div>

        {/* Global Search Input with ⌘K */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setIsGlobalSearchOpen(true)}
            placeholder="Global search (assets, plans, personnel)..."
            className="w-full h-9 pl-9 pr-14 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
          <kbd
            onClick={() => setIsGlobalSearchOpen(true)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-700 cursor-pointer shadow-2xs"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Trailing Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Security Session Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>TLS 1.3 · 30m Session Timeout</span>
        </div>

        {/* Role Switcher */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-blue-900 dark:text-blue-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Role: {currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select RBAC Role
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                  Strict Access Mode
                </span>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-start gap-2.5 transition-colors cursor-pointer ${
                      currentRole === r.role ? 'bg-blue-50/70 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-white ${
                        r.role === 'Super Admin'
                          ? 'bg-purple-600'
                          : r.role === 'Admin'
                          ? 'bg-indigo-600'
                          : r.role === 'Project Manager'
                          ? 'bg-blue-600'
                          : r.role === 'Team Lead'
                          ? 'bg-teal-600'
                          : r.role === 'Viewer'
                          ? 'bg-slate-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{r.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {r.role}
                        </span>
                        {currentRole === r.role && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            aria-label="Notifications"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.linkToTab) {
                        setCurrentTab(notif.linkToTab as any);
                        setIsNotifDropdownOpen(false);
                      }
                    }}
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-start gap-3 ${
                      !notif.read ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'overallocation'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/40'
                          : notif.type === 'deadline'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40'
                          : notif.type === 'capacity'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40'
                      }`}
                    >
                      {notif.type === 'overallocation' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : notif.type === 'deadline' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        {/* User Profile & Account Menu */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 pl-1 cursor-pointer group text-left focus:outline-none"
            aria-label="User account menu"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-600 group-hover:border-blue-600 transition-colors"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-slate-300 dark:border-slate-600">
                {currentUser?.initials || 'C'}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-tight truncate max-w-[130px]">
                {currentUser?.name || 'Chethan'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                {currentUser?.title || currentRole}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors hidden sm:block" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Account Overview Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Active User"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {currentUser?.initials || 'C'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser?.name || 'Chethan'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      @{currentUser?.username || 'superadmin'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {currentUser?.email || 'chethan.shetty@aumovio.com'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
                        {currentRole}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Persona Switching */}
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1.5 flex items-center justify-between">
                  <span>Switch Verified Account</span>
                  <Sparkles className="w-3 h-3 text-blue-500" />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {users
                    .filter((u) => u.status === 'Active')
                    .slice(0, 5)
                    .map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchAccount(u);
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{u.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Action Links */}
              <div className="p-1 space-y-0.5">
                {(canManageUsers || canApproveRequests) && (
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setCurrentTab('Administration');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-500" />
                    <span>Administration &amp; Access Requests</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
