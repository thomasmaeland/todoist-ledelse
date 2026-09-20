'use client';

import { useEffect, useState } from 'react';
import { Project, Tag } from '@/types';

interface SidebarProps {
  workspaceId: string;
  selectedProjectId?: string;
  selectedTagId?: string;
  onProjectSelect: (projectId?: string) => void;
  onTagSelect: (tagId?: string) => void;
}

export default function Sidebar({
  workspaceId,
  selectedProjectId,
  selectedTagId,
  onProjectSelect,
  onTagSelect,
}: SidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showNewTag, setShowNewTag] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchTags();
  }, [workspaceId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `/api/projects?workspace_id=${workspaceId}`
      );
      const result = await response.json();
      setProjects(result.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(
        `/api/tags?workspace_id=${workspaceId}`
      );
      const result = await response.json();
      setTags(result.data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: newProjectName,
          color: newProjectColor,
        }),
      });
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setShowNewProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: newTagName,
          color: newTagColor,
        }),
      });
      const newTag = await response.json();
      setTags([...tags, newTag]);
      setNewTagName('');
      setShowNewTag(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete project?')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        onProjectSelect(undefined);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete tag?')) return;
    try {
      await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      setTags(tags.filter((t) => t.id !== id));
      if (selectedTagId === id) {
        onTagSelect(undefined);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#10b981' },
  ];

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Todoist
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ledelse</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="px-2">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input text-sm"
          />
        </div>

        {/* Quick Navigation */}
        <div className="px-2">
          <button
            onClick={() => {
              onProjectSelect(undefined);
              onTagSelect(undefined);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              !selectedProjectId && !selectedTagId
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            📋 All Tasks
          </button>
        </div>

        {/* Projects Section */}
        <div className="px-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              📁 Projects
            </h3>
            {!showNewProject && (
              <button
                onClick={() => setShowNewProject(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-lg"
                title="Add project"
              >
                +
              </button>
            )}
          </div>

          {/* New Project Form */}
          {showNewProject && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3 fade-in">
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createProject()}
                className="input text-sm"
                autoFocus
              />
              <div className="space-y-2">
                <div className="flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewProjectColor(color.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        newProjectColor === color.value
                          ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 dark:ring-offset-gray-900'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createProject}
                    className="flex-1 btn-primary text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewProject(false)}
                    className="btn-secondary text-sm px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="space-y-1">
            {loading ? (
              <p className="text-xs text-gray-500 px-2">Loading...</p>
            ) : filteredProjects.length === 0 ? (
              <p className="text-xs text-gray-500 px-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </p>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
                    style={{ backgroundColor: project.color }}
                  />
                  <button
                    onClick={() => {
                      onProjectSelect(project.id);
                      onTagSelect(undefined);
                    }}
                    className={`flex-1 text-left text-sm font-medium transition ${
                      selectedProjectId === project.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {project.name}
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="px-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              🏷️ Tags
            </h3>
            {!showNewTag && (
              <button
                onClick={() => setShowNewTag(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-lg"
                title="Add tag"
              >
                +
              </button>
            )}
          </div>

          {/* New Tag Form */}
          {showNewTag && (
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 space-y-3 fade-in">
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTag()}
                className="input text-sm"
                autoFocus
              />
              <div className="space-y-2">
                <div className="flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewTagColor(color.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        newTagColor === color.value
                          ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 dark:ring-offset-gray-900'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createTag}
                    className="flex-1 btn-primary text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewTag(false)}
                    className="btn-secondary text-sm px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tags List */}
          <div className="space-y-1">
            {filteredTags.length === 0 ? (
              <p className="text-xs text-gray-500 px-2">
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </p>
            ) : (
              filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
                    style={{ backgroundColor: tag.color }}
                  />
                  <button
                    onClick={() => {
                      onTagSelect(tag.id);
                      onProjectSelect(undefined);
                    }}
                    className={`flex-1 text-left text-sm font-medium transition ${
                      selectedTagId === tag.id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
