import React from 'react';
import { useRMT, ActiveTab } from '../../context/RMTContext';
import {
  LayoutDashboard,
  Users,
  Contact,
  FolderGit2,
  CheckSquare,
  Sliders,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  UserPlus,
  History,
  LogOut,
  ShieldAlert,
  CalendarCheck2,
} from 'lucide-react';

export const SideNavBar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    resources,
    teams,
    projects,
    tasks,
    users,
    accessRequests,
    leaveRequests,
    setIsAddResourceOpen,
    setIsSettingsOpen,
    setIsHelpOpen,
    setIsAuditLogOpen,
    logout,
    currentRole,
    canManageUsers,
    canApproveRequests,
  } = useRMT();

  const canEdit =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canSeeAdmin =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';

  const pendingApprovalsCount =
    users.filter((u) => u.status === 'Pending Approval').length +
    accessRequests.filter((r) => r.status === 'Pending Review').length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    count?: number | string;
    badgeHighlight?: boolean;
    hidden?: boolean;
  }[] = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'Administration',
      label: 'Administration',
      icon: <ShieldAlert className="w-5 h-5" />,
      count: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} new` : users.length,
      badgeHighlight: pendingApprovalsCount > 0,
      hidden: !canSeeAdmin,
    },
    {
      id: 'Teams',
      label: 'Teams',
      icon: <Users className="w-5 h-5" />,
      count: teams.length,
    },
    {
      id: 'Resource Directory',
      label: 'Resource Directory',
      icon: <Contact className="w-5 h-5" />,
      count: resources.length,
    },
    {
      id: 'Projects',
      label: 'Projects',
      icon: <FolderGit2 className="w-5 h-5" />,
      count: projects.length,
    },
    {
      id: 'Task Details',
      label: 'Task Details',
      icon: <CheckSquare className="w-5 h-5" />,
      count: tasks.length,
    },
    {
      id: 'Resource Allocation',
      label: 'Resource Allocation',
      icon: <Sliders className="w-5 h-5" />,
      count: 'Live',
    },
    {
      id: 'Leave Planner',
      label: 'Leave Planner',
      icon: <CalendarCheck2 className="w-5 h-5" />,
      count: leaveRequests.filter((lr) => lr.status === 'Approved').length > 0
        ? `${leaveRequests.filter((lr) => lr.status === 'Approved').length}`
        : undefined,
    },
    {
      id: 'Reports',
      label: 'Reports & Analytics',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      count: '6',
    },
  ];

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-3.5 z-30 select-none overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col gap-3">
        {/* Workspace Brand Block */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
            <span className="material-symbols-outlined text-[18px]">domain</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              RMT Workspace
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Global Resource Hub
            </span>
          </div>
        </div>

        {/* Primary CTA: Add Resource - Admin & Project Manager only */}
        {canEdit && (
          <button
            onClick={() => setIsAddResourceOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        )}

        <div className="h-px bg-slate-200 dark:bg-slate-800 opacity-80 my-0.5"></div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-blue-300 font-semibold border-l-4 border-blue-700 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        item.badgeHighlight
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                          : isActive
                          ? 'bg-blue-700 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col gap-1 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsAuditLogOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer text-left"
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>Audit Logs</span>
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help Center</span>
        </button>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer text-left mt-1"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
