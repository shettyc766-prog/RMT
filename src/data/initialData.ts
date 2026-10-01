import { Resource, Team, Project, Task, NotificationItem, AuditLog } from '../types';

export const INITIAL_RESOURCES: Resource[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-INIT-01',
    user: 'Chethan',
    role: 'Super Admin',
    action: 'System Bootstrapped',
    target: 'Workspace Database',
    details: 'Enterprise workforce management initialized with database-driven records.',
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'TEAM-01',
    name: 'Embedded Systems',
    lead: 'Chethan',
    leadEmail: 'chethan.shetty@aumovio.com',
    description: 'Microcontroller firmware, low-level drivers, and real-time RTOS kernels.',
    resourceCount: 0,
    totalCapacityHours: 0,
    allocatedHours: 0,
    occupancyPercentage: 0,
    activeProjects: [],
  },
  {
    id: 'TEAM-02',
    name: 'Hardware Engineering',
    lead: 'Chethan',
    leadEmail: 'chethan.shetty@aumovio.com',
    description: 'Schematic capture, high-speed PCB layouts, power electronics, and EMC compliance.',
    resourceCount: 0,
    totalCapacityHours: 0,
    allocatedHours: 0,
    occupancyPercentage: 0,
    activeProjects: [],
  },
  {
    id: 'TEAM-03',
    name: 'Software Development',
    lead: 'Chethan',
    leadEmail: 'chethan.shetty@aumovio.com',
    description: 'Core application backends, web portals, microservices, and distributed architecture.',
    resourceCount: 0,
    totalCapacityHours: 0,
    allocatedHours: 0,
    occupancyPercentage: 0,
    activeProjects: [],
  },
  {
    id: 'TEAM-04',
    name: 'Cloud Platforms & Infrastructure',
    lead: 'Chethan',
    leadEmail: 'chethan.shetty@aumovio.com',
    description: 'Cloud native infrastructure, Kubernetes orchestration, telemetry, and CI/CD pipelines.',
    resourceCount: 0,
    totalCapacityHours: 0,
    allocatedHours: 0,
    occupancyPercentage: 0,
    activeProjects: [],
  },
  {
    id: 'TEAM-05',
    name: 'QA & Hardware Validation',
    lead: 'Chethan',
    leadEmail: 'chethan.shetty@aumovio.com',
    description: 'Automated test benches, environmental stress screening, and quality gates.',
    resourceCount: 0,
    totalCapacityHours: 0,
    allocatedHours: 0,
    occupancyPercentage: 0,
    activeProjects: [],
  },
];
