# Todoist for Ledelse - Deploy Final Components (Part 3)

$projectPath = "C:\Users\thoma\todoist-ledelse"
$appPath = "$projectPath\app"
$componentsPath = "$appPath\components"
$dashboardPath = "$appPath\dashboard"

Write-Host "🚀 Deploying final component files..." -ForegroundColor Cyan
Write-Host ""

# 1. ChecklistTemplateLibrary.tsx
$checklistTemplateLibraryContent = @'
'use client';

import { useState, useEffect } from 'react';

interface TemplateItem {
  id: string;
  title: string;
  order: number;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  checklist_template_items: TemplateItem[];
}

interface ChecklistTemplateLibraryProps {
  workspaceId: string;
  onSelectTemplate?: (template: ChecklistTemplate) => void;
  showDialog?: boolean;
  onClose?: () => void;
}

export default function ChecklistTemplateLibrary({
  workspaceId,
  onSelectTemplate,
  showDialog = false,
  onClose,
}: ChecklistTemplateLibraryProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateItems, setTemplateItems] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [workspaceId]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/checklist-templates?workspace_id=${workspaceId}`);
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return;

    const validItems = templateItems.filter((item) => item.trim());
    if (validItems.length === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/checklist-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: templateName,
          description: templateDescription || null,
          items: validItems.map((title, index) => ({
            title: title.trim(),
            order: index,
          })),
        }),
      });

      const newTemplate = await response.json();
      setTemplates([newTemplate, ...templates]);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateItems(['']);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      await fetch(`/api/checklist-templates/${templateId}`, { method: 'DELETE' });
      setTemplates(templates.filter((t) => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleAddItem = () => {
    setTemplateItems([...templateItems, '']);
  };

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...templateItems];
    newItems[index] = value;
    setTemplateItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index));
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          📋 Checklist Templates
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
      ) : (
        <>
          {/* Create Template Form */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition text-sm"
            >
              ➕ Create Template
            </button>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Sprint Review"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="What is this template for?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {templateItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateItem(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      {templateItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="px-2 py-2 text-gray-400 hover:text-red-500 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddItem}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add item
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTemplate}
                  disabled={submitting || !templateName.trim()}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm disabled:opacity-50"
                >
                  ✅ Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setTemplateName('');
                    setTemplateDescription('');
                    setTemplateItems(['']);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </p>

            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No templates yet. Create one to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer group"
                  >
                    <div
                      onClick={() => {
                        onSelectTemplate?.(template);
                        onClose?.();
                      }}
                      className="mb-2"
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {template.name}
                      </p>
                      {template.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {template.checklist_template_items?.length || 0} items
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (showDialog) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {content}
    </div>
  );
}
'@

Set-Content -Path "$componentsPath\ChecklistTemplateLibrary.tsx" -Value $checklistTemplateLibraryContent
Write-Host "✅ Created: app/components/ChecklistTemplateLibrary.tsx" -ForegroundColor Green

# 2. Update TaskCard.tsx with bulk mode
# This REPLACES the existing file
$taskCardContent = @'
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
'@

Set-Content -Path "$componentsPath\TaskCard.tsx" -Value $taskCardContent
Write-Host "✅ Updated: app/components/TaskCard.tsx (added bulk mode + time tracking)" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  IMPORTANT: Run deploy-features-part4.ps1 next to update Dashboard" -ForegroundColor Yellow
