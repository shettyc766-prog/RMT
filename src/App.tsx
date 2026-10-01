import React from 'react';
import { RMTProvider, useRMT } from './context/RMTContext';
import { TopNavBar } from './components/common/TopNavBar';
import { SideNavBar } from './components/common/SideNavBar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SettingsModal } from './components/common/SettingsModal';
import { AuditLogModal } from './components/common/AuditLogModal';
import { HelpCenterModal } from './components/common/HelpCenterModal';
import { ResourceModal } from './components/modals/ResourceModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { TaskModal } from './components/modals/TaskModal';
import { TeamModal } from './components/modals/TeamModal';
import { AssignResourceModal } from './components/modals/AssignResourceModal';
import { ProjectDashboardModal } from './components/modals/ProjectDashboardModal';
import { CreateUserModal } from './components/admin/CreateUserModal';
import { SecurityEmailModal } from './components/admin/SecurityEmailModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { TeamsView } from './components/teams/TeamsView';
import { ResourceDirectoryView } from './components/resources/ResourceDirectoryView';
import { ProjectsView } from './components/projects/ProjectsView';
import { TaskDetailsView } from './components/tasks/TaskDetailsView';
import { AllocationModuleView } from './components/allocation/AllocationModuleView';
import { ReportsView } from './components/reports/ReportsView';
import { LeavePlannerView } from './components/leave/LeavePlannerView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentTab, toastMessage, isAuthenticated } = useRMT();
  const [authView, setAuthView] = React.useState<'login' | 'signup'>('login');
  const [loginPrefillEmail, setLoginPrefillEmail] = React.useState<string>('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        {authView === 'signup' ? (
          <SignUpPage
            onNavigateToLogin={(email) => {
              if (email) setLoginPrefillEmail(email);
              setAuthView('login');
            }}
          />
        ) : (
          <LoginPage
            initialEmail={loginPrefillEmail}
            onNavigateToSignUp={() => setAuthView('signup')}
          />
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Application Bar */}
      <TopNavBar />

      {/* Main Workspace Body */}
      <div className="flex flex-1 relative">
        {/* Left Side Navigation */}
        <SideNavBar />

        {/* Dynamic Main Canvas */}
        <main className="ml-60 flex-1 p-6 lg:p-8 max-w-[1600px] overflow-y-auto">
          {currentTab === 'Dashboard' && <DashboardView />}
          {currentTab === 'Administration' && <AdminDashboardView />}
          {currentTab === 'Teams' && <TeamsView />}
          {currentTab === 'Resource Directory' && <ResourceDirectoryView />}
          {currentTab === 'Projects' && <ProjectsView />}
          {currentTab === 'Task Details' && <TaskDetailsView />}
          {currentTab === 'Resource Allocation' && <AllocationModuleView />}
          {currentTab === 'Leave Planner' && <LeavePlannerView />}
          {currentTab === 'Reports' && <ReportsView />}
        </main>
      </div>

      {/* Global Modals & Dialogs */}
      <GlobalSearchModal />
      <SettingsModal />
      <AuditLogModal />
      <HelpCenterModal />
      <ResourceModal />
      <ProjectModal />
      <TaskModal />
      <TeamModal />
      <AssignResourceModal />
      <ProjectDashboardModal />
      <CreateUserModal />
      <SecurityEmailModal />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <RMTProvider>
      <AppContent />
    </RMTProvider>
  );
}
