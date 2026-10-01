import React from 'react';
import { useRMT } from '../../context/RMTContext';
import {
  Users,
  UserCheck,
  UserX,
  FolderGit2,
  CheckSquare,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    resources,
    teams,
    projects,
    tasks,
    setCurrentTab,
    setIsAddResourceOpen,
    setIsAddProjectOpen,
    setIsAddTaskOpen,
    setIsAssignModalOpen,
    setAssignProjectTarget,
    auditLogs,
    currentRole,
  } = useRMT();

  // -------------------------------------------------------------
  // DYNAMIC METRICS FROM DATABASE RECORDS (Rules 4, 5, 8, 9)
  // -------------------------------------------------------------
  const totalResourcesCount = resources.length;
  const activeResourcesCount = resources.filter((r) => r.availabilityStatus !== 'On Leave').length;
  const availableResourcesCount = resources.filter((r) => r.availabilityStatus === 'Available').length;
  const allocatedResourcesCount = resources.filter(
    (r) => r.availabilityStatus === 'Partially Allocated' || r.availabilityStatus === 'Fully Allocated'
  ).length;

  // Rule 4: Active projects count directly from Projects table where status = Active
  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length;

  // Rule 5: Open Tasks = Not Started + In Progress + Review + Blocked
  // Excludes Completed, Closed, Cancelled, Archived
  const openTasksCount = tasks.filter(
    (t) =>
      t.status === 'Not Started' ||
      t.status === 'In Progress' ||
      t.status === 'Review' ||
      t.status === 'Blocked'
  ).length;

  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;

  // Dynamic percentages
  const utilizationPct =
    totalResourcesCount > 0 ? Math.round((allocatedResourcesCount / totalResourcesCount) * 100) : 0;
  const benchPct =
    totalResourcesCount > 0 ? Math.round((availableResourcesCount / totalResourcesCount) * 100) : 0;
  const inProgressTaskCount = tasks.filter((t) => t.status === 'In Progress').length;

  // Allocation distribution counts
  const fullyAllocatedCount = resources.filter((r) => r.availabilityStatus === 'Fully Allocated').length;
  const partiallyAllocatedCount = resources.filter((r) => r.availabilityStatus === 'Partially Allocated').length;
  const onLeaveCount = resources.filter((r) => r.availabilityStatus === 'On Leave').length;

  const fullyAllocatedPct =
    totalResourcesCount > 0 ? Math.round((fullyAllocatedCount / totalResourcesCount) * 100) : 0;
  const partiallyAllocatedPct =
    totalResourcesCount > 0 ? Math.round((partiallyAllocatedCount / totalResourcesCount) * 100) : 0;
  const availablePct =
    totalResourcesCount > 0 ? Math.round((availableResourcesCount / totalResourcesCount) * 100) : 0;
  const onLeavePct =
    totalResourcesCount > 0 ? Math.round((onLeaveCount / totalResourcesCount) * 100) : 0;

  // Team overall capacity totals
  const totalWeeklyCapacityHours = resources.reduce((sum, r) => sum + r.weeklyAvailableHours, 0);
  const totalAllocatedHours = resources.reduce(
    (sum, r) => sum + Math.round((r.weeklyAvailableHours * r.capacity) / 100),
    0
  );
  const totalOccupancyPct =
    totalWeeklyCapacityHours > 0
      ? Math.min(100, Math.round((totalAllocatedHours / totalWeeklyCapacityHours) * 100))
      : 0;

  const kpis = [
    {
      label: 'Total Resources',
      value: totalResourcesCount,
      sub: 'Approved registered personnel',
      icon: <Users className="w-5 h-5 text-blue-700" />,
      color: 'border-l-4 border-blue-700',
      badge: `${totalResourcesCount} Active`,
      badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40',
      onClick: () => setCurrentTab('Resource Directory'),
    },
    {
      label: 'Allocated Resources',
      value: allocatedResourcesCount,
      sub: `${utilizationPct}% active utilization`,
      icon: <UserCheck className="w-5 h-5 text-teal-600" />,
      color: 'border-l-4 border-teal-600',
      badge: 'Assigned',
      badgeColor: 'text-teal-700 bg-teal-50 dark:bg-teal-950/40',
      onClick: () => setCurrentTab('Resource Directory'),
    },
    {
      label: 'Available Resources',
      value: availableResourcesCount,
      sub: 'Ready for deployment',
      icon: <UserX className="w-5 h-5 text-amber-600" />,
      color: 'border-l-4 border-amber-600',
      badge: `${benchPct}% bench`,
      badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40',
      onClick: () => setCurrentTab('Resource Directory'),
    },
    {
      label: 'Active Projects',
      value: activeProjectsCount,
      sub: `${projects.length} Total Projects`,
      icon: <FolderGit2 className="w-5 h-5 text-purple-600" />,
      color: 'border-l-4 border-purple-600',
      badge: 'Database Records',
      badgeColor: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40',
      onClick: () => setCurrentTab('Projects'),
    },
    {
      label: 'Open Tasks',
      value: openTasksCount,
      sub: `${inProgressTaskCount} in progress`,
      icon: <CheckSquare className="w-5 h-5 text-indigo-600" />,
      color: 'border-l-4 border-indigo-600',
      badge: 'Not Started / W.I.P',
      badgeColor: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40',
      onClick: () => setCurrentTab('Task Details'),
    },
    {
      label: 'Completed Tasks',
      value: completedTasksCount,
      sub: 'Deliverables verified',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      color: 'border-l-4 border-emerald-600',
      badge: `${tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}% done`,
      badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40',
      onClick: () => setCurrentTab('Task Details'),
    },
  ];

  const canEdit =
    currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Quick Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time organizational resource allocation, capacity forecasting and delivery velocity.
          </p>
        </div>

        {/* Quick Actions Bar */}
        {canEdit && (
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
            <button
              onClick={() => {
                if (projects[0]) {
                  setAssignProjectTarget(projects[0]);
                  setIsAssignModalOpen(true);
                } else {
                  setIsAddProjectOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Assign Resources</span>
            </button>
          </div>
        )}
      </section>

      {/* KPI METRICS (Rule 8: Real-time Database Values) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            onClick={kpi.onClick}
            className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${kpi.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {kpi.icon}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{kpi.sub}</div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${kpi.badgeColor}`}>
                {kpi.badge}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        ))}
      </section>

      {/* VISUAL DATA BREAKDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Overall Resource Allocation Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Resource Allocation Distribution
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {totalResourcesCount} Total Resources
            </span>
          </div>

          {/* Graphical Proportional Bars (Dynamic from live database) */}
          <div className="my-5 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Fully Allocated (100%)
                </span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                  {fullyAllocatedCount} Resources ({fullyAllocatedPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-700 h-full rounded-full transition-all"
                  style={{ width: `${fullyAllocatedPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Partially Allocated
                </span>
                <span className="font-mono font-bold text-amber-600">
                  {partiallyAllocatedCount} Resources ({partiallyAllocatedPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${partiallyAllocatedPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Available for Deployment (0%)
                </span>
                <span className="font-mono font-bold text-teal-600">
                  {availableResourcesCount} Resources ({availablePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all"
                  style={{ width: `${availablePct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  On Leave / Unavailable
                </span>
                <span className="font-mono font-bold text-slate-400">
                  {onLeaveCount} Resources ({onLeavePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all"
                  style={{ width: `${onLeavePct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Capacity Allocation</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {totalOccupancyPct}% occupancy
            </span>
          </div>
        </div>

        {/* Team-wise Resource Distribution (Rule 2) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Team-wise Resource Distribution &amp; Occupancy
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('Teams')}
              className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Teams</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Team Distribution Rows (Dynamic headcount from approved active users) */}
          <div className="my-3 space-y-3">
            {teams.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No teams configured. Use "+ Add Team" in Teams tab.
              </div>
            ) : (
              teams.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Lead: {t.lead}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500 font-semibold">{t.resourceCount} Members</span>
                      <span
                        className={`font-bold ${
                          t.occupancyPercentage >= 90
                            ? 'text-red-600'
                            : t.occupancyPercentage >= 80
                            ? 'text-blue-700'
                            : 'text-teal-600'
                        }`}
                      >
                        {t.occupancyPercentage}% Occupancy
                      </span>
                    </div>
                  </div>
                  {/* Meter */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        t.occupancyPercentage >= 90
                          ? 'bg-red-500'
                          : t.occupancyPercentage >= 80
                          ? 'bg-blue-700'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${t.occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total Available Hours: <strong>{totalWeeklyCapacityHours} h/week</strong>
            </span>
            <span>
              Allocated Hours: <strong>{totalAllocatedHours} h ({totalOccupancyPct}%)</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Activity Trail & Delivery Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Audit Activities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recent Governance &amp; Audit Logs</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Database Logged</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs mt-2">
            {auditLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">No audit logs recorded yet.</div>
            ) : (
              auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-blue-700 dark:text-blue-400 font-mono text-[10px]">
                        {log.target}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Project Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span>Active Project Portfolio</span>
            </h3>
            <button
              onClick={() => setCurrentTab('Projects')}
              className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-semibold"
            >
              View All ({projects.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs mt-2">
            {projects.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No projects in database. Click "+ Add Project" to create your first active deliverable.
              </div>
            ) : (
              projects.slice(0, 4).map((proj) => (
                <div key={proj.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{proj.name}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          proj.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Team: <span className="font-medium text-slate-700 dark:text-slate-300">{proj.team}</span> &bull; Project Lead: <strong className="text-blue-700 dark:text-blue-400">{proj.teamLead}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {proj.completionPercentage}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {proj.assignedResourceIds.length} Assigned
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
