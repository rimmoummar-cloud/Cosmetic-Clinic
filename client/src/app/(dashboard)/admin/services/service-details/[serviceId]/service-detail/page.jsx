"use client";
import { use } from "react";
import { useEffect, useState } from "react";
import api from "../../../../../../../lib/api";

export default function Page({ params }) {
const { serviceId } = use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    short_description: "",
    long_description: "",
    why_choose_this: "",
    suitable_for: "",
    not_suitable_for: "",
    precautions: "",
    preparation: "",
    recovery: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/service-details/services/${serviceId}/details`
      );

      const result = res?.data?.data || null;
      setData(result);
      if (result) setForm(result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const handleSave = async () => {
    if (data?.id) {
      await api.put(`/service-details/${data.id}`, form);
    } else {
      await api.post(`/service-details`, {
        service_id: serviceId,
        ...form,
      });
    }

    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!data?.id) return;

    if (!confirm("Delete?")) return;

    await api.delete(`/service-details/${data.id}`);

    setData(null);
    setForm({});
  };

  if (loading) {
    return (
      <div className="p-10 text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold">Service Detail</h1>
          <p className="text-gray-500 text-sm">
            Manage structured content
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl"
        >
          {data ? "Edit" : "Add"}
        </button>
      </div>

      {/* TABLE (clean admin style) */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Field</th>
              <th className="p-4 text-left">Value</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(form).map(([k, v]) => (
              <tr key={k} className="border-t">
                <td className="p-4 text-gray-600">
                  {k.replaceAll("_", " ")}
                </td>
                <td className="p-4 text-gray-800">
                  {v || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl"
        >
          Edit
        </button>

        {data && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl"
          >
            Delete
          </button>
        )}
      </div>

      {/* FORM MODAL (clean + scroll fixed) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 space-y-4">

            <h2 className="text-lg font-bold">
              Service Detail Form
            </h2>

            {Object.keys(form).map((k) => (
              <div key={k}>
                <label className="text-xs text-gray-500">
                  {k.replaceAll("_", " ")}
                </label>

                <textarea
                  name={k}
                  value={form[k] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [k]: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-1"
                  rows={3}
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-xl"
              >
                Save
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

