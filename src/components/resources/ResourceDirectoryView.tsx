import React, { useState, useMemo, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Resource } from '../../types';
import {
  Download,
  Plus,
  Search,
  FilterX,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  X,
} from 'lucide-react';

export const ResourceDirectoryView: React.FC = () => {
  const {
    resources,
    teams,
    setIsAddResourceOpen,
    setEditingResource,
    updateResource,
    currentRole,
    showToast,
  } = useRMT();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [editingIdResourceId, setEditingIdResourceId] = useState<string | null>(null);
  const [inlineUserId, setInlineUserId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.currentTask.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTeam = selectedTeam === 'All Teams' || res.team === selectedTeam;
      const matchSkill =
        selectedSkill === 'All Skills' ||
        res.skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()));

      return matchSearch && matchTeam && matchSkill;
    });
  }, [resources, searchTerm, selectedTeam, selectedSkill]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));

  // Automatically keep current page in bounds when resources are added or removed
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredResources.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredResources.length);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTeam('All Teams');
    setSelectedSkill('All Skills');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['User ID', 'Resource Name', 'Email', 'Team', 'Team Lead', 'Capacity (%)', 'Availability Status', 'Assigned Project', 'Current Task'],
      ...filteredResources.map((r) => [
        r.id,
        r.name,
        r.email,
        r.team,
        r.teamLead,
        `${r.capacity}%`,
        r.availabilityStatus,
        r.assignedProject,
        r.currentTask,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `resource_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Resource list exported to CSV.');
  };

  const canEdit = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';

  const handleStartEditId = (res: Resource) => {
    if (!canEdit) return;
    setEditingIdResourceId(res.id);
    setInlineUserId(res.id);
  };

  const handleSaveInlineId = (oldId: string) => {
    const trimmed = inlineUserId.trim().toUpperCase();
    if (!trimmed) {
      showToast('User ID cannot be empty.');
      return;
    }
    if (trimmed === oldId) {
      setEditingIdResourceId(null);
      return;
    }
    const success = updateResource(oldId, { id: trimmed });
    if (success !== false) {
      setEditingIdResourceId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* PAGE HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Resource Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain complete employee resource information.
          </p>
        </div>
        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCsv}
            type="button"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Resource List</span>
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setEditingResource(null);
                setIsAddResourceOpen(true);
              }}
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Resource</span>
            </button>
          )}
        </div>
      </section>

      {/* CONTROLS & FUNCTIONS BAR */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Resource Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by resource name, ID, email, or task..."
            className="w-full h-9 pl-9 pr-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter by Team */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 font-medium hidden sm:inline">Team:</label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-7 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Skill */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 font-medium hidden sm:inline">Skill:</label>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 pl-3 pr-7 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option>All Skills</option>
              <option>Firmware / C++</option>
              <option>Embedded Linux</option>
              <option>AUTOSAR</option>
              <option>Hardware Design</option>
              <option>Cloud / Go</option>
              <option>QA Automation</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetFilters}
            title="Reset Filters"
            type="button"
            className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* RESOURCE DIRECTORY DATA TABLE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4" scope="col">User ID</th>
                <th className="py-3 px-4 min-w-[220px]" scope="col">Resource Name &amp; Email</th>
                <th className="py-3 px-4" scope="col">Team</th>
                <th className="py-3 px-4" scope="col">Team Lead</th>
                <th className="py-3 px-4 min-w-[130px]" scope="col">Capacity (%)</th>
                <th className="py-3 px-4" scope="col">Availability Status</th>
                <th className="py-3 px-4" scope="col">Assigned Project</th>
                <th className="py-3 px-4 min-w-[200px]" scope="col">Current Task</th>
                <th className="py-3 px-4 text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedResources.map((res) => {
                // Color badges exactly matching mockups
                const isFull = res.availabilityStatus === 'Fully Allocated';
                const isPart = res.availabilityStatus === 'Partially Allocated';
                const isAvail = res.availabilityStatus === 'Available';
                const isOnLeave = res.availabilityStatus === 'On Leave';

                return (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    {/* User ID (Editable) */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {editingIdResourceId === res.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={inlineUserId}
                            onChange={(e) => setInlineUserId(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineId(res.id);
                              if (e.key === 'Escape') setEditingIdResourceId(null);
                            }}
                            autoFocus
                            className="w-28 h-7 px-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-blue-500 rounded text-blue-700 dark:text-blue-300 focus:outline-none uppercase shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineId(res.id)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                            title="Save User ID"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIdResourceId(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 group/uid">
                          <span>{res.id}</span>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStartEditId(res)}
                              className="opacity-0 group-hover/uid:opacity-100 p-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
                              title="Click to edit User ID"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Resource Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {res.avatar ? (
                          <img
                            src={res.avatar}
                            alt={res.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {res.initials}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {res.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {res.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-fit">
                          {res.team}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Lead: {res.teamLead}
                        </span>
                      </div>
                    </td>

                    {/* Team Lead */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {res.teamLead}
                    </td>

                    {/* Capacity (%) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-mono font-medium">
                          <span>{res.capacity}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              res.capacity > 100
                                ? 'bg-red-600'
                                : res.capacity >= 80
                                ? 'bg-blue-700'
                                : res.capacity > 0
                                ? 'bg-teal-600'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(res.capacity, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Availability Status */}
                    <td className="py-3.5 px-4">
                      {isFull && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                          Fully Allocated
                        </span>
                      )}
                      {isPart && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Partially Allocated
                        </span>
                      )}
                      {isAvail && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                          Available
                        </span>
                      )}
                      {isOnLeave && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          On Leave
                        </span>
                      )}
                    </td>

                    {/* Assigned Project */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono ${
                          res.assignedProject === 'Unassigned'
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                            : 'bg-blue-50/60 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300'
                        }`}
                      >
                        {res.assignedProject}
                      </span>
                    </td>

                    {/* Current Task */}
                    <td
                      className={`py-3.5 px-4 truncate max-w-xs ${
                        res.assignedProject === 'Unassigned'
                          ? 'text-slate-400 italic'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                      title={res.currentTask}
                    >
                      {res.currentTask}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end">
                        <button
                          onClick={() => {
                            if (canEdit) {
                              setEditingResource(res);
                              setIsAddResourceOpen(true);
                            }
                          }}
                          className={`p-1.5 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                            !canEdit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title={canEdit ? 'Edit Resource' : 'Read-only: Edit restricted'}
                          type="button"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <footer className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs">
          <div className="text-slate-500">
            Showing <span className="font-semibold text-slate-900 dark:text-white font-mono">{startIndex}</span> to{' '}
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {endIndex}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {filteredResources.length}
            </span>{' '}
            {filteredResources.length === 1 ? 'resource' : 'resources'}
            {filteredResources.length !== resources.length && (
              <span className="ml-1 text-slate-400 font-normal">
                (filtered from {resources.length} total)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  className={`w-7 h-7 rounded-lg font-mono font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
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
              disabled={currentPage === totalPages || filteredResources.length === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
