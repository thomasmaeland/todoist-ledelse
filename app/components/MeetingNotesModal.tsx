'use client';

import { useState, useEffect } from 'react';
import { MeetingNote, MeetingType, Person } from '@/types';

interface MeetingNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  people: Person[];
  onNoteSaved: (note: MeetingNote) => void;
}

export default function MeetingNotesModal({
  isOpen,
  onClose,
  workspaceId,
  people,
  onNoteSaved,
}: MeetingNotesModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('1-1');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [personId, setPersonId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [tab, setTab] = useState<'new' | 'history'>('new');

  useEffect(() => {
    if (isOpen && tab === 'history') {
      fetchNotes();
    }
  }, [isOpen, tab]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `/api/meeting-notes?workspace_id=${workspaceId}&meeting_type=${meetingType}`
      );
      const result = await response.json();
      setNotes(result.data || []);
    } catch (error) {
      console.error('Error fetching meeting notes:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          title,
          content,
          meeting_type: meetingType,
          meeting_date: meetingDate || undefined,
          person_id: personId || undefined,
        }),
      });

      const newNote = await response.json();
      onNoteSaved(newNote);

      // Reset form
      setTitle('');
      setContent('');
      setPersonId('');
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setTab('history');
      fetchNotes();
    } catch (error) {
      console.error('Error saving meeting note:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 Meeting Notes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('new')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                tab === 'new'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              New Note
            </button>
            <button
              onClick={() => setTab('history')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                tab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'new' ? (
            <div className="space-y-4">
              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['1-1', 'team', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMeetingType(type)}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        meetingType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type === '1-1' ? '👤 1-1' : type === 'team' ? '👥 Team' : '🗂️ Other'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Person (for 1-1 meetings) */}
              {meetingType === '1-1' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    With
                  </label>
                  <select
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="input"
                  >
                    <option value="">Select person...</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="input"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Meeting title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="What was discussed? Any action items?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input resize-none h-32"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Note'}
                </button>
                <button onClick={onClose} className="btn-secondary px-4">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No meeting notes yet
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="card p-4 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {note.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {note.meeting_date
                          ? new Date(note.meeting_date).toLocaleDateString()
                          : new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {note.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {note.content}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                      {note.meeting_type === '1-1' ? '👤 1-1' : '👥 Team'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
