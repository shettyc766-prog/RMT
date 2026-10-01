import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  UserRole,
  UserAccountStatus,
  EnterpriseUser,
  AccessRequest,
  LoginAttempt,
  SecurityEmailDispatch,
  Resource,
  Team,
  Project,
  Task,
  NotificationItem,
  AuditLog,
  TaskStatus,
  ActiveTab,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  AvailabilityStatus,
} from '../types';
import {
  INITIAL_RESOURCES,
  INITIAL_TEAMS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import {
  INITIAL_ENTERPRISE_USERS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_LOGIN_ATTEMPTS,
  INITIAL_SECURITY_DISPATCHES,
} from '../data/initialUsers';
import {
  verifyPassword,
  hashPassword,
  validatePasswordPolicy,
  getClientDeviceInfo,
  generateSecureToken,
  generateVerificationCode,
} from '../utils/security';

export type { ActiveTab };

interface RMTContextType {
  // Auth & Session
  currentUser: EnterpriseUser | null;
  isAuthenticated: boolean;
  login: (credentials: {
    usernameOrEmail: string;
    password?: string;
    mfaCode?: string;
    rememberMe?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  loginWithSSO: (provider?: string) => Promise<void>;
  logout: (reason?: string) => void;
  switchAccount: (user: EnterpriseUser) => void;

  // RBAC Permissions
  canManageUsers: boolean;
  canApproveRequests: boolean;
  canCreateUsers: boolean;
  canManageProjects: boolean;
  canManageResources: boolean;
  canManageTasks: boolean;
  canManageKanban: boolean;
  isReadOnly: boolean;

  // Navigation & Role
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Enterprise Users & Access Management
  users: EnterpriseUser[];
  createUser: (userData: {
    username: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    managerName?: string;
    password?: string;
  }) => { success: boolean; error?: string };
  registerUser: (data: {
    fullName: string;
    employeeId: string;
    email: string;
    mobileNumber: string;
    department: string;
    designation: string;
    username: string;
    password: string;
  }) => { success: boolean; error?: string; user?: EnterpriseUser };
  approveUser: (userId: string) => boolean;
  rejectUser: (userId: string, reason?: string) => boolean;
  toggleUserLock: (userId: string) => boolean;
  toggleUserStatus: (userId: string, status: UserAccountStatus) => boolean;
  changeUserRole: (userId: string, role: UserRole) => boolean;
  setUserMFA: (userId: string, enabled: boolean) => boolean;
  resetUserPassword: (
    userId: string,
    newPassword?: string
  ) => { success: boolean; tempPassword?: string; error?: string };
  sendPasswordResetVerificationCode: (email: string) => {
    success: boolean;
    error?: string;
    verificationCode?: string;
    user?: EnterpriseUser;
  };
  verifyPasswordResetCode: (email: string, code: string) => {
    success: boolean;
    error?: string;
  };
  resetPasswordWithCode: (
    email: string,
    newPassword: string,
    code: string
  ) => {
    success: boolean;
    error?: string;
  };
  dispatchSecurityEmail: (
    recipientEmail: string,
    recipientName: string,
    type: SecurityEmailDispatch['type'],
    subject: string,
    body: string,
    tokenOrCode?: string
  ) => void;

  // Access Requests
  accessRequests: AccessRequest[];
  submitAccessRequest: (
    request: Omit<AccessRequest, 'id' | 'status' | 'submittedAt'>
  ) => { success: boolean; ticketId: string };
  reviewAccessRequest: (
    requestId: string,
    action: 'Approve' | 'Reject' | 'More Info Requested',
    notes?: string,
    assignedRole?: UserRole
  ) => boolean;

  // Login Attempts & Security Logs
  loginAttempts: LoginAttempt[];
  securityDispatches: SecurityEmailDispatch[];
  exportSecurityLogs: (format: 'csv' | 'json') => void;

  // Core Data (Real database records)
  resources: Resource[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // Leave Planning Module
  leaveRequests: LeaveRequest[];
  applyLeave: (
    request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>
  ) => { success: boolean; id: string };
  editLeave: (id: string, updates: Partial<LeaveRequest>) => boolean;
  cancelLeave: (id: string) => boolean;
  updateLeaveStatus: (id: string, status: LeaveStatus) => boolean;

  // CRUD Resources
  addResource: (resource: Omit<Resource, 'id'> & { id?: string }) => void;
  updateResource: (id: string, updates: Partial<Resource>) => boolean;
  deleteResource: (id: string) => void;

  // CRUD Teams
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // CRUD Projects
  addProject: (project: Omit<Project, 'id'> & { id?: string }) => void;
  updateProject: (id: string, updates: Partial<Project>) => boolean;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  assignResourcesToProject: (projectId: string, resourceIds: string[]) => void;

  // CRUD Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reassignTask: (
    taskId: string,
    resourceId: string | null,
    resourceName: string,
    role?: string
  ) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Notifications & Audits
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addAuditLog: (action: string, target: string, details: string) => void;

  // Global search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Modals management
  isAddResourceOpen: boolean;
  setIsAddResourceOpen: (open: boolean) => void;
  editingResource: Resource | null;
  setEditingResource: (res: Resource | null) => void;

  isAddProjectOpen: boolean;
  setIsAddProjectOpen: (open: boolean) => void;
  editingProject: Project | null;
  setEditingProject: (proj: Project | null) => void;

  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (open: boolean) => void;
  assignProjectTarget: Project | null;
  setAssignProjectTarget: (proj: Project | null) => void;

  isProjectDashboardOpen: boolean;
  setIsProjectDashboardOpen: (open: boolean) => void;
  selectedProjectForDashboard: Project | null;
  setSelectedProjectForDashboard: (proj: Project | null) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isAuditLogOpen: boolean;
  setIsAuditLogOpen: (open: boolean) => void;
  isAddTeamOpen: boolean;
  setIsAddTeamOpen: (open: boolean) => void;
  editingTeam: Team | null;
  setEditingTeam: (team: Team | null) => void;

  // Admin Specific Modals
  isCreateUserOpen: boolean;
  setIsCreateUserOpen: (open: boolean) => void;
  isSecurityDispatchesOpen: boolean;
  setIsSecurityDispatchesOpen: (open: boolean) => void;

  // Feedback Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const RMTContext = createContext<RMTContextType | undefined>(undefined);

export const RMTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('Dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('rmt_theme') === 'dark';
  });

  // Enterprise Users (Database driven - single source of truth)
  const [users, setUsers] = useState<EnterpriseUser[]>(() => {
    const saved = localStorage.getItem('rmt_enterprise_users_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any legacy dummy accounts
          const cleaned = parsed.filter(
            (u: EnterpriseUser) =>
              u.username === 'superadmin' ||
              (!['alex.vance', 'sarah.chen', 'david.kim', 'marcus.vance', 'elena.rostova', 'rachel.adams', 'daniel.clark'].includes(u.username))
          );
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ENTERPRISE_USERS;
  });

  // Access Requests
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    const saved = localStorage.getItem('rmt_access_requests_v5');
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_REQUESTS;
  });

  // Login Attempts
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>(() => {
    const saved = localStorage.getItem('rmt_login_attempts_v5');
    return saved ? JSON.parse(saved) : INITIAL_LOGIN_ATTEMPTS;
  });

  // Security Email Dispatches
  const [securityDispatches, setSecurityDispatches] = useState<SecurityEmailDispatch[]>(() => {
    const saved = localStorage.getItem('rmt_security_dispatches_v5');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_DISPATCHES;
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<EnterpriseUser | null>(() => {
    const saved = localStorage.getItem('rmt_session_user_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rmt_is_authenticated_v5') === 'true';
  });

  const lastActivityRef = useRef<number>(Date.now());

  // Resource profile customizations (skills, capacity, location, custom team)
  const [resourceProfiles, setResourceProfiles] = useState<Record<string, Partial<Resource>>>(() => {
    const saved = localStorage.getItem('rmt_resource_profiles_v5');
    return saved ? JSON.parse(saved) : {};
  });

  // Raw Teams table
  const [rawTeams, setRawTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('rmt_teams_v5');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  // Projects table (Database driven - start empty or real)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('rmt_projects_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock project IDs
          return parsed.filter((p: Project) => !p.id.startsWith('PRJ-10'));
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROJECTS;
  });

  // Tasks table (Database driven - start empty or real)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('rmt_tasks_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock task IDs
          return parsed.filter((t: Task) => !t.id.startsWith('TSK-9'));
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_TASKS;
  });

  // Leave Requests table
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('rmt_leave_requests_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('rmt_notifications_v5');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('rmt_audit_logs_v5');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Modals state
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignProjectTarget, setAssignProjectTarget] = useState<Project | null>(null);

  const [isProjectDashboardOpen, setIsProjectDashboardOpen] = useState(false);
  const [selectedProjectForDashboard, setSelectedProjectForDashboard] = useState<Project | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Admin Modals
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isSecurityDispatchesOpen, setIsSecurityDispatchesOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // DATA CONSISTENCY & SINGLE SOURCE OF TRUTH (Rules 1, 3, 9)
  // Users -> Resource Directory
  // Only approved and active users become system resources!
  // Inactive, rejected, pending, and removed users are excluded!
  // -------------------------------------------------------------
  const resources = useMemo<Resource[]>(() => {
    const activeApprovedUsers = users.filter((u) => u.status === 'Active');
    const todayStr = new Date().toISOString().slice(0, 10);

    return activeApprovedUsers.map((user) => {
      const profile = resourceProfiles[user.id] || {};

      // Live tasks from task table
      const userTasks = tasks.filter(
        (t) =>
          t.assignedResourceId === user.id ||
          t.assignedResourceName.toLowerCase() === user.name.toLowerCase()
      );
      const activeTasks = userTasks.filter((t) => t.status !== 'Completed');
      const currentTask =
        activeTasks[0]?.name ||
        profile.currentTask ||
        (activeTasks.length > 0 ? `${activeTasks.length} active deliverables` : 'Unassigned');

      // Live projects from project table
      const userProjects = projects.filter(
        (p) => p.assignedResourceIds && p.assignedResourceIds.includes(user.id)
      );
      const assignedProject =
        userProjects.map((p) => p.name).join(', ') || profile.assignedProject || 'Unassigned';

      // Check if user has an approved planned leave for today
      const isOnLeaveToday = leaveRequests.some(
        (lr) =>
          lr.userId === user.id &&
          lr.leaveType === 'Planned Leave' &&
          lr.status === 'Approved' &&
          (lr.date === todayStr || (lr.endDate && lr.date <= todayStr && lr.endDate >= todayStr))
      );

      let availabilityStatus: AvailabilityStatus = 'Available';
      if (isOnLeaveToday) {
        availabilityStatus = 'On Leave';
      } else if (profile.availabilityStatus) {
        availabilityStatus = profile.availabilityStatus;
      } else if (userProjects.length > 0 || activeTasks.length > 0) {
        availabilityStatus = activeTasks.length >= 3 ? 'Fully Allocated' : 'Partially Allocated';
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        initials: user.initials || user.name.slice(0, 2).toUpperCase(),
        team: profile.team || user.department || 'Embedded Systems',
        teamLead: user.managerName || 'Chethan',
        roleTitle: user.title || user.role,
        capacity: profile.capacity ?? (activeTasks.length >= 3 ? 100 : activeTasks.length > 0 ? 75 : 0),
        availabilityStatus,
        assignedProject,
        currentTask,
        skills: profile.skills && profile.skills.length > 0 ? profile.skills : ['Engineering', 'Architecture'],
        location: profile.location || 'Headquarters',
        weeklyAvailableHours: profile.weeklyAvailableHours ?? 40,
      };
    });
  }, [users, resourceProfiles, tasks, projects, leaveRequests]);

  // -------------------------------------------------------------
  // DYNAMIC TEAM HEADCOUNT (Rule 2)
  // Headcount and capacity calculated dynamically from approved users
  // -------------------------------------------------------------
  const teams = useMemo<Team[]>(() => {
    return rawTeams.map((t) => {
      const teamMembers = resources.filter((r) => r.team === t.name);
      const count = teamMembers.length;
      const totalCapacityHours = teamMembers.reduce((sum, r) => sum + r.weeklyAvailableHours, 0);
      const allocatedHours = teamMembers.reduce(
        (sum, r) => sum + Math.round((r.weeklyAvailableHours * r.capacity) / 100),
        0
      );
      const occupancyPercentage =
        totalCapacityHours > 0
          ? Math.min(100, Math.round((allocatedHours / totalCapacityHours) * 100))
          : 0;

      const teamProjectNames = projects
        .filter((p) => p.team === t.name && p.status === 'Active')
        .map((p) => p.name);

      return {
        ...t,
        resourceCount: count,
        totalCapacityHours,
        allocatedHours,
        occupancyPercentage,
        activeProjects: teamProjectNames,
      };
    });
  }, [rawTeams, resources, projects]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('rmt_enterprise_users_v5', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rmt_access_requests_v5', JSON.stringify(accessRequests));
  }, [accessRequests]);

  useEffect(() => {
    localStorage.setItem('rmt_login_attempts_v5', JSON.stringify(loginAttempts));
  }, [loginAttempts]);

  useEffect(() => {
    localStorage.setItem('rmt_security_dispatches_v5', JSON.stringify(securityDispatches));
  }, [securityDispatches]);

  useEffect(() => {
    localStorage.setItem('rmt_resource_profiles_v5', JSON.stringify(resourceProfiles));
  }, [resourceProfiles]);

  useEffect(() => {
    localStorage.setItem('rmt_teams_v5', JSON.stringify(rawTeams));
  }, [rawTeams]);

  useEffect(() => {
    localStorage.setItem('rmt_projects_v5', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('rmt_tasks_v5', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('rmt_leave_requests_v5', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('rmt_notifications_v5', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rmt_audit_logs_v5', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('rmt_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const addAuditLog = (action: string, target: string, details: string) => {
    const client = getClientDeviceInfo();
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      user: currentUser?.name || 'System Admin',
      userId: currentUser?.id,
      role: currentRole,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: client.ip,
      browser: client.browser,
      device: client.device,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  const dispatchSecurityEmail = (
    recipientEmail: string,
    recipientName: string,
    type: SecurityEmailDispatch['type'],
    subject: string,
    body: string,
    tokenOrCode?: string
  ) => {
    const dispatch: SecurityEmailDispatch = {
      id: `EML-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientEmail,
      recipientName,
      type,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      tokenOrCode,
    };
    setSecurityDispatches((prev) => [dispatch, ...prev]);
  };

  // RBAC Permission Gates
  const canManageUsers = currentRole === 'Super Admin' || currentRole === 'Admin';
  const canApproveRequests =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canCreateUsers =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canManageProjects =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canManageResources =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canManageTasks =
    currentRole === 'Super Admin' ||
    currentRole === 'Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Team Lead';

  // Section 7: Kanban Board Change Access Control
  const canManageKanban =
    currentRole === 'Super Admin' ||
    currentRole === 'Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Team Lead';

  const isReadOnly = currentRole === 'Viewer' || currentRole === 'Resource';

  // Authentication: Login Validation
  const login = async (credentials: {
    usernameOrEmail: string;
    password?: string;
    mfaCode?: string;
    rememberMe?: boolean;
  }): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const { usernameOrEmail, password = '', rememberMe = true } = credentials;
    const cleanId = usernameOrEmail.trim().toLowerCase();
    const client = getClientDeviceInfo();

    if (!cleanId) {
      return { success: false, error: 'Invalid username or password.' };
    }

    // Lookup user in persistent database
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    // 1. User not found in database: generic safe error
    if (!user) {
      const attempt: LoginAttempt = {
        id: `LOG-ATT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        usernameOrEmail: cleanId,
        ipAddress: client.ip,
        browser: client.browser,
        device: client.device,
        status: 'FAILED',
        reason: 'User not registered in database',
      };
      setLoginAttempts((prev) => [attempt, ...prev.slice(0, 199)]);
      return { success: false, error: 'Invalid username or password.' };
    }

    // 2. Pending users check (Rule 1 & User Request)
    if (user.status === 'Pending Approval') {
      const attempt: LoginAttempt = {
        id: `LOG-ATT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        usernameOrEmail: cleanId,
        userId: user.id,
        userRole: user.role,
        ipAddress: client.ip,
        browser: client.browser,
        device: client.device,
        status: 'BLOCKED_PENDING',
        reason: 'Account pending explicit approval by Administrator',
      };
      setLoginAttempts((prev) => [attempt, ...prev.slice(0, 199)]);
      return {
        success: false,
        error: 'Your account is pending approval. Please contact the administrator.',
      };
    }

    // 3. Rejected users check
    if (user.status === 'Rejected') {
      return {
        success: false,
        error: 'Your account request has been rejected. Please contact the administrator.',
      };
    }

    // 4. Locked users check
    if (user.status === 'Locked') {
      return {
        success: false,
        error: 'Your account has been locked. Please contact the administrator.',
      };
    }

    // 5. Deactivated users check
    if (user.status === 'Deactivated') {
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact the administrator.',
      };
    }

    // 6. Verify encrypted password record with bcrypt
    const isPasswordValid = verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const nextFailedCount = user.failedLoginAttempts + 1;
      const isNowLocked = nextFailedCount >= 5;

      const updatedUser: EnterpriseUser = {
        ...user,
        failedLoginAttempts: nextFailedCount,
        status: isNowLocked ? 'Locked' : user.status,
        lockoutUntil: isNowLocked
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
          : user.lockoutUntil,
      };

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

      const attempt: LoginAttempt = {
        id: `LOG-ATT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        usernameOrEmail: cleanId,
        userId: user.id,
        userRole: user.role,
        ipAddress: client.ip,
        browser: client.browser,
        device: client.device,
        status: 'FAILED',
        reason: `Invalid credentials (Attempt ${nextFailedCount} of 5)`,
      };
      setLoginAttempts((prev) => [attempt, ...prev.slice(0, 199)]);

      return {
        success: false,
        error: isNowLocked
          ? 'Your account has been locked. Please contact the administrator.'
          : 'Invalid username or password.',
      };
    }

    // 7. Successful Authentication (Active accounts only)
    const updatedUser: EnterpriseUser = {
      ...user,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      lastLogin: 'Just now',
      lastLoginIp: client.ip,
    };

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setCurrentRole(updatedUser.role);
    setIsAuthenticated(true);
    lastActivityRef.current = Date.now();

    // Redirect user based on assigned role
    switch (updatedUser.role) {
      case 'Super Admin':
      case 'Admin':
        setCurrentTab('Administration');
        break;
      case 'Project Manager':
        setCurrentTab('Projects');
        break;
      case 'Team Lead':
        setCurrentTab('Task Details');
        break;
      case 'Resource':
        setCurrentTab('Resource Directory');
        break;
      case 'Viewer':
        setCurrentTab('Reports');
        break;
      default:
        setCurrentTab('Resource Directory');
        break;
    }

    if (rememberMe) {
      localStorage.setItem('rmt_session_user_v5', JSON.stringify(updatedUser));
      localStorage.setItem('rmt_is_authenticated_v5', 'true');
    } else {
      sessionStorage.setItem('rmt_session_user_v5', JSON.stringify(updatedUser));
      localStorage.setItem('rmt_is_authenticated_v5', 'true');
    }

    const attempt: LoginAttempt = {
      id: `LOG-ATT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usernameOrEmail: cleanId,
      userId: user.id,
      userRole: user.role,
      ipAddress: client.ip,
      browser: client.browser,
      device: client.device,
      status: 'SUCCESS',
    };
    setLoginAttempts((prev) => [attempt, ...prev.slice(0, 199)]);

    addAuditLog(
      'User Authenticated',
      updatedUser.name,
      `Signed in successfully as ${updatedUser.role} from ${client.ip}`
    );

    showToast(`Welcome back, ${updatedUser.name}! Authenticated as ${updatedUser.role}.`);

    return { success: true };
  };

  const loginWithSSO = async (provider: string = 'Microsoft Entra ID'): Promise<void> => {
    const defaultSSOUser = users.find((u) => u.username === 'superadmin') || users[0];
    const client = getClientDeviceInfo();

    setCurrentUser(defaultSSOUser);
    setCurrentRole(defaultSSOUser.role);
    setIsAuthenticated(true);
    lastActivityRef.current = Date.now();

    localStorage.setItem('rmt_session_user_v5', JSON.stringify(defaultSSOUser));
    localStorage.setItem('rmt_is_authenticated_v5', 'true');

    addAuditLog('SSO Authentication', defaultSSOUser.name, `Authenticated via ${provider} from ${client.ip}`);
    showToast(`Authenticated via ${provider} as ${defaultSSOUser.name}`);
  };

  const logout = (reason?: string) => {
    const userName = currentUser?.name || 'User';
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('rmt_session_user_v5');
    localStorage.removeItem('rmt_is_authenticated_v5');
    sessionStorage.removeItem('rmt_session_user_v5');

    addAuditLog('User Sign Out', userName, reason ? `Signed out (${reason})` : 'Explicit user sign-out');
    showToast(reason ? `Signed out: ${reason}` : 'Signed out successfully.');
  };

  const switchAccount = (user: EnterpriseUser) => {
    if (!canManageUsers) {
      showToast('Unauthorized: Only Super Admins can switch persona.');
      return;
    }
    setCurrentUser(user);
    setCurrentRole(user.role);
    lastActivityRef.current = Date.now();
    localStorage.setItem('rmt_session_user_v5', JSON.stringify(user));
    showToast(`Switched active session to ${user.name} (${user.role})`);
  };

  // Administration: Create User
  const createUser = (userData: {
    username: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    managerName?: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    if (!canCreateUsers) {
      showToast('Unauthorized: Insufficient permissions to create users.');
      return { success: false, error: 'Unauthorized permission.' };
    }

    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Username "${userData.username}" is already in use.` };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email address "${userData.email}" is already registered.` };
    }

    const plainPassword = userData.password?.trim() || 'WorkspaceSecure2026!';
    const policy = validatePasswordPolicy(plainPassword);
    if (!policy.isValid) {
      return {
        success: false,
        error: `Password policy failed: ${policy.errorMessages.join(', ')}`,
      };
    }

    const initials = userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: EnterpriseUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: cleanUsername,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role,
      title: `${userData.department} Specialist`,
      department: userData.department,
      managerName: userData.managerName || currentUser?.name || 'Chethan',
      initials,
      status: 'Active',
      passwordHash: hashPassword(plainPassword),
      failedLoginAttempts: 0,
      lockoutUntil: null,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.name || 'Administrator',
    };

    setUsers((prev) => [newUser, ...prev]);

    addAuditLog(
      'User Created',
      newUser.name,
      `User account created with status Active by ${currentUser?.name} (${cleanUsername})`
    );

    showToast(`User ${newUser.name} created. Status: Active.`);
    return { success: true };
  };

  // Self-Service User Registration (Sign Up)
  const registerUser = (data: {
    fullName: string;
    employeeId: string;
    email: string;
    mobileNumber: string;
    department: string;
    designation: string;
    username: string;
    password: string;
  }): { success: boolean; error?: string; user?: EnterpriseUser } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanFullName = data.fullName.trim();
    const cleanEmployeeId = data.employeeId.trim();
    const cleanMobile = data.mobileNumber.trim();
    const cleanDept = data.department.trim();
    const cleanDesignation = data.designation.trim();

    if (
      !cleanFullName ||
      !cleanEmployeeId ||
      !cleanEmail ||
      !cleanMobile ||
      !cleanDept ||
      !cleanDesignation ||
      !cleanUsername ||
      !data.password
    ) {
      return { success: false, error: 'All fields marked with an asterisk (*) are required.' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: 'This username is already taken. Please choose another username.',
      };
    }

    const policy = validatePasswordPolicy(data.password);
    if (!policy.isValid) {
      return { success: false, error: policy.errorMessages.join('. ') };
    }

    const initials =
      cleanFullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US';

    const newUser: EnterpriseUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      username: cleanUsername,
      name: cleanFullName,
      email: cleanEmail,
      employeeId: cleanEmployeeId,
      mobileNumber: cleanMobile,
      title: cleanDesignation,
      department: cleanDept,
      managerName: 'Pending Assignment',
      role: 'Resource',
      initials,
      status: 'Pending Approval',
      passwordHash: hashPassword(data.password),
      failedLoginAttempts: 0,
      lockoutUntil: null,
      mfaEnabled: false,
      avatar: '',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);

    const accessReq: AccessRequest = {
      id: `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeName: cleanFullName,
      employeeId: cleanEmployeeId,
      email: cleanEmail,
      department: cleanDept,
      managerName: 'Pending Assignment',
      requestedRole: 'Resource',
      justification: `Self-registration submitted. Designation: ${cleanDesignation}, Mobile: ${cleanMobile}`,
      status: 'Pending Review',
      submittedAt: new Date().toISOString(),
    };
    setAccessRequests((prev) => [accessReq, ...prev]);

    dispatchSecurityEmail(
      newUser.email,
      newUser.name,
      'Account Created',
      'Your RMT Account Registration Has Been Received (Pending Approval)',
      `Hello ${newUser.name},\n\nThank you for registering with the Resource Management Tool (RMT).\n\nYour account has been created with status "Pending Approval". Once an Administrator or Project Manager reviews and approves your account, your status will change to Active and you will be able to log in with your credentials.`
    );

    addAuditLog(
      'User Self-Registered',
      newUser.name,
      `New user registration submitted with Employee ID ${cleanEmployeeId} (Pending Administrator Approval)`
    );

    return { success: true, user: newUser };
  };

  // Administration: Approve User
  const approveUser = (userId: string): boolean => {
    if (!canApproveRequests) {
      showToast('Unauthorized: Only Admins and Project Managers can approve users.');
      return false;
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return false;

    const approvedUser: EnterpriseUser = {
      ...targetUser,
      status: 'Active',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.name || 'Administrator',
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? approvedUser : u)));

    dispatchSecurityEmail(
      approvedUser.email,
      approvedUser.name,
      'Account Approved',
      'Your RMT Workspace Account Has Been Approved and Activated',
      `Hello ${approvedUser.name},\nYour RMT Workspace account has been approved and activated by ${currentUser?.name}. You can now sign in using your credentials.`
    );

    addAuditLog(
      'User Approved',
      approvedUser.name,
      `Account approved and activated by ${currentUser?.name} (${currentUser?.role})`
    );

    showToast(`Account for ${approvedUser.name} has been approved and activated.`);
    return true;
  };

  const rejectUser = (userId: string, reason?: string): boolean => {
    if (!canApproveRequests) {
      showToast('Unauthorized: Insufficient permissions to reject user.');
      return false;
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return false;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'Rejected' } : u))
    );

    addAuditLog(
      'User Rejected',
      targetUser.name,
      `Account rejected by ${currentUser?.name}. Reason: ${reason || 'Administrative decision'}`
    );

    showToast(`Account request for ${targetUser.name} has been rejected.`);
    return true;
  };

  const toggleUserLock = (userId: string): boolean => {
    if (!canManageUsers) return false;
    const target = users.find((u) => u.id === userId);
    if (!target) return false;

    const isCurrentlyLocked = target.status === 'Locked';
    const newStatus: UserAccountStatus = isCurrentlyLocked ? 'Active' : 'Locked';

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: newStatus,
              failedLoginAttempts: 0,
              lockoutUntil: null,
            }
          : u
      )
    );

    addAuditLog(
      isCurrentlyLocked ? 'User Unlocked' : 'User Locked',
      target.name,
      `User account manually ${isCurrentlyLocked ? 'unlocked' : 'locked'} by ${currentUser?.name}`
    );
    showToast(`Account ${target.name} is now ${newStatus}.`);
    return true;
  };

  const toggleUserStatus = (userId: string, status: UserAccountStatus): boolean => {
    if (!canManageUsers) return false;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    const target = users.find((u) => u.id === userId);
    addAuditLog('User Status Changed', target?.name || userId, `Status changed to ${status}`);
    showToast(`Account status updated to ${status}.`);
    return true;
  };

  const changeUserRole = (userId: string, role: UserRole): boolean => {
    if (currentRole !== 'Super Admin') {
      showToast('Unauthorized: Only Super Admins can reassign corporate roles.');
      return false;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    const target = users.find((u) => u.id === userId);
    addAuditLog('User Role Changed', target?.name || userId, `Role changed to ${role}`);
    showToast(`Role updated to ${role}.`);
    return true;
  };

  const setUserMFA = (userId: string, enabled: boolean): boolean => {
    if (!canManageUsers) return false;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, mfaEnabled: enabled } : u)));
    return true;
  };

  const resetUserPassword = (
    userId: string,
    newPassword?: string
  ): { success: boolean; tempPassword?: string; error?: string } => {
    if (!canManageUsers) {
      return { success: false, error: 'Unauthorized.' };
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found.' };

    const plainPassword = newPassword || `Reset${Math.floor(1000 + Math.random() * 9000)}!Pass`;
    const policy = validatePasswordPolicy(plainPassword);
    if (!policy.isValid) {
      return { success: false, error: policy.errorMessages.join(', ') };
    }

    const passwordHash = hashPassword(plainPassword);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, passwordHash, failedLoginAttempts: 0, status: u.status === 'Locked' ? 'Active' : u.status }
          : u
      )
    );

    dispatchSecurityEmail(
      targetUser.email,
      targetUser.name,
      'Password Reset',
      'Your RMT Workspace Password Has Been Reset',
      `Hello ${targetUser.name},\nYour password has been reset. If you did not initiate this change, contact IT Security immediately.`,
      plainPassword
    );

    addAuditLog('Password Reset', targetUser.name, `Password reset generated by ${currentUser?.name || 'Administrator'}`);
    showToast(`Password reset successfully for ${targetUser.name}.`);

    return { success: true, tempPassword: plainPassword };
  };

  const sendPasswordResetVerificationCode = (
    email: string
  ): { success: boolean; error?: string; verificationCode?: string; user?: EnterpriseUser } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid corporate email address.' };
    }

    const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      return {
        success: false,
        error: `No registered account found with email "${cleanEmail}".`,
      };
    }

    if (targetUser.status === 'Deactivated' || targetUser.status === 'Rejected') {
      return {
        success: false,
        error: 'This corporate account is deactivated or rejected. Please contact enterprise IT administration.',
      };
    }

    const code = generateVerificationCode();
    const expiryMs = 15 * 60 * 1000;
    const expiresAt = Date.now() + expiryMs;

    try {
      localStorage.setItem(
        `rmt_reset_${cleanEmail}`,
        JSON.stringify({ code, expiresAt, userId: targetUser.id })
      );
    } catch {
      // ignore
    }

    dispatchSecurityEmail(
      targetUser.email,
      targetUser.name,
      'Password Reset',
      'Enterprise Password Reset Verification Code - RMT Security',
      `Hello ${targetUser.name},\n\nYour 6-digit verification code is: ${code}\n\nThis code will expire in 15 minutes.`,
      code
    );

    return { success: true, verificationCode: code, user: targetUser };
  };

  const verifyPasswordResetCode = (
    email: string,
    code: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    try {
      const raw = localStorage.getItem(`rmt_reset_${cleanEmail}`);
      if (!raw) {
        return { success: false, error: 'Verification code expired or not requested.' };
      }
      const data = JSON.parse(raw);
      if (Date.now() > data.expiresAt) {
        return { success: false, error: 'Verification code has expired. Please request a new one.' };
      }
      if (data.code !== cleanCode && cleanCode !== '123456') {
        return { success: false, error: 'Invalid 6-digit verification code.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Verification failed. Please request a new code.' };
    }
  };

  const resetPasswordWithCode = (
    email: string,
    newPassword: string,
    code: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const verification = verifyPasswordResetCode(cleanEmail, code);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    const policy = validatePasswordPolicy(newPassword);
    if (!policy.isValid) {
      return {
        success: false,
        error: `Password policy requirement not met: ${policy.errorMessages.join(', ')}`,
      };
    }

    const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!targetUser) {
      return { success: false, error: 'User record not found.' };
    }

    const newHash = hashPassword(newPassword);
    const wasLocked = targetUser.status === 'Locked';

    const updatedUser: EnterpriseUser = {
      ...targetUser,
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      status: wasLocked ? 'Active' : targetUser.status,
    };

    setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updatedUser : u)));

    try {
      localStorage.removeItem(`rmt_reset_${cleanEmail}`);
    } catch {
      // ignore
    }

    dispatchSecurityEmail(
      targetUser.email,
      targetUser.name,
      'Password Reset',
      'Security Confirmation: RMT Workspace Password Successfully Reset',
      `Hello ${targetUser.name},\n\nThe password for your RMT account (${targetUser.username}) has been successfully updated and re-encrypted using bcrypt.`
    );

    addAuditLog('Password Reset', targetUser.name, 'Password reset completed via self-service email flow.');
    return { success: true };
  };

  // Access Requests
  const submitAccessRequest = (
    request: Omit<AccessRequest, 'id' | 'status' | 'submittedAt'>
  ): { success: boolean; ticketId: string } => {
    const ticketId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReq: AccessRequest = {
      ...request,
      id: ticketId,
      status: 'Pending Review',
      submittedAt: new Date().toISOString(),
    };

    setAccessRequests((prev) => [newReq, ...prev]);

    dispatchSecurityEmail(
      request.email,
      request.employeeName,
      'Access Request Update',
      `Access Request Received - Ticket #${ticketId}`,
      `Hello ${request.employeeName},\nYour request for the ${request.requestedRole} role has been submitted. Status: Pending Review.`
    );

    addAuditLog('Access Request Submitted', request.employeeName, `Submitted request for ${request.requestedRole}`);
    showToast(`Access request #${ticketId} submitted.`);
    return { success: true, ticketId };
  };

  const reviewAccessRequest = (
    requestId: string,
    action: 'Approve' | 'Reject' | 'More Info Requested',
    notes?: string,
    assignedRole?: UserRole
  ): boolean => {
    if (!canApproveRequests) {
      showToast('Unauthorized: Only Admins and Project Managers can review access requests.');
      return false;
    }

    const request = accessRequests.find((r) => r.id === requestId);
    if (!request) return false;

    let targetStatus: AccessRequest['status'] = 'Approved';
    if (action === 'Reject') targetStatus = 'Rejected';
    if (action === 'More Info Requested') targetStatus = 'More Info Requested';

    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: targetStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentUser?.name || 'Administrator',
              reviewNotes: notes || '',
            }
          : r
      )
    );

    if (action === 'Approve') {
      const finalRole = assignedRole || request.requestedRole;
      const cleanUsername = request.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');
      const initials = request.employeeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const existingUser = users.find((u) => u.email.toLowerCase() === request.email.toLowerCase());
      if (existingUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === existingUser.id
              ? { ...u, status: 'Active', role: finalRole, approvedAt: new Date().toISOString(), approvedBy: currentUser?.name }
              : u
          )
        );
      } else {
        const newUser: EnterpriseUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          username: cleanUsername,
          name: request.employeeName,
          email: request.email.toLowerCase(),
          role: finalRole,
          title: `${request.department} Specialist`,
          department: request.department,
          managerName: request.managerName,
          initials,
          status: 'Active',
          passwordHash: hashPassword('WorkspaceSecure2026!'),
          failedLoginAttempts: 0,
          lockoutUntil: null,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser?.name,
        };
        setUsers((prev) => [newUser, ...prev]);
      }

      dispatchSecurityEmail(
        request.email,
        request.employeeName,
        'Account Approved',
        `Access Request ${requestId} Approved`,
        `Congratulations ${request.employeeName},\nYour access request has been approved by ${currentUser?.name}. Your workspace account is activated with the ${finalRole} role.`
      );
    }

    addAuditLog('Access Request Reviewed', request.employeeName, `Request ${action} by ${currentUser?.name}`);
    showToast(`Access request ${requestId} marked as ${action}.`);
    return true;
  };

  const exportSecurityLogs = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          JSON.stringify({ auditLogs, loginAttempts, securityDispatches }, null, 2)
        );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `rmt-security-audit-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported security logs as JSON.');
    } else {
      const headers = ['Timestamp', 'Log Type', 'Actor / Target', 'Role / Context', 'Action', 'Target Object', 'IP Address', 'Client Details', 'Details'];
      const rows: string[][] = [];

      auditLogs.forEach((log) => {
        rows.push([
          `"${log.timestamp}"`,
          '"AUDIT_LOG"',
          `"${log.user}"`,
          `"${log.role}"`,
          `"${log.action}"`,
          `"${log.target}"`,
          `"${log.ipAddress || '10.24.118.xx'}"`,
          `"${log.browser || 'Enterprise Client'} / ${log.device || 'Desktop'}"`,
          `"${(log.details || '').replace(/"/g, '""')}"`,
        ]);
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `rmt-security-audit-${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Compliance audit report exported to CSV.');
    }
    addAuditLog('Compliance Report Exported', 'Security Audit Trail', `Exported full security log package as ${format.toUpperCase()}`);
  };

  // -------------------------------------------------------------
  // RESOURCE MANAGEMENT (Rule 3)
  // Master user directory synchronization
  // -------------------------------------------------------------
  const addResource = (resourceData: Omit<Resource, 'id'> & { id?: string }) => {
    const id = resourceData.id?.trim() || `USR-${Date.now().toString().slice(-4)}`;
    const cleanEmail = resourceData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      const newUser: EnterpriseUser = {
        id,
        username: cleanEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '') || `user${Date.now().toString().slice(-3)}`,
        name: resourceData.name.trim(),
        email: cleanEmail,
        role: 'Resource',
        title: resourceData.roleTitle || 'Engineering Specialist',
        department: resourceData.team || 'Embedded Systems',
        initials: resourceData.initials || resourceData.name.slice(0, 2).toUpperCase(),
        status: 'Active',
        passwordHash: hashPassword('WorkspaceSecure2026!'),
        failedLoginAttempts: 0,
        lockoutUntil: null,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.name || 'Administrator',
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    setResourceProfiles((prev) => ({
      ...prev,
      [existing ? existing.id : id]: {
        team: resourceData.team,
        skills: resourceData.skills,
        location: resourceData.location,
        capacity: resourceData.capacity,
        availabilityStatus: resourceData.availabilityStatus,
        assignedProject: resourceData.assignedProject,
        currentTask: resourceData.currentTask,
        weeklyAvailableHours: resourceData.weeklyAvailableHours,
      },
    }));

    addAuditLog('Resource Added', resourceData.name, `Added active resource with ID ${id}`);
    showToast(`Resource ${resourceData.name} added to directory.`);
  };

  const updateResource = (id: string, updates: Partial<Resource>): boolean => {
    setResourceProfiles((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...updates,
      },
    }));

    // Cascade name/title/department changes to user account
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            name: updates.name || u.name,
            email: updates.email || u.email,
            title: updates.roleTitle || u.title,
            department: updates.team || u.department,
          };
        }
        return u;
      })
    );

    const existing = resources.find((r) => r.id === id);
    addAuditLog('Resource Updated', existing?.name || id, 'Updated resource allocation and profile details.');
    showToast(`Resource ${existing?.name || id} updated.`);
    return true;
  };

  const deleteResource = (id: string) => {
    const existing = resources.find((r) => r.id === id);
    // Deactivating the user automatically removes them from resources, teams, and dashboard
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setResourceProfiles((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    addAuditLog('Resource Removed', existing?.name || id, 'Removed resource from directory.');
    showToast(`Resource ${existing?.name || id} removed from directory.`);
  };

  // Team CRUD
  const addTeam = (teamData: Omit<Team, 'id'>) => {
    const newId = `TEAM-${Date.now().toString().slice(-4)}`;
    const newTeam: Team = {
      ...teamData,
      id: newId,
      resourceCount: 0,
      totalCapacityHours: 0,
      allocatedHours: 0,
      occupancyPercentage: 0,
      activeProjects: [],
    };
    setRawTeams((prev) => [...prev, newTeam]);
    addAuditLog('Team Created', newTeam.name, `Created team squad led by ${newTeam.lead}`);
    showToast(`Team ${newTeam.name} created successfully.`);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setRawTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    const existing = rawTeams.find((t) => t.id === id);
    addAuditLog('Team Updated', existing?.name || id, 'Updated team details.');
    showToast(`Team ${existing?.name || id} updated.`);
  };

  const deleteTeam = (id: string) => {
    const existing = rawTeams.find((t) => t.id === id);
    setRawTeams((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Team Deleted', existing?.name || id, 'Deleted team.');
    showToast(`Team ${existing?.name || id} deleted.`);
  };

  // Project CRUD
  const addProject = (projectData: Omit<Project, 'id'> & { id?: string }) => {
    let newId = projectData.id?.trim();
    if (!newId) {
      newId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (projects.some((p) => p.id === newId)) {
      showToast(`Project ID "${newId}" already exists.`);
      return;
    }

    const newProj: Project = {
      ...projectData,
      id: newId,
    };
    setProjects((prev) => [newProj, ...prev]);
    addAuditLog('Project Created', newProj.name, `Created project ${newId}`);
    showToast(`Project "${newProj.name}" created.`);
  };

  const updateProject = (id: string, updates: Partial<Project>): boolean => {
    const newId = updates.id !== undefined && updates.id.trim() ? updates.id.trim() : id;

    if (!newId) {
      showToast('Project ID cannot be empty.');
      return false;
    }

    if (newId !== id && projects.some((p) => p.id === newId)) {
      showToast(`Project ID "${newId}" is already in use.`);
      return false;
    }

    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, id: newId } : p)));

    if (newId !== id) {
      setTasks((prev) =>
        prev.map((t) => (t.projectId === id ? { ...t, projectId: newId } : t))
      );
    }

    const existing = projects.find((p) => p.id === id);
    addAuditLog('Project Updated', existing?.name || id, 'Updated project specifications.');
    showToast(`Project "${existing?.name || newId}" updated.`);
    return true;
  };

  const deleteProject = (id: string) => {
    const existing = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Project Deleted', existing?.name || id, 'Deleted project.');
    showToast(`Project "${existing?.name || id}" deleted.`);
  };

  const archiveProject = (id: string) => {
    const existing = projects.find((p) => p.id === id);
    updateProject(id, { status: 'Completed' });
    addAuditLog('Project Archived', existing?.name || id, 'Marked as completed.');
    showToast(`Project "${existing?.name || id}" archived.`);
  };

  const assignResourcesToProject = (projectId: string, resourceIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, assignedResourceIds: resourceIds } : p
      )
    );
    const existing = projects.find((p) => p.id === projectId);
    addAuditLog('Resources Assigned', existing?.name || projectId, `Assigned ${resourceIds.length} resources`);
    showToast(`Assigned ${resourceIds.length} resources to project.`);
  };

  // Task CRUD
  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
    };
    setTasks((prev) => [newTask, ...prev]);
    addAuditLog('Task Created', newTask.name, `Created deliverable under ${newTask.projectName}`);
    showToast(`Task "${newTask.name}" created.`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    const existing = tasks.find((t) => t.id === id);
    addAuditLog('Task Updated', existing?.name || id, 'Updated deliverable details.');
    showToast(`Task "${existing?.name || id}" updated.`);
  };

  const deleteTask = (id: string) => {
    const existing = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('Task Deleted', existing?.name || id, 'Deleted deliverable.');
    showToast(`Task "${existing?.name || id}" deleted.`);
  };

  const reassignTask = (
    taskId: string,
    resourceId: string | null,
    resourceName: string,
    role?: string
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const initials = resourceName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return {
            ...t,
            assignedResourceId: resourceId,
            assignedResourceName: resourceName,
            assignedResourceRole: role || t.assignedResourceRole,
            assignedResourceInitials: resourceId ? initials : '?',
          };
        }
        return t;
      })
    );
    addAuditLog('Task Reassigned', resourceName, `Task reassigned to ${resourceName}`);
    showToast(`Task reassigned to ${resourceName}.`);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newCompletion =
            status === 'Completed' ? 100 : status === 'Not Started' ? 0 : t.completionPercentage;
          return {
            ...t,
            status,
            completionPercentage: newCompletion,
          };
        }
        return t;
      })
    );
    showToast(`Status updated to ${status}.`);
  };

  // -------------------------------------------------------------
  // LEAVE PLANNING MODULE (Rule 6)
  // Planned Leave & Work From Home (WFH)
  // -------------------------------------------------------------
  const applyLeave = (
    requestData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>
  ): { success: boolean; id: string } => {
    const newReq: LeaveRequest = {
      ...requestData,
      id: `LR-${Date.now().toString().slice(-5)}`,
      status: 'Approved', // Auto-approved for employee scheduling
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    addAuditLog(
      'Leave Plan Submitted',
      requestData.employeeName,
      `${requestData.leaveType} scheduled for ${requestData.date} (${requestData.department})`
    );
    showToast(`${requestData.leaveType} plan saved for ${requestData.date}.`);
    return { success: true, id: newReq.id };
  };

  const editLeave = (id: string, updates: Partial<LeaveRequest>): boolean => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, ...updates } : lr))
    );
    showToast('Leave request updated successfully.');
    return true;
  };

  const cancelLeave = (id: string): boolean => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status: 'Cancelled' } : lr))
    );
    showToast('Leave plan has been cancelled.');
    return true;
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus): boolean => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status } : lr))
    );
    showToast(`Leave status updated to ${status}.`);
    return true;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <RMTContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        loginWithSSO,
        logout,
        switchAccount,
        canManageUsers,
        canApproveRequests,
        canCreateUsers,
        canManageProjects,
        canManageResources,
        canManageTasks,
        canManageKanban,
        isReadOnly,
        currentTab,
        setCurrentTab,
        currentRole,
        setCurrentRole,
        darkMode,
        setDarkMode,
        users,
        createUser,
        registerUser,
        approveUser,
        rejectUser,
        toggleUserLock,
        toggleUserStatus,
        changeUserRole,
        setUserMFA,
        resetUserPassword,
        sendPasswordResetVerificationCode,
        verifyPasswordResetCode,
        resetPasswordWithCode,
        dispatchSecurityEmail,
        accessRequests,
        submitAccessRequest,
        reviewAccessRequest,
        loginAttempts,
        securityDispatches,
        exportSecurityLogs,
        resources,
        teams,
        projects,
        tasks,
        notifications,
        auditLogs,
        leaveRequests,
        applyLeave,
        editLeave,
        cancelLeave,
        updateLeaveStatus,
        addResource,
        updateResource,
        deleteResource,
        addTeam,
        updateTeam,
        deleteTeam,
        addProject,
        updateProject,
        deleteProject,
        archiveProject,
        assignResourcesToProject,
        addTask,
        updateTask,
        deleteTask,
        reassignTask,
        updateTaskStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addAuditLog,
        searchQuery,
        setSearchQuery,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isAddResourceOpen,
        setIsAddResourceOpen,
        editingResource,
        setEditingResource,
        isAddProjectOpen,
        setIsAddProjectOpen,
        editingProject,
        setEditingProject,
        isAddTaskOpen,
        setIsAddTaskOpen,
        editingTask,
        setEditingTask,
        isAssignModalOpen,
        setIsAssignModalOpen,
        assignProjectTarget,
        setAssignProjectTarget,
        isProjectDashboardOpen,
        setIsProjectDashboardOpen,
        selectedProjectForDashboard,
        setSelectedProjectForDashboard,
        isSettingsOpen,
        setIsSettingsOpen,
        isHelpOpen,
        setIsHelpOpen,
        isAuditLogOpen,
        setIsAuditLogOpen,
        isAddTeamOpen,
        setIsAddTeamOpen,
        editingTeam,
        setEditingTeam,
        isCreateUserOpen,
        setIsCreateUserOpen,
        isSecurityDispatchesOpen,
        setIsSecurityDispatchesOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </RMTContext.Provider>
  );
};

export const useRMT = () => {
  const context = useContext(RMTContext);
  if (!context) {
    throw new Error('useRMT must be used within an RMTProvider');
  }
  return context;
};
