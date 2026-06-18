
"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
  const { serviceId } = use(params);

  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    benefit_order: 1,
  };

  const [form, setForm] =
    useState(emptyForm);

  const fetchBenefits = async () => {
    try {
      setLoading(true);

      const res =
        await api.get(
          `/service-benefits/service/${serviceId}`
        );

      setBenefits(
        res?.data?.data || []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchBenefits();
    }
  }, [serviceId]);

  const openCreateModal = () => {
    setEditingBenefit(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (
    benefit
  ) => {
    setEditingBenefit(benefit);

    setForm({
      title:
        benefit.title || "",
      description:
        benefit.description || "",
      benefit_order:
        benefit.benefit_order || 1,
    });

    setShowModal(true);
  };

  const handleSave =
    async () => {
      try {
        setSaving(true);

        if (
          editingBenefit?.id
        ) {
          await api.put(
            `/service-benefits/${editingBenefit.id}`,
            form
          );
        } else {
          await api.post(
            `/service-benefits`,
            {
              service_id:
                serviceId,
              ...form,
            }
          );
        }

        setShowModal(false);
        setEditingBenefit(
          null
        );

        fetchBenefits();
      } catch (err) {
        console.log(err);
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async (id) => {
      const ok =
        window.confirm(
          "Delete this benefit?"
        );

      if (!ok) return;

      try {
        await api.delete(
          `/service-benefits/${id}`
        );

        fetchBenefits();
      } catch (err) {
        console.log(err);
      }
    };

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Service Benefits
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Manage service
            benefits
          </p>
        </div>

        <button
          onClick={
            openCreateModal
          }
          className="
            px-6
            py-2.5
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
          + Add Benefit
        </button>

      </div>

      {/* TABLE */}
      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-100
          overflow-hidden
        "
      >
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-gray-50">

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Title
                </th>

                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Description
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

              {benefits.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="
                      text-center
                      py-10
                      text-gray-400
                    "
                  >
                    No benefits found
                  </td>
                </tr>
              ) : (
                benefits.map(
                  (benefit) => (
                    <tr
                      key={
                        benefit.id
                      }
                      className="
                        hover:bg-gray-50/50
                        transition-colors
                      "
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {
                          benefit.title
                        }
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                        {
                          benefit.description
                        }
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {
                          benefit.benefit_order
                        }
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                benefit
                              )
                            }
                            className="
                              px-3
                              py-1.5
                              text-xs
                              bg-blue-50
                              text-blue-600
                              rounded-lg
                              hover:bg-blue-100
                            "
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                benefit.id
                              )
                            }
                            className="
                              px-3
                              py-1.5
                              text-xs
                              bg-red-50
                              text-red-600
                              rounded-lg
                              hover:bg-red-100
                            "
                          >
                            Delete
                          </button>

                        </div>

                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          onClick={() =>
            setShowModal(
              false
            )
          }
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
          "
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
              max-w-xl
              max-h-[90vh]
              overflow-y-auto
            "
          >

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-xl font-bold font-[var(--font-heading)]">
                {editingBenefit
                  ? "Edit Benefit"
                  : "Add Benefit"}
              </h2>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <label className="text-sm font-medium">
                  Title
                </label>

                <input
                  type="text"
                  value={
                    form.title
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      title:
                        e.target
                          .value,
                    })
                  }
                  className="
                    mt-2
                    w-full
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:border-primary
                  "
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={
                    form.description
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      description:
                        e.target
                          .value,
                    })
                  }
                  className="
                    mt-2
                    w-full
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    outline-none
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
                  value={
                    form.benefit_order
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      benefit_order:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  }
                  className="
                    mt-2
                    w-full
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:border-primary
                  "
                />

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  onClick={
                    handleSave
                  }
                  disabled={
                    saving
                  }
                  className="
                    px-5
                    py-2.5
                    bg-primary
                    text-white
                    rounded-xl
                  "
                >
                  {saving
                    ? "Saving..."
                    : "Save"}
                </button>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="
                    px-5
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

