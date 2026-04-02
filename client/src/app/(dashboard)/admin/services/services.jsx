"use client";

import { useEffect, useState } from "react";
import { services as seedServices, categories as seedCategories } from "../../../data/services";
import ServiceForm from "./components/ServiceForm";

export default function ServicesPage({ service, categories = seedCategories }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState(service || seedServices);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (service) {
      setServiceList(service);
    }
  }, [service]);

  const fetchServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/services", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServiceList(Array.isArray(data) ? data : data?.services || []);
    } catch (err) {
      setStatus("Unable to load services.");
    }
  };

  const filtered = serviceList.filter((s) => {
    const term = search.toLowerCase();
    const categoryName = categories.find((c) => c.id === s.category_id)?.name?.toLowerCase?.() || "";
    return (
      s.name?.toLowerCase?.().includes(term) ||
      s.description?.toLowerCase?.().includes(term) ||
      categoryName.includes(term)
    );
  });

  const openCreateModal = () => {
    setSelectedService({ category_id: categories[0]?.id ?? "" });
    setEditingServiceId(null);
    setStatus("");
    setShowModal(true);
  };

  const handleEdit = (svc) => {
    setStatus("");
    setEditingServiceId(svc.id);
    setSelectedService(svc);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this service?");
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchServices();
    } catch (error) {
      setStatus("Unable to delete service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (payload) => {
    setStatus("");
    setLoading(true);
    const isEditing = Boolean(editingServiceId);
    const url = isEditing ? `http://localhost:5000/api/services/${editingServiceId}` : "http://localhost:5000/api/services";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setLoading(false);
      setStatus("Unable to save service. Please try again.");
      throw new Error("Request failed");
    }

    await fetchServices();
    setShowModal(false);
    setSelectedService(null);
    setEditingServiceId(null);
    setStatus(isEditing ? "Service updated successfully." : "Service created successfully.");
    setLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setEditingServiceId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your clinic services</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          + Add Service
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors w-full max-w-md"
        />
      </div>

      {status && <p className="mb-4 text-sm text-green-600">{status}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Service</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg overflow-hidden">
                        {svc.image_url ? (
                          <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                        ) : (
                          categories.find((c) => c.id === svc.category_id)?.icon
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.description?.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{svc.duration_minutes}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">${svc.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(svc)}
                        className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(svc.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold font-[var(--font-heading)]">{editingServiceId ? "Edit Service" : "Add New Service"}</h2>
              <button onClick={closeModal} className="text-2xl text-gray-400 hover:text-gray-600">
                x
              </button>
            </div>
            <ServiceForm
              onSubmit={handleFormSubmit}
              loading={loading}
              initialData={selectedService}
              isEditing={Boolean(editingServiceId)}
              onClose={closeModal}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
