import React from 'react';
import { useRMT } from '../../context/RMTContext';
import {
  X,
  FolderGit2,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Edit,
} from 'lucide-react';

export const ProjectDashboardModal: React.FC = () => {
  const {
    isProjectDashboardOpen,
    setIsProjectDashboardOpen,
    selectedProjectForDashboard,
    setSelectedProjectForDashboard,
    resources,
    tasks,
    setEditingProject,
    setIsAddProjectOpen,
    setAssignProjectTarget,
    setIsAssignModalOpen,
  } = useRMT();

  if (!isProjectDashboardOpen || !selectedProjectForDashboard) return null;

  const project = selectedProjectForDashboard;
  const projectResources = resources.filter((r) =>
    project.assignedResourceIds.includes(r.id)
  );
  const projectTasks = tasks.filter((t) => t.projectName === project.name || t.projectId === project.id);

  const totalPlannedHours = projectTasks.reduce((acc, t) => acc + t.plannedHours, 0) || project.plannedHours;
  const totalActualHours = projectTasks.reduce((acc, t) => acc + t.actualHours, 0) || project.actualHours;
  const variance = totalActualHours - totalPlannedHours;

  const handleClose = () => {
    setIsProjectDashboardOpen(false);
    setSelectedProjectForDashboard(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {project.id.slice(-3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {project.name}
                </h2>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                  {project.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    project.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : project.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : project.status === 'On Hold'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : project.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Team: <strong className="text-slate-800 dark:text-slate-200">{project.team}</strong> &bull; Project Team Lead: <strong className="text-blue-700 dark:text-blue-400">{project.teamLead}</strong> &bull; Timeline: {project.startDate} &ndash; {project.endDate}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-medium">Completion Rate</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {project.completionPercentage}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${project.completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-medium">Assigned Resources</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {projectResources.length} Staff
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Cross-functional squad</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-medium">Deliverables Tracked</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {projectTasks.length} Tasks
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">In current milestone</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-500 font-medium">Hours Logged / Budget</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {totalActualHours}h / {totalPlannedHours}h
              </div>
              <span
                className={`text-[10px] font-semibold mt-1 block ${
                  variance > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {variance > 0 ? `+${variance}h Over budget` : `${Math.abs(variance)}h Runway remaining`}
              </span>
            </div>
          </div>

          {/* Scope description */}
          {project.description && (
            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/60 dark:border-blue-800/60">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block mb-1">
                Project Scope &amp; Deliverable Architecture
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Assigned Workforce */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Assigned Personnel Squad ({projectResources.length})
              </h3>
              <button
                onClick={() => {
                  setAssignProjectTarget(project);
                  setIsAssignModalOpen(true);
                }}
                className="text-xs text-blue-700 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Reassign Personnel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projectResources.map((res) => (
                <div
                  key={res.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      {res.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {res.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {res.roleTitle} • {res.team}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {res.capacity}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Tasks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              Linked Deliverables ({projectTasks.length})
            </h3>
            {projectTasks.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                No active tasks linked to this project yet.
              </div>
            ) : (
              <div className="space-y-2">
                {projectTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{t.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            t.priority === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assigned: <strong>{t.assignedResourceName}</strong> • Due: {t.dueDate}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.actualHours}h / {t.plannedHours}h
                      </div>
                      <div className="text-[11px] text-blue-600">{t.completionPercentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <button
            onClick={() => {
              setEditingProject(project);
              setIsAddProjectOpen(true);
              handleClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Project Details</span>
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 text-xs font-semibold transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
