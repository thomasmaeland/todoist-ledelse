# Todoist for Ledelse - Deploy 4 Advanced Features
# This script creates all necessary directories and files

$projectPath = "C:\Users\thoma\todoist-ledelse"
$appPath = "$projectPath\app"

Write-Host "🚀 Starting deployment of 4 advanced features..." -ForegroundColor Cyan
Write-Host ""

# Create directories
$dirsToCreate = @(
    "$appPath\api\tasks\bulk",
    "$appPath\api\time-entries",
    "$appPath\api\checklist-templates",
    "$appPath\components"
)

foreach ($dir in $dirsToCreate) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Already exists: $dir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📝 Creating API route files..." -ForegroundColor Cyan
Write-Host ""

# 1. Bulk Actions API
$bulkActionsContent = @'
// app/api/tasks/bulk/route.ts
import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskIds, workspace_id, payload } = body;

    if (!action || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'action and taskIds array are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    switch (action) {
      case 'delete':
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .in('id', taskIds);

        if (deleteError) throw deleteError;

        return NextResponse.json({
          success: true,
          message: `Deleted ${taskIds.length} task(s)`,
          count: taskIds.length,
        });

      case 'mark-done':
        const { error: doneError } = await supabase
          .from('tasks')
          .update({
            status: 'done',
            completed_at: new Date().toISOString(),
          })
          .in('id', taskIds);

        if (doneError) throw doneError;

        return NextResponse.json({
          success: true,
          message: `Marked ${taskIds.length} task(s) as done`,
          count: taskIds.length,
        });

      case 'mark-cancelled':
        const { error: cancelError } = await supabase
          .from('tasks')
          .update({ status: 'cancelled' })
          .in('id', taskIds);

        if (cancelError) throw cancelError;

        return NextResponse.json({
          success: true,
          message: `Cancelled ${taskIds.length} task(s)`,
          count: taskIds.length,
        });

      case 'assign-tag':
        if (!payload?.tagId) {
          return NextResponse.json(
            { error: 'tagId is required for assign-tag action' },
            { status: 400 }
          );
        }

        const tagAssignments = taskIds.map((taskId) => ({
          task_id: taskId,
          tag_id: payload.tagId,
        }));

        const { error: tagError } = await supabase
          .from('task_tags')
          .upsert(tagAssignments, { onConflict: 'task_id,tag_id' });

        if (tagError) throw tagError;

        return NextResponse.json({
          success: true,
          message: `Assigned tag to ${taskIds.length} task(s)`,
          count: taskIds.length,
        });

      case 'assign-people':
        if (!payload?.peopleIds || !Array.isArray(payload.peopleIds)) {
          return NextResponse.json(
            { error: 'peopleIds array is required for assign-people action' },
            { status: 400 }
          );
        }

        const peopleAssignments = taskIds.flatMap((taskId) =>
          payload.peopleIds.map((personId: string) => ({
            task_id: taskId,
            person_id: personId,
          }))
        );

        const { error: peopleError } = await supabase
          .from('task_people')
          .upsert(peopleAssignments, { onConflict: 'task_id,person_id' });

        if (peopleError) throw peopleError;

        return NextResponse.json({
          success: true,
          message: `Assigned people to ${taskIds.length} task(s)`,
          count: taskIds.length,
        });

      case 'unassign-tag':
        if (!payload?.tagId) {
          return NextResponse.json(
            { error: 'tagId is required for unassign-tag action' },
            { status: 400 }
          );
        }

        const { error: untagError } = await supabase
          .from('task_tags')
          .delete()
          .eq('tag_id', payload.tagId)
          .in('task_id', taskIds);

        if (untagError) throw untagError;

        return NextResponse.json({
          success: true,
          message: `Unassigned tag from ${taskIds.length} task(s)`,
          count: taskIds.length,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Bulk Actions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action', details: String(error) },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "$appPath\api\tasks\bulk\route.ts" -Value $bulkActionsContent
Write-Host "✅ Created: app/api/tasks/bulk/route.ts" -ForegroundColor Green

# 2. Time Entries API
$timeEntriesContent = @'
// app/api/time-entries/route.ts
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
      .from('time_entries')
      .select('*')
      .eq('task_id', task_id)
      .order('logged_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Time Entries API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, workspace_id, duration_minutes, notes, logged_date } = body;

    if (!task_id || !workspace_id || !duration_minutes) {
      return NextResponse.json(
        { error: 'task_id, workspace_id, and duration_minutes are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: entryData, error: entryError } = await supabase
      .from('time_entries')
      .insert([
        {
          task_id,
          workspace_id,
          duration_minutes,
          notes,
          logged_date: logged_date || new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (entryError) throw entryError;

    const { data: taskData } = await supabase
      .from('time_entries')
      .select('duration_minutes')
      .eq('task_id', task_id);

    if (taskData) {
      const totalMinutes = taskData.reduce(
        (sum: number, entry: any) => sum + entry.duration_minutes,
        0
      );

      await supabase
        .from('tasks')
        .update({ time_tracked_minutes: totalMinutes })
        .eq('id', task_id);
    }

    return NextResponse.json(entryData[0], { status: 201 });
  } catch (error) {
    console.error('[Time Entries API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, duration_minutes, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updateData: any = {};
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (notes !== undefined) updateData.notes = notes;

    const { data: entryData, error: updateError } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const { data: taskData } = await supabase
      .from('time_entries')
      .select('duration_minutes, task_id')
      .eq('task_id', entryData.task_id);

    if (taskData) {
      const totalMinutes = taskData.reduce(
        (sum: number, entry: any) => sum + entry.duration_minutes,
        0
      );

      await supabase
        .from('tasks')
        .update({ time_tracked_minutes: totalMinutes })
        .eq('id', entryData.task_id);
    }

    return NextResponse.json(entryData);
  } catch (error) {
    console.error('[Time Entries API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry', details: String(error) },
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

    const { data: entryData } = await supabase
      .from('time_entries')
      .select('task_id')
      .eq('id', id)
      .single();

    const { error: deleteError } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    if (entryData) {
      const { data: taskData } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('task_id', entryData.task_id);

      const totalMinutes = taskData?.reduce(
        (sum: number, entry: any) => sum + entry.duration_minutes,
        0
      ) || 0;

      await supabase
        .from('tasks')
        .update({ time_tracked_minutes: totalMinutes })
        .eq('id', entryData.task_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Time Entries API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry', details: String(error) },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "$appPath\api\time-entries\route.ts" -Value $timeEntriesContent
Write-Host "✅ Created: app/api/time-entries/route.ts" -ForegroundColor Green

# 3. Checklist Templates API
$checklistTemplatesContent = @'
// app/api/checklist-templates/route.ts
import { createServiceClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspace_id = searchParams.get('workspace_id');

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('checklist_templates')
      .select(
        `
        id,
        name,
        description,
        created_at,
        updated_at,
        checklist_template_items(id, title, "order")
      `
      )
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Checklist Templates API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, name, description, items } = body;

    if (!workspace_id || !name) {
      return NextResponse.json(
        { error: 'workspace_id and name are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: templateData, error: templateError } = await supabase
      .from('checklist_templates')
      .insert([
        {
          workspace_id,
          name,
          description,
        },
      ])
      .select()
      .single();

    if (templateError) throw templateError;

    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any, index: number) => ({
        template_id: templateData.id,
        title: item.title || item,
        order: item.order !== undefined ? item.order : index,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_template_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json(templateData, { status: 201 });
  } catch (error) {
    console.error('[Checklist Templates API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error: itemsError } = await supabase
      .from('checklist_template_items')
      .delete()
      .eq('template_id', id);

    if (itemsError) throw itemsError;

    const { error: templateError } = await supabase
      .from('checklist_templates')
      .delete()
      .eq('id', id);

    if (templateError) throw templateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Checklist Templates API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: String(error) },
      { status: 500 }
    );
  }
}
'@

Set-Content -Path "$appPath\api\checklist-templates\route.ts" -Value $checklistTemplatesContent
Write-Host "✅ Created: app/api/checklist-templates/route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Creating component files..." -ForegroundColor Cyan
Write-Host ""

# Component files will be in the next part due to character limit
# Create a marker file to show we're done with API routes
Write-Host "✅ All API routes created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Run deploy-features-part2.ps1 next to create component files" -ForegroundColor Yellow
