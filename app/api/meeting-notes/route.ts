import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspace_id = searchParams.get('workspace_id');
    const meeting_type = searchParams.get('meeting_type');

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    let query = supabase
      .from('meeting_notes')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('meeting_date', { ascending: false, nullsFirst: true });

    if (meeting_type) query = query.eq('meeting_type', meeting_type);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Meeting Notes API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting notes', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, title, content, meeting_type, meeting_date, person_id } = body;

    if (!workspace_id || !title) {
      return NextResponse.json(
        { error: 'workspace_id and title are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('meeting_notes')
      .insert([
        {
          workspace_id,
          title,
          content,
          meeting_type: meeting_type || 'other',
          meeting_date,
          person_id,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('[Meeting Notes API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting note', details: String(error) },
      { status: 500 }
    );
  }
}
