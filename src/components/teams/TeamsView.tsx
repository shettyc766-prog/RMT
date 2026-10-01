import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Team, Resource } from '../../types';
import {
  Users,
  Plus,
  Download,
  Edit2,
  Trash2,
  FolderGit2,
  Clock,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Mail,
  Sliders,
} from 'lucide-react';

export const TeamsView: React.FC = () => {
  const {
    teams,
    resources,
    projects,
    tasks,
    setIsAddTeamOpen,
    setEditingTeam,
    deleteTeam,
    setIsAddResourceOpen,
    setEditingResource,
    deleteResource,
    setIsAddTaskOpen,
    setAssignProjectTarget,
    setIsAssignModalOpen,
    currentRole,
    showToast,
  } = useRMT();

  const [selectedTeamName, setSelectedTeamName] = useState<string>(() => teams[0]?.name || 'Embedded Systems');

  const selectedTeam = teams.find((t) => t.name === selectedTeamName) || teams[0];
  const activeSelectedTeamName = selectedTeam?.name || selectedTeamName;
  const teamMembers = resources.filter((r) => r.team === activeSelectedTeamName);
  const teamProjects = projects.filter((p) => p.team === activeSelectedTeamName);
  const teamTasks = tasks.filter((t) => t.team === activeSelectedTeamName);

  const handleExportCsv = () => {
    const csvRows = [
      ['Team ID', 'Team Name', 'Team Lead', 'Lead Email', 'Resource Count', 'Capacity Hours', 'Allocated Hours', 'Occupancy %'],
      ...teams.map((t) => [
        t.id,
        t.name,
        t.lead,
        t.leadEmail,
        t.resourceCount.toString(),
        t.totalCapacityHours.toString(),
        t.allocatedHours.toString(),
        `${t.occupancyPercentage}%`,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `teams_capacity_matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Team matrix exported to CSV.');
  };

  const canEdit = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';
  const canDelete = currentRole === 'Super Admin' || currentRole === 'Admin';

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Teams &amp; Organizational Squads
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize squad capacity, balance occupancy percentages, and configure cross-team personnel.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            type="button"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Team Data</span>
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setEditingTeam(null);
                setIsAddTeamOpen(true);
              }}
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Team</span>
            </button>
          )}
        </div>
      </section>

      {/* TEAM OVERVIEW CARDS (5 Core Teams) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {teams.map((t) => {
          const isSelected = selectedTeamName === t.name;
          const squadProjects = projects.filter((p) => p.team === t.name);
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTeamName(t.name)}
              className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-700 ring-2 ring-blue-700/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTeam(t);
                            setIsAddTeamOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-700"
                          title="Edit Team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && teams.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete team ${t.name}?`)) {
                              deleteTeam(t.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                    <span className="text-slate-400 font-normal">Team Lead:</span>
                    <span className="font-semibold">{t.lead}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mb-3 line-clamp-2">
                  {t.description}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Headcount:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {t.resourceCount} Members
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Capacity:</span>
                    <span className="font-mono text-[11px]">
                      {t.allocatedHours}h / {t.totalCapacityHours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Occupancy:</span>
                  <span
                    className={`font-mono ${
                      t.occupancyPercentage >= 90
                        ? 'text-red-600'
                        : t.occupancyPercentage >= 80
                        ? 'text-blue-700'
                        : 'text-teal-600'
                    }`}
                  >
                    {t.occupancyPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      t.occupancyPercentage >= 90
                        ? 'bg-red-500'
                        : t.occupancyPercentage >= 80
                        ? 'bg-blue-700'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${t.occupancyPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>Active Projects:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {squadProjects.length}
                  </span>
                </div>

                {squadProjects.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Projects &amp; Leads
                    </div>
                    {squadProjects.slice(0, 2).map((p) => (
                      <div key={p.id} className="text-[11px] flex items-center justify-between gap-1 text-slate-600 dark:text-slate-300">
                        <span className="truncate max-w-[110px] font-medium">{p.name}</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                          Lead: {p.teamLead}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* TEAM RESOURCE MANAGEMENT DRILL-DOWN */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-5">
        {/* Selected Team Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedTeam?.name} Team Management
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold font-mono">
                {teamMembers.length} Staff Configured
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Team Lead: <strong>{selectedTeam?.lead}</strong> ({selectedTeam?.leadEmail}) &bull;{' '}
              {selectedTeam?.description}
            </p>
          </div>

          {/* Quick Team Member Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setEditingResource(null);
                    setIsAddResourceOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Team Member</span>
                </button>
                <button
                  onClick={() => {
                    if (teamProjects[0]) {
                      setAssignProjectTarget(teamProjects[0]);
                      setIsAssignModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Assign Project</span>
                </button>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Assign Task</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Team Members Grid & Capacity */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Active Team Members &amp; Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamMembers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No active registered personnel currently assigned to {selectedTeam?.name}.
                <br />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New users approved from this department will automatically appear here.
                </span>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                        {member.initials}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{member.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{member.roleTitle}</div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-400 truncate max-w-[180px] mt-0.5">
                        Task: {member.currentTask}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {member.capacity}%
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-1 inline-block ${
                        member.availabilityStatus === 'Available'
                          ? 'bg-teal-100 text-teal-800'
                          : member.availabilityStatus === 'Fully Allocated'
                          ? 'bg-blue-100 text-blue-800'
                          : member.availabilityStatus === 'Partially Allocated'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {member.availabilityStatus}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingResource(member);
                            setIsAddResourceOpen(true);
                          }}
                          className="text-slate-400 hover:text-blue-700"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from team?`)) {
                              deleteResource(member.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Projects Summary */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Active Projects under {selectedTeam?.name} ({teamProjects.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamProjects.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">({p.id})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Team: <span className="font-medium text-slate-700 dark:text-slate-300">{p.team}</span> &bull; Project Lead: <strong className="text-blue-700 dark:text-blue-400">{p.teamLead}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Timeline: {p.startDate} &ndash; {p.endDate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-700">{p.completionPercentage}%</span>
                  <div className="text-[10px] text-slate-500">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
