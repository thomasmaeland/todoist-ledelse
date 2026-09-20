'use client';

import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  bulkMode?: boolean;
  isSelected?: boolean;
  onSelectChange?: (taskId: string, selected: boolean) => void;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({
  task,
  onClick,
  bulkMode = false,
  isSelected = false,
  onSelectChange,
  onEdit,
}: TaskCardProps) {
  const priorityColors = {
    low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  };

  const statusEmojis = {
    todo: '📋',
    in_progress: '🔄',
    done: '✅',
    cancelled: '⛔',
  };

  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('no-NO', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div
      className={`p-4 rounded-lg border transition cursor-pointer group ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => {
        if (!bulkMode) {
          onEdit?.(task);
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox (visible in bulk mode) */}
        {bulkMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelectChange?.(task.id, e.target.checked);
            }}
            className="w-5 h-5 mt-1 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {statusEmojis[task.status as keyof typeof statusEmojis]} {task.title}
          </h3>

          {/* Description Preview */}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {task.description}
            </p>
          )}

          {/* Tags and Metadata */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Priority Badge */}
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                priorityColors[task.priority as keyof typeof priorityColors].bg
              } ${priorityColors[task.priority as keyof typeof priorityColors].text}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            {/* Due Date Badge */}
            {formattedDueDate && (
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  isOverdue
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                📅 {formattedDueDate}
              </span>
            )}

            {/* Time Tracked */}
            {task.time_tracked_minutes && task.time_tracked_minutes > 0 && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                ⏱️ {Math.floor(task.time_tracked_minutes / 60)}h {task.time_tracked_minutes % 60}m
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag) => (
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
            </div>
          )}
        </div>

        {/* Right Actions (hover) */}
        {!bulkMode && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
