import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { X, Users, Mail, Briefcase, Info } from 'lucide-react';

export const TeamModal: React.FC = () => {
  const { isAddTeamOpen, setIsAddTeamOpen, editingTeam, setEditingTeam, addTeam, updateTeam } =
    useRMT();

  const [name, setName] = useState('');
  const [lead, setLead] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingTeam) {
      setName(editingTeam.name);
      setLead(editingTeam.lead);
      setLeadEmail(editingTeam.leadEmail);
      setDescription(editingTeam.description);
    } else {
      setName('');
      setLead('');
      setLeadEmail('');
      setDescription('');
    }
  }, [editingTeam, isAddTeamOpen]);

  const handleClose = () => {
    setIsAddTeamOpen(false);
    setEditingTeam(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTeam) {
      updateTeam(editingTeam.id, {
        name,
        lead,
        leadEmail,
        description,
      });
    } else {
      addTeam({
        name,
        lead,
        leadEmail,
        description,
        resourceCount: 0,
        totalCapacityHours: 0,
        allocatedHours: 0,
        occupancyPercentage: 0,
        activeProjects: [],
      });
    }
    handleClose();
  };

  if (!isAddTeamOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTeam ? `Edit Squad (${editingTeam.name})` : 'Add Operational Squad'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Squad leadership, mission scope, and cross-team alignment
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Team / Squad Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Embedded Security & Cryptography"
              className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Squad Lead Name
              </label>
              <input
                type="text"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Corporate Email
              </label>
              <input
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="lead@company.com"
                className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Dynamic Headcount Notice (Rule 2: No manual team count entry) */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Dynamic Headcount Calculation</span>
              <p className="text-[11px] text-blue-700 dark:text-blue-300/80 mt-0.5 leading-snug">
                Team member counts and capacity hours are automatically calculated in real time from approved, active users assigned to this team in the Resource Directory. No manual entry required.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mission &amp; Scope Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary engineering discipline, system domain, and technical scope..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {editingTeam ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
