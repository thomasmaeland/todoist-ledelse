'use client';

import { useState, useEffect } from 'react';

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface ChecklistComponentProps {
  taskId: string;
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  editable?: boolean;
}

export default function ChecklistComponent({
  taskId,
  items,
  onItemsChange,
  editable = true,
}: ChecklistComponentProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(items);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecklist(items);
  }, [items]);

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  const addItem = async () => {
    if (!newItemTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/checklist-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          title: newItemTitle,
          order: checklist.length,
        }),
      });

      const newItem = await response.json();
      const updated = [...checklist, newItem];
      setChecklist(updated);
      onItemsChange(updated);
      setNewItemTitle('');
    } catch (error) {
      console.error('Error adding checklist item:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string, completed: boolean) => {
    try {
      await fetch('/api/checklist-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, completed: !completed }),
      });

      const updated = checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !completed } : item
      );
      setChecklist(updated);
      onItemsChange(updated);
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/checklist-items?id=${itemId}`, { method: 'DELETE' });
      const updated = checklist.filter((item) => item.id !== itemId);
      setChecklist(updated);
      onItemsChange(updated);
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  if (checklist.length === 0 && !editable) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          ✓ Sjekkliste
          {checklist.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({completedCount}/{checklist.length})
            </span>
          )}
        </h3>
      </div>

      {/* Progress Bar */}
      {checklist.length > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {Math.round(progressPercent)}% ferdig
          </p>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2 mb-4">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-600 rounded transition group"
          >
            <button
              onClick={() => toggleItem(item.id, item.completed)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                item.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 dark:border-gray-500 hover:border-green-500'
              }`}
            >
              {item.completed && <span className="text-white text-sm">✓</span>}
            </button>
            <span
              className={`flex-1 ${
                item.completed
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.title}
            </span>
            {editable && (
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Item */}
      {editable && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Legg til punkt..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="input text-sm flex-1"
          />
          <button
            onClick={addItem}
            disabled={!newItemTitle.trim() || loading}
            className="btn-primary text-sm px-3"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
