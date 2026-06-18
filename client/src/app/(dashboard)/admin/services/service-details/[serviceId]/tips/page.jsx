"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [tips, setTips] = useState([]);
  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

 const [form, setForm] = useState({
  type: "before_session",
  content: "",
  tip_order: 1,
});

  useEffect(() => {
    fetchTips();
  }, [serviceId]);

  const fetchTips = async () => {
    try {
      const res = await api.get(
        `/service-tips/service/${serviceId}`
      );

      setTips(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStatus("Failed to load tips.");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);

setForm({
  type: "before_session",
  content: "",
  tip_order: 1,
});

    setShowModal(true);
  };

  const handleEdit = (tip) => {
    setEditingId(tip.id);

    setForm({
      type: tip.type,
      content: tip.content,
      tip_order: tip.tip_order,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);

    setEditingId(null);

  setForm({
  type: "before_session",
  content: "",
  tip_order: 1,
});
  };

  const handleSave = async () => {
    try {
        console.log(form.type);
      setLoading(true);

      if (editingId) {
        await api.put(
          `/service-tips/${editingId}`,
          form
        );
      } else {
        await api.post(
          `/service-tips`,
          {
            service_id: serviceId,
            ...form,
          }
        );
      }

      await fetchTips();

      closeModal();

      setStatus(
        editingId
          ? "Tip updated successfully."
          : "Tip created successfully."
      );
    } catch (err) {
      console.log(err);
      setStatus("Unable to save tip.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this tip?"
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/service-tips/${id}`
      );

      await fetchTips();

      setStatus(
        "Tip deleted successfully."
      );
    } catch (err) {
      console.log(err);
      setStatus(
        "Unable to delete tip."
      );
    }
  };

  return (
    <div>

      {/* Header */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Service Tips
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage service tips and instructions
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="
            px-6 py-2.5
            bg-gradient-to-r
            from-primary
            to-primary-dark
            text-white
            rounded-xl
            text-sm
            font-semibold
            hover:shadow-lg
            hover:shadow-primary/20
            transition-all
          "
        >
          + Add Tip
        </button>

      </div>

      {status && (
        <p className="mb-4 text-sm text-green-600">
          {status}
        </p>
      )}

      {/* Table */}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Content
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Order
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-50">

              {tips.map((tip) => (
                <tr
                  key={tip.id}
                  className="
                    hover:bg-gray-50/50
                    transition-colors
                  "
                >
                  <td className="px-6 py-4 text-sm capitalize">
                    {tip.type}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 max-w-lg">
                    {tip.content}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {tip.tip_order}
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(tip)
                        }
                        className="
                          px-3 py-1.5
                          text-xs
                          bg-blue-50
                          text-blue-600
                          rounded-lg
                          hover:bg-blue-100
                          transition-colors
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(tip.id)
                        }
                        className="
                          px-3 py-1.5
                          text-xs
                          bg-red-50
                          text-red-600
                          rounded-lg
                          hover:bg-red-100
                          transition-colors
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

      </div>

      {/* Modal */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
          "
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              relative
              bg-white
              rounded-2xl
              shadow-2xl
              w-full
              max-w-lg
              animate-scaleIn
            "
          >
            <div className="p-6 border-b border-gray-100">

              <h2 className="text-xl font-bold font-[var(--font-heading)]">
                {editingId
                  ? "Edit Tip"
                  : "Add Tip"}
              </h2>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="text-sm font-medium">
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type:
                        e.target.value,
                    })
                  }
                  className="
                    w-full
                    mt-2
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-primary
                  "
                >
                   <option value="before_session">Before Session</option>
  <option value="after_session">After Session</option>
  <option value="do">Do</option>
  <option value="dont">Don't</option>
  <option value="warning">Warning</option>
                </select>

              </div>

              <div>
                <label className="text-sm font-medium">
                  Content
                </label>

                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content:
                        e.target.value,
                    })
                  }
                  className="
                    w-full
                    mt-2
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-primary
                  "
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Order
                </label>

                <input
                  type="number"
                  value={form.tip_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tip_order:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="
                    w-full
                    mt-2
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-primary
                  "
                />
              </div>

              <div className="flex gap-3 pt-2">

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="
                    px-6
                    py-2.5
                    bg-gradient-to-r
                    from-primary
                    to-primary-dark
                    text-white
                    rounded-xl
                  "
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Tip"
                    : "Create Tip"}
                </button>

                <button
                  onClick={closeModal}
                  className="
                    px-6
                    py-2.5
                    bg-gray-100
                    rounded-xl
                  "
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}