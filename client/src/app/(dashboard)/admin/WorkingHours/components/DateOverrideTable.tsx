"use client";

type OverrideItem = {
  id: number;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  is_day_off: boolean;
};

type FormState = {
  work_date: string;
  start_time: string;
  end_time: string;
  is_day_off: boolean;
};

type Props = {
  selectedDate: string;
  loading: boolean;
  error: string;
  status: string;
  data: OverrideItem | null;
  form: FormState;
  isEditing: boolean;
  actionLoading: boolean;
  onFormChange: (name: keyof FormState, value: string | boolean) => void;
  onCreate: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
};

export default function DateOverrideTable({
  selectedDate,
  loading,
  error,
  status,
  data,
  form,
  isEditing,
  actionLoading,
  onFormChange,
  onCreate,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: Props) {
  if (!selectedDate) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
        Select a date to view or create overrides.
      </div>
    );
  }

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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Start Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">End Time</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Day Off</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading override...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && !data && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">{selectedDate}</td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      disabled={form.is_day_off}
                      value={form.start_time}
                      onChange={(e) => onFormChange("start_time", e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="time"
                      disabled={form.is_day_off}
                      value={form.end_time}
                      onChange={(e) => onFormChange("end_time", e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={form.is_day_off}
                        onChange={(e) => onFormChange("is_day_off", e.target.checked)}
                        className="h-4 w-4"
                      />
                      Day Off
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={onCreate}
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all disabled:opacity-60"
                    >
                      {actionLoading ? "Creating..." : "Create Override"}
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !error && !data && (
                <tr>
                  <td colSpan={5} className="px-6 pb-6 text-sm text-gray-500">
                    No override for this date
                  </td>
                </tr>
              )}

              {!loading && !error && data && (
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{data.work_date}</td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="time"
                        disabled={form.is_day_off}
                        value={form.start_time}
                        onChange={(e) => onFormChange("start_time", e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{data.is_day_off ? "-" : data.start_time || "-"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="time"
                        disabled={form.is_day_off}
                        value={form.end_time}
                        onChange={(e) => onFormChange("end_time", e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{data.is_day_off ? "-" : data.end_time || "-"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={form.is_day_off}
                          onChange={(e) => onFormChange("is_day_off", e.target.checked)}
                          className="h-4 w-4"
                        />
                        Day Off
                      </label>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          data.is_day_off ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {data.is_day_off ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={onSaveEdit}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-60"
                          >
                            {actionLoading ? "Saving..." : "Save"}
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
                            onClick={onStartEdit}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={onDelete}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                          >
                            {actionLoading ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
