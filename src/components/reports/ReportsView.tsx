import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  PieChart,
  BarChart3,
  TrendingUp,
  CheckSquare,
  UserCheck,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { resources, teams, projects, tasks, showToast } = useRMT();

  const [activeReportId, setActiveReportId] = useState<number>(1);
  const [reportFormat, setReportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');

  const reportList = [
    {
      id: 1,
      title: 'Resource Utilization Report',
      desc: 'Individual employee burn rates, capacity occupancy, and idle bench time.',
      icon: <PieChart className="w-5 h-5 text-blue-700" />,
      period: 'Weekly Rollup',
    },
    {
      id: 2,
      title: 'Team Capacity Report',
      desc: 'Squad-level allocated hours, maximum throughput, and delta allocations.',
      icon: <BarChart3 className="w-5 h-5 text-teal-600" />,
      period: 'Live Audit',
    },
    {
      id: 3,
      title: 'Project Progress Report',
      desc: 'Epic milestone burndown, delivery timelines, and budget variance.',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      period: 'Milestone Baseline',
    },
    {
      id: 4,
      title: 'Task Completion Report',
      desc: 'Sprint deliverable resolution cycle times, defect ratios, and status breakdown.',
      icon: <CheckSquare className="w-5 h-5 text-indigo-600" />,
      period: 'Sprint Q4',
    },
    {
      id: 5,
      title: 'Resource Availability Report',
      desc: '30-Day forecasting of releasing resources, scheduled annual leaves, and bench staff.',
      icon: <UserCheck className="w-5 h-5 text-amber-600" />,
      period: '30-Day Forward',
    },
    {
      id: 6,
      title: 'Monthly Productivity Report',
      desc: 'Overall engineering velocity, velocity per squad, and delivery KPIs.',
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      period: 'Monthly Summary',
    },
  ];

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    const report = reportList.find((r) => r.id === activeReportId);
    if (format === 'pdf') {
      window.print();
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportId === 1) {
      csvContent += 'Resource ID,Name,Team,Lead,Capacity %,Availability Status,Project\n';
      resources.forEach((r) => {
        csvContent += `"${r.id}","${r.name}","${r.team}","${r.teamLead}","${r.capacity}%","${r.availabilityStatus}","${r.assignedProject}"\n`;
      });
    } else if (activeReportId === 2) {
      csvContent += 'Team ID,Name,Lead,Resource Count,Total Capacity (h),Allocated Hours,Occupancy %\n';
      teams.forEach((t) => {
        csvContent += `"${t.id}","${t.name}","${t.lead}",${t.resourceCount},${t.totalCapacityHours},${t.allocatedHours},"${t.occupancyPercentage}%"\n`;
      });
    } else {
      csvContent += 'Project ID,Name,Team,Lead,Start Date,End Date,Status,Completion %\n';
      projects.forEach((p) => {
        csvContent += `"${p.id}","${p.name}","${p.team}","${p.teamLead}","${p.startDate}","${p.endDate}","${p.status}","${p.completionPercentage}%"\n`;
      });
    }

    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `${report?.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Generated & downloaded ${report?.title} as ${format.toUpperCase()}`);
  };

  const selectedReport = reportList.find((r) => r.id === activeReportId) || reportList[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reports &amp; Executive Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate enterprise-grade resource audits, team throughput analytics, and sprint velocity rollups.
          </p>
        </div>

        {/* Global Export Formats */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Export Selected:</span>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-red-600" />
            <span>PDF Print</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>CSV</span>
          </button>
        </div>
      </section>

      {/* 6 Specialized Reports Selector Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {reportList.map((rep) => {
          const isSelected = rep.id === activeReportId;
          return (
            <div
              key={rep.id}
              onClick={() => setActiveReportId(rep.id)}
              className={`p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-700 ring-2 ring-blue-700/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  {rep.icon}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {rep.period}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {rep.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{rep.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Interactive Report Data Previewer */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedReport.title} Preview
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold font-mono">
                Verified Data Stream
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{selectedReport.desc}</p>
          </div>

          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Formatted Export</span>
          </button>
        </div>

        {/* Dynamic preview table based on active report */}
        <div className="overflow-x-auto">
          {activeReportId === 1 && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Capacity %</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Project Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resources.slice(0, 8).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.name} ({r.id})
                    </td>
                    <td className="py-2.5 px-3">{r.team}</td>
                    <td className="py-2.5 px-3">{r.teamLead}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{r.capacity}%</td>
                    <td className="py-2.5 px-3">{r.availabilityStatus}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{r.assignedProject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportId === 2 && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Team Name</th>
                  <th className="py-2.5 px-3">Team Lead</th>
                  <th className="py-2.5 px-3">Resource Count</th>
                  <th className="py-2.5 px-3">Total Capacity (Weekly)</th>
                  <th className="py-2.5 px-3">Allocated Hours</th>
                  <th className="py-2.5 px-3">Occupancy %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {t.name}
                    </td>
                    <td className="py-2.5 px-3">{t.lead}</td>
                    <td className="py-2.5 px-3 font-mono">{t.resourceCount} Members</td>
                    <td className="py-2.5 px-3 font-mono">{t.totalCapacityHours}h</td>
                    <td className="py-2.5 px-3 font-mono">{t.allocatedHours}h</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-600">
                      {t.occupancyPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeReportId > 2) && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Project Lead</th>
                  <th className="py-2.5 px-3">Planned vs Actual Hours</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.team}</span>
                        <span className="text-[10px] text-slate-500">Lead: {p.teamLead}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">{p.teamLead}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {p.actualHours}h / {p.plannedHours}h
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">{p.endDate}</td>
                    <td className="py-2.5 px-3">{p.status}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {p.completionPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
