'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Task, Person, Tag } from '@/types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  people: Person[];
  tags: Tag[];
  onTaskUpdate: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
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
  const [loading, setLoading] = useState(false);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
    cancelled: tasks.filter((t) => t.status === 'cancelled'),
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as Task['status'];

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedTask = await response.json();
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-6">
        <Droppable droppableId="todo">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[600px] rounded-lg p-4 transition ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-100 dark:bg-gray-700/30'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                To Do
              </h3>
              <KanbanColumn
                status="todo"
                tasks={tasksByStatus.todo}
                onTaskClick={onTaskClick}
                disabled={loading}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="in_progress">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[600px] rounded-lg p-4 transition ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-100 dark:bg-gray-700/30'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                In Progress
              </h3>
              <KanbanColumn
                status="in_progress"
                tasks={tasksByStatus.in_progress}
                onTaskClick={onTaskClick}
                disabled={loading}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="done">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[600px] rounded-lg p-4 transition ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-100 dark:bg-gray-700/30'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Done
              </h3>
              <KanbanColumn
                status="done"
                tasks={tasksByStatus.done}
                onTaskClick={onTaskClick}
                disabled={loading}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="cancelled">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[600px] rounded-lg p-4 transition ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-100 dark:bg-gray-700/30'
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Cancelled
              </h3>
              <KanbanColumn
                status="cancelled"
                tasks={tasksByStatus.cancelled}
                onTaskClick={onTaskClick}
                disabled={loading}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
