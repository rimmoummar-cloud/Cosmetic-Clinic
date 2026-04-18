"use client";

export default function BreakHoursTable({
  rows,
  loading,
  error,
  status,
  dayLabels,
  newForm,
  editForm,
  editingId,
  actionLoadingId,
  onNewFormChange,
  onEditFormChange,
  onAdd,
  onEdit,
  onCancelEdit,
  onSaveEdit,
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
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4">
                  {/* <select
                    value={newForm.work_date}
                    onChange={(e) => onNewFormChange("work_date", e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  >
                    {dayLabels.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select> */}
                  <input
  type="date"
  min={new Date().toISOString().split("T")[0]}
  value={newForm.work_date}
  onChange={(e) => onNewFormChange("work_date", e.target.value)}
  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm"
/>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={newForm.start_time}
                    onChange={(e) => onNewFormChange("start_time", e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                  
                </td>
                <td className="px-6 py-4">
                  <input
                    type="time"
                    value={newForm.end_time}
                    onChange={(e) => onNewFormChange("end_time", e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={onAdd}
                    disabled={actionLoadingId === "add"}
                    className="px-4 py-2 text-xs bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all disabled:opacity-60"
                  >
                    {actionLoadingId === "add" ? "Adding..." : "Add Break Hour"}
                  </button>
                </td>
              </tr>

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
                    No break hours found. Add one using the form above.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((row) => {
                  const isEditing = editingId === row.id;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {isEditing ? (
                        <input
  type="date"
  min={new Date().toISOString().split("T")[0]}
  value={editForm.work_date}
  onChange={(e) => onEditFormChange("work_date", e.target.value)}
/>
                        ) : (
                         <span className="text-sm text-gray-700">
  {row.work_date?.split("T")[0]}
</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editForm.start_time}
                            onChange={(e) => onEditFormChange("start_time", e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{row.start_time}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editForm.end_time}
                            onChange={(e) => onEditFormChange("end_time", e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{row.end_time}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onSaveEdit(row.id)}
                                disabled={actionLoadingId === row.id}
                                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-60"
                              >
                                {actionLoadingId === row.id ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={onCancelEdit}
                                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
