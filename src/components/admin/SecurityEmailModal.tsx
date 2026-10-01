import React from 'react';
import { useRMT } from '../../context/RMTContext';
import { Mail, X, CheckCircle2, ShieldAlert, KeyRound, UserCheck, Clock } from 'lucide-react';

export const SecurityEmailModal: React.FC = () => {
  const { isSecurityDispatchesOpen, setIsSecurityDispatchesOpen, securityDispatches } = useRMT();

  if (!isSecurityDispatchesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Security Email Dispatches
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit log of automated lifecycle notifications (Created, Approved, Reset, Locked)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSecurityDispatchesOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {securityDispatches.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No outgoing notifications recorded yet.
            </div>
          ) : (
            securityDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        dispatch.type === 'Account Locked'
                          ? 'bg-red-600'
                          : dispatch.type === 'Account Approved'
                          ? 'bg-emerald-600'
                          : dispatch.type === 'Password Reset'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {dispatch.type === 'Account Locked' && <ShieldAlert className="w-4 h-4" />}
                      {dispatch.type === 'Account Approved' && <UserCheck className="w-4 h-4" />}
                      {dispatch.type === 'Password Reset' && <KeyRound className="w-4 h-4" />}
                      {dispatch.type === 'Account Created' && <Mail className="w-4 h-4" />}
                      {dispatch.type === 'Access Request Update' && <Clock className="w-4 h-4" />}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {dispatch.subject}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        To: <span className="font-semibold text-slate-700 dark:text-slate-300">{dispatch.recipientName}</span> ({dispatch.recipientEmail})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {dispatch.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(dispatch.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {dispatch.body}
                  {dispatch.tokenOrCode && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Temporary Token / Code:</span>
                      <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
                        {dispatch.tokenOrCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500">
            Total Dispatches Logged: <strong>{securityDispatches.length}</strong>
          </span>
          <button
            onClick={() => setIsSecurityDispatchesOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
