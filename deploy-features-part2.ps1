# Todoist for Ledelse - Deploy Components (Part 2)

$projectPath = "C:\Users\thoma\todoist-ledelse"
$appPath = "$projectPath\app"
$componentsPath = "$appPath\components"

Write-Host "🚀 Deploying component files..." -ForegroundColor Cyan
Write-Host ""

# 1. BulkActionsToolbar.tsx
$bulkActionsToolbarContent = @'
'use client';

import { useState } from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onMarkDone: () => Promise<void>;
  onMarkCancelled: () => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  onMarkDone,
  onMarkCancelled,
  onDelete,
  onClose,
}: BulkActionsToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      onClose();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Error performing bulk action');
    } finally {
      setLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-40 flex items-center gap-4">
      {/* Count Display */}
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {selectedCount} selected
      </span>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>

      {/* Action Buttons */}
      <button
        onClick={() => handleAction(onMarkDone)}
        disabled={loading}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50"
      >
        ✅ Mark Done
      </button>

      <button
        onClick={() => handleAction(onMarkCancelled)}
        disabled={loading}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
      >
        ⛔ Cancel
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="px-3 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
      >
        🗑️ Delete
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
      >
        ✕
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Delete {selectedCount} task{selectedCount !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleAction(onDelete);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'@

Set-Content -Path "$componentsPath\BulkActionsToolbar.tsx" -Value $bulkActionsToolbarContent
Write-Host "✅ Created: app/components/BulkActionsToolbar.tsx" -ForegroundColor Green

# 2. KanbanBoard.tsx
$kanbanBoardContent = @'
'use client';

import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
  DragStart,
} from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import { Task, Person, Tag } from '@/types';

interface KanbanBoardProps {
  tasks: Task[];
  people: Person[];
  tags: Tag[];
  onTaskUpdate: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  workspaceId: string;
}

export default function KanbanBoard({
  tasks,
  people,
  tags,
  onTaskUpdate,
  onTaskClick,
  workspaceId,
}: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const columns = {
    todo: { title: '📋 To Do', tasks: tasks.filter((t) => t.status === 'todo') },
    in_progress: {
      title: '🔄 In Progress',
      tasks: tasks.filter((t) => t.status === 'in_progress'),
    },
    done: { title: '✅ Done', tasks: tasks.filter((t) => t.status === 'done') },
    cancelled: {
      title: '⛔ Cancelled',
      tasks: tasks.filter((t) => t.status === 'cancelled'),
    },
  };

  const handleDragStart = (start: DragStart) => {
    setDraggedTaskId(start.draggableId);
  };

  const handleDragEnd = async (result: DropResult) => {
    setDraggedTaskId(null);

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as Task['status'];

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus };
    onTaskUpdate(updatedTask);

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'done' && { completed_at: new Date().toISOString() }),
        }),
      });

      if (!response.ok) {
        console.error('Error updating task status');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(columns).map(([statusKey, column]) => (
          <Droppable key={statusKey} droppableId={statusKey}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg p-4 min-h-[500px] transition ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400'
                    : 'bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent'
                }`}
              >
                {/* Column Header */}
                <div className="mb-4">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                    {column.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Tasks */}
                <KanbanColumn
                  tasks={column.tasks}
                  people={people}
                  tags={tags}
                  isDraggingOver={snapshot.isDraggingOver}
                  draggedTaskId={draggedTaskId}
                  onTaskClick={onTaskClick}
                />

                {/* Droppable Placeholder */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
'@

Set-Content -Path "$componentsPath\KanbanBoard.tsx" -Value $kanbanBoardContent
Write-Host "✅ Created: app/components/KanbanBoard.tsx" -ForegroundColor Green

# 3. KanbanColumn.tsx
$kanbanColumnContent = @'
'use client';

import { Draggable } from 'react-beautiful-dnd';
import { Task, Person, Tag } from '@/types';

interface KanbanColumnProps {
  tasks: Task[];
  people: Person[];
  tags: Tag[];
  isDraggingOver: boolean;
  draggedTaskId: string | null;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({
  tasks,
  people,
  tags,
  isDraggingOver,
  draggedTaskId,
  onTaskClick,
}: KanbanColumnProps) {
  const priorityColors = {
    low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    high: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
    },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          {isDraggingOver ? '✨ Drop here' : 'No tasks'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <Draggable key={task.id} draggableId={task.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => onTaskClick(task)}
              className={`p-4 rounded-lg border-2 transition cursor-grab active:cursor-grabbing ${
                snapshot.isDragging
                  ? 'shadow-2xl scale-105 bg-white dark:bg-gray-700 border-blue-500 opacity-100 z-50'
                  : draggedTaskId === task.id
                  ? 'opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                {task.title}
              </h3>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}

              {/* Priority Badge */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    priorityColors[task.priority as keyof typeof priorityColors].bg
                  } ${
                    priorityColors[task.priority as keyof typeof priorityColors].text
                  }`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>

                {/* Due Date */}
                {task.due_date && (
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    📅{' '}
                    {new Date(task.due_date).toLocaleDateString('no-NO', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Assignees */}
              {task.people && task.people.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">👤</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {task.people.map((p) => p.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
}
'@

Set-Content -Path "$componentsPath\KanbanColumn.tsx" -Value $kanbanColumnContent
Write-Host "✅ Created: app/components/KanbanColumn.tsx" -ForegroundColor Green

# 4. TimeTrackerPanel.tsx
$timeTrackerPanelContent = @'
'use client';

import { useState, useEffect } from 'react';

interface TimeEntry {
  id: string;
  task_id: string;
  duration_minutes: number;
  notes?: string;
  logged_date: string;
  created_at: string;
}

interface TimeTrackerPanelProps {
  taskId: string;
  onTimeUpdated?: (totalMinutes: number) => void;
}

export default function TimeTrackerPanel({
  taskId,
  onTimeUpdated,
}: TimeTrackerPanelProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [taskId]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/time-entries?task_id=${taskId}`);
      const data = await response.json();
      setEntries(data.data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    const totalMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0');
    if (totalMinutes === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          workspace_id: 'default-workspace',
          duration_minutes: totalMinutes,
          notes: notes || null,
        }),
      });

      const newEntry = await response.json();
      setEntries([newEntry, ...entries]);
      setHours('');
      setMinutes('');
      setNotes('');
      setShowForm(false);

      const totalTime = entries.reduce(
        (sum, entry) => sum + entry.duration_minutes,
        totalMinutes
      );
      onTimeUpdated?.(totalTime);
    } catch (error) {
      console.error('Error adding time entry:', error);
      alert('Error adding time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await fetch(`/api/time-entries?id=${entryId}`, { method: 'DELETE' });
      const updated = entries.filter((e) => e.id !== entryId);
      setEntries(updated);

      const totalTime = updated.reduce((sum, entry) => sum + entry.duration_minutes, 0);
      onTimeUpdated?.(totalTime);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      alert('Error deleting time entry');
    }
  };

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const displayTime =
    totalHours > 0
      ? `${totalHours}h ${remainingMinutes}m`
      : remainingMinutes > 0
      ? `${remainingMinutes}m`
      : '0m';

  if (loading) {
    return <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Total Time Display */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mb-1">
          Total Time Tracked
        </p>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">⏱️ {displayTime}</p>
      </div>

      {/* Add Time Entry Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition text-sm"
        >
          ➕ Add Time Entry
        </button>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddEntry}
              disabled={submitting || (!hours && !minutes)}
              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm disabled:opacity-50"
            >
              ✅ Save
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setHours('');
                setMinutes('');
                setNotes('');
              }}
              className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
        </p>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No time logged yet</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const entryHours = Math.floor(entry.duration_minutes / 60);
              const entryMins = entry.duration_minutes % 60;
              const entryDisplay =
                entryHours > 0
                  ? `${entryHours}h ${entryMins}m`
                  : `${entryMins}m`;

              return (
                <div
                  key={entry.id}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-start justify-between gap-3 group hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      ⏱️ {entryDisplay}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {entry.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(entry.logged_date).toLocaleDateString('no-NO')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
'@

Set-Content -Path "$componentsPath\TimeTrackerPanel.tsx" -Value $timeTrackerPanelContent
Write-Host "✅ Created: app/components/TimeTrackerPanel.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  IMPORTANT: Run deploy-features-part3.ps1 next to create more component files" -ForegroundColor Yellow
