"use client";

import { useState } from "react";

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
  editForm: FormState;
  editingId: number | null;
  actionLoadingId: number | null;
  onEditFormChange: (name: keyof FormState, value: string) => void;
  onEdit: (row: WorkingHourItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: number) => void;
};

export default function WorkingHoursTable({
  rows,
  loading,
  error,
  status,
  dayLabels,
  editForm,
  editingId,
  actionLoadingId,
  onEditFormChange,
  onEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEdit = (row: WorkingHourItem) => {
    onEdit(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onCancelEdit();
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onSaveEdit(editingId);
      setIsModalOpen(false);
    }
  };

  return (
    <>
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
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {dayLabels[row.day_of_week] || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{row.start_time}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{row.end_time}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Working Hours</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Day Field - Read Only */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Day</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium">
                  {dayLabels[parseInt(editForm.day_of_week)] || "Unknown"}
                </div>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => onEditFormChange("start_time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={editForm.end_time}
                  onChange={(e) => onEditFormChange("end_time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
                disabled={actionLoadingId === editingId}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={actionLoadingId === editingId}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {actionLoadingId === editingId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
