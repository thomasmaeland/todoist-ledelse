'use client';

import { useState, useEffect } from 'react';

interface TimeEntry {
  id: string;
  duration_minutes: number;
  notes?: string;
  logged_date: string;
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
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

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
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;

    if (totalMinutes === 0) return;

    setAdding(true);
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          duration_minutes: totalMinutes,
          notes: notes || null,
        }),
      });

      const newEntry = await response.json();
      const updated = [...entries, newEntry];
      setEntries(updated);

      const totalTime = updated.reduce((sum, e) => sum + e.duration_minutes, 0);
      onTimeUpdated?.(totalTime);

      setHours('');
      setMinutes('');
      setNotes('');
    } catch (error) {
      console.error('Error adding time entry:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await fetch(`/api/time-entries/${entryId}`, { method: 'DELETE' });
      const updated = entries.filter((e) => e.id !== entryId);
      setEntries(updated);

      const totalTime = updated.reduce((sum, e) => sum + e.duration_minutes, 0);
      onTimeUpdated?.(totalTime);
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Total Time Logged
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {totalHours}h {totalMins}m
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Add Time Entry
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours
            </label>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minutes
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you work on?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleAddEntry}
          disabled={adding || (!hours && !minutes)}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Entry'}
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Entries
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No time entries yet
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.floor(entry.duration_minutes / 60)}h{' '}
                    {entry.duration_minutes % 60}m
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-gray-400 hover:text-red-500 transition text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
