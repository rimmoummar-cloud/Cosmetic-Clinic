"use client";

type OverrideItem = {
  id: number;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  is_day_off: boolean;
};

type Props = {
  data: OverrideItem[];
  loading: boolean;
  error: string;
  actionLoading: boolean;
  onAdd: () => void;
  onEdit: (item: OverrideItem) => void;
  onDelete: (id: number) => void;
};

const formatDate = (value: string) => value.split("T")[0];

const formatTime = (value: string | null, isDayOff: boolean) => {
  if (isDayOff || !value) return "-";
  return value.slice(0, 5);
};

export default function DateOverrideTable({ data, loading, error, actionLoading, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900">Upcoming Working Hours</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
        >
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Day Off</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  Loading upcoming records...
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

            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No upcoming overrides found.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              Array.isArray(data) &&
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70">
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.work_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatTime(item.start_time, item.is_day_off)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatTime(item.end_time, item.is_day_off)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.is_day_off ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.is_day_off ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        disabled={actionLoading}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
