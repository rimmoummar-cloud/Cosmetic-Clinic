"use client";

export default function BreakHoursTable({
  rows,
  loading,
  error,
  status,
  actionLoadingId,
  onOpenAddModal,
  onOpenEditModal,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 text-sm rounded-xl border bg-red-50 text-red-700 border-red-100">
          {error}
        </div>
      )}

      {status && (
        <div className="px-4 py-3 text-sm rounded-xl border bg-green-50 text-green-700 border-green-100">
          {status}
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Break Hours</h2>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 text-sm bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all"
        >
          + Add Break Hour
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Start Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">End Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading break hours...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No break hours found. Click the "Add Break Hour" button to create one.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {row.work_date?.split("T")[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{row.start_time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{row.end_time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(row)}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          disabled={actionLoadingId === row.id}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {actionLoadingId === row.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
