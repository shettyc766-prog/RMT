import React from 'react';
import { useRMT } from '../../context/RMTContext';
import { X, HelpCircle, BookOpen, Command, Sparkles, CheckCircle2 } from 'lucide-react';

export const HelpCenterModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen } = useRMT();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                RMT Enterprise Documentation
              </h2>
              <p className="text-[11px] text-slate-500">
                Resource Management Tool v2.4 quick reference guide &amp; shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Core Modules
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Dashboard:</strong> Executive overview of capacity, active projects, deliverables and runway variances.</li>
              <li><strong>Teams:</strong> Visualize DTCO, BVDR, Vehicle Electronics, Telematics, and Tool Development with occupancy % and capacity hours.</li>
              <li><strong>Resource Directory:</strong> Complete workforce directory with capacity %, availability badges, team leads, and linked tasks.</li>
              <li><strong>Projects:</strong> Project lifecycle tracker (Planned, Active, On Hold, Completed, Cancelled) with resource assignments and dashboards.</li>
              <li><strong>Task Details:</strong> Sprint deliverables with Table Grid and Allocation Board (Kanban), priority levels, and planned vs actual hours.</li>
              <li><strong>Resource Allocation:</strong> Drag-and-drop workload balancing module with over-allocation prevention.</li>
              <li><strong>Reports &amp; Analytics:</strong> 6 enterprise intelligence reports with batch export to Excel, CSV, and PDF.</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Command className="w-4 h-4 text-purple-600" /> Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>Open Global Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>Close Active Dialog</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">ESC</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => setIsHelpOpen(false)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
