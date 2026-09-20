# Phase 1 Implementation: Drag & Drop + Bulk Actions

## What's New

This Phase 1 implementation adds two major features to your Todoist Ledelse dashboard:

### 1. **Kanban Board View** (Drag & Drop)
- Toggle between List and Kanban views
- Drag tasks between columns: Å gjøre → Pågår → Ferdig → Avbrutt
- Real-time status updates when dropping tasks
- Visual feedback during dragging
- Column count indicators

### 2. **Bulk Actions**
- Select multiple tasks with checkboxes
- Floating toolbar appears when tasks are selected
- Bulk actions available:
  - Mark as Done (✓)
  - Mark as Cancelled
  - Delete

## Installation Steps

### 1. Install Dependencies

```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

### 2. File Updates

Replace or update these files in your project:

#### Option A: Complete Replacement
Copy `dashboard-phase1-enhanced.tsx` to `app/dashboard/page.tsx`

This file includes:
- All Phase 2 UI polish features (from previous implementation)
- NEW: Kanban board view
- NEW: Improved bulk actions toolbar
- Full list view with selection checkboxes

#### Option B: Merge Manually
If you want to keep custom modifications:

1. **Copy Kanban components** from `kanban-components.tsx`
   - `KanbanTaskCard` component
   - `KanbanColumn` component  
   - `KanbanBoard` component

2. **Add to Dashboard state** (line ~1240):
   ```typescript
   const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
   ```

3. **Add view toggle button** in the header section (line ~1392):
   ```typescript
   <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
     <button
       onClick={() => setViewMode('list')}
       className={`px-4 py-2 text-sm font-medium transition-all duration-150 ${
         viewMode === 'list'
           ? 'bg-red-600 text-white'
           : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
       }`}
     >
       📋 Liste
     </button>
     <button
       onClick={() => setViewMode('kanban')}
       className={`px-4 py-2 text-sm font-medium transition-all duration-150 ${
         viewMode === 'kanban'
           ? 'bg-red-600 text-white'
           : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
       }`}
     >
       📊 Kanban
     </button>
   </div>
   ```

4. **Update content area** to render both views:
   ```typescript
   {viewMode === 'list' && (
     // Existing list view code
   )}
   
   {viewMode === 'kanban' && (
     <KanbanBoardView
       tasks={tasks}
       onTaskStatusChange={handleTaskStatusChange}
       onTaskDelete={handleDeleteTask}
       onTaskEdit={setSelectedTask}
     />
   )}
   ```

### 3. API Endpoint (Optional - for backend integration)

Copy `api-tasks-bulk.ts` to `app/api/tasks/bulk/route.ts`

This provides a backend endpoint for bulk operations:
- `POST /api/tasks/bulk`
- Actions: `delete`, `mark-done`, `mark-cancelled`
- Can be connected to Supabase or your database

### 4. Update Imports

Add to your `types.ts` if not already present:

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  dueDate: string;
  timeTracked: number;
  tags: Tag[];
  assignees: Person[];
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

## Usage

### Kanban Board
1. Click the **📊 Kanban** button in the header
2. Drag tasks between columns to change their status
3. Tasks update instantly as you drop them
4. Click a task card to edit it

### Bulk Actions
1. In List view, check the boxes next to tasks
2. A toolbar appears at the bottom when tasks are selected
3. Choose an action:
   - **✓ Ferdig** - Mark selected tasks as done
   - **Avbryt** - Mark selected tasks as cancelled
   - **✕ Slett** - Delete selected tasks

## Features

✨ **UI Polish (Phase 2 preserved)**
- Empty states for all tabs
- Consistent spacing and typography
- Smooth animations
- Dark mode support
- Color system (red/green/blue/gray)

🎯 **Drag & Drop (Phase 1 new)**
- Visual feedback during drag
- Ring highlight on valid drop zones
- Optimistic UI updates
- Status persists across views

✅ **Bulk Actions (Phase 1 new)**
- Multi-select checkboxes
- Floating action toolbar
- Batch operations
- Immediate visual feedback

## Next Steps

After testing Phase 1:

**Phase 2: Time Tracking**
- Track hours/minutes per task
- Time entry history
- Total time display on cards

**Phase 3: Checklist Templates**
- Save checklist sets as templates
- Apply templates to new tasks
- Template library in sidebar

## Testing Checklist

- [ ] Toggle between List and Kanban views
- [ ] Drag a task from "Å gjøre" to "Pågår"
- [ ] Verify status updates
- [ ] Drag to "Ferdig" column
- [ ] Drag to "Avbrutt" column
- [ ] Refresh page - task stays in new column
- [ ] Select multiple tasks
- [ ] Click "Ferdig" button
- [ ] Verify tasks marked as done
- [ ] Select tasks and delete
- [ ] Verify bulk delete works
- [ ] Test dark mode on both views

## Troubleshooting

### `react-beautiful-dnd` not found
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
npm run dev
```

### Drag & drop not working
- Ensure `DragDropContext` wraps all draggable columns
- Check browser console for errors
- Try clearing `.next` cache: `rm -rf .next && npm run dev`

### Bulk toolbar not appearing
- Verify checkboxes have `onChange` handler
- Check that `selectedTasks` state is updating
- Ensure toolbar component is rendered

## Files Provided

1. **dashboard-phase1-enhanced.tsx** - Complete dashboard with Phase 1 (recommended for new setup)
2. **kanban-components.tsx** - Standalone Kanban components (for integration)
3. **api-tasks-bulk.ts** - Backend bulk actions API
4. **PHASE-1-SETUP.md** - This file

## Next Session

Phase 2 (Time Tracking) and Phase 3 (Templates) are ready to implement when you want. Estimated 4-5 hours per phase.
