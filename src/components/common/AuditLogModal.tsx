import React from 'react';
import { useRMT } from '../../context/RMTContext';
import { X, History, FileDown, ShieldCheck } from 'lucide-react';

export const AuditLogModal: React.FC = () => {
  const { isAuditLogOpen, setIsAuditLogOpen, auditLogs, showToast } = useRMT();

  if (!isAuditLogOpen) return null;

  const handleExportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Role,Action,Target,Details']
        .concat(
          auditLogs.map(
            (l) =>
              `"${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.target}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rmt_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported to CSV.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Audit Trail &amp; Activity Log
              </h2>
              <p className="text-[11px] text-slate-500">
                Immutable compliance log tracking all resource modifications, assignments and sprint adjustments
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditLogOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total recorded entries: <strong className="text-slate-800 dark:text-slate-200">{auditLogs.length}</strong>
          </span>
          <button
            onClick={handleExportLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>

        {/* Log table */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-700">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300">
                      {log.target}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>By: <strong>{log.user}</strong></span>
                    <span>•</span>
                    <span>Role: {log.role}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => setIsAuditLogOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
