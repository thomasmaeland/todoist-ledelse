'use client';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onMarkDone: () => void;
  onMarkCancelled: () => void;
  onDelete: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function BulkActionsToolbar({
  selectedCount,
  onMarkDone,
  onMarkCancelled,
  onDelete,
  onClose,
  loading = false,
}: BulkActionsToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
        </span>

        <div className="flex gap-2">
          <button
            onClick={onMarkDone}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mark Done'}
          </button>

          <button
            onClick={onMarkCancelled}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition text-sm disabled:opacity-50"
          >
            Delete
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
