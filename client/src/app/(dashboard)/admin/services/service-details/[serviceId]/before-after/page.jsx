"use client";

import { useEffect, useState, use } from "react";
import api from "../../../../../../../lib/api";
import { getMediaUrl } from "../../../../../../../lib/mediaUrl";

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    display_order: 1,
    before_image: null,
    after_image: null,
  });

  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");

  // ======================
  // FETCH
  // ======================
  const fetchData = async () => {
    try {
      const res = await api.get(
        `/before-after-images/service/${serviceId}`
      );
      setItems(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStatus("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  // ======================
  // OPEN CREATE
  // ======================
  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      display_order: 1,
      before_image: null,
      after_image: null,
    });
    setBeforePreview("");
    setAfterPreview("");
    setShowModal(true);
  };

  // ======================
  // EDIT
  // ======================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      description: item.description || "",
      display_order: item.display_order || 1,
      before_image: null,
      after_image: null,
    });

    setBeforePreview(
      item.before_image
        ? getMediaUrl(item.before_image)
        : ""
    );

    setAfterPreview(
      item.after_image
        ? getMediaUrl(item.after_image)
        : ""
    );

    setShowModal(true);
  };

  // ======================
  // SAVE (CREATE / UPDATE)
  // ======================
  const handleSave = async () => {
    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("service_id", serviceId);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("display_order", form.display_order);

      if (form.before_image) {
        fd.append("before_image", form.before_image);
      }

      if (form.after_image) {
        fd.append("after_image", form.after_image);
      }

      if (editingId) {
        await api.put(
          `/before-after-images/${editingId}`,
          fd
        );
      } else {
        await api.post(
          `/before-after-images`,
          fd
        );
      }

      await fetchData();
      closeModal();
      setStatus("Saved successfully");
    } catch (err) {
      console.log(err);
      setStatus("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;

    try {
      await api.delete(
        `/before-after-images/${id}`
      );
      await fetchData();
      setStatus("Deleted successfully");
    } catch (err) {
      console.log(err);
      setStatus("Delete failed");
    }
  };

  // ======================
  // CLOSE MODAL
  // ======================
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setBeforePreview("");
    setAfterPreview("");
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Before & After Images
          </h1>
          <p className="text-gray-500 text-sm">
            Manage transformation gallery
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2 bg-black text-white rounded-xl"
        >
          + Add Image
        </button>
      </div>

      {status && (
        <p className="mb-4 text-sm text-green-600">
          {status}
        </p>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Before</th>
              <th className="p-3 text-left">After</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  <img
                    src={getMediaUrl(item.before_image)}
                    className="w-24 h-20 object-cover rounded"
                  />
                </td>

                <td className="p-3">
                  <img
                    src={getMediaUrl(item.after_image)}
                    className="w-24 h-20 object-cover rounded"
                  />
                </td>

                <td className="p-3">{item.title}</td>
                <td className="p-3">{item.display_order}</td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[600px]">

            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit" : "Add"}
            </h2>

            <input
              className="w-full border p-2 mb-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 mb-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="w-full border p-2 mb-2"
              value={form.display_order}
              onChange={(e) =>
                setForm({
                  ...form,
                  display_order: e.target.value,
                })
              }
            />

            {/* BEFORE */}
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setForm({ ...form, before_image: file });
                setBeforePreview(URL.createObjectURL(file));
              }}
            />

            {beforePreview && (
              <img
                src={beforePreview}
                className="w-32 h-24 object-cover mt-2"
              />
            )}

            {/* AFTER */}
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setForm({ ...form, after_image: file });
                setAfterPreview(URL.createObjectURL(file));
              }}
            />

            {afterPreview && (
              <img
                src={afterPreview}
                className="w-32 h-24 object-cover mt-2"
              />
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded"
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
