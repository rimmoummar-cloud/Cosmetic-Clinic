"use client";

import { useEffect, useState } from "react";
import DateOverrideTable from "./components/DateOverrideTable";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const defaultForm: FormState = {
  work_date: "",
  start_time: "09:00",
  end_time: "17:00",
  is_day_off: false,
};

const toTimeInputValue = (value: string | null) => {
  if (!value) return "";
  return value.slice(0, 5);
};

const normalizeDate = (dateStr: string) => {
  return dateStr.split("T")[0];
};

export default function WorkingHoursByDate() {
  const [data, setData] = useState<OverrideItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fetchUpcomingWorkingHours = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHoursByDate/upcoming`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch working hours");
      }

      const result = await res.json();
      const upcoming: OverrideItem[] = Array.isArray(result) ? result : [];
      setData(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load working hours");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingWorkingHours();
  }, []);

  const onFormChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.work_date) return "Date is required.";
    if (!form.is_day_off) {
      if (!form.start_time || !form.end_time) return "Start time and end time are required.";
      if (form.end_time <= form.start_time) return "End time must be after start time.";
    }
    return "";
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);
    setError("");  // Clear previous errors when opening modal
    setStatus("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: OverrideItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    const normalizedDate = item.work_date.split("T")[0]; // Normalize to YYYY-MM-DD
    setForm({
      work_date: normalizedDate,
      start_time: toTimeInputValue(item.start_time) || "09:00",
      end_time: toTimeInputValue(item.end_time) || "17:00",
      is_day_off: Boolean(item.is_day_off),
    });
    setError("");  // Clear previous errors when opening modal
    setStatus("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (actionLoading) return;
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);
  };






  const onSubmit = async () => {
  // STEP 1: Validate required fields
  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  setActionLoading(true);
  setError("");
  setStatus("");

  try {
    // STEP 2: Normalize date
    const formDate = normalizeDate(form.work_date);

    // STEP 3: Call duplicate check API safely
    const checkRes = await fetch(
      `${API_BASE_URL}/workingHoursByDate/date/${formDate}`
    );

    // مهم جداً: تأكد من response
    if (!checkRes.ok) {
      // إذا رجع 404 مثلاً → يعني ما في duplicate
      if (checkRes.status !== 404) {
        setError("Failed to validate date. Please try again.");
        setActionLoading(false);
        return;
      }
    }

    let checkData: any = null;

    try {
      checkData = await checkRes.json();
    } catch {
      checkData = null;
    }

    // STEP 4: Determine if duplicate exists
    let exists = false;
    let isSameRecord = false;

    if (Array.isArray(checkData)) {
      exists = checkData.length > 0;

      if (isEditing) {
        isSameRecord = checkData.some(
          (item) => item.id === editingId
        );
      }
    } else if (checkData && checkData.id) {
      exists = true;

      if (isEditing) {
        isSameRecord = checkData.id === editingId;
      }
    }

    // STEP 5: Show message if duplicate
    if (exists && !isSameRecord) {
      setError("This date already exists");
      setActionLoading(false);
      return;
    }

    // STEP 6: Prepare payload
    const payload = {
      work_date: formDate,
      start_time: form.is_day_off ? null : form.start_time,
      end_time: form.is_day_off ? null : form.end_time,
      is_day_off: form.is_day_off,
    };

    // STEP 7: Update or Create
    if (isEditing && editingId !== null) {
      const res = await fetch(
        `${API_BASE_URL}/workingHoursByDate/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update override");
      }

      setStatus("Override updated successfully.");
    } else {
      const res = await fetch(
        `${API_BASE_URL}/workingHoursByDate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        // لو database unique ضرب
        if (res.status === 409) {
          setError("This date already exists");
          setActionLoading(false);
          return;
        }

        throw new Error("Failed to create override");
      }

      setStatus("Override created successfully.");
    }

    // STEP 8: Reset form
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm(defaultForm);

    // STEP 9: Refresh table
    await fetchUpcomingWorkingHours();

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to save override"
    );
  } finally {
    setActionLoading(false);
  }
};
  // const onSubmit = async () => {
  //   // STEP 1: Validate required fields
  //   const validationError = validateForm();
  //   if (validationError) {
  //     setError(validationError);
  //     return;
  //   }

  //   setActionLoading(true);
  //   setError("");
  //   setStatus("");

  //   try {
  //     // STEP 2: Check backend duplicate API
  //     const formDate = normalizeDate(form.work_date);
  //     const checkRes = await fetch(`${API_BASE_URL}/workingHoursByDate/date/${formDate}`);
  //     const checkData = await checkRes.json();
      
  //     // STEP 3: If duplicate exists, check if it's a different record (not the one being edited)
  //     const hasDuplicate = Array.isArray(checkData) && checkData.length > 0;
  //     if (hasDuplicate && !(isEditing && checkData.some((item) => item.id === editingId))) {
  //       setError("This date already exists");
  //       setActionLoading(false);
  //       return;
  //     }

  //     // STEP 4: Proceed with POST or PUT
  //     const payload = {
  //       work_date: formDate,
  //       start_time: form.is_day_off ? null : form.start_time,
  //       end_time: form.is_day_off ? null : form.end_time,
  //       is_day_off: form.is_day_off,
  //     };

  //     if (isEditing && editingId !== null) {
  //       const res = await fetch(`${API_BASE_URL}/workingHoursByDate/${editingId}`, {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });

  //       if (!res.ok) {
  //         throw new Error("Failed to update override");
  //       }

  //       setStatus("Override updated successfully.");
  //     } else {
  //       const res = await fetch(`${API_BASE_URL}/workingHoursByDate`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });

  //       if (!res.ok) {
  //         throw new Error("Failed to create override");
  //       }

  //       setStatus("Override created successfully.");
  //     }

  //     setIsModalOpen(false);
  //     setIsEditing(false);
  //     setEditingId(null);
  //     setForm(defaultForm);
  //     // STEP 5: Refresh table after success
  //     await fetchUpcomingWorkingHours();
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Unable to save override");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const onDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this override?");
    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHoursByDate/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete override");
      }

      setStatus("Override deleted successfully.");
      await fetchUpcomingWorkingHours();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete override");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {status && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {status}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <DateOverrideTable
        data={data}
        loading={loading}
        error={error}
        actionLoading={actionLoading}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={onDelete}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Override" : "Add Override"}</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  min={!isEditing ? new Date().toISOString().split("T")[0] : undefined}
                  value={form.work_date}
                  onChange={(e) => onFormChange("work_date", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  disabled={form.is_day_off}
                  value={form.start_time}
                  onChange={(e) => onFormChange("start_time", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  disabled={form.is_day_off}
                  value={form.end_time}
                  onChange={(e) => onFormChange("end_time", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_day_off}
                  onChange={(e) => onFormChange("is_day_off", e.target.checked)}
                  className="h-4 w-4"
                />
                Day Off
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={actionLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
              >
                {actionLoading ? (isEditing ? "Saving..." : "Inserting...") : isEditing ? "Save" : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
