"use client";

type WorkingHourItem = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type FormState = {
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type Props = {
  rows: WorkingHourItem[];
  loading: boolean;
  error: string;
  status: string;
  dayLabels: string[];
  newForm: FormState;
  editForm: FormState;
  editingId: number | null;
  actionLoadingId: number | "add" | null;
  onNewFormChange: (name: keyof FormState, value: string) => void;
  onEditFormChange: (name: keyof FormState, value: string) => void;
  onAdd: () => void;
  onEdit: (row: WorkingHourItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function WorkingHoursTable({
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
}: Props) {
  return (
    <div className="space-y-4">
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Day</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Start Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">End Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4">
                  <select
                    value={newForm.day_of_week}
                    onChange={(e) => onNewFormChange("day_of_week", e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  >
                    {dayLabels.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
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
                    {actionLoadingId === "add" ? "Adding..." : "Add"}
                  </button>
                </td>
              </tr>

              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading working hours...
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
                    No default working hours found.
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
                          <select
                            value={editForm.day_of_week}
                            onChange={(e) => onEditFormChange("day_of_week", e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                          >
                            {dayLabels.map((label, index) => (
                              <option key={label} value={index}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-700">{dayLabels[row.day_of_week] || "Unknown"}</span>
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
