import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspace_id = searchParams.get('workspace_id');
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');

    console.log('[Tasks API] GET request', { workspace_id, project_id, status });

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    let query = supabase
      .from('tasks')
      .select(
        `*,
        task_tags(tag:tags(id, name, color)),
        task_people(person:people(id, name, email))`,
        { count: 'exact' }
      )
      .eq('workspace_id', workspace_id)
      .order('due_date', { ascending: true, nullsFirst: true });

    if (project_id) query = query.eq('project_id', project_id);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Tasks API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log('[Tasks API] Success', { count, data: data?.length });
    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('[Tasks API] Catch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, title, priority = 'medium', status = 'todo', due_date, project_id, description } = body;

    console.log('[Tasks API] POST request', { workspace_id, title });

    if (!workspace_id || !title) {
      return NextResponse.json(
        { error: 'workspace_id and title are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          workspace_id,
          title,
          description,
          priority,
          status,
          due_date,
          project_id,
        },
      ])
      .select();

    if (error) {
      console.error('[Tasks API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[Tasks API] Success');
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('[Tasks API] Catch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
