import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Project, ProjectStatus, TaskPriority } from '../../types';
import { X, FolderGit2, Calendar, Users, Target, Hash } from 'lucide-react';

export const ProjectModal: React.FC = () => {
  const {
    isAddProjectOpen,
    setIsAddProjectOpen,
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    teams,
    resources,
  } = useRMT();

  const [projectId, setProjectId] = useState('PRJ-101');
  const [name, setName] = useState('');
  const [team, setTeam] = useState(() => teams[0]?.name || 'Embedded Systems');
  const [teamLead, setTeamLead] = useState(() => teams[0]?.lead || 'Chethan');
  const [startDate, setStartDate] = useState(() => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
  const [endDate, setEndDate] = useState('Dec 31, 2026');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [plannedHours, setPlannedHours] = useState(500);
  const [actualHours, setActualHours] = useState(0);

  useEffect(() => {
    if (editingProject) {
      setProjectId(editingProject.id);
      setName(editingProject.name);
      setTeam(editingProject.team);
      setTeamLead(editingProject.teamLead);
      setStartDate(editingProject.startDate);
      setEndDate(editingProject.endDate);
      setStatus(editingProject.status);
      setCompletionPercentage(editingProject.completionPercentage);
      setDescription(editingProject.description);
      setPriority(editingProject.priority);
      setPlannedHours(editingProject.plannedHours);
      setActualHours(editingProject.actualHours);
    } else {
      setProjectId(`PRJ-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setTeam(teams[0]?.name || 'Embedded Systems');
      setTeamLead(teams[0]?.lead || 'Chethan');
      setStartDate(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
      setEndDate('Dec 31, 2026');
      setStatus('Active');
      setCompletionPercentage(0);
      setDescription('');
      setPriority('High');
      setPlannedHours(500);
      setActualHours(0);
    }
  }, [editingProject, isAddProjectOpen, teams]);

  const handleTeamChange = (newTeamName: string) => {
    setTeam(newTeamName);
    const selectedTeam = teams.find((t) => t.name === newTeamName);
    if (selectedTeam) {
      setTeamLead(selectedTeam.lead);
    }
  };

  const handleClose = () => {
    setIsAddProjectOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId.trim()) return;

    if (editingProject) {
      const success = updateProject(editingProject.id, {
        id: projectId.trim().toUpperCase(),
        name,
        team,
        teamLead,
        startDate,
        endDate,
        status,
        completionPercentage,
        description,
        priority,
        plannedHours,
        actualHours,
      });
      if (success === false) return;
    } else {
      // Pick 2-3 resources from the selected team initially
      const teamResourceIds = resources
        .filter((r) => r.team === team)
        .slice(0, 3)
        .map((r) => r.id);

      addProject({
        id: projectId.trim().toUpperCase(),
        name,
        team,
        teamLead,
        startDate,
        endDate,
        status,
        assignedResourceIds: teamResourceIds,
        completionPercentage,
        description,
        priority,
        plannedHours,
        actualHours,
      });
    }
    handleClose();
  };

  if (!isAddProjectOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProject ? `Edit Project (${editingProject.id})` : 'Create New Project'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Manage project deliverables, timelines, milestone commitments &amp; capacity budgets
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project ID (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Project ID *</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">Editable ID</span>
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value.toUpperCase())}
                  placeholder="e.g. PRJ-101"
                  className="w-full h-9 px-3 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-700 dark:text-blue-400 focus:outline-none focus:border-blue-600 uppercase"
                />
              </div>
              <span className="text-[10px] text-slate-400">Unique identifier for this project</span>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Title *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DTCO Smart 4.0 or ECU Gateway v5"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsible Team *
              </label>
              <select
                value={team}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} (Team Lead: {t.lead})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Selected Team Lead: <strong className="text-blue-600 dark:text-blue-400">{teamLead}</strong>
              </span>
            </div>

            {/* Team Lead */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project / Team Lead
              </label>
              <input
                type="text"
                value={teamLead}
                onChange={(e) => setTeamLead(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Jan 15, 2024"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Delivery Date
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Nov 30, 2024"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as ProjectStatus;
                  setStatus(s);
                  if (s === 'Completed') setCompletionPercentage(100);
                  if (s === 'Planned') setCompletionPercentage(0);
                }}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Strategic Priority
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

            {/* Planned Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Planned Budget Hours
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

            {/* Completion Percentage Slider */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Completion (%)
                </label>
                <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                  {completionPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Description &amp; Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline deliverables, architecture requirements and regulatory milestones..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

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
              {editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
