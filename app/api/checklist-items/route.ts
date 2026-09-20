// app/api/checklist-items/route.ts
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
      .from('checklist_items')
      .select('*')
      .eq('task_id', task_id)
      .order('order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Checklist Items API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist items', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, title, order = 0 } = body;

    if (!task_id || !title) {
      return NextResponse.json(
        { error: 'task_id and title are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('checklist_items')
      .insert([
        {
          task_id,
          title,
          completed: false,
          order,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('[Checklist Items API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checklist item', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed, title } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updateData: any = {};
    if (typeof completed === 'boolean') updateData.completed = completed;
    if (title) updateData.title = title;

    const { data, error } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('[Checklist Items API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Checklist Items API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete checklist item', details: String(error) },
      { status: 500 }
    );
  }
}
