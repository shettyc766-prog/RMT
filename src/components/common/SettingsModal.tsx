import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { X, Shield, Server, RefreshCw, Key, Users, CheckCircle2, Lock } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, currentRole, showToast, addAuditLog, resources } = useRMT();
  const [syncing, setSyncing] = useState(false);
  const [tenantId, setTenantId] = useState('0f4b3291-a18c-4f12-9c10-82df391a27e0');
  const [dbProvider, setDbProvider] = useState('PostgreSQL / Enterprise Cloud SQL');

  if (!isSettingsOpen) return null;

  const handleSyncEntraId = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      addAuditLog('Entra ID Synchronized', 'Microsoft Entra ID', `Manual sync refreshed ${resources.length} resources & role assignments`);
      showToast('Successfully synchronized directory with Microsoft Entra ID.');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enterprise Workspace Settings
              </h2>
              <p className="text-[11px] text-slate-500">
                Microsoft Entra ID, Database Connections &amp; RBAC Access Controls
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Azure AD / Entra ID Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Microsoft Entra ID (Azure AD)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Single Sign-On (SSO) and Security Group role mappings are active. User profiles, departments, and team leads are synced directly from Azure AD.
            </p>
            <div className="text-[11px] font-mono bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex justify-between items-center">
              <span>Tenant: {tenantId}</span>
              <span className="text-emerald-600 font-semibold">Active</span>
            </div>
            <button
              onClick={handleSyncEntraId}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing Accounts...' : 'Sync Entra ID Now'}</span>
            </button>
          </div>

          {/* Database Connection */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Backend Database Persistence
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">Database Engine</div>
                <div className="font-semibold text-slate-900 dark:text-white">{dbProvider}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 text-[11px]">Connection Status</div>
                <div className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Pool (12 ms)
                </div>
              </div>
            </div>
          </div>

          {/* RBAC Active Role Notice */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Current Access Session
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              You are currently authenticated as <strong>Sarah Chen (Lead PM)</strong> with role{' '}
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                {currentRole}
              </span>
              . You have authority to allocate cross-team personnel, approve sprints, edit timelines, and export confidential enterprise audits.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 text-xs font-semibold transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
