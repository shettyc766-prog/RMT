import React, { useState, useMemo, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Project, ProjectStatus } from '../../types';
import {
  Download,
  Plus,
  Search,
  FilterX,
  MoreVertical,
  UserPlus,
  BarChart2,
  Edit2,
  Archive,
  Trash2,
  CheckCircle2,
  PauseCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    resources,
    teams,
    setIsAddProjectOpen,
    setEditingProject,
    deleteProject,
    archiveProject,
    updateProject,
    setAssignProjectTarget,
    setIsAssignModalOpen,
    setSelectedProjectForDashboard,
    setIsProjectDashboardOpen,
    currentRole,
    showToast,
  } = useRMT();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingIdProjectId, setEditingIdProjectId] = useState<string | null>(null);
  const [inlineProjectId, setInlineProjectId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamLead.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchTeam = !teamFilter || p.team === teamFilter;

      return matchSearch && matchStatus && matchTeam;
    });
  }, [projects, searchQuery, statusFilter, teamFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));

  // Automatically keep current page in bounds when projects change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredProjects.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredProjects.length);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

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

  const handleExportCsv = () => {
    const csvRows = [
      ['Project ID', 'Project Name', 'Team', 'Team Lead', 'Start Date', 'End Date', 'Status', 'Completion %'],
      ...filteredProjects.map((p) => [
        p.id,
        p.name,
        p.team,
        p.teamLead,
        p.startDate,
        p.endDate,
        p.status,
        `${p.completionPercentage}%`,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `projects_portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Project list exported to CSV.');
  };

  const canEdit = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canDelete = currentRole === 'Super Admin' || currentRole === 'Admin';

  const handleStartEditId = (prj: Project) => {
    if (!canEdit) return;
    setEditingIdProjectId(prj.id);
    setInlineProjectId(prj.id);
  };

  const handleSaveInlineId = (oldId: string) => {
    const trimmed = inlineProjectId.trim().toUpperCase();
    if (!trimmed) {
      showToast('Project ID cannot be empty.');
      return;
    }
    if (trimmed === oldId) {
      setEditingIdProjectId(null);
      return;
    }
    const success = updateProject(oldId, { id: trimmed });
    if (success !== false) {
      setEditingIdProjectId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage project deliverables, timelines, resource allocation, and progress.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            type="button"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Projects</span>
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsAddProjectOpen(true);
              }}
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Project</span>
            </button>
          )}
        </div>
      </section>

      {/* Filters & Search Toolbar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Table Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Project..."
              className="w-full h-9 pl-9 pr-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="">Filter by Status: All</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Filter by Team */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-9 px-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="">Filter by Team: All</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter || teamFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setTeamFilter('');
              }}
              title="Reset Filters"
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-mono">{paginatedProjects.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white font-mono">{filteredProjects.length}</strong> projects
          </span>
        </div>
      </section>

      {/* PROJECT LIST TABLE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4 min-w-[200px]">Project Name</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Team Lead</th>
                <th className="py-3 px-4 whitespace-nowrap">Start Date</th>
                <th className="py-3 px-4 whitespace-nowrap">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Resources</th>
                <th className="py-3 px-4 min-w-[150px]">Completion %</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-850/30">
                    No active projects found in database matching your criteria.
                    <br />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Use the "+ Add Project" button to create an active deliverable.
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((prj) => {
                  const assignedRes = resources.filter((r) =>
                    prj.assignedResourceIds && prj.assignedResourceIds.includes(r.id)
                  );
                  const assignedCount = assignedRes.length;

                return (
                  <tr
                    key={prj.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    {/* Project ID (Editable) */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {editingIdProjectId === prj.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={inlineProjectId}
                            onChange={(e) => setInlineProjectId(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineId(prj.id);
                              if (e.key === 'Escape') setEditingIdProjectId(null);
                            }}
                            autoFocus
                            className="w-28 h-7 px-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-blue-500 rounded text-blue-700 dark:text-blue-300 focus:outline-none uppercase shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineId(prj.id)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                            title="Save Project ID"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIdProjectId(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 group/pid">
                          <span>{prj.id}</span>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStartEditId(prj)}
                              className="opacity-0 group-hover/pid:opacity-100 p-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
                              title="Click to edit Project ID"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Project Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {prj.name}
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 w-fit">
                          {prj.team}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <span className="text-slate-400 font-normal">Team Lead:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{prj.teamLead}</span>
                        </div>
                      </div>
                    </td>

                    {/* Team Lead */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                          {prj.teamLead.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'TL'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">{prj.teamLead}</span>
                          <span className="text-[10px] text-slate-400 block">{prj.team}</span>
                        </div>
                      </div>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {prj.startDate}
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {prj.endDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prj.status === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                          Active
                        </span>
                      )}
                      {prj.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                          Completed
                        </span>
                      )}
                      {prj.status === 'On Hold' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300">
                          <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                          On Hold
                        </span>
                      )}
                      {prj.status === 'Planned' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200">
                          <Clock className="w-3.5 h-3.5 text-indigo-700" />
                          Planned
                        </span>
                      )}
                      {prj.status === 'Cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-700" />
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Assigned Resources Avatar Stack */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {assignedRes.slice(0, 2).map((r, i) => (
                            <div
                              key={r.id}
                              className={`inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold flex items-center justify-center text-white ${
                                i === 0 ? 'bg-blue-700' : 'bg-teal-600'
                              }`}
                              title={r.name}
                            >
                              {r.initials}
                            </div>
                          ))}
                          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                            +{assignedCount}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {assignedCount} Resources
                        </span>
                      </div>
                    </td>

                    {/* Completion % with Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              prj.status === 'Cancelled'
                                ? 'bg-red-600'
                                : prj.completionPercentage === 100
                                ? 'bg-teal-500'
                                : prj.status === 'On Hold'
                                ? 'bg-amber-500'
                                : 'bg-blue-700'
                            }`}
                            style={{ width: `${prj.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 w-10 text-right">
                          {prj.completionPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-center relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === prj.id ? null : prj.id)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Project Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === prj.id && (
                          <div
                            onMouseLeave={() => setActiveMenuId(null)}
                            className="absolute right-0 top-8 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-100"
                          >
                            <button
                              onClick={() => {
                                setAssignProjectTarget(prj);
                                setIsAssignModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                            >
                              <UserPlus className="w-4 h-4 text-blue-700" />
                              <span>Assign Resources</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProjectForDashboard(prj);
                                setIsProjectDashboardOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                            >
                              <BarChart2 className="w-4 h-4 text-teal-600" />
                              <span>View Project Dashboard</span>
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingProject(prj);
                                  setIsAddProjectOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-slate-400" />
                                <span>Edit Project</span>
                              </button>
                            )}
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                            {canEdit && (
                              <button
                                onClick={() => {
                                  archiveProject(prj.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                              >
                                <Archive className="w-4 h-4 text-slate-400" />
                                <span>Archive Project</span>
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete project ${prj.name}?`)) {
                                    deleteProject(prj.id);
                                  }
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 text-left transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span>Delete Project</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <footer className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing <span className="font-semibold text-slate-900 dark:text-white font-mono">{startIndex}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white font-mono">{endIndex}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white font-mono">{filteredProjects.length}</span> projects
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                  className={`w-7 h-7 rounded font-mono font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredProjects.length === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
