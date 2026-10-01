import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Resource, AvailabilityStatus } from '../../types';
import { X, User, Mail, Building, Briefcase, Award, Percent, Fingerprint } from 'lucide-react';

export const ResourceModal: React.FC = () => {
  const {
    isAddResourceOpen,
    setIsAddResourceOpen,
    editingResource,
    setEditingResource,
    addResource,
    updateResource,
    teams,
    projects,
  } = useRMT();

  const [userId, setUserId] = useState('RES-1001');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('DTCO');
  const [teamLead, setTeamLead] = useState('Alex Vance');
  const [roleTitle, setRoleTitle] = useState('Embedded Software Engineer');
  const [capacity, setCapacity] = useState<number>(100);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Fully Allocated');
  const [assignedProject, setAssignedProject] = useState('DTCO Smart 4.0');
  const [currentTask, setCurrentTask] = useState('');
  const [skillsText, setSkillsText] = useState('Firmware / C++, AUTOSAR');
  const [location, setLocation] = useState('Munich, DE');

  useEffect(() => {
    if (editingResource) {
      setUserId(editingResource.id);
      setName(editingResource.name);
      setEmail(editingResource.email);
      setTeam(editingResource.team);
      setTeamLead(editingResource.teamLead);
      setRoleTitle(editingResource.roleTitle);
      setCapacity(editingResource.capacity);
      setAvailabilityStatus(editingResource.availabilityStatus);
      setAssignedProject(editingResource.assignedProject);
      setCurrentTask(editingResource.currentTask);
      setSkillsText(editingResource.skills.join(', '));
      setLocation(editingResource.location || 'Munich, DE');
    } else {
      setUserId(`RES-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setEmail('');
      setTeam(teams[0]?.name || 'DTCO');
      setTeamLead(teams[0]?.lead || 'Alex Vance');
      setRoleTitle('Embedded Software Engineer');
      setCapacity(100);
      setAvailabilityStatus('Fully Allocated');
      setAssignedProject(projects[0]?.name || 'Unassigned');
      setCurrentTask('');
      setSkillsText('Firmware / C++, AUTOSAR');
      setLocation('Munich, DE');
    }
  }, [editingResource, isAddResourceOpen, teams, projects]);

  // Sync team lead when team changes
  const handleTeamChange = (newTeamName: string) => {
    setTeam(newTeamName);
    const selectedTeam = teams.find((t) => t.name === newTeamName);
    if (selectedTeam) {
      setTeamLead(selectedTeam.lead);
    }
  };

  const handleClose = () => {
    setIsAddResourceOpen(false);
    setEditingResource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !userId.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingResource) {
      const success = updateResource(editingResource.id, {
        id: userId.trim().toUpperCase(),
        name,
        email,
        team,
        teamLead,
        roleTitle,
        capacity,
        availabilityStatus,
        assignedProject,
        currentTask: currentTask || (availabilityStatus === 'Available' ? 'Ready for allocation' : 'Assigned deliverable'),
        skills,
        location,
      });
      if (success === false) return;
    } else {
      addResource({
        id: userId.trim().toUpperCase(),
        name,
        email,
        initials,
        team,
        teamLead,
        roleTitle,
        capacity,
        availabilityStatus,
        assignedProject,
        currentTask: currentTask || (availabilityStatus === 'Available' ? 'Ready for allocation' : 'Assigned deliverable'),
        skills,
        location,
        weeklyAvailableHours: 40,
      });
    }

    handleClose();
  };

  if (!isAddResourceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingResource ? `Edit Resource (${editingResource.id})` : 'Add New Resource'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Maintain complete employee workforce records &amp; capacity profiling
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
            {/* User ID (Editable) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>User ID / Resource ID *</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">Editable ID</span>
              </label>
              <input
                required
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                placeholder="e.g. RES-1042"
                className="w-full h-9 px-3 font-mono font-bold text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-700 dark:text-blue-400 focus:outline-none focus:border-blue-600 uppercase"
              />
              <span className="text-[10px] text-slate-400">Unique identifier for this employee/resource record</span>
            </div>

            {/* Resource Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Full Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email Address *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.vance@company.com"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Team *
              </label>
              <select
                value={team}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Lead */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Team Lead
              </label>
              <input
                type="text"
                value={teamLead}
                onChange={(e) => setTeamLead(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title / Specialization
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Tech Lead, Security Spec"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => {
                  const status = e.target.value as AvailabilityStatus;
                  setAvailabilityStatus(status);
                  if (status === 'Available' || status === 'On Leave') {
                    setCapacity(0);
                    setAssignedProject('Unassigned');
                  } else if (status === 'Fully Allocated') {
                    setCapacity(100);
                  } else if (status === 'Partially Allocated' && capacity === 0) {
                    setCapacity(50);
                  }
                }}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Available">Available</option>
                <option value="Partially Allocated">Partially Allocated</option>
                <option value="Fully Allocated">Fully Allocated</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Capacity % Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Capacity Allocation (%)
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                  {capacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            {/* Assigned Project */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Project
              </label>
              <select
                value={assignedProject}
                onChange={(e) => setAssignedProject(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Unassigned">Unassigned</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Task Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Task / Deliverable Summary
            </label>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="e.g. Cryptographic Key Exchange impl or Ready for allocation"
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Skills (Comma-separated) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Skills &amp; Technologies (comma separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Firmware / C++, Embedded Linux, AUTOSAR, Hardware Design, QA Automation"
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Engineering Office Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Munich, DE / Berlin, DE / Stuttgart, DE / Bengaluru, IN"
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
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
              {editingResource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
