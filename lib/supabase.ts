import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side Supabase client (service role key - only in API routes)
export const createServiceClient = () => {
  return createClient(supabaseUrl, serviceRoleKey);
};

// Get workspace ID from localStorage (for now, hardcoded for MVP)
export const getWorkspaceId = () => {
  // TODO: This will come from auth/session later
  // For now, return a default workspace ID
  return typeof window !== 'undefined'
    ? localStorage.getItem('workspace_id') || 'default-workspace'
    : 'default-workspace';
};
