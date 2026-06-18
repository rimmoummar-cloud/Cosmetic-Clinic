"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    question: "",
    answer: "",
    faq_order: 1,
  });

  useEffect(() => {
    if (serviceId) {
      fetchFaqs();
    }
  }, [serviceId]);

  const fetchFaqs = async () => {
    try {
      const res = await api.get(
        `/service-faqs/service/${serviceId}`
      );

      setFaqs(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStatus("Failed to load FAQs.");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      question: "",
      answer: "",
      faq_order: 1,
    });

    setShowModal(true);
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);

    setForm({
      question: faq.question,
      answer: faq.answer,
      faq_order: faq.faq_order,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);

    setForm({
      question: "",
      answer: "",
      faq_order: 1,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingId) {
        await api.put(
          `/service-faqs/${editingId}`,
          form
        );
      } else {
        await api.post(
          `/service-faqs`,
          {
            service_id: Number(serviceId),
            ...form,
          }
        );
      }

      await fetchFaqs();

      closeModal();

      setStatus(
        editingId
          ? "FAQ updated successfully."
          : "FAQ created successfully."
      );
    } catch (err) {
      console.log(err);
      setStatus("Unable to save FAQ.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this FAQ?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/service-faqs/${id}`
      );

      await fetchFaqs();

      setStatus(
        "FAQ deleted successfully."
      );
    } catch (err) {
      console.log(err);
      setStatus(
        "Unable to delete FAQ."
      );
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Service FAQs
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage frequently asked questions
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
          + Add FAQ
        </button>

      </div>

      {status && (
        <p className="mb-4 text-sm text-green-600">
          {status}
        </p>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-gray-50">

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Question
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Answer
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

              {faqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="
                    hover:bg-gray-50/50
                    transition-colors
                  "
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {faq.question}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 max-w-lg">
                    {faq.answer}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {faq.faq_order}
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(faq)
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
                          handleDelete(faq.id)
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

      {/* MODAL */}

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
              max-w-2xl
              animate-scaleIn
            "
          >
            <div className="p-6 border-b border-gray-100">

              <h2 className="text-xl font-bold font-[var(--font-heading)]">
                {editingId
                  ? "Edit FAQ"
                  : "Add FAQ"}
              </h2>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="text-sm font-medium">
                  Question
                </label>

                <input
                  type="text"
                  value={form.question}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      question:
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
                  Answer
                </label>

                <textarea
                  rows={5}
                  value={form.answer}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      answer:
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
                  value={form.faq_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      faq_order:
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
                    ? "Update FAQ"
                    : "Create FAQ"}
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