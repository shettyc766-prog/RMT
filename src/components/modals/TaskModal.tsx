import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { X, CheckSquare, Clock, AlertTriangle, UserCheck } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isAddTaskOpen,
    setIsAddTaskOpen,
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    projects,
    resources,
    teams,
  } = useRMT();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState(() => projects[0]?.name || '');
  const [assignedResourceId, setAssignedResourceId] = useState<string>(() => resources[0]?.id || 'unassigned');
  const [team, setTeam] = useState(() => teams[0]?.name || 'Embedded Systems');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [plannedHours, setPlannedHours] = useState(40);
  const [actualHours, setActualHours] = useState(0);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description);
      setProjectName(editingTask.projectName);
      setAssignedResourceId(editingTask.assignedResourceId || 'unassigned');
      setTeam(editingTask.team);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setPlannedHours(editingTask.plannedHours);
      setActualHours(editingTask.actualHours);
      setStartDate(editingTask.startDate);
      setDueDate(editingTask.dueDate);
      setCompletionPercentage(editingTask.completionPercentage);
      setIsBlocked(editingTask.isBlocked || false);
      setBlockedReason(editingTask.blockedReason || '');
    } else {
      setName('');
      setDescription('');
      setProjectName(projects[0]?.name || '');
      setAssignedResourceId(resources[0]?.id || 'unassigned');
      setTeam(teams[0]?.name || 'Embedded Systems');
      setPriority('High');
      setStatus('In Progress');
      setPlannedHours(40);
      setActualHours(0);
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
      setCompletionPercentage(0);
      setIsBlocked(false);
      setBlockedReason('');
    }
  }, [editingTask, isAddTaskOpen, projects, resources, teams]);

  const handleClose = () => {
    setIsAddTaskOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedRes = resources.find((r) => r.id === assignedResourceId);
    const assignedName = assignedRes ? assignedRes.name : 'Unassigned';
    const assignedRole = assignedRes ? assignedRes.roleTitle : 'Action Required';
    const assignedAvatar = assignedRes ? assignedRes.avatar : undefined;
    const assignedInitials = assignedRes ? assignedRes.initials : '?';

    const isOver = actualHours > plannedHours;

    if (editingTask) {
      updateTask(editingTask.id, {
        name,
        description,
        projectName,
        assignedResourceId: assignedResourceId === 'unassigned' ? null : assignedResourceId,
        assignedResourceName: assignedName,
        assignedResourceRole: assignedRole,
        assignedResourceAvatar: assignedAvatar,
        assignedResourceInitials: assignedInitials,
        team,
        priority,
        status,
        plannedHours,
        actualHours,
        startDate,
        dueDate,
        completionPercentage,
        isBlocked: status === 'Blocked' ? true : isBlocked,
        blockedReason: status === 'Blocked' ? blockedReason || 'External dependency blocked' : undefined,
        isOverBudget: isOver,
      });
    } else {
      addTask({
        name,
        description,
        projectName,
        assignedResourceId: assignedResourceId === 'unassigned' ? null : assignedResourceId,
        assignedResourceName: assignedName,
        assignedResourceRole: assignedRole,
        assignedResourceAvatar: assignedAvatar,
        assignedResourceInitials: assignedInitials,
        team,
        priority,
        status,
        plannedHours,
        actualHours,
        startDate,
        dueDate,
        completionPercentage,
        isBlocked: status === 'Blocked' ? true : isBlocked,
        blockedReason: status === 'Blocked' ? blockedReason || 'Dependency blocker' : undefined,
        isOverBudget: isOver,
      });
    }
    handleClose();
  };

  if (!isAddTaskOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? `Edit Deliverable (${editingTask.id})` : 'Create New Deliverable'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Track deliverables, planned vs actual hours &amp; sprint runway
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Task Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deliverable Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CAN FD Transceiver Driver"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Parent Project *
              </label>
              <select
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  const selProj = projects.find((p) => p.name === e.target.value);
                  if (selProj) {
                    setTeam(selProj.team);
                  }
                }}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.team} - Lead: {p.teamLead})
                  </option>
                ))}
              </select>
              {(() => {
                const currentProj = projects.find((p) => p.name === projectName);
                return currentProj ? (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Team: <strong className="text-slate-700 dark:text-slate-300">{currentProj.team}</strong> &bull; Project Lead: <strong className="text-blue-600 dark:text-blue-400">{currentProj.teamLead}</strong>
                  </span>
                ) : null;
              })()}
            </div>

            {/* Assigned Resource */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Personnel *
              </label>
              <select
                value={assignedResourceId}
                onChange={(e) => setAssignedResourceId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="unassigned">-- Unassigned (Needs Assignee) --</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.team} - {r.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executing Team
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} (Lead: {t.lead})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const st = e.target.value as TaskStatus;
                  setStatus(st);
                  if (st === 'Completed') setCompletionPercentage(100);
                  if (st === 'Not Started') setCompletionPercentage(0);
                  if (st === 'Blocked') setIsBlocked(true);
                }}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Completion Percentage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deliverable Progress
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                  {completionPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Planned Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Planned Hours
              </label>
              <input
                type="number"
                value={plannedHours}
                onChange={(e) => setPlannedHours(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Actual Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Logged Hours
              </label>
              <input
                type="number"
                value={actualHours}
                onChange={(e) => setActualHours(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sprint Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Oct 12, 2024"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Oct 28, 2024"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Deliverable Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical summary, test bench requirements or API contracts..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Blocked info if applicable */}
          {status === 'Blocked' && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-1">
              <label className="block text-xs font-bold text-red-800 dark:text-red-300">
                Blocker Reason &amp; Impact
              </label>
              <input
                type="text"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="e.g. Blocked by HSM vendor firmware driver update"
                className="w-full h-8 px-2.5 text-xs bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 rounded text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              {editingTask ? 'Update Deliverable' : 'Create Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
