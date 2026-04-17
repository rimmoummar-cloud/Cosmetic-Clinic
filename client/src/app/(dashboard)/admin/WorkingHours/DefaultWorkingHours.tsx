"use client";

import { useEffect, useMemo, useState } from "react";
import WorkingHoursTable from "./components/WorkingHoursTable";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DefaultWorkingHours() {
  const [rows, setRows] = useState<WorkingHourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | "add" | null>(null);
  const [newForm, setNewForm] = useState<FormState>({
    day_of_week: "0",
    start_time: "09:00",
    end_time: "17:00",
  });
  const [editForm, setEditForm] = useState<FormState>({
    day_of_week: "0",
    start_time: "09:00",
    end_time: "17:00",
  });

  const dayLabels = useMemo(
    () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    []
  );

  const fetchRows = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHours`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch default working hours");
      }

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load default working hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const onNewFormChange = (name: keyof FormState, value: string) => {
    setStatus("");
    setError("");
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditFormChange = (name: keyof FormState, value: string) => {
    setStatus("");
    setError("");
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateTimes = (start: string, end: string) => {
    if (!start || !end) return "Start time and end time are required.";
    if (start >= end) return "End time must be later than start time.";
    return "";
  };

  const onAdd = async () => {
    const validationError = validateTimes(newForm.start_time, newForm.end_time);
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoadingId("add");
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: Number(newForm.day_of_week),
          start_time: newForm.start_time,
          end_time: newForm.end_time,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create working hour");
      }

      setStatus("Working hour added successfully.");
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add working hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  const onEdit = (row: WorkingHourItem) => {
    setStatus("");
    setError("");
    setEditingId(row.id);
    setEditForm({
      day_of_week: String(row.day_of_week),
      start_time: row.start_time,
      end_time: row.end_time,
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditForm({ day_of_week: "0", start_time: "09:00", end_time: "17:00" });
  };

  const onSaveEdit = async (id: number) => {
    const validationError = validateTimes(editForm.start_time, editForm.end_time);
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoadingId(id);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: Number(editForm.day_of_week),
          start_time: editForm.start_time,
          end_time: editForm.end_time,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update working hour");
      }

      setStatus("Working hour updated successfully.");
      setEditingId(null);
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update working hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  const onDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this row?");
    if (!confirmed) return;

    setActionLoadingId(id);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/workingHours/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete working hour");
      }

      setStatus("Working hour deleted successfully.");
      if (editingId === id) {
        setEditingId(null);
      }
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete working hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <WorkingHoursTable
      rows={rows}
      loading={loading}
      error={error}
      status={status}
      dayLabels={dayLabels}
      newForm={newForm}
      editForm={editForm}
      editingId={editingId}
      actionLoadingId={actionLoadingId}
      onNewFormChange={onNewFormChange}
      onEditFormChange={onEditFormChange}
      onAdd={onAdd}
      onEdit={onEdit}
      onCancelEdit={onCancelEdit}
      onSaveEdit={onSaveEdit}
      onDelete={onDelete}
    />
  );
}
