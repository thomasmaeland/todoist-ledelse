import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('task_tags')
      .select('tag:tags(id, name, color)')
      .eq('task_id', task_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Task tags GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, tag_id } = body;

    if (!task_id || !tag_id) {
      return NextResponse.json(
        { error: 'task_id and tag_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if already exists
    const { data: existing } = await supabase
      .from('task_tags')
      .select()
      .eq('task_id', task_id)
      .eq('tag_id', tag_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Tag already added to this task' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('task_tags')
      .insert([{ task_id, tag_id }])
      .select('tag:tags(id, name, color)');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Task tags POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
