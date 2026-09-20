import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');
    const workspace_id = searchParams.get('workspace_id');

    if (!task_id || !workspace_id) {
      return NextResponse.json(
        { error: 'Missing task_id or workspace_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('task_id', task_id)
      .eq('workspace_id', workspace_id)
      .order('logged_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { task_id, workspace_id, duration_minutes, notes } = await request.json();

    if (!task_id || !workspace_id || !duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create time entry
    const { data: entryData, error: entryError } = await supabase
      .from('time_entries')
      .insert({
        task_id,
        workspace_id,
        duration_minutes,
        notes: notes || null,
        logged_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Update task's total time
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('time_tracked_minutes')
      .eq('id', task_id)
      .single();

    const newTotal = (currentTask?.time_tracked_minutes || 0) + duration_minutes;

    await supabase
      .from('tasks')
      .update({ time_tracked_minutes: newTotal })
      .eq('id', task_id);

    return NextResponse.json({
      data: entryData,
      totalTime: newTotal,
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry', details: String(error) },
      { status: 500 }
    );
  }
}

