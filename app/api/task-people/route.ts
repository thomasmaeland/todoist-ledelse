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
      .from('task_people')
      .select('person:people(id, name, email, role)')
      .eq('task_id', task_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Task people GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, person_id } = body;

    if (!task_id || !person_id) {
      return NextResponse.json(
        { error: 'task_id and person_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if already exists
    const { data: existing } = await supabase
      .from('task_people')
      .select()
      .eq('task_id', task_id)
      .eq('person_id', person_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Person already assigned to this task' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('task_people')
      .insert([{ task_id, person_id }])
      .select('person:people(id, name, email, role)');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Task people POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
