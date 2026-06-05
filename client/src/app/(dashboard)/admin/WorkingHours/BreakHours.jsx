"use client";

import { useEffect, useState } from "react";
import BreakHoursTable from "./components/BreakHoursTable";
import BreakHoursModal from "./components/BreakHoursModal";
import api from "../../../../lib/api.js";


export default function BreakHours() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [editingRow, setEditingRow] = useState(null);

  const fetchRows = async () => {
    setLoading(true);
    setError("");

    try {
  const res = await api.get("/BreakHours/Hours");

const data = res.data;
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

  const openAddModal = () => {
    setEditingRow(null);
    setModalMode("add");
    setStatus("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    setModalMode("edit");
    setStatus("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
  };

  const handleModalSubmit = async (formData) => {
    const { work_date, start_time, end_time, mode, id } = formData;

    setActionLoadingId(mode === "add" ? "add" : id);
    setError("");
    setStatus("");

    try {
      const payload = {
        work_date,
        start_time,
        end_time,
      };

   if (mode === "add") {

  await api.post(
    "/BreakHours/Hours",
    payload
  );

} else {

  await api.put(
    `/BreakHours/Hours/${id}`,
    payload
  );

}

      setStatus(
        mode === "add"
          ? "Break hour added successfully."
          : "Break hour updated successfully."
      );
      closeModal();
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${mode === "add" ? "add" : "update"} break hour`);
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
   await api.delete(
  `/BreakHours/Hours/${id}`
);
      setStatus("Break hour deleted successfully.");
      await fetchRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete break hour");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <BreakHoursTable
        rows={rows}
        loading={loading}
        error={error}
        status={status}
        actionLoadingId={actionLoadingId}
        onOpenAddModal={openAddModal}
        onOpenEditModal={openEditModal}
        onDelete={onDelete}
      />
      <BreakHoursModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingRow}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        loading={actionLoadingId === (modalMode === "add" ? "add" : editingRow?.id)}
      />
    </>
  );
}
