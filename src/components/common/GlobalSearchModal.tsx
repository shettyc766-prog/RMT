import React, { useState, useEffect } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Search, X, Users, FolderGit2, CheckSquare, Contact, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    resources,
    projects,
    tasks,
    teams,
    setCurrentTab,
    setEditingResource,
    setIsAddResourceOpen,
    setSelectedProjectForDashboard,
    setIsProjectDashboardOpen,
    setEditingTask,
    setIsAddTaskOpen,
  } = useRMT();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isGlobalSearchOpen) {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const filteredResources = query
    ? resources.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.email.toLowerCase().includes(query.toLowerCase()) ||
          r.id.toLowerCase().includes(query.toLowerCase()) ||
          r.team.toLowerCase().includes(query.toLowerCase()) ||
          r.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : resources.slice(0, 3);

  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.id.toLowerCase().includes(query.toLowerCase()) ||
          p.team.toLowerCase().includes(query.toLowerCase())
      )
    : projects.slice(0, 3);

  const filteredTasks = query
    ? tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.assignedResourceName.toLowerCase().includes(query.toLowerCase()) ||
          t.projectName.toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 3);

  const filteredTeams = query
    ? teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : teams.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources, projects, deliverables, teams... (ESC to close)"
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-700/50">
          {/* Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                <Contact className="w-3.5 h-3.5" />
                <span>Personnel & Resources ({filteredResources.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setCurrentTab('Resource Directory');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                        {res.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {res.name}
                          </span>
                          <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-medium">
                            {res.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {res.team} • {res.roleTitle} • {res.availabilityStatus}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Projects ({filteredProjects.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredProjects.map((prj) => (
                  <div
                    key={prj.id}
                    onClick={() => {
                      setCurrentTab('Projects');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs font-mono font-bold">
                        {prj.id.slice(-2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {prj.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {prj.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {prj.team} • Lead: {prj.teamLead} • {prj.completionPercentage}% complete
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks & Deliverables ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredTasks.map((tsk) => (
                  <div
                    key={tsk.id}
                    onClick={() => {
                      setCurrentTab('Task Details');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {tsk.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            tsk.priority === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : tsk.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {tsk.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tsk.projectName} • Assigned to: {tsk.assignedResourceName} • {tsk.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams */}
          {filteredTeams.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                <Users className="w-3.5 h-3.5" />
                <span>Operational Teams ({filteredTeams.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => {
                      setCurrentTab('Teams');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {team.name}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        Lead: {team.lead} • {team.resourceCount} Members • {team.occupancyPercentage}% Occupancy
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Type any name, project code, or skill keyword</span>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-blue-600 hover:underline font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
