export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MeetingType = '1-1' | 'team' | 'other';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Person {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingNote {
  id: string;
  workspace_id: string;
  title: string;
  content?: string;
  meeting_type: MeetingType;
  meeting_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  workspace_id: string;
  meeting_note_id?: string;
  title: string;
  description?: string;
  responsible_person_id?: string;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
}