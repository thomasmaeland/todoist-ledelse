'use client';

import { Draggable } from 'react-beautiful-dnd';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: Task['status'];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  disabled?: boolean;
}

export default function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  disabled = false,
}: KanbanColumnProps) {
  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
          No tasks
        </p>
      ) : (
        tasks.map((task, index) => (
          <Draggable
            key={task.id}
            draggableId={task.id}
            index={index}
            isDragDisabled={disabled}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`transition ${
                  snapshot.isDragging
                    ? 'opacity-50 shadow-lg scale-105'
                    : 'opacity-100'
                }`}
              >
                <TaskCard
                  task={task}
                  onEdit={() => onTaskClick?.(task)}
                />
              </div>
            )}
          </Draggable>
        ))
      )}
    </div>
  );
}
