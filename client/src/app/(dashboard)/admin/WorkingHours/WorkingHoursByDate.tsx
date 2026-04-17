"use client";

import { useState } from "react";
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

export default function WorkingHoursByDate() {
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState<OverrideItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    work_date: "",
    start_time: "09:00",
    end_time: "17:00",
    is_day_off: false,
  });

  const onFormChange = (name: keyof FormState, value: string | boolean) => {
    setStatus("");
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.work_date) return "Date is required.";
    if (!form.is_day_off) {
      if (!form.start_time || !form.end_time) return "Start time and end time are required.";
      if (form.start_time >= form.end_time) return "End time must be later than start time.";
    }
    return "";
  };

  const mapIncomingToForm = (incoming: OverrideItem | null, date: string) => {
    if (!incoming) {
      return {
        work_date: date,
        start_time: "09:00",
        end_time: "17:00",
        is_day_off: false,
      };
    }

    return {
      work_date: incoming.work_date,
      start_time: incoming.start_time || "09:00",
      end_time: incoming.end_time || "17:00",
      is_day_off: Boolean(incoming.is_day_off),
    };
  };

  const fetchOverrideByDate = async (date: string) => {
    if (!date) return;

    setLoading(true);
    setError("");
    setStatus("");
    setIsEditing(false);

    try {
      const res = await fetch(`${API_BASE_URL}/workingHoursByDate/${date}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch override for this date");
      }

      const override = (await res.json()) as OverrideItem | null;
      setData(override || null);
      setForm(mapIncomingToForm(override || null, date));
    } catch (err) {
      setData(null);
      setForm(mapIncomingToForm(null, date));
      setError(err instanceof Error ? err.message : "Unable to load override");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = async (date: string) => {
    setSelectedDate(date);
    await fetchOverrideByDate(date);
  };

  const onCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoading(true);
    setError("");
    setStatus("");

    try {
      const payload = {
        work_date: form.work_date,
        start_time: form.is_day_off ? null : form.start_time,
        end_time: form.is_day_off ? null : form.end_time,
        is_day_off: form.is_day_off,
      };

      const res = await fetch(`${API_BASE_URL}/workingHoursByDate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create override");
      }

      setStatus("Override created successfully.");
      await fetchOverrideByDate(selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create override");
    } finally {
      setActionLoading(false);
    }
  };

  const onStartEdit = () => {
    if (!data) return;
    setIsEditing(true);
    setForm(mapIncomingToForm(data, selectedDate));
  };

  const onCancelEdit = () => {
    setIsEditing(false);
    setForm(mapIncomingToForm(data, selectedDate));
  };

  const onSaveEdit = async () => {
    if (!data) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoading(true);
    setError("");
    setStatus("");

    try {
      const payload = {
        work_date: form.work_date,
        start_time: form.is_day_off ? null : form.start_time,
        end_time: form.is_day_off ? null : form.end_time,
        is_day_off: form.is_day_off,
      };

      const res = await fetch(`${API_BASE_URL}/workingHoursByDate/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update override");
      }

      setStatus("Override updated successfully.");
      setIsEditing(false);
      await fetchOverrideByDate(selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update override");
    } finally {
      setActionLoading(false);
    }
  };

  const onDelete = async () => {
    if (!data) return;
    const confirmed = window.confirm("Are you sure you want to delete this override?");
    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHoursByDate/${data.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete override");
      }

      setStatus("Override deleted successfully.");
      setData(null);
      setIsEditing(false);
      setForm(mapIncomingToForm(null, selectedDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete override");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full sm:w-auto p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {error && (
        <div className="px-4 py-3 text-sm rounded-xl border bg-red-50 text-red-700 border-red-100">
          {error}
        </div>
      )}

      <DateOverrideTable
        selectedDate={selectedDate}
        loading={loading}
        error={error}
        status={status}
        data={data}
        form={form}
        isEditing={isEditing}
        actionLoading={actionLoading}
        onFormChange={onFormChange}
        onCreate={onCreate}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
