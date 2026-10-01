import React, { useState, useMemo } from 'react';
import { useRMT } from '../../context/RMTContext';
import { LeaveRequest, LeaveType } from '../../types';
import {
  Calendar as CalendarIcon,
  Home,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  X,
  FileText,
  CalendarCheck2,
  Check,
} from 'lucide-react';

export const LeavePlannerView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    leaveRequests,
    applyLeave,
    editLeave,
    cancelLeave,
    resources,
    teams,
    showToast,
  } = useRMT();

  const [activeView, setActiveView] = useState<'calendar' | 'monthly' | 'team'>('calendar');
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('All Teams');
  const [searchMember, setSearchMember] = useState<string>('');

  // Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Planned Leave');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Manager check
  const isManager =
    currentRole === 'Super Admin' ||
    currentRole === 'Admin' ||
    currentRole === 'Project Manager' ||
    currentRole === 'Team Lead';

  // Personal Requests for logged-in user
  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return leaveRequests.filter(
      (lr) => lr.userId === currentUser.id || lr.employeeName.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [leaveRequests, currentUser]);

  // Calendar calculations
  const year = selectedMonthDate.getFullYear();
  const month = selectedMonthDate.getMonth();
  const monthName = selectedMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const daysArray = useMemo(() => {
    const arr: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    // Padding before 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      arr.push({
        dateStr: prevDate.toISOString().slice(0, 10),
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      arr.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }
    return arr;
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => {
    setSelectedMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(new Date(year, month + 1, 1));
  };

  const handleOpenApply = (prefillDate?: string) => {
    setEditingRequest(null);
    setLeaveType('Planned Leave');
    setStartDate(prefillDate || new Date().toISOString().slice(0, 10));
    setEndDate('');
    setReason('');
    setIsApplyModalOpen(true);
  };

  const handleOpenEdit = (req: LeaveRequest) => {
    setEditingRequest(req);
    setLeaveType(req.leaveType);
    setStartDate(req.date);
    setEndDate(req.endDate || '');
    setReason(req.reason || '');
    setIsApplyModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) {
      showToast('Please select a valid date.');
      return;
    }

    if (endDate && endDate < startDate) {
      showToast('End date cannot precede the start date.');
      return;
    }

    if (editingRequest) {
      editLeave(editingRequest.id, {
        date: startDate,
        endDate: endDate || undefined,
        leaveType,
        reason: reason.trim() || undefined,
      });
      setIsApplyModalOpen(false);
      setEditingRequest(null);
    } else {
      applyLeave({
        userId: currentUser?.id || 'USR-CURR',
        employeeName: currentUser?.name || 'Registered User',
        employeeId: currentUser?.employeeId || currentUser?.id || 'EMP-1001',
        department: currentUser?.department || 'Engineering',
        date: startDate,
        endDate: endDate || undefined,
        leaveType,
        reason: reason.trim() || undefined,
      });
      setIsApplyModalOpen(false);
    }
  };

  // Team filtered leave plans
  const teamLeavePlans = useMemo(() => {
    return leaveRequests.filter((lr) => {
      const matchTeam =
        selectedTeamFilter === 'All Teams' || lr.department === selectedTeamFilter;
      const matchSearch =
        !searchMember ||
        lr.employeeName.toLowerCase().includes(searchMember.toLowerCase()) ||
        lr.employeeId.toLowerCase().includes(searchMember.toLowerCase());
      return matchTeam && matchSearch;
    });
  }, [leaveRequests, selectedTeamFilter, searchMember]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Leave &amp; WFH Planner</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Schedule future planned leaves, record Work From Home (WFH) days, and coordinate team availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeView === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setActiveView('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeView === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setActiveView('team')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeView === 'team'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Team View
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => handleOpenApply()}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave / WFH</span>
          </button>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">My Planned Leaves</span>
            <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <CalendarIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {myRequests.filter((r) => r.leaveType === 'Planned Leave' && r.status === 'Approved').length} Days
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled time off</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">My WFH Schedule</span>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Home className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {myRequests.filter((r) => r.leaveType === 'Work From Home' && r.status === 'Approved').length} Days
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Approved remote working days</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team On Leave Today</span>
            <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {
              leaveRequests.filter(
                (r) =>
                  r.leaveType === 'Planned Leave' &&
                  r.status === 'Approved' &&
                  (r.date === todayStr || (r.endDate && r.date <= todayStr && r.endDate >= todayStr))
              ).length
            }{' '}
            Staff
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Out of office today</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team WFH Today</span>
            <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {
              leaveRequests.filter(
                (r) =>
                  r.leaveType === 'Work From Home' &&
                  r.status === 'Approved' &&
                  (r.date === todayStr || (r.endDate && r.date <= todayStr && r.endDate >= todayStr))
              ).length
            }{' '}
            Remote
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Working remotely today</p>
        </div>
      </section>

      {/* VIEW 1: CALENDAR VIEW */}
      {activeView === 'calendar' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{monthName}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Planned Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300">Work From Home (WFH)</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="bg-slate-50 dark:bg-slate-850 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}

            {daysArray.map((cell, idx) => {
              // Find matching leave events for this day
              const dayLeaves = leaveRequests.filter((lr) => {
                if (lr.status === 'Cancelled') return false;
                if (lr.endDate) {
                  return lr.date <= cell.dateStr && lr.endDate >= cell.dateStr;
                }
                return lr.date === cell.dateStr;
              });

              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => cell.isCurrentMonth && handleOpenApply(cell.dateStr)}
                  className={`min-h-[105px] p-2 transition-all flex flex-col justify-between cursor-pointer ${
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
                  } ${isToday ? 'ring-2 ring-blue-600 inset-0' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayLeaves.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {dayLeaves.length} scheduled
                      </span>
                    )}
                  </div>

                  {/* Day Events */}
                  <div className="mt-1.5 space-y-1 overflow-hidden">
                    {dayLeaves.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                          item.leaveType === 'Planned Leave'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                        title={`${item.employeeName}: ${item.leaveType}${item.reason ? ` (${item.reason})` : ''}`}
                      >
                        {item.leaveType === 'Planned Leave' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        ) : (
                          <Home className="w-2.5 h-2.5 shrink-0" />
                        )}
                        <span className="truncate">{item.employeeName}</span>
                      </div>
                    ))}
                    {dayLeaves.length > 2 && (
                      <div className="text-[9px] font-semibold text-slate-400 pl-1">
                        +{dayLeaves.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW 2: MONTHLY TIMELINE VIEW */}
      {activeView === 'monthly' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              My Scheduled Leaves &amp; Remote Work (Timeline)
            </h2>
            <button
              onClick={() => handleOpenApply()}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              + Schedule Request
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <div className="text-sm font-semibold">No planned leaves or WFH requests on file</div>
              <p className="text-xs mt-1">Click "Apply Leave / WFH" to schedule your upcoming dates.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {myRequests.map((req) => {
                const isFuture = req.date >= todayStr;
                return (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          req.leaveType === 'Planned Leave'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {req.leaveType === 'Planned Leave' ? (
                          <CalendarIcon className="w-4 h-4" />
                        ) : (
                          <Home className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {req.leaveType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : req.status === 'Cancelled'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Date: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{req.date}</span>
                          {req.endDate && (
                            <>
                              {' '}
                              to{' '}
                              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                {req.endDate}
                              </span>
                            </>
                          )}
                          {req.reason && <span className="ml-2 italic text-slate-400">&bull; {req.reason}</span>}
                        </div>
                      </div>
                    </div>

                    {isFuture && req.status !== 'Cancelled' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(req)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Edit Request"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => cancelLeave(req.id)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Cancel Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* VIEW 3: TEAM VIEW (Managers and Team Members) */}
      {activeView === 'team' && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Team Availability &amp; Planned Schedules
              </h2>
              <p className="text-xs text-slate-500">
                Managers can oversee cross-team absences and remote work distribution.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search personnel..."
                  className="h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="All Teams">All Squads &amp; Departments</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {teamLeavePlans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <div className="text-sm font-semibold">No team leave plans recorded</div>
              <p className="text-xs mt-1">Team members who submit leave or WFH plans will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-850/50">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Squad / Dept</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Scheduled Date(s)</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    {isManager && <th className="py-2.5 px-3 text-right">Manager Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teamLeavePlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {plan.employeeName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{plan.employeeId}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {plan.department}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            plan.leaveType === 'Planned Leave'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {plan.leaveType === 'Planned Leave' ? (
                            <CalendarIcon className="w-3 h-3" />
                          ) : (
                            <Home className="w-3 h-3" />
                          )}
                          {plan.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {plan.date}
                        {plan.endDate ? ` → ${plan.endDate}` : ''}
                      </td>
                      <td className="py-3 px-3 text-slate-500 italic">
                        {plan.reason || 'No reason provided'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            plan.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : plan.status === 'Cancelled'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      {isManager && (
                        <td className="py-3 px-3 text-right">
                          {plan.status !== 'Cancelled' && (
                            <button
                              onClick={() => cancelLeave(plan.id)}
                              className="text-xs text-rose-600 hover:underline cursor-pointer"
                            >
                              Cancel Plan
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Modal: Apply / Edit Leave Plan */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-blue-600" />
                <span>{editingRequest ? 'Edit Scheduled Plan' : 'Apply Leave / WFH Plan'}</span>
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee Name (Auto-filled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Name (Auto-filled)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Registered Employee'}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* Employee ID (Auto-filled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.employeeId || currentUser?.id || 'EMP-1001'}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Plan Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('Planned Leave')}
                    className={`h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      leaveType === 'Planned Leave'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    <span>Planned Leave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('Work From Home')}
                    className={`h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      leaveType === 'Work From Home'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-4 h-4 text-blue-500" />
                    <span>Work From Home</span>
                  </button>
                </div>
              </div>

              {/* Date & Optional End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date / Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-9.5 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full h-9.5 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Reason (Not mandatory) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Reason
                  </label>
                  <span className="text-[10px] text-slate-400">Optional / Not mandatory</span>
                </div>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual PTO, doctor appointment, remote sprint work"
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Status */}
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold">Approval Status:</span>
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Approved
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {editingRequest ? 'Update Request' : 'Confirm Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
