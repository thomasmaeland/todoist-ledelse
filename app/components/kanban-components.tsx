'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task } from '@/types';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'Å gjøre', color: 'bg-slate-50 dark:bg-slate-800' },
  { id: 'in-progress', title: 'Pågår', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done', title: 'Ferdig', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'cancelled', title: 'Avbrutt', color: 'bg-red-50 dark:bg-red-900/20' },
];

interface KanbanProps {
  tasks: (Task & { recurring?: string })[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
}

// Individual Task Card for Kanban
function KanbanTaskCard({
  task,
  onDelete,
  onEdit,
}: {
  task: Task & { recurring?: string };
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}) {
  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300',
    medium: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group"
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
        {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('no-NO', { month: 'short', day: 'numeric' })}</span>}
        {task.timeTracked > 0 && (
          <span>⏱️ {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m</span>
        )}
      </div>
    </div>
  );
}

// Kanban Column
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
  return (
    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-1 ${column.color} rounded-lg p-4 min-h-[500px] transition-all duration-150 ${
            snapshot.isDraggingOver ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            {column.title} ({tasks.length})
          </h3>

          <div className="space-y-2">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-all duration-150 ${
                      snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                    }`}
                  >
                    <KanbanTaskCard
                      task={task}
                      onDelete={onTaskDelete}
                      onEdit={onTaskEdit}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          </div>

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// Main Kanban Board
export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskDelete,
  onTaskEdit,
}: KanbanProps) {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Drop outside a droppable
    if (!destination) return;

    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Different column - update task status
    if (source.droppableId !== destination.droppableId) {
      onTaskStatusChange(draggableId, destination.droppableId);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
