"use client";

import { useEffect, useState, use } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
const { serviceId } = use(params);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    title: "",
    icon: "",
    display_order: 1,
  });

  // =========================
  // FETCH
  // =========================
  const fetchItems = async () => {
    try {
      const res = await api.get(
        `/suitable-for/service/${serviceId}`
      );
      setItems(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStatus("Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [serviceId]);

  // =========================
  // OPEN CREATE
  // =========================
  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      icon: "",
      display_order: 1,
    });
    setShowModal(true);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      icon: item.icon || "",
      display_order: item.display_order || 1,
    });

    setShowModal(true);
  };

  // =========================
  // CLOSE
  // =========================
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // =========================
  // SAVE (CREATE / UPDATE)
  // =========================
  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingId) {
        await api.put(`/suitable-for/${editingId}`, form);
      } else {
        await api.post(`/suitable-for`, {
          service_id: serviceId,
          ...form,
        });
      }

      await fetchItems();
      closeModal();
      setStatus("Saved successfully");
    } catch (err) {
      console.log(err);
      setStatus("Error saving item");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;

    try {
      await api.delete(`/suitable-for/${id}`);
      await fetchItems();
      setStatus("Deleted successfully");
    } catch (err) {
      console.log(err);
      setStatus("Error deleting item");
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Suitable For
          </h1>
          <p className="text-gray-500 text-sm">
            Manage suitable for section
          </p>
        </div>

        <button
          onClick={openCreate}
          className="
            px-5 py-2.5
            bg-primary
            text-white
            rounded-xl
            hover:opacity-90
          "
        >
          + Add Item
        </button>
      </div>

      {/* STATUS */}
      {status && (
        <div className="mb-4 text-sm text-green-600">
          {status}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm">Icon</th>
              <th className="text-left p-4 text-sm">Title</th>
              <th className="text-left p-4 text-sm">Order</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">

                <td className="p-4">
                  <span className="text-2xl">
                    {item.icon}
                  </span>
                </td>

                <td className="p-4 text-gray-700">
                  {item.title}
                </td>

                <td className="p-4">
                  {item.display_order}
                </td>

                <td className="p-4 flex gap-2">

                  <button
                    onClick={() => handleEdit(item)}
                    className="
                      px-3 py-1
                      text-sm
                      bg-blue-50
                      text-blue-600
                      rounded-lg
                    "
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="
                      px-3 py-1
                      text-sm
                      bg-red-50
                      text-red-600
                      rounded-lg
                    "
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

          <div className="bg-white p-6 rounded-2xl w-[400px]">

            <h2 className="text-lg font-bold mb-4">
              {editingId ? "Edit Item" : "Add Item"}
            </h2>

            {/* TITLE */}
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full border p-2 rounded-lg mb-3"
            />

            {/* ICON */}
            <input
              placeholder="Icon (emoji or class)"
              value={form.icon}
              onChange={(e) =>
                setForm({ ...form, icon: e.target.value })
              }
              className="w-full border p-2 rounded-lg mb-3"
            />

            {/* ORDER */}
            <input
              type="number"
              value={form.display_order}
              onChange={(e) =>
                setForm({
                  ...form,
                  display_order: Number(e.target.value),
                })
              }
              className="w-full border p-2 rounded-lg mb-3"
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-2">

              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                {loading ? "Saving..." : "Save"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}