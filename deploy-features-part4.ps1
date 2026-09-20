# Todoist for Ledelse - Deploy Dashboard Updates (Part 4)

$projectPath = "C:\Users\thoma\todoist-ledelse"
$appPath = "$projectPath\app"
$dashboardPath = "$appPath\dashboard"

Write-Host "Starting deployment of Dashboard with Bulk Actions and Kanban Integration..." -ForegroundColor Cyan
Write-Host ""

# 1. Update Dashboard.tsx with Bulk Mode, Kanban View, and All Integrations
$dashboardContent = @'
'use client';

import { useState, useEffect } from 'react';
import { Task, Tag, Person } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskDetailsModal from '@/components/TaskDetailsModal';
import BulkActionsToolbar from '@/components/BulkActionsToolbar';
import KanbanBoard from '@/components/KanbanBoard';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Bulk mode states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const workspaceId = 'default-workspace';

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, peopleRes, tagsRes] = await Promise.all([
        fetch(`/api/tasks?workspace_id=${workspaceId}`),
        fetch(`/api/people?workspace_id=${workspaceId}`),
        fetch(`/api/tags?workspace_id=${workspaceId}`),
      ]);

      const tasksData = await tasksRes.json();
      const peopleData = await peopleRes.json();
      const tagsData = await tagsRes.json();

      setTasks(tasksData.data || []);
      setPeople(peopleData.data || []);
      setTags(tagsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle task selection toggle
  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelection = new Set(selectedTaskIds);
    if (selected) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    setSelectedTaskIds(newSelection);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedTaskIds(new Set());
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, payload?: any) => {
    if (selectedTaskIds.size === 0) return;

    setBulkLoading(true);
    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          taskIds: Array.from(selectedTaskIds),
          workspace_id: workspaceId,
          payload,
        }),
      });

      if (!response.ok) throw new Error('Bulk action failed');

      // Refresh task list
      await fetchData();
      clearSelection();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle task update (from Kanban drop)
  const handleTaskUpdated = async (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Group tasks by status for list view
  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    done: filteredTasks.filter((t) => t.status === 'done'),
    cancelled: filteredTasks.filter((t) => t.status === 'cancelled'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Todoist for Ledelse
            </h1>
            <div className="flex gap-2">
              {/* Bulk Mode Toggle */}
              <button
                onClick={() => {
                  setBulkMode(!bulkMode);
                  clearSelection();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  bulkMode
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {bulkMode ? 'BULK ON' : 'BULK'}
              </button>

              {/* View Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition text-sm"
              >
                {viewMode === 'list' ? 'KANBAN' : 'LIST'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            {/* Priority Filter */}
            <select
              value={selectedPriority || ''}
              onChange={(e) => setSelectedPriority(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Selection Counter (bulk mode) */}
          {bulkMode && selectedTaskIds.size > 0 && (
            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            people={people}
            tags={tags}
            onTaskUpdate={handleTaskUpdated}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setShowDetails(true);
            }}
            workspaceId={workspaceId}
          />
        ) : (
          // List view with status groups
          <div className="space-y-8">
            {/* To Do Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                To Do ({tasksByStatus.todo.length})
              </h2>
              <div className="space-y-3">
                {tasksByStatus.todo.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tasks in this column</p>
                ) : (
                  tasksByStatus.todo.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      bulkMode={bulkMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onSelectChange={handleSelectTask}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setShowDetails(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                In Progress ({tasksByStatus.in_progress.length})
              </h2>
              <div className="space-y-3">
                {tasksByStatus.in_progress.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tasks in this column</p>
                ) : (
                  tasksByStatus.in_progress.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      bulkMode={bulkMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onSelectChange={handleSelectTask}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setShowDetails(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Done Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Done ({tasksByStatus.done.length})
              </h2>
              <div className="space-y-3">
                {tasksByStatus.done.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tasks in this column</p>
                ) : (
                  tasksByStatus.done.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      bulkMode={bulkMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onSelectChange={handleSelectTask}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setShowDetails(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Cancelled Column */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Cancelled ({tasksByStatus.cancelled.length})
              </h2>
              <div className="space-y-3">
                {tasksByStatus.cancelled.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tasks in this column</p>
                ) : (
                  tasksByStatus.cancelled.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      bulkMode={bulkMode}
                      isSelected={selectedTaskIds.has(task.id)}
                      onSelectChange={handleSelectTask}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setShowDetails(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showDetails && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => {
            setShowDetails(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={(updatedTask) => {
            setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
            setSelectedTask(updatedTask);
          }}
          people={people}
          tags={tags}
          workspaceId={workspaceId}
        />
      )}

      {/* Bulk Actions Toolbar */}
      {bulkMode && selectedTaskIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedTaskIds.size}
          onMarkDone={() => handleBulkAction('mark-done')}
          onMarkCancelled={() => handleBulkAction('mark-cancelled')}
          onDelete={() => {
            if (
              confirm(
                `Delete ${selectedTaskIds.size} task${selectedTaskIds.size !== 1 ? 's' : ''}? This cannot be undone.`
              )
            ) {
              handleBulkAction('delete');
            }
          }}
          onClose={clearSelection}
          loading={bulkLoading}
        />
      )}
    </div>
  );
}
'@

Set-Content -Path "$dashboardPath\page.tsx" -Value $dashboardContent
Write-Host "SUCCESS: Updated app/dashboard/page.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "REMAINING MANUAL UPDATES:" -ForegroundColor Yellow
Write-Host "  1. Update app/components/TaskDetailsModal.tsx:" -ForegroundColor Yellow
Write-Host "     - Add Time tab with TimeTrackerPanel component" -ForegroundColor Gray
Write-Host "     - Add Apply Template button in checklist tab" -ForegroundColor Gray
Write-Host "     - Import ChecklistTemplateLibrary component" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Update app/components/ChecklistComponent.tsx:" -ForegroundColor Yellow
Write-Host "     - Add Save as Template button" -ForegroundColor Gray
Write-Host "     - Add handleSaveTemplate function calling /api/checklist-templates" -ForegroundColor Gray
Write-Host ""
Write-Host "See ADVANCED-FEATURES-GUIDE.md for integration details" -ForegroundColor Cyan
