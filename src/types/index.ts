export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Project Manager'
  | 'Team Lead'
  | 'Resource'
  | 'Viewer';

export type UserAccountStatus =
  | 'Active'
  | 'Pending Approval'
  | 'Locked'
  | 'Deactivated'
  | 'Rejected';

export interface EnterpriseUser {
  id: string; // e.g. 'USR-001'
  username: string; // e.g. 'alex.vance'
  name: string; // e.g. 'Alex Vance'
  email: string; // e.g. 'alex.vance@company.com'
  role: UserRole;
  title: string;
  department: string;
  employeeId?: string;
  mobileNumber?: string;
  managerName?: string;
  avatar?: string;
  initials: string;
  status: UserAccountStatus;
  passwordHash: string; // bcrypt hash
  failedLoginAttempts: number;
  lockoutUntil?: string | null;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLogin?: string;
  lastLoginIp?: string;
}

export type AuthUser = EnterpriseUser;

export type AccessRequestStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'More Info Requested';

export interface AccessRequest {
  id: string; // e.g. 'REQ-88421'
  employeeName: string;
  employeeId: string; // e.g. 'EMP-1049'
  email: string;
  department: string;
  managerName: string;
  requestedRole: UserRole;
  justification?: string;
  status: AccessRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface LoginAttempt {
  id: string;
  timestamp: string;
  usernameOrEmail: string;
  userId?: string;
  userRole?: UserRole;
  ipAddress: string;
  browser: string;
  device: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED_LOCKED' | 'BLOCKED_PENDING' | 'MFA_REQUIRED';
  reason?: string;
}

export type SecurityEmailType =
  | 'Account Created'
  | 'Account Approved'
  | 'Password Reset'
  | 'Account Locked'
  | 'Access Request Update';

export interface SecurityEmailDispatch {
  id: string;
  recipientEmail: string;
  recipientName: string;
  type: SecurityEmailType;
  subject: string;
  body: string;
  sentAt: string;
  status: 'Delivered' | 'Pending';
  tokenOrCode?: string;
}

export type AvailabilityStatus =
  | 'Available'
  | 'Partially Allocated'
  | 'Fully Allocated'
  | 'On Leave';

export type ProjectStatus =
  | 'Planned'
  | 'Active'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Blocked'
  | 'Review'
  | 'Completed';

export interface Resource {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  team: string;
  teamLead: string;
  roleTitle: string;
  capacity: number; // e.g. 100
  availabilityStatus: AvailabilityStatus;
  assignedProject: string;
  currentTask: string;
  skills: string[];
  location?: string;
  weeklyAvailableHours: number;
}

export interface Team {
  id: string;
  name: string;
  lead: string;
  leadEmail: string;
  description: string;
  resourceCount: number;
  totalCapacityHours: number;
  allocatedHours: number;
  occupancyPercentage: number;
  activeProjects: string[];
}

export interface Project {
  id: string;
  name: string;
  team: string;
  teamLead: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  assignedResourceIds: string[];
  completionPercentage: number;
  description: string;
  priority: TaskPriority;
  plannedHours: number;
  actualHours: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  projectName: string;
  projectId?: string;
  assignedResourceId: string | null;
  assignedResourceName: string;
  assignedResourceRole?: string;
  assignedResourceAvatar?: string;
  assignedResourceInitials?: string;
  team: string;
  priority: TaskPriority;
  status: TaskStatus;
  plannedHours: number;
  actualHours: number;
  startDate: string;
  dueDate: string;
  completionPercentage: number;
  isBlocked?: boolean;
  blockedReason?: string;
  isOverBudget?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'overallocation' | 'deadline' | 'capacity' | 'unassigned' | 'approval' | 'security';
  timestamp: string;
  read: boolean;
  linkToTab?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  userId?: string;
  role: UserRole;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  browser?: string;
  device?: string;
}

export type ActiveTab =
  | 'Dashboard'
  | 'Teams'
  | 'Resource Directory'
  | 'Projects'
  | 'Task Details'
  | 'Resource Allocation'
  | 'Leave Planner'
  | 'Reports'
  | 'Administration';

export type LeaveType = 'Planned Leave' | 'Work From Home';
export type LeaveStatus = 'Approved' | 'Pending Review' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  leaveType: LeaveType;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
}
