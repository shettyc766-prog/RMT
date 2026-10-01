import React, { useState, useMemo, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import {
  Download,
  Plus,
  Search,
  FilterX,
  AlertTriangle,
  Lock,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  TrendingUp,
  PieChart,
  BarChart2,
  FileSpreadsheet,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns,
} from 'lucide-react';

export const TaskDetailsView: React.FC = () => {
  const {
    tasks,
    resources,
    projects,
    teams,
    setIsAddTaskOpen,
    setEditingTask,
    deleteTask,
    reassignTask,
    updateTaskStatus,
    currentRole,
    currentUser,
    showToast,
    setCurrentTab,
  } = useRMT();

  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('All');
  const [reassignModalTask, setReassignModalTask] = useState<Task | null>(null);
  const [statusModalTask, setStatusModalTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Section 7: Kanban Board Access Control
  const canManageKanban =
    currentRole === 'Super Admin' ||
    currentRole === 'Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Team Lead';

  const canEdit = canManageKanban;
  const canDelete = canManageKanban;
  const isResourceRole = currentRole === 'Resource';
  const isViewerRole = currentRole === 'Viewer';

  // Filtered deliverables (Rule 7: Resources view assigned tasks only)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isResourceRole && currentUser) {
        const isAssigned =
          t.assignedResourceId === currentUser.id ||
          t.assignedResourceName.toLowerCase() === currentUser.name.toLowerCase();
        if (!isAssigned) return false;
      }

      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedResourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProject = selectedProject === 'All Projects' || t.projectName === selectedProject;
      const matchTeam = selectedTeam === 'All Teams' || t.team === selectedTeam;
      const matchPriority = selectedPriority === 'All Priorities' || t.priority === selectedPriority;
      const matchStatus = activeFilterStatus === 'All' || t.status === activeFilterStatus;

      return matchSearch && matchProject && matchTeam && matchPriority && matchStatus;
    });
  }, [tasks, searchQuery, selectedProject, selectedTeam, selectedPriority, activeFilterStatus, isResourceRole, currentUser]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

  // Automatically keep current page in bounds when tasks change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredTasks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredTasks.length);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Keep only necessary pages
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Counts for pills
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const reviewCount = tasks.filter((t) => t.status === 'Review').length;
  const blockedCount = tasks.filter((t) => t.status === 'Blocked').length;
  const notStartedCount = tasks.filter((t) => t.status === 'Not Started').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProject('All Projects');
    setSelectedTeam('All Teams');
    setSelectedPriority('All Priorities');
    setActiveFilterStatus('All');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Task ID', 'Deliverable Name', 'Project', 'Assigned Personnel', 'Team', 'Priority', 'Status', 'Planned Hours', 'Actual Hours', 'Due Date', 'Completion %'],
      ...filteredTasks.map((t) => [
        t.id,
        t.name,
        t.projectName,
        t.assignedResourceName,
        t.team,
        t.priority,
        t.status,
        t.plannedHours.toString(),
        t.actualHours.toString(),
        t.dueDate,
        `${t.completionPercentage}%`,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `deliverables_sprint_q4_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Deliverables exported to CSV.');
  };

  // Dynamic alerts & operational calculations from Task & Resource tables
  const unassignedTasksCount = tasks.filter(
    (t) => !t.assignedResourceId || t.assignedResourceId === 'unassigned' || t.assignedResourceName === 'Unassigned'
  ).length;
  const overAllocatedStaffCount = resources.filter((r) => r.capacity > 100).length;
  const totalCapacityHours = resources.reduce((sum, r) => sum + r.weeklyAvailableHours, 0);
  const totalAllocatedHours = resources.reduce(
    (sum, r) => sum + Math.round((r.weeklyAvailableHours * r.capacity) / 100),
    0
  );
  const overallOccupancyPct =
    totalCapacityHours > 0
      ? Math.min(100, Math.round((totalAllocatedHours / totalCapacityHours) * 100))
      : 0;
  const avgHoursVariance =
    tasks.length > 0
      ? (tasks.reduce((sum, t) => sum + Math.abs(t.actualHours - t.plannedHours), 0) / tasks.length).toFixed(1)
      : '0.0';

  return (
    <div className="flex flex-col gap-5">
      {/* SECTION 1: Header & Quick Actions */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Task Details
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Live Database Deliverables
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Task Management Module - Track deliverables, execution timelines, workload balance, and resource allocation.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Table Grid / Allocation Board Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-750 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Table Grid</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-slate-100 dark:bg-slate-750 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Kanban Board</span>
            </button>
          </div>

          {/* Export Report Trigger */}
          <button
            onClick={handleExportCsv}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* Primary Button: + Add Task */}
          {canEdit && (
            <button
              onClick={() => {
                setEditingTask(null);
                setIsAddTaskOpen(true);
              }}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </section>

      {/* Role Access Notice (Rule 7) */}
      {isResourceRole && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Resource Access Mode:</strong> Viewing deliverables assigned to you ({currentUser?.name || 'Current User'}). Kanban Board change permissions are restricted to Super Admin, Project Manager, and Project Lead.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-[10px] font-bold uppercase">
            Assigned Only
          </span>
        </div>
      )}
      {isViewerRole && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Viewer Access Mode:</strong> Read-only access. Kanban Board change permissions are restricted to Super Admin, Project Manager, and Project Lead.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold uppercase">
            Read-Only
          </span>
        </div>
      )}

      {/* SECTION 2: Capacity Alerts Banner & Operational Metrics */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Alerts & Pills (Span 8) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between gap-3">
          {/* Top alert strip */}
          <div className="flex items-center justify-between gap-3 p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-lg">
            <div className="flex items-center gap-2">
              {blockedCount > 0 || overAllocatedStaffCount > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {overAllocatedStaffCount} Over-allocated Staff &bull; {unassignedTasksCount} Unassigned Deliverables &bull; {blockedCount} Blocked Items
              </span>
            </div>
            {blockedCount > 0 ? (
              <button
                onClick={() => setActiveFilterStatus('Blocked')}
                className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline shrink-0"
              >
                Review {blockedCount} Blocked &rarr;
              </button>
            ) : (
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Healthy Execution
              </span>
            )}
          </div>

          {/* Filter Status Pills Navigation */}
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveFilterStatus('All')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'All'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>All Tasks</span>
              <span className="px-1.5 py-0.2 bg-white/20 dark:bg-slate-700 rounded-full text-[10px] font-mono">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterStatus('In Progress')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'In Progress'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>In Progress</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                {inProgressCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterStatus('Review')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'Review'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Review</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                {reviewCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterStatus('Blocked')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'Blocked'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>Blocked</span>
              <span className="font-mono font-bold">{blockedCount}</span>
            </button>

            <button
              onClick={() => setActiveFilterStatus('Not Started')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'Not Started'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Not Started</span>
              <span className="font-mono font-bold text-slate-500">{notStartedCount}</span>
            </button>

            <button
              onClick={() => setActiveFilterStatus('Completed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilterStatus === 'Completed'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Completed</span>
              <span className="font-mono font-bold">{completedCount}</span>
            </button>
          </div>
        </div>

        {/* Team Capacity Dashboard Widget (Span 4) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">monitoring</span>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Team Capacity Dashboard
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded">
              Live Database
            </span>
          </div>

          <div className="my-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-500">Overall Allocation Load</span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                {overallOccupancyPct}% <span className="text-[11px] font-normal text-slate-400">/ 100% Total Capacity</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-blue-700 h-full transition-all" style={{ width: `${overallOccupancyPct}%` }}></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Sprint Runway Variance:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {avgHoursVariance}h avg variance
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Search & Advanced Filtering Suite */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col gap-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Search input (Span 4) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by task name, project, or resource..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Filter by Project (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.team} - Lead: {p.teamLead})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Team (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} (Lead: {t.lead})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Priority (Span 2) */}
          <div className="lg:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px]">Applied Filters:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700">
              Sprint: Active Q4
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700">
              Sort: Priority (High &rarr; Low)
            </span>
            {activeFilterStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px]">
                Status: {activeFilterStatus}
                <button onClick={() => setActiveFilterStatus('All')}>&times;</button>
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="text-blue-700 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      </section>

      {/* SECTION 4: View Mode Rendering (Table Grid vs Kanban) */}
      {viewMode === 'kanban' ? (
        <TaskKanbanBoard
          tasks={filteredTasks}
          canEdit={canEdit}
          canDelete={canDelete}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsAddTaskOpen(true);
          }}
          onDeleteTask={(taskId) => {
            deleteTask(taskId);
          }}
          onStatusChange={(taskId, newStatus) => {
            updateTaskStatus(taskId, newStatus);
          }}
          onAddTaskWithStatus={(status) => {
            setEditingTask(null);
            setIsAddTaskOpen(true);
          }}
        />
      ) : (
        /* TABLE GRID VIEW - EXACT MATCH WITH IMAGE 9 */
        <section
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden flex flex-col"
          id="table-container"
        >
          {/* Table Header strip */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-[18px]">table_chart</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Deliverable Execution Grid
              </span>
              <span className="text-slate-500 text-[11px]">
                (Showing {paginatedTasks.length} of {tasks.length} tasks)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Over-budget hours
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Milestone locked
              </span>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[280px]">Task Name &amp; Description</th>
                  <th className="py-3 px-3 w-[160px]">Project Name</th>
                  <th className="py-3 px-3 w-[180px]">Assigned Resource</th>
                  <th className="py-3 px-3 w-[120px]">Team</th>
                  <th className="py-3 px-3 w-[110px]">Priority</th>
                  <th className="py-3 px-3 w-[130px]">Status</th>
                  <th className="py-3 px-3 w-[140px]">Planned vs Actual</th>
                  <th className="py-3 px-3 w-[170px]">Start &amp; Due Date</th>
                  <th className="py-3 px-3 w-[130px]">Completion %</th>
                  <th className="py-3 px-4 w-[80px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
                {paginatedTasks.map((t) => {
                  const runway = t.plannedHours - t.actualHours;
                  const isOver = t.actualHours > t.plannedHours;

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors ${
                        t.isBlocked ? 'over-allocated-stripe' : ''
                      }`}
                    >
                      {/* Task Name & Description */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-[13px]">
                              {t.name}
                            </span>
                            {t.isBlocked && (
                              <span
                                className="material-symbols-outlined text-red-600 text-[16px]"
                                title={t.blockedReason || 'Blocked deliverable'}
                              >
                                lock
                              </span>
                            )}
                          </div>
                          <span
                            className="text-slate-500 text-[11px] truncate max-w-[260px]"
                            title={t.description}
                          >
                            {t.description}
                          </span>
                        </div>
                      </td>

                      {/* Project Name */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {t.projectName}
                        </span>
                      </td>

                      {/* Assigned Resource */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {t.assignedResourceAvatar ? (
                            <img
                              src={t.assignedResourceAvatar}
                              alt={t.assignedResourceName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-600">
                              {t.assignedResourceInitials || '?'}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-[12px] text-slate-900 dark:text-slate-100">
                              {t.assignedResourceName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {t.assignedResourceRole || 'Engineer'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-3">
                        {(() => {
                          const taskProject = projects.find(
                            (p) => p.name === t.projectName || p.id === t.projectId
                          );
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-fit">
                                {t.team}
                              </span>
                              {taskProject?.teamLead && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  Lead: <strong className="font-semibold text-slate-700 dark:text-slate-300">{taskProject.teamLead}</strong>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        {t.priority === 'Critical' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300">
                            Critical
                          </span>
                        )}
                        {t.priority === 'High' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                            High
                          </span>
                        )}
                        {t.priority === 'Medium' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                            Medium
                          </span>
                        )}
                        {t.priority === 'Low' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            Low
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {t.status === 'In Progress' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            In Progress
                          </span>
                        )}
                        {t.status === 'Blocked' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300">
                            <span className="material-symbols-outlined text-[13px]">block</span>
                            Blocked
                          </span>
                        )}
                        {t.status === 'Review' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-300">
                            <span className="material-symbols-outlined text-[13px]">rate_review</span>
                            Review
                          </span>
                        )}
                        {t.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border border-teal-300">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Completed
                          </span>
                        )}
                        {t.status === 'Not Started' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Not Started
                          </span>
                        )}
                      </td>

                      {/* Planned vs Actual */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col font-mono text-[12px]">
                          <span
                            className={`font-semibold ${
                              isOver ? 'text-red-600 font-bold' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {t.plannedHours}h / {t.actualHours}h {isOver ? '(Over)' : ''}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isOver
                                ? 'text-red-600 font-medium'
                                : runway > 0
                                ? 'text-teal-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {isOver
                              ? `+${Math.abs(runway)}h variance logged`
                              : runway > 0
                              ? `${runway}h remaining runway`
                              : 'Delivered on schedule'}
                          </span>
                        </div>
                      </td>

                      {/* Start & Due Date */}
                      <td className="py-3 px-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                        {t.startDate} &ndash; {t.dueDate}
                      </td>

                      {/* Completion % */}
                      <td className="py-3 px-3">
                        <div className="w-full">
                          <div className="flex justify-between text-[11px] font-mono font-semibold mb-1">
                            <span>{t.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.status === 'Blocked'
                                  ? 'bg-red-600'
                                  : t.completionPercentage === 100
                                  ? 'bg-teal-600'
                                  : t.status === 'Review'
                                  ? 'bg-purple-600'
                                  : 'bg-blue-700'
                              }`}
                              style={{ width: `${t.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingTask(t);
                                setIsAddTaskOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Deliverable"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete deliverable ${t.name}?`)) {
                                  deleteTask(t.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Deliverable"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="p-1 text-slate-300 dark:text-slate-600" title="Read-only: Edit restricted to Admin & Project Manager">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Row Actions helper bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            {canEdit ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Available Row Actions:
                  </span>
                  <span
                    onClick={() => {
                      if (tasks[0]) {
                        setEditingTask(tasks[0]);
                        setIsAddTaskOpen(true);
                      }
                    }}
                    className="cursor-pointer hover:text-blue-700 underline"
                  >
                    Edit Task
                  </span>{' '}
                  &bull;
                  <span
                    onClick={() => {
                      if (tasks[0]) {
                        setEditingTask(tasks[0]);
                        setIsAddTaskOpen(true);
                      }
                    }}
                    className="cursor-pointer hover:text-blue-700 underline"
                  >
                    Reassign Task
                  </span>{' '}
                  &bull;
                  <span
                    onClick={() => {
                      if (tasks[0]) {
                        updateTaskStatus(tasks[0].id, 'Completed');
                      }
                    }}
                    className="cursor-pointer hover:text-blue-700 underline"
                  >
                    Update Status
                  </span>
                </div>
                <span className="italic text-[11px] hidden sm:inline">
                  Click edit icon on any row to modify hours, dates and status
                </span>
              </>
            ) : (
              <div className="flex items-center justify-between w-full text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Viewing as <strong>{currentRole}</strong> (Read-Only). Task editing is restricted to <strong>Admin</strong> and <strong>Project Manager</strong>.</span>
                </span>
                <span className="italic text-slate-400 hidden sm:inline">
                  Switch to Admin or Project Manager profile in top bar to edit
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 5: Enterprise Reporting & Intelligence */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Reporting &amp; Intelligence
            </h3>
            <p className="text-xs text-slate-500">
              Generate verified capacity audits, task completion rates, and cross-team productivity rollups.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Batch Download:</span>
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel (.xlsx)
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-red-600" /> PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" /> CSV
            </button>
          </div>
        </div>

        {/* 6 Specialized Report Tiles (Bento Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Report 1 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <PieChart className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Weekly
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Resource Utilization
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Individual burn &amp; idle bench</p>
            </div>
          </div>

          {/* Report 2 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <BarChart2 className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Live
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Team Capacity Report
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Squad load &amp; delta allocations</p>
            </div>
          </div>

          {/* Report 3 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <TrendingUp className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Milestone
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Project Progress
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Epic burndown &amp; sprint health</p>
            </div>
          </div>

          {/* Report 4 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <CheckCircle2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Sprint Q4
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Task Completion
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Cycle time &amp; defect resolution</p>
            </div>
          </div>

          {/* Report 5 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <UserCheck className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                30-Day
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Resource Availability
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Upcoming vacation &amp; bench</p>
            </div>
          </div>

          {/* Report 6 */}
          <div
            onClick={() => setCurrentTab('Reports')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-28"
          >
            <div className="flex items-start justify-between">
              <span className="material-symbols-outlined text-purple-600 text-[20px] group-hover:scale-110 transition-transform">
                speed
              </span>
              <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Monthly
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700">
                Monthly Productivity
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Engineering velocity &amp; KPIs</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Audit & Entra ID Status Footer */}
      <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>
            Last synced with Microsoft Entra ID &bull; RBAC: <strong>{currentRole}</strong> permissions &bull; Showing{' '}
            <strong>{startIndex} to {endIndex}</strong> of <strong>{filteredTasks.length}</strong> tasks
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-slate-400 font-mono text-xs"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded font-mono font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || filteredTasks.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
