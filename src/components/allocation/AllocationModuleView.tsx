import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Resource, Task } from '../../types';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
} from 'lucide-react';

export const AllocationModuleView: React.FC = () => {
  const { resources, teams, tasks, projects, updateResource, reassignTask, showToast, currentRole } = useRMT();

  const canEdit = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'Project Manager';

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('Week 42 (Current)');
  const [filterTeam, setFilterTeam] = useState('All');

  const weeks = ['Week 41', 'Week 42 (Current)', 'Week 43', 'Week 44', 'Week 45'];

  const filteredResources = resources.filter(
    (r) => filterTeam === 'All' || r.team === filterTeam
  );

  // Overallocation detection
  const overAllocatedResources = resources.filter((r) => r.capacity > 100);
  const underUtilizedResources = resources.filter((r) => r.capacity < 50 && r.availabilityStatus !== 'On Leave');

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (!canEdit) return;
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
  };

  const handleDropOnResource = (e: React.DragEvent, targetResource: Resource) => {
    if (!canEdit) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    reassignTask(taskId, targetResource.id, targetResource.name, targetResource.roleTitle);
    // Increase capacity if not full
    const newCap = Math.min(120, targetResource.capacity + 20);
    updateResource(targetResource.id, {
      capacity: newCap,
      availabilityStatus: newCap >= 100 ? 'Fully Allocated' : 'Partially Allocated',
    });
    setDraggedTaskId(null);
    showToast(`Deliverable allocated to ${targetResource.name}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Resource Allocation &amp; Workload Balancing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              Interactive Drag &amp; Drop
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Balance staff workloads, eliminate scheduling bottlenecks, and prevent team burnouts.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="h-9 px-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          >
            {weeks.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="h-9 px-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} (Lead: {t.lead})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Dynamic Alerts Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Over-allocation alerts */}
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-900 dark:text-red-200 block mb-0.5">
              Over-allocation Risk ({overAllocatedResources.length} Staff Affected)
            </span>
            <p className="text-red-700 dark:text-red-300 leading-snug">
              {overAllocatedResources.length > 0
                ? `${overAllocatedResources.map((r) => r.name).join(', ')} currently exceed standard weekly capacity. Reassign tasks to bench personnel below to normalize workload.`
                : 'No personnel currently exceed capacity thresholds. Engineering workload is balanced.'}
            </p>
          </div>
        </div>

        {/* Under-utilization alerts */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
              Under-utilized Capacity Available ({underUtilizedResources.length} Staff Open)
            </span>
            <p className="text-amber-700 dark:text-amber-300 leading-snug">
              {underUtilizedResources.length > 0
                ? `${underUtilizedResources.map((r) => r.name).join(', ')} have open capacity. Drag unassigned tasks directly into their allocation drop targets.`
                : 'All available personnel are actively engaged in deliverables.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Dual Workspace: Unassigned Tasks Pool (Left) + Resource Capacity Board (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Unassigned / Pending Deliverables Pool (Span 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sprint Task Backlog Pool
              </h2>
              <p className="text-[11px] text-slate-400">Drag any card into a team member's tray</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {tasks.length} Deliverables
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable={canEdit}
                onDragStart={(e) => handleDragStart(e, task.id)}
                className={`p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 space-y-2 select-none group transition-all ${
                  canEdit
                    ? 'hover:border-blue-600 hover:shadow-md cursor-grab active:cursor-grabbing'
                    : 'cursor-default'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                    {task.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      task.priority === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{task.projectName}</span>
                    {(() => {
                      const taskProj = projects.find(
                        (p) => p.name === task.projectName || p.id === task.projectId
                      );
                      return taskProj ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                          (Lead: {taskProj.teamLead})
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {task.plannedHours}h budgeted
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>Current: <strong>{task.assignedResourceName}</strong></span>
                  {canEdit ? (
                    <span className="font-semibold text-blue-600">Drag to reallocate &rarr;</span>
                  ) : (
                    <span className="text-slate-400 italic">Read-only view</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Allocation Drop Matrix (Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Workforce Capacity Runway ({selectedWeek})
              </h2>
              <p className="text-[11px] text-slate-400">
                Drop tasks directly to balance staff bandwidth
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredResources.length} Staff
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {filteredResources.map((res) => {
              const resTasks = tasks.filter((t) => t.assignedResourceId === res.id);
              const isOver = res.capacity > 100;
              const isUnder = res.capacity === 0;

              return (
                <div
                  key={res.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnResource(e, res)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOver
                      ? 'border-red-300 dark:border-red-900 bg-red-50/20 dark:bg-red-950/20'
                      : isUnder
                      ? 'border-teal-300 dark:border-teal-900 bg-teal-50/20 dark:bg-teal-950/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                        {res.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {res.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                            {res.team}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {res.roleTitle} &bull; Lead: <strong>{res.teamLead}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isOver ? 'text-red-600' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {res.capacity}% Load
                        </span>
                        {isOver && (
                          <span className="text-[10px] text-red-600 font-bold">
                            (+{res.capacity - 100}% OVER)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {resTasks.length} tasks linked
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full ${
                        isOver
                          ? 'bg-red-600'
                          : res.capacity >= 80
                          ? 'bg-blue-700'
                          : res.capacity > 0
                          ? 'bg-teal-600'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(res.capacity, 100)}%` }}
                    ></div>
                  </div>

                  {/* Allocated Deliverables Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px]">Deliverables:</span>
                    {resTasks.length === 0 ? (
                      <span className="text-slate-400 italic text-[11px]">
                        No tasks assigned &bull; Drop deliverable here to assign
                      </span>
                    ) : (
                      resTasks.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1 shadow-2xs"
                        >
                          <span>{t.name}</span>
                          <span className="font-mono text-[9px] text-slate-400">({t.plannedHours}h)</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
