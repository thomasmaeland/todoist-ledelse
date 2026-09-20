'use client';

import { useState, useEffect } from 'react';
import { Task, Tag, Person } from '@/types';
import { KanbanBoard } from '../components/kanban-dndkit';

// Color & Icon System
const COLORS = {
  primary: 'red',     // Primary actions
  success: 'green',   // Done/completed
  neutral: 'gray',    // Default/inactive
  accent: 'blue',     // Secondary/info
};

const ICONS = {
  check: '✓',
  close: '✕',
  chevronDown: '▼',
  chevronRight: '▶',
  plus: '+',
  menu: '☰',
  user: '👤',
  search: '🔍',
  task: '☐',
  note: '📝',
  meeting: '👥',
  calendar: '📅',
  copy: '📋',
  arrow: '↳',
};

// Mock data
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Gjør 30 minutter med yoga',
    description: '',
    priority: 'low',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    timeTracked: 120,
    tags: [],
    assignees: [],
    workspaceId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurring: 'daily',
  },
  {
    id: '2',
    title: 'Tanlegetime',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    timeTracked: 0,
    tags: [],
    assignees: [],
    workspaceId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface MeetingNote {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
}

interface OneOnOne {
  id: string;
  name: string;
  date: string;
  notes: string;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  date: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  category?: string;
}

interface ChecklistSection {
  name: string;
  items: ChecklistItem[];
}

const SIDEBAR_ITEMS = [
  { label: 'I dag', icon: ICONS.calendar, id: 'today' },
  { label: 'Oppgaver', icon: ICONS.check, id: 'tasks' },
  { label: 'Møter 1-on-1', icon: ICONS.meeting, id: 'oneonones' },
  { label: 'Møtenotater', icon: ICONS.note, id: 'notes' },
  { label: 'Sjekklister', icon: ICONS.task, id: 'checklists' },
];

// Sort options
type SortOption = 'date' | 'priority' | 'name' | 'time';

// Task Card Component
function TaskCard({
  task,
  selected,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task & { recurring?: string };
  selected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  onToggle?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}) {
  const isCompleted = task.status === 'done';

  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300',
    medium: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('no-NO', { month: 'short', day: 'numeric' })
    : null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-150 group ${
        selected ? 'bg-red-50 dark:bg-red-900/10' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={isCompleted || selected}
        onChange={(e) => {
          if (onSelect) onSelect(task.id, e.target.checked);
          else if (onToggle) onToggle(task.id);
        }}
        className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0 py-0.5 cursor-pointer" onClick={() => onEdit?.(task)}>
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm leading-tight ${
              isCompleted
                ? 'line-through text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-gray-200'
            }`}
          >
            {task.title}
          </p>
          {task.recurring && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {task.recurring}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
            {task.priority}
          </span>
          {formattedDueDate && (
            <span className={`text-xs px-2 py-0.5 rounded ${isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              📅 {formattedDueDate}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags && task.tags.length > 0 && task.tags.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              #{tag}
            </span>
          ))}
          {task.assignees && task.assignees.length > 0 && task.assignees.map((person) => (
            <span key={person.id} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              👤 {person}
            </span>
          ))}
        </div>
        {task.timeTracked > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            ⏱️ {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete?.(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 hover:scale-110"
      >
        {ICONS.close}
      </button>
    </div>
  );
}

// Bulk Actions Toolbar
function BulkActionsToolbar({
  selectedCount,
  onMarkDone,
  onMarkCancelled,
  onDelete,
}: {
  selectedCount: number;
  onMarkDone: () => void;
  onMarkCancelled: () => void;
  onDelete: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 flex items-center gap-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {selectedCount} valgt
      </span>
      <button
        onClick={onMarkDone}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-all duration-150 hover:shadow-md"
      >
        {ICONS.check} Ferdig
      </button>
      <button
        onClick={onMarkCancelled}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-medium transition-all duration-150 hover:shadow-md"
      >
        Avbryt
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-all duration-150 hover:shadow-md"
      >
        {ICONS.close} Slett
      </button>
    </div>
  );
}

// Time Tracker Modal
function TimeTrackerModal({
  taskId,
  currentTime,
  onClose,
  onAddTime,
}: {
  taskId: string;
  currentTime: number;
  onClose: () => void;
  onAddTime: (minutes: number) => void;
}) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Logg tid
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Timer"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
              }
              placeholder="Min"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Total: <span className="font-semibold">{Math.floor(currentTime / 60)}h {currentTime % 60}m</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (hours > 0 || minutes > 0) {
                  onAddTime(hours * 60 + minutes);
                  onClose();
                }
              }}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-all duration-150 hover:shadow-md text-sm"
            >
              Legg til
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded font-medium transition-all duration-150 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Lukk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Checklist Detail Inline Component
function ChecklistDetailInline({
  checklist,
  onUpdate,
  onDelete,
  onCopyToNextMonth,
}: {
  checklist: Checklist;
  onUpdate: (checklist: Checklist) => void;
  onDelete: () => void;
  onCopyToNextMonth: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Annet');
  const [inlineAddItemId, setInlineAddItemId] = useState<string | null>(null);
  const [inlineNewText, setInlineNewText] = useState('');

  const categories = Array.from(new Set(checklist.items.map(item => item.category || 'Annet')));

  const getItemsByCategory = (category: string) => {
    return checklist.items.filter(item => (item.category || 'Annet') === category);
  };

  const filteredItems = (categoryItems: ChecklistItem[]) => {
    if (!searchQuery.trim()) return categoryItems;
    return categoryItems.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const categoryProgress = (category: string) => {
    const items = getItemsByCategory(category);
    const done = items.filter(i => i.done).length;
    return { done, total: items.length };
  };

  const totalProgress = () => {
    const done = checklist.items.filter(i => i.done).length;
    return { done, total: checklist.items.length };
  };

  const toggleSection = (category: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCategoryItems = (category: string, done: boolean) => {
    const updated = {
      ...checklist,
      items: checklist.items.map(item =>
        (item.category || 'Annet') === category ? { ...item, done } : item
      )
    };
    onUpdate(updated);
  };

  const toggleItem = (itemId: string) => {
    const updated = {
      ...checklist,
      items: checklist.items.map(item =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    };
    onUpdate(updated);
  };

  const deleteItem = (itemId: string) => {
    const updated = {
      ...checklist,
      items: checklist.items.filter(item => item.id !== itemId)
    };
    onUpdate(updated);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const updated = {
        ...checklist,
        items: [...checklist.items, {
          id: Date.now().toString(),
          text: newItemText.trim(),
          done: false,
          category: newItemCategory
        }]
      };
      onUpdate(updated);
      setNewItemText('');
    }
  };

  const handleAddItemInline = (afterItemId: string, category: string) => {
    if (inlineNewText.trim()) {
      const itemIndex = checklist.items.findIndex(i => i.id === afterItemId);
      const newItems = [...checklist.items];
      newItems.splice(itemIndex + 1, 0, {
        id: Date.now().toString(),
        text: inlineNewText.trim(),
        done: false,
        category: category
      });
      onUpdate({ ...checklist, items: newItems });
      setInlineNewText('');
      setInlineAddItemId(null);
    }
  };

  const { done: totalDone, total: totalItems } = totalProgress();
  const progressPercent = Math.round((totalDone / totalItems) * 100);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-1">
      {/* Optional Add Form - Hidden by default */}
      {showAddForm && (
        <div className="flex gap-0.5 px-1 pb-1 mb-1 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAddItem(); }}
            placeholder="Ny oppgave..."
            className="flex-1 px-1 py-0.5 border border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="px-1 py-0.5 border border-gray-300 dark:border-gray-600 text-xs text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => {
              handleAddItem();
              setShowAddForm(false);
            }}
            disabled={!newItemText.trim()}
            className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all duration-150 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓
          </button>
          <button
            onClick={() => setShowAddForm(false)}
            className="px-1 py-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-150"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-0">
        {categories.map((category) => {
          const items = getItemsByCategory(category);
          const filtered = filteredItems(items);
          const { done, total } = categoryProgress(category);
          const isExpanded = expandedSections.has(category);

          return (
            <div key={category}>
              {/* Section Header */}
              <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/20 group">
                <button
                  onClick={() => toggleSection(category)}
                  className="flex-1 flex items-center gap-1 px-1 py-0.5 transition-all duration-150"
                >
                  <span className="text-gray-300 dark:text-gray-600 text-xs leading-none w-3 transition-transform duration-200 inline-block">{isExpanded ? ICONS.chevronDown : ICONS.chevronRight}</span>
                  <h3 className="font-normal text-gray-600 dark:text-gray-400 text-xs leading-tight">{category}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-600 leading-tight">({done}/{total})</span>
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-all duration-150 hover:scale-110"
                >
                  {ICONS.plus}
                </button>
              </div>

              {/* Section Items */}
              {isExpanded && (
                <div className="space-y-0 py-0">
                  {filtered.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 py-1 italic px-1">Ingen oppgaver funnet</p>
                  )}
                  {filtered.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-1 px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 group">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleItem(item.id)}
                          className="w-3.5 h-3.5 rounded border border-gray-300 dark:border-gray-600 text-blue-600 cursor-pointer flex-shrink-0"
                        />
                        <span
                          className={`flex-1 text-base leading-relaxed ${
                            item.done
                              ? 'line-through text-gray-400 dark:text-gray-600'
                              : 'text-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => setInlineAddItemId(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs flex-shrink-0 transition-all duration-150 hover:scale-110"
                          title="Legg til oppgave under"
                        >
                          {ICONS.plus}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs flex-shrink-0 transition-all duration-150 hover:scale-110"
                        >
                          {ICONS.close}
                        </button>
                      </div>
                      {inlineAddItemId === item.id && (
                        <div className="flex items-center gap-1 px-1 py-0.5 bg-blue-50 dark:bg-blue-900/10 animate-in fade-in duration-150">
                          <span className="text-gray-400 text-xs">{ICONS.arrow}</span>
                          <input
                            type="text"
                            value={inlineNewText}
                            onChange={(e) => setInlineNewText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleAddItemInline(item.id, item.category || 'Annet');
                            }}
                            placeholder="Ny oppgave..."
                            className="flex-1 px-1 py-0.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddItemInline(item.id, item.category || 'Annet')}
                            className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all duration-150 hover:shadow-md"
                          >
                            {ICONS.plus}
                          </button>
                          <button
                            onClick={() => {
                              setInlineAddItemId(null);
                              setInlineNewText('');
                            }}
                            className="px-1 py-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-all duration-150 hover:scale-110"
                          >
                            {ICONS.close}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Bulk actions for section */}
                  <div className="flex gap-0.5 px-1 py-0 text-xs">
                    <button
                      onClick={() => toggleCategoryItems(category, true)}
                      className="text-green-600 dark:text-green-400 hover:underline transition-all duration-150 hover:font-medium"
                    >
                      {ICONS.check} Alle
                    </button>
                    <span className="text-gray-300">/</span>
                    <button
                      onClick={() => toggleCategoryItems(category, false)}
                      className="text-gray-500 dark:text-gray-400 hover:underline transition-all duration-150 hover:font-medium"
                    >
                      Avmerk
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions - Minimal */}
      <div className="flex gap-1 pt-0.5 mt-0.5 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCopyToNextMonth}
          className="flex-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium transition-all duration-150 hover:shadow-sm"
        >
          {ICONS.copy} Neste måned
        </button>
        <button
          onClick={onDelete}
          className="px-1 py-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs transition-all duration-150 hover:scale-110"
        >
          {ICONS.close}
        </button>
      </div>
    </div>
  );
}

// New Task Modal Component
function NewTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (task: Task & { recurring?: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState('none');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.some(t => t === newTag.trim())) {
      setTags([...tags, newTag.trim() as Tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: Tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCreate = () => {
    if (title.trim()) {
      onCreate({
        id: Date.now().toString(),
        title: title.trim(),
        description,
        priority,
        status: 'todo',
        dueDate,
        timeTracked: 0,
        tags,
        assignees: [],
        workspaceId: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recurring: recurring !== 'none' ? recurring : undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setRecurring('none');
      setTags([]);
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-xl w-full shadow-xl max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Ny oppgave</h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Tittel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="Hva må du gjøre?"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Beskrivelse</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Legg til detaljer..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Prioritet</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="low">Lav</option>
              <option value="medium">Medium</option>
              <option value="high">Høy</option>
              <option value="urgent">Haster</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Frist</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Recurring */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Gjentakelse</label>
          <select
            value={recurring}
            onChange={(e) => setRecurring(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="none">Ingen</option>
            <option value="daily">Daglig</option>
            <option value="weekly">Ukentlig</option>
            <option value="monthly">Månedlig</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddTag(); }}
              placeholder="Legg til tag..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-150 hover:shadow-md"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-900 dark:hover:text-red-200 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCreate}
          disabled={!title.trim()}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-150 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Opprett oppgave
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-150"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// New Checklist Modal Component
function NewChecklistModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, items: ChecklistItem[]) => void;
}) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<(ChecklistItem & { tempId: string })[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Oppgaver');
  const [categories, setCategories] = useState<string[]>(['Oppgaver', 'Annet']);

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setItems([
        ...items,
        {
          id: Date.now().toString() + Math.random(),
          tempId: Date.now().toString() + Math.random(),
          text: newItemText.trim(),
          done: false,
          category: newItemCategory,
        },
      ]);
      setNewItemText('');
    }
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId));
  };

  const handleAddCategory = () => {
    const newCat = prompt('Ny kategori:');
    if (newCat && newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewItemCategory(newCat.trim());
    }
  };

  const handleCreate = () => {
    if (title.trim() && items.length > 0) {
      const finalItems = items.map(({ tempId, ...rest }) => rest);
      onCreate(title, finalItems);
      setTitle('');
      setItems([]);
      setNewItemText('');
      setNewItemCategory('Oppgaver');
      onClose();
    }
  };

  const itemsByCategory = categories.map((cat) => ({
    category: cat,
    items: items.filter((item) => item.category === cat),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ny sjekkliste</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg">
          ✕
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Sjekkliste navn..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Item Input */}
        <div className="col-span-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddItem();
            }}
            placeholder="Legg til oppgave..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Select */}
        <div className="flex gap-1">
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddCategory}
            className="px-2 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded text-sm font-medium transition-all duration-150"
          >
            +
          </button>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddItem}
        disabled={!newItemText.trim()}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium mb-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md"
      >
        Legg til oppgave
      </button>

      {/* Items Preview */}
      {items.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Oppgaver ({items.length})</h3>

          <div className="space-y-3">
            {itemsByCategory.map(({ category, items: catItems }) =>
              catItems.length > 0 ? (
                <div key={category}>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">📂 {category}</p>
                  <div className="space-y-1 ml-3">
                    {catItems.map((item) => (
                      <div key={item.tempId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded text-sm group">
                        <span className="text-gray-900 dark:text-gray-200">{item.text}</span>
                        <button
                          onClick={() => handleRemoveItem(item.tempId)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs transition-all duration-150 hover:scale-110"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleCreate}
          disabled={!title.trim() || items.length === 0}
          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md"
        >
          Opprett sjekkliste
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-150"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// Task Detail Sidebar
function TaskDetailSidebar({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: (Task & { recurring?: string }) | null;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [recurring, setRecurring] = useState(task.recurring || 'none');
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [newTag, setNewTag] = useState('');
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [tags, setTags] = useState<Tag[]>(task.tags || []);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.some(t => t === newTag.trim())) {
      setTags([...tags, newTag.trim() as Tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: Tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rediger oppgave</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl transition-all duration-150 hover:scale-110">{ICONS.close}</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Tittel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Oppgave tittel"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Beskrivelse</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Legg til detaljer..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Prioritet</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="low">Lav</option>
            <option value="medium">Medium</option>
            <option value="high">Høy</option>
            <option value="urgent">Haster</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Frist</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Gjentakelse</label>
          <select
            value={recurring}
            onChange={(e) => setRecurring(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="none">Ingen</option>
            <option value="daily">Daglig</option>
            <option value="weekly">Ukentlig</option>
            <option value="monthly">Månedlig</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddTag(); }}
              placeholder="Legg til tag..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-md"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-900 dark:hover:text-red-200 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Tid logget</label>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span className="text-sm text-gray-900 dark:text-gray-200">
              {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m
            </span>
            <button
              onClick={() => setShowTimeTracker(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-all duration-150 hover:shadow-md"
            >
              Logg tid
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-2">
        <button
          onClick={() => {
            onUpdate({ ...task, title, description, priority, dueDate, recurring: recurring as any, tags });
            onClose();
          }}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-150 hover:shadow-md"
        >
          Lagre endringer
        </button>
        <button
          onClick={() => {
            onDelete(task.id);
            onClose();
          }}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-150"
        >
          Slett oppgave
        </button>
      </div>

      {showTimeTracker && (
        <TimeTrackerModal
          taskId={task.id}
          currentTime={task.timeTracked}
          onClose={() => setShowTimeTracker(false)}
          onAddTime={(minutes) => {
            const updated = { ...task, timeTracked: (task.timeTracked || 0) + minutes };
            onUpdate(updated);
            setShowTimeTracker(false);
          }}
        />
      )}
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const [tasks, setTasks] = useState<(Task & { recurring?: string })[]>(MOCK_TASKS);
  const [notes, setNotes] = useState<MeetingNote[]>([
    { id: '1', title: 'Møte ledelse', content: 'Diskuterte strategi', date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() },
  ]);
  const [oneOnOnes, setOneOnOnes] = useState<OneOnOne[]>([
    { id: '1', name: 'Team standup', date: new Date().toISOString().split('T')[0], notes: '' },
  ]);
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: '1',
      title: 'Månedsrapportering September',
      date: new Date().toISOString().split('T')[0],
      items: [
        { id: '1', text: 'Samle salgsdata', done: true, category: 'Salg' },
        { id: '2', text: 'Beregn konverteringsrate', done: true, category: 'Salg' },
        { id: '3', text: 'Gjennomgå pipelineverdi', done: false, category: 'Salg' },
        { id: '4', text: 'Oppdater kundestatus', done: false, category: 'Salg' },
        { id: '5', text: 'Sjekk lagerstatus', done: false, category: 'Operasjoner' },
        { id: '6', text: 'Gjennomgå prosesser', done: true, category: 'Operasjoner' },
        { id: '7', text: 'QA testing rapport', done: false, category: 'Operasjoner' },
        { id: '8', text: 'Finansiell oversikt', done: false, category: 'Finans' },
        { id: '9', text: 'Revisjon av budsjett', done: true, category: 'Finans' },
        { id: '10', text: 'Fakturering', done: false, category: 'Finans' },
      ],
    },
  ]);
  const [activeTab, setActiveTab] = useState('today');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<(Task & { recurring?: string }) | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewOneOnOne, setShowNewOneOnOne] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newOneOnOneName, setNewOneOnOneName] = useState('');
  const [newOneOnOneNotes, setNewOneOnOneNotes] = useState('');
  const [showNewChecklist, setShowNewChecklist] = useState(false);
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) newSelected.add(taskId);
    else newSelected.delete(taskId);
    setSelectedTasks(newSelected);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleBulkMarkDone = () => {
    setTasks(
      tasks.map((t) => (selectedTasks.has(t.id) ? { ...t, status: 'done' } : t))
    );
    setSelectedTasks(new Set());
  };

  const handleBulkMarkCancelled = () => {
    setTasks(
      tasks.map((t) => (selectedTasks.has(t.id) ? { ...t, status: 'cancelled' } : t))
    );
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = () => {
    setTasks(tasks.filter((t) => !selectedTasks.has(t.id)));
    setSelectedTasks(new Set());
  };

  const handleCopyChecklistToNextMonth = (checklist: Checklist) => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthDate = nextMonth.toISOString().split('T')[0];
    const monthName = nextMonth.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' });

    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title: `${checklist.title} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
      date: nextMonthDate,
      items: checklist.items.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        done: false // Reset completion status
      }))
    };

    setChecklists([...checklists, newChecklist]);
    // Show success feedback by scrolling/focusing, then close expanded view
    setExpandedChecklistId(null);
  };

  const sortTasks = (tasksToSort: typeof tasks) => {
    const sorted = [...tasksToSort];
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return sorted.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'time':
        return sorted.sort((a, b) => (b.timeTracked || 0) - (a.timeTracked || 0));
      case 'date':
      default:
        return sorted.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }
  };

  const activeTasks = sortTasks(tasks.filter((t) => t.status === 'todo'));
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header with User */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-150">
            <span className="text-lg">{ICONS.user}</span>
            <span className="font-medium text-gray-900 dark:text-white text-sm flex-1 text-left">Du</span>
            <span className="text-xs text-gray-500">{ICONS.chevronDown}</span>
          </button>
        </div>

        {/* Quick Add */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowNewTask(true)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition-all duration-150 hover:shadow-md"
          >
            <span>{ICONS.plus}</span> Legg til oppgave
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Søk..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                activeTab === item.id
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium shadow-sm'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* My Projects Section */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-500 uppercase tracking-wide mb-3 px-1">Mine prosjekter</h3>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
              activeTab === 'checklists'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium shadow-sm'
                : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
            }`}
          >
            <span>{ICONS.task}</span>
            <span>Sjekklister</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between bg-white dark:bg-gray-800">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'today' ? 'I dag' : activeTab === 'tasks' ? 'Oppgaver' : activeTab === 'oneonones' ? 'Møter 1-on-1' : activeTab === 'notes' ? 'Møtenotater' : 'Sjekklister'}
            </h1>
          </div>
          {activeTab === 'tasks' && (
            <div className="flex items-center gap-3">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setTaskViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    taskViewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  📋 Liste
                </button>
                <button
                  onClick={() => setTaskViewMode('kanban')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    taskViewMode === 'kanban'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  📊 Kanban
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="date">Sorter: Dato</option>
                <option value="priority">Sorter: Prioritet</option>
                <option value="name">Sorter: Navn</option>
                <option value="time">Sorter: Tid logget</option>
              </select>
            </div>
          )}
          {activeTab === 'today' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="date">Sorter: Dato</option>
              <option value="priority">Sorter: Prioritet</option>
              <option value="name">Sorter: Navn</option>
              <option value="time">Sorter: Tid logget</option>
            </select>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          {activeTab === 'today' && (
            <div className="max-w-4xl">
              {activeTasks.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <div className="px-8 py-5">
                    <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Aktive oppgaver</h2>
                  </div>
                  <div>
                    {activeTasks.map((t) => (
                      <TaskCard key={t.id} task={t} selected={selectedTasks.has(t.id)} onSelect={handleSelectTask} onToggle={handleToggleTask} onEdit={setSelectedTask} onDelete={handleDeleteTask} />
                    ))}
                  </div>
                </div>
              )}
              {doneTasks.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <div className="px-8 py-5">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wide">Ferdig ({doneTasks.length})</h2>
                  </div>
                  <div>
                    {doneTasks.map((t) => (
                      <TaskCard key={t.id} task={t} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                    ))}
                  </div>
                </div>
              )}
              {activeTasks.length === 0 && doneTasks.length === 0 && (
                <div className="px-8">
                  <EmptyState
                    icon={ICONS.task}
                    title="Ingen oppgaver i dag"
                    description="Se ut til at du har gjort alt! Eller legg til nye oppgaver."
                    action={{ label: '+ Legg til oppgave', onClick: () => setShowNewTask(true) }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-4xl">
              {notes.length > 0 && (
                <div>
                  <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Møtenotater ({notes.length})</h2>
                  </div>
                  <div className="px-8 py-4 space-y-2">
                    {notes.map((n) => (
                      <div key={n.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-all duration-150">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{n.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{n.content}</p>
                            <p className="text-xs text-gray-500 mt-2">{n.date}</p>
                          </div>
                          <button onClick={() => setNotes(notes.filter((x) => x.id !== n.id))} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {notes.length === 0 && (
                <div className="px-8">
                  <EmptyState
                    icon={ICONS.note}
                    title="Ingen møtenotater ennå"
                    description="Opprett ditt første møtenotat for å holde styr på diskusjoner og avgjørelser."
                    action={{ label: '+ Nytt møtenotat', onClick: () => setShowNewNote(true) }}
                  />
                </div>
              )}
              <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-800">
                <button onClick={() => setShowNewNote(true)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-2">
                  <span>+</span> Nytt møtenotat
                </button>
              </div>
            </div>
          )}

          {activeTab === 'oneonones' && (
            <div className="max-w-4xl">
              {oneOnOnes.length > 0 && (
                <div>
                  <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Møter 1-on-1 ({oneOnOnes.length})</h2>
                  </div>
                  <div className="px-8 py-4 space-y-2">
                    {oneOnOnes.map((m) => (
                      <div key={m.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-all duration-150">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{m.name}</h3>
                            {m.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{m.notes}</p>}
                            <p className="text-xs text-gray-500 mt-2">{m.date}</p>
                          </div>
                          <button onClick={() => setOneOnOnes(oneOnOnes.filter((x) => x.id !== m.id))} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {oneOnOnes.length === 0 && (
                <div className="px-8">
                  <EmptyState
                    icon={ICONS.meeting}
                    title="Ingen møter planlagt"
                    description="Planlegg 1-on-1 møter med teammedlemmer dine for bedre kommunikasjon."
                    action={{ label: '+ Nytt møte', onClick: () => setShowNewOneOnOne(true) }}
                  />
                </div>
              )}
              <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-800">
                <button onClick={() => setShowNewOneOnOne(true)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-2">
                  <span>+</span> Nytt møte
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <>
              {taskViewMode === 'list' ? (
                <div className="max-w-4xl">
                  {tasks.length > 0 && (
                    <>
                      {activeTasks.length > 0 && (
                        <div className="border-b border-gray-200 dark:border-gray-800">
                          <div className="px-8 py-5">
                            <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Aktive ({activeTasks.length})</h2>
                          </div>
                          <div>
                            {activeTasks.map((t) => (
                              <TaskCard key={t.id} task={t} selected={selectedTasks.has(t.id)} onSelect={handleSelectTask} onToggle={handleToggleTask} onEdit={setSelectedTask} onDelete={handleDeleteTask} />
                            ))}
                          </div>
                        </div>
                      )}
                      {doneTasks.length > 0 && (
                        <div className="border-b border-gray-200 dark:border-gray-800">
                          <div className="px-8 py-5">
                            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wide">Ferdig ({doneTasks.length})</h2>
                          </div>
                          <div>
                            {doneTasks.map((t) => (
                              <TaskCard key={t.id} task={t} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {tasks.length === 0 && (
                    <div className="px-8">
                      <EmptyState
                        icon={ICONS.task}
                        title="Ingen oppgaver"
                        description="Du har ingen oppgaver registrert ennå. Lag din første oppgave for å komme i gang."
                        action={{ label: '+ Legg til oppgave', onClick: () => setShowNewTask(true) }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <KanbanBoard
                  tasks={tasks}
                  onTaskStatusChange={(taskId, newStatus) => {
                    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)));
                  }}
                  onTaskDelete={handleDeleteTask}
                  onTaskEdit={setSelectedTask}
                />
              )}
            </>
          )}

          {activeTab === 'checklists' && (
            <div className="max-w-4xl">
              {checklists.length > 0 && (
                <div>
                  <div className="px-8 py-1">
                    <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Sjekklister ({checklists.length})</h2>
                  </div>
                  <div className="px-8 py-0 space-y-0">
                    {checklists.map((c) => {
                      const completedCount = c.items.filter((i) => i.done).length;
                      const progressPercent = Math.round((completedCount / c.items.length) * 100);
                      const isExpanded = expandedChecklistId === c.id;

                      return (
                        <div key={c.id} className="space-y-0.5">
                          {/* Checklist Header Card */}
                          <div
                            onClick={() => setExpandedChecklistId(isExpanded ? null : c.id)}
                            className="px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer transition-all duration-150 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 dark:text-gray-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
                              <h3 className="font-medium text-sm text-gray-900 dark:text-white">{c.title}</h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({completedCount}/{c.items.length})</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setChecklists(checklists.filter((x) => x.id !== c.id));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity flex-shrink-0 text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Expanded Detail View */}
                          {isExpanded && (
                            <ChecklistDetailInline
                              checklist={c}
                              onUpdate={(updated) => {
                                setChecklists(checklists.map(cl => cl.id === updated.id ? updated : cl));
                              }}
                              onDelete={() => {
                                setChecklists(checklists.filter(cl => cl.id !== c.id));
                                setExpandedChecklistId(null);
                              }}
                              onCopyToNextMonth={() => handleCopyChecklistToNextMonth(c)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {checklists.length === 0 && (
                <div className="px-8">
                  <EmptyState
                    icon={ICONS.copy}
                    title="Ingen sjekklister"
                    description="Lag sjekklister for å organisere gjentakende oppgaver og prosesser."
                    action={{ label: '+ Ny sjekkliste', onClick: () => setShowNewChecklist(true) }}
                  />
                </div>
              )}
              <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-800">
                <button onClick={() => setShowNewChecklist(true)} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-2">
                  <span>+</span> Ny sjekkliste
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Sidebar */}
      {selectedTask && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSelectedTask(null)} />
          <TaskDetailSidebar task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={(t) => setTasks(tasks.map((x) => (x.id === t.id ? t : x)))} onDelete={handleDeleteTask} />
        </>
      )}

      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <NewTaskModal
            onClose={() => setShowNewTask(false)}
            onCreate={(newTask) => {
              setTasks([...tasks, newTask]);
              setShowNewTask(false);
            }}
          />
        </div>
      )}

      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nytt møtenotat</h2>
            <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Tittel..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white mb-3" autoFocus />
            <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Innhold..." rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { if (newNoteTitle.trim()) { setNotes([...notes, { id: Date.now().toString(), title: newNoteTitle, content: newNoteContent, date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() }]); setNewNoteTitle(''); setNewNoteContent(''); setShowNewNote(false); } }} className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">Opprett</button>
              <button onClick={() => setShowNewNote(false)} className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showNewOneOnOne && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nytt 1-on-1 møte</h2>
            <input type="text" value={newOneOnOneName} onChange={(e) => setNewOneOnOneName(e.target.value)} placeholder="Navn (person eller team)..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white mb-3" autoFocus />
            <textarea value={newOneOnOneNotes} onChange={(e) => setNewOneOnOneNotes(e.target.value)} placeholder="Notater..." rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:bg-gray-700 dark:text-white mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { if (newOneOnOneName.trim()) { setOneOnOnes([...oneOnOnes, { id: Date.now().toString(), name: newOneOnOneName, date: new Date().toISOString().split('T')[0], notes: newOneOnOneNotes }]); setNewOneOnOneName(''); setNewOneOnOneNotes(''); setShowNewOneOnOne(false); } }} className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">Opprett</button>
              <button onClick={() => setShowNewOneOnOne(false)} className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showNewChecklist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <NewChecklistModal
            onClose={() => setShowNewChecklist(false)}
            onCreate={(title, items) => {
              setChecklists([...checklists, {
                id: Date.now().toString(),
                title,
                items: items.map(item => ({
                  ...item,
                  id: Date.now().toString() + Math.random()
                })),
                date: new Date().toISOString().split('T')[0]
              }]);
              setShowNewChecklist(false);
            }}
          />
        </div>
      )}

      <BulkActionsToolbar selectedCount={selectedTasks.size} onMarkDone={handleBulkMarkDone} onMarkCancelled={handleBulkMarkCancelled} onDelete={handleBulkDelete} />
    </div>
  );
}
