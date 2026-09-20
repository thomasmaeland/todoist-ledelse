'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'Å gjøre', color: 'bg-slate-50 dark:bg-slate-800' },
  { id: 'in-progress', title: 'Pågår', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done', title: 'Ferdig', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'cancelled', title: 'Avbrutt', color: 'bg-red-50 dark:bg-red-900/20' },
];

// Draggable Task Card
function SortableTaskCard({
  task,
  onDelete,
  onEdit,
}: {
  task: Task & { recurring?: string };
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300',
    medium: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-1 leading-tight">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs transition-all duration-150"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}
        >
          {task.priority}
        </span>
        {task.recurring && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {task.recurring}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {task.dueDate && (
          <span>
            📅{' '}
            {new Date(task.dueDate).toLocaleDateString('no-NO', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        {task.timeTracked > 0 && (
          <span>
            ⏱️ {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m
          </span>
        )}
      </div>
    </div>
  );
}

// Kanban Column with droppable area
function KanbanColumn({
  column,
  tasks,
  onTaskDelete,
  onTaskEdit,
}: {
  column: (typeof KANBAN_COLUMNS)[0];
  tasks: (Task & { recurring?: string })[];
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
}) {
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className={`flex-1 ${column.color} rounded-lg p-4 min-h-[500px] transition-all duration-150`}>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
        {column.title} ({tasks.length})
      </h3>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onDelete={onTaskDelete}
              onEdit={onTaskEdit}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// Main Kanban Board
interface KanbanBoardProps {
  tasks: (Task & { recurring?: string })[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
}

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskDelete,
  onTaskEdit,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if the status actually changed
    if (newStatus !== active.data?.current?.sortable?.containerId) {
      onTaskStatusChange(taskId, newStatus);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full p-8 overflow-x-auto">
        {KANBAN_COLUMNS.map((column) => (
          <SortableContext
            key={column.id}
            items={[column.id]}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              column={column}
              tasks={getTasksByStatus(column.id)}
              onTaskDelete={onTaskDelete}
              onTaskEdit={onTaskEdit}
            />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}
