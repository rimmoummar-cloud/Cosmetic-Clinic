"use client";

import { useEffect, useMemo, useState } from "react";
import BreakHoursTable from "./components/BreakHoursTable";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function BreakHours() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [newForm, setNewForm] = useState({
  work_date: "",
    start_time: "09:00",
    end_time: "17:00",
  });
  const [editForm, setEditForm] = useState({
   work_date: "",
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
      const res = await fetch(`${API_BASE_URL}/BreakHours/Hours`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch break hours");
      }

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load break hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const onNewFormChange = (name, value) => {
    setStatus("");
    setError("");
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditFormChange = (name, value) => {
    setStatus("");
    setError("");
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateTimes = (start, end) => {
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
      const res = await fetch(`${API_BASE_URL}/BreakHours/Hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  work_date: newForm.work_date,
  start_time: newForm.start_time,
  end_time: newForm.end_time,
}),
      });

      if (!res.ok) {
        throw new Error("Failed to create break hour");
      }

      setStatus("Break hour added successfully.");
      setNewForm({
     work_date: newForm.work_date,
        start_time: "09:00",
        end_time: "17:00",
      });
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add break hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  const onEdit = (row) => {
    setStatus("");
    setError("");
    setEditingId(row.id);
    setEditForm({
      work_date: String(row.work_date),
      start_time: row.start_time,
      end_time: row.end_time,
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditForm({ work_date: newForm.work_date, start_time: "09:00", end_time: "17:00" });
  };

  const onSaveEdit = async (id) => {
    const validationError = validateTimes(editForm.start_time, editForm.end_time);
    if (validationError) {
      setError(validationError);
      return;
    }

    setActionLoadingId(id);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/BreakHours/Hours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  work_date: editForm.work_date,
  start_time: editForm.start_time,
  end_time: editForm.end_time,
}),
      });

      if (!res.ok) {
        throw new Error("Failed to update break hour");
      }

      setStatus("Break hour updated successfully.");
      setEditingId(null);
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update break hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this break hour?");
    if (!confirmed) return;

    setActionLoadingId(id);
    setError("");
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/BreakHours/Hours/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete break hour");
      }

      setStatus("Break hour deleted successfully.");
      if (editingId === id) {
        setEditingId(null);
      }
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete break hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <BreakHoursTable
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
