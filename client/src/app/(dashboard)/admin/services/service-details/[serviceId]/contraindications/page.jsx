"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    display_order: 1,
  });

  // =========================
  // FETCH
  // =========================

  const fetchItems = async () => {
    try {
      const res = await api.get(
        `/contraindications/service/${serviceId}`
      );

      setItems(res.data.data || []);
    } catch (err) {
      console.log(err);
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
      description: "",
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
      description: item.description || "",
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

    setForm({
      title: "",
      description: "",
      display_order: 1,
    });
  };

  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingId) {
        await api.put(
          `/contraindications/${editingId}`,
          form
        );
      } else {
        await api.post(
          "/contraindications",
          {
            service_id: serviceId,
            ...form,
          }
        );
      }

      await fetchItems();
      closeModal();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Delete this item?"
    );

    if (!ok) return;

    try {
      await api.delete(
        `/contraindications/${id}`
      );

      fetchItems();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-[#6B4F3A]">
            Contraindications
          </h1>

          <p className="text-gray-500 text-sm">
            Manage contraindications for this
            service
          </p>
        </div>

        <button
          onClick={openCreate}
          className="
            px-5 py-2.5
            rounded-xl
            bg-[#6B4F3A]
            text-white
            hover:opacity-90
          "
        >
          + Add Item
        </button>

      </div>

      {/* TABLE */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-200
          overflow-hidden
          shadow-sm
        "
      >
        <table className="w-full">

          <thead className="bg-[#F8F5F2]">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-[#6B4F3A]">
                Title
              </th>

              <th className="p-4 text-left text-sm font-semibold text-[#6B4F3A]">
                Description
              </th>

              <th className="p-4 text-left text-sm font-semibold text-[#6B4F3A]">
                Order
              </th>

              <th className="p-4 text-left text-sm font-semibold text-[#6B4F3A]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="
                    p-8
                    text-center
                    text-gray-400
                  "
                >
                  No data found
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t"
              >
                <td className="p-4">
                  {item.title}
                </td>

                <td className="p-4 max-w-md">
                  {item.description}
                </td>

                <td className="p-4">
                  {item.display_order}
                </td>

                <td className="p-4">

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        handleEdit(item)
                      }
                      className="
                        px-3 py-1.5
                        rounded-lg
                        bg-blue-50
                        text-blue-600
                        text-sm
                      "
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="
                        px-3 py-1.5
                        rounded-lg
                        bg-red-50
                        text-red-600
                        text-sm
                      "
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

      {/* MODAL */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          "
        >
          <div
            className="
              bg-white
              rounded-2xl
              p-6
              w-[500px]
            "
          >
            <h2 className="text-xl font-bold mb-5">
              {editingId
                ? "Edit Contraindication"
                : "Add Contraindication"}
            </h2>

            {/* TITLE */}

            <div className="mb-4">
              <label className="block mb-2 text-sm">
                Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
              />
            </div>

            {/* DESCRIPTION */}

            <div className="mb-4">
              <label className="block mb-2 text-sm">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
              />
            </div>

            {/* ORDER */}

            <div className="mb-6">
              <label className="block mb-2 text-sm">
                Display Order
              </label>

              <input
                type="number"
                value={
                  form.display_order
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    display_order:
                      Number(
                        e.target.value
                      ),
                  })
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
              />
            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3">

              <button
                onClick={closeModal}
                className="
                  px-5 py-2
                  rounded-xl
                  bg-gray-100
                "
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="
                  px-5 py-2
                  rounded-xl
                  bg-[#6B4F3A]
                  text-white
                "
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Create"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}