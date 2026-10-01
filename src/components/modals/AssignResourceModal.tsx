import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { X, UserPlus, Check, Search, ShieldCheck } from 'lucide-react';

export const AssignResourceModal: React.FC = () => {
  const {
    isAssignModalOpen,
    setIsAssignModalOpen,
    assignProjectTarget,
    setAssignProjectTarget,
    resources,
    assignResourcesToProject,
  } = useRMT();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (assignProjectTarget) {
      setSelectedIds(assignProjectTarget.assignedResourceIds || []);
    } else {
      setSelectedIds([]);
    }
  }, [assignProjectTarget, isAssignModalOpen]);

  if (!isAssignModalOpen || !assignProjectTarget) return null;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    assignResourcesToProject(assignProjectTarget.id, selectedIds);
    setIsAssignModalOpen(false);
    setAssignProjectTarget(null);
  };

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.team.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.roleTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.skills.some((s) => s.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Resources: {assignProjectTarget.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                Team: <strong className="text-slate-700 dark:text-slate-300">{assignProjectTarget.team}</strong> &bull; Project Lead: <strong className="text-blue-700 dark:text-blue-400">{assignProjectTarget.teamLead}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAssignModalOpen(false);
              setAssignProjectTarget(null);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by name, team, skill..."
              className="w-full h-8 pl-9 pr-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Resource Selection List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-700/50">
          {filteredResources.map((res) => {
            const isAssigned = selectedIds.includes(res.id);
            return (
              <div
                key={res.id}
                onClick={() => handleToggle(res.id)}
                className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  isAssigned
                    ? 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isAssigned
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    {res.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {res.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {res.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        {res.team}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {res.roleTitle} • Capacity: <strong>{res.capacity}%</strong> • {res.availabilityStatus}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      res.availabilityStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : res.availabilityStatus === 'Fully Allocated'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : res.availabilityStatus === 'Partially Allocated'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {res.availabilityStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected: <strong className="text-blue-700 dark:text-blue-400">{selectedIds.length}</strong> resources
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setAssignProjectTarget(null);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
