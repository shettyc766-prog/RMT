import React, { useState } from 'react';
import { useRMT } from '../../context/RMTContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  GripVertical,
  Plus,
  Clock,
  PlayCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ArrowRight,
  MoreHorizontal,
  ChevronDown,
  Building2,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: Task[];
  canEdit: boolean;
  canDelete: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTaskWithStatus: (status: TaskStatus) => void;
}

interface ColumnConfig {
  status: TaskStatus;
  label: string;
  badgeColor: string;
  dotColor: string;
  headerBg: string;
  borderColor: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STANDARD_COLUMNS: ColumnConfig[] = [
  {
    status: 'Not Started',
    label: 'Not Started',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    headerBg: 'bg-slate-50/80 dark:bg-slate-850/80',
    borderColor: 'border-slate-200 dark:border-slate-800',
    accentColor: 'text-slate-600 dark:text-slate-300',
    icon: Clock,
    description: 'Backlog & queued work items',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500 animate-pulse',
    headerBg: 'bg-blue-50/40 dark:bg-blue-950/20',
    borderColor: 'border-blue-100 dark:border-blue-900/40',
    accentColor: 'text-blue-600 dark:text-blue-400',
    icon: PlayCircle,
    description: 'Active engineering & development',
  },
  {
    status: 'Review',
    label: 'Review',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dotColor: 'bg-purple-500',
    headerBg: 'bg-purple-50/40 dark:bg-purple-950/20',
    borderColor: 'border-purple-100 dark:border-purple-900/40',
    accentColor: 'text-purple-600 dark:text-purple-400',
    icon: Eye,
    description: 'Peer sign-off & quality verification',
  },
  {
    status: 'Completed',
    label: 'Completed',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
    description: 'Delivered & benchmarked',
  },
];

const BLOCKED_COLUMN: ColumnConfig = {
  status: 'Blocked',
  label: 'Blocked / At Risk',
  badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900',
  dotColor: 'bg-red-600',
  headerBg: 'bg-red-50/50 dark:bg-red-950/30',
  borderColor: 'border-red-200 dark:border-red-900/50',
  accentColor: 'text-red-600 dark:text-red-400',
  icon: AlertTriangle,
  description: 'Impediments & dependency locks',
};

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  canEdit,
  canDelete,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTaskWithStatus,
}) => {
  const { projects } = useRMT();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [includeBlockedColumn, setIncludeBlockedColumn] = useState(false);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Determine active columns
  const activeColumns = includeBlockedColumn
    ? [
        STANDARD_COLUMNS[0], // Not Started
        STANDARD_COLUMNS[1], // In Progress
        BLOCKED_COLUMN,      // Blocked
        STANDARD_COLUMNS[2], // Review
        STANDARD_COLUMNS[3], // Completed
      ]
    : STANDARD_COLUMNS;

  // Count blocked tasks to advise user
  const blockedTasksCount = tasks.filter((t) => t.status === 'Blocked').length;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    if (!canEdit) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colStatus: TaskStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only reset if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!canEdit) return;
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Board Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Kanban Board</span>
            <span>&bull;</span>
            <span>{canEdit ? 'Drag cards between columns to transition status' : 'Viewing in read-only mode'}</span>
          </div>

          {canEdit ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Change Access (Super Admin / PM / Project Lead)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Lock className="w-3 h-3" /> View-Only Access (Resource / Viewer)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Toggle between standard 4 columns vs including Blocked */}
          <button
            type="button"
            onClick={() => setIncludeBlockedColumn(!includeBlockedColumn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              includeBlockedColumn
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-300'
                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {includeBlockedColumn ? 'Hide "Blocked" Column' : `Show "Blocked" Column (${blockedTasksCount})`}
            </span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {tasks.length} total deliverables
          </span>
        </div>
      </div>

      {/* Info notice if 4 columns active and there is a blocked task */}
      {!includeBlockedColumn && blockedTasksCount > 0 && (
        <div className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{blockedTasksCount} task(s) currently Blocked:</strong> Displayed under "In Progress" with a critical barrier flag. Toggle "Show Blocked Column" above to assign or resolve bottlenecks in a dedicated column.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIncludeBlockedColumn(true)}
            className="font-bold underline text-amber-900 dark:text-amber-100 hover:text-amber-700 text-xs shrink-0 ml-2"
          >
            Expand to 5 Columns &rarr;
          </button>
        </div>
      )}

      {/* KANBAN BOARD COLUMNS CONTAINER */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          activeColumns.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
        } gap-4 items-start`}
      >
        {activeColumns.map((col) => {
          // If in 4-column mode, include 'Blocked' tasks inside 'In Progress' with visual indicator
          const colTasks = tasks.filter((t) => {
            if (!includeBlockedColumn && col.status === 'In Progress') {
              return t.status === 'In Progress' || t.status === 'Blocked';
            }
            return t.status === col.status;
          });

          const totalPlanned = colTasks.reduce((sum, t) => sum + t.plannedHours, 0);
          const totalActual = colTasks.reduce((sum, t) => sum + t.actualHours, 0);
          const isDragTarget = dragOverColumn === col.status;
          const ColIcon = col.icon;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-xl border transition-all duration-200 min-h-[560px] bg-slate-50/70 dark:bg-slate-900/80 ${
                col.borderColor
              } ${
                isDragTarget
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 shadow-md'
                  : 'shadow-2xs'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 rounded-t-xl border-b ${col.borderColor} ${col.headerBg} flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ColIcon className={`w-3.5 h-3.5 ${col.accentColor}`} />
                      <span>{col.label}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs">
                      {colTasks.length}
                    </span>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onAddTaskWithStatus(col.status)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        title={`Add deliverable to ${col.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">{col.description}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300 shrink-0">
                    {totalActual}h / {totalPlanned}h
                  </span>
                </div>
              </div>

              {/* Column Body / Drop Zone */}
              <div className="p-2.5 flex-1 flex flex-col gap-2.5 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div
                    className={`flex-1 flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-all text-center ${
                      isDragTarget
                        ? 'border-blue-500 bg-blue-100/40 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <ColIcon className="w-8 h-8 opacity-40 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium">No tasks in {col.label}</p>
                    <p className="text-[11px] mt-0.5 opacity-80">
                      {isDragTarget ? 'Release to drop task here' : 'Drag deliverables here to reclassify'}
                    </p>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onAddTaskWithStatus(col.status)}
                        className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 hover:text-blue-700 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {colTasks.map((task) => {
                      const isBeingDragged = draggedTaskId === task.id;
                      const isOverdue =
                        task.status !== 'Completed' &&
                        new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                      return (
                        <div
                          key={task.id}
                          draggable={canEdit}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          className={`relative group bg-white dark:bg-slate-850 rounded-xl border p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2.5 ${
                            isBeingDragged
                              ? 'opacity-40 scale-[0.98] border-blue-500 ring-2 ring-blue-500/30'
                              : task.isBlocked || task.status === 'Blocked'
                              ? 'border-red-300 dark:border-red-900 over-allocated-stripe hover:border-red-500'
                              : 'border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500'
                          } ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        >
                          {/* Card Top Row: ID, Priority & Grip */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              {canEdit ? (
                                <span
                                  className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors cursor-grab"
                                  title="Drag to reposition status"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span
                                  className="text-slate-300 dark:text-slate-600"
                                  title="Read-only (Admin & PM only)"
                                >
                                  <Lock className="w-3 h-3" />
                                </span>
                              )}
                              <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {task.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {getPriorityBadge(task.priority)}

                              {/* Card Action Menu Trigger - only if user can edit or delete */}
                              {(canEdit || canDelete) && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Card actions"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Dropdown Menu for Quick Movement & Actions */}
                                  {activeMenuTaskId === task.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setActiveMenuTaskId(null)}
                                      />
                                      <div className="absolute right-0 top-7 z-50 w-48 bg-white dark:bg-slate-850 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs text-slate-700 dark:text-slate-200">
                                        {canEdit && (
                                          <>
                                            <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                                              Move to Status:
                                            </div>
                                            {(['Not Started', 'In Progress', 'Review', 'Completed', 'Blocked'] as TaskStatus[])
                                              .filter((s) => s !== task.status)
                                              .map((targetStatus) => (
                                                <button
                                                  key={targetStatus}
                                                  type="button"
                                                  onClick={() => {
                                                    onStatusChange(task.id, targetStatus);
                                                    setActiveMenuTaskId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                                                >
                                                  <span>{targetStatus}</span>
                                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                                </button>
                                              ))}

                                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                            <button
                                              type="button"
                                              onClick={() => {
                                                onEditTask(task);
                                                setActiveMenuTaskId(null);
                                              }}
                                              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                              <span>Edit Deliverable</span>
                                            </button>
                                          </>
                                        )}

                                        {canDelete && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuTaskId(null);
                                              if (confirm(`Delete deliverable ${task.name}?`)) {
                                                onDeleteTask(task.id);
                                              }
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1.5 text-red-600 font-medium cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Delete Deliverable</span>
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Task Title & Description */}
                          <div
                            onClick={() => canEdit && onEditTask(task)}
                            className="flex flex-col gap-1 cursor-pointer"
                          >
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {task.name}
                            </h4>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Blocked alert badge if applicable */}
                          {(task.isBlocked || task.status === 'Blocked') && (
                            <div className="flex items-center gap-1.5 p-1.5 rounded bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-[10px] text-red-700 dark:text-red-300 font-medium">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {task.blockedReason || 'Blocked by upstream dependency'}
                              </span>
                            </div>
                          )}

                          {/* Project Tag & Particular Project Team Lead */}
                          {(() => {
                            const taskProject = projects.find(
                              (p) => p.name === task.projectName || p.id === task.projectId
                            );
                            return (
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-full">
                                  <Building2 className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{task.projectName}</span>
                                </span>
                                {taskProject?.teamLead && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                    <span className="text-slate-400 font-normal">Lead:</span>
                                    <strong className="text-slate-700 dark:text-slate-300 font-semibold">{taskProject.teamLead}</strong>
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Progress Bar & Hours */}
                          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span className="font-mono text-[10px]">
                                {task.actualHours}h / {task.plannedHours}h
                                {task.actualHours > task.plannedHours && (
                                  <span className="text-red-600 font-bold ml-1">
                                    (+{task.actualHours - task.plannedHours}h)
                                  </span>
                                )}
                              </span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                                {task.completionPercentage}%
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  task.status === 'Blocked' || task.isBlocked
                                    ? 'bg-red-500'
                                    : task.completionPercentage === 100
                                    ? 'bg-emerald-500'
                                    : task.status === 'Review'
                                    ? 'bg-purple-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${task.completionPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Card Footer: Assigned Person & Due Date */}
                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            {/* Assigned Resource */}
                            <div className="flex items-center gap-1.5 max-w-[60%]">
                              {task.assignedResourceAvatar ? (
                                <img
                                  src={task.assignedResourceAvatar}
                                  alt={task.assignedResourceName}
                                  className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold border border-slate-300 dark:border-slate-600 shrink-0">
                                  {task.assignedResourceInitials || '?'}
                                </div>
                              )}
                              <span
                                className="truncate font-medium text-slate-700 dark:text-slate-300 text-[11px]"
                                title={`${task.assignedResourceName} (${task.assignedResourceRole || 'Engineer'})`}
                              >
                                {task.assignedResourceName}
                              </span>
                            </div>

                            {/* Due Date */}
                            <div
                              className={`flex items-center gap-1 text-[10px] font-mono shrink-0 ${
                                isOverdue
                                  ? 'text-red-600 font-bold'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                              title={`Due Date: ${task.dueDate}`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>

                          {/* Quick Status Shift Bar on Hover for Accessibility/Touch - Only when canEdit */}
                          {canEdit && (
                            <div className="pt-1.5 mt-0.5 border-t border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400">
                                Move status:
                              </span>
                              <div className="flex items-center gap-1">
                                {col.status !== 'Not Started' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStatusChange(task.id, 'Not Started');
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                                    title="Move to Not Started"
                                  >
                                    Not Started
                                  </button>
                                )}
                                {col.status !== 'In Progress' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStatusChange(task.id, 'In Progress');
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                                    title="Move to In Progress"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {col.status !== 'Review' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStatusChange(task.id, 'Review');
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors cursor-pointer"
                                    title="Move to Review"
                                  >
                                    Review
                                  </button>
                                )}
                                {col.status !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onStatusChange(task.id, 'Completed');
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                                    title="Move to Completed"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Drop target ghost indicator when dragging over column */}
                    {isDragTarget && (
                      <div className="border-2 border-dashed border-blue-500/70 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl p-3 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                        Release to assign to {col.label}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
