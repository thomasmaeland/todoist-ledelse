import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspace_id = searchParams.get('workspace_id');

    console.log('[Projects API] GET request', { workspace_id });

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Projects API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[Projects API] Success', { count, data: data?.length });
    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('[Projects API] Catch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, name, description, color = '#3b82f6' } = body;

    console.log('[Projects API] POST request', { workspace_id, name });

    if (!workspace_id || !name) {
      return NextResponse.json(
        { error: 'workspace_id and name are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          workspace_id,
          name,
          description,
          color,
        },
      ])
      .select();

    if (error) {
      console.error('[Projects API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[Projects API] Success');
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('[Projects API] Catch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
