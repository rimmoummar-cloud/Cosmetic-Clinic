"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/api.js";

export default function DisclaimersPage() {
  const [disclaimers, setDisclaimers] = useState([]);
  const [selectedDisclaimer, setSelectedDisclaimer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    service_id: "",
    title: "",
    description: "",
    type: "warning",
    is_active: true,
  });

  const [services, setServices] = useState([]);

  // Fetch disclaimers
  useEffect(() => {
    fetchDisclaimers();
    fetchServices();
  }, []);

  const fetchDisclaimers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/disclaimers");
      const list = Array.isArray(res.data) ? res.data : res.data?.disclaimers || [];
      setDisclaimers(list);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to load disclaimers",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      const list = Array.isArray(res.data) ? res.data : res.data?.services || [];
      setServices(list);
    } catch (error) {
      console.error("Unable to load services", error);
    }
  };

  // Filter disclaimers
  const filtered = disclaimers.filter((d) => {
    const matchesSearch =
      d.title?.toLowerCase?.().includes(search.toLowerCase()) ||
      d.service_name?.toLowerCase?.().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && d.is_active) ||
      (statusFilter === "inactive" && !d.is_active);

    return matchesSearch && matchesStatus;
  });

  // Handle row selection
  const handleSelectDisclaimer = (disclaimer) => {
    setSelectedDisclaimer(disclaimer);
    setIsEditMode(false);
    setFormData({
      service_id: disclaimer.service_id || "",
      title: disclaimer.title || "",
      description: disclaimer.description || "",
      type: disclaimer.type || "warning",
      is_active: disclaimer.is_active ?? true,
    });
    setStatus(null);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedDisclaimer(null);
    setIsEditMode(true);
    setFormData({
      service_id: services[0]?.id || "",
      title: "",
      description: "",
      type: "warning",
      is_active: true,
    });
    setStatus(null);
  };

  // Handle edit mode
  const handleEditMode = () => {
    setIsEditMode(true);
    setStatus(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setStatus(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submit (create/update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.service_id) {
      setStatus({
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const isCreating = !selectedDisclaimer;
      const endpoint = isCreating ? "/disclaimers" : `/disclaimers/${selectedDisclaimer.id}`;
      const method = isCreating ? "post" : "put";

      const payload = {
        service_id: parseInt(formData.service_id),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        is_active: formData.is_active,
      };

      const res = await api({
        url: endpoint,
        method,
        data: payload,
      });

      setStatus({
        type: "success",
        message: isCreating ? "Disclaimer created successfully" : "Disclaimer updated successfully",
      });

      await fetchDisclaimers();
      setIsEditMode(false);
      setSelectedDisclaimer(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to save disclaimer",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (disclaimerId) => {
    try {
      setLoading(true);
      const disclaimer = disclaimers.find((d) => d.id === disclaimerId);
      const newStatus = !disclaimer.is_active;

      const res = await api.patch(`/disclaimers/${disclaimerId}/status`, {
        is_active: newStatus,
      });

      setStatus({
        type: "success",
        message: `Disclaimer ${newStatus ? "activated" : "deactivated"} successfully`,
      });

      await fetchDisclaimers();
      if (selectedDisclaimer?.id === disclaimerId) {
        setSelectedDisclaimer((prev) => ({ ...prev, is_active: newStatus }));
        setFormData((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to toggle status",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (disclaimerId) => {
    if (!window.confirm("Are you sure you want to delete this disclaimer?")) return;

    try {
      setLoading(true);
      await api.delete(`/disclaimers/${disclaimerId}`);

      setStatus({
        type: "success",
        message: "Disclaimer deleted successfully",
      });

      await fetchDisclaimers();
      setSelectedDisclaimer(null);
      setIsEditMode(false);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to delete disclaimer",
      });
    } finally {
      setLoading(false);
    }
  };

  const statusStyles =
    status?.type === "error"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-green-50 text-green-700 border-green-100";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Service Disclaimers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage treatment warnings and disclaimers</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          + Add Disclaimer
        </button>
      </div>

      {/* Status Message */}
      {status?.message && (
        <div className={`px-4 py-3 rounded-xl border text-sm ${statusStyles}`}>
          {status.message}
        </div>
      )}

      {/* Main Layout: Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Disclaimers List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search disclaimers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors w-full"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Disclaimers List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No disclaimers found
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((disclaimer) => (
                  <div
                    key={disclaimer.id}
                    onClick={() => handleSelectDisclaimer(disclaimer)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDisclaimer?.id === disclaimer.id
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate">{disclaimer.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          disclaimer.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {disclaimer.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{disclaimer.service_name}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{disclaimer.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Details / Form */}
        <div className="lg:col-span-2">
          {selectedDisclaimer && !isEditMode ? (
            // VIEW MODE
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold font-[var(--font-heading)]">Disclaimer Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedDisclaimer.id)}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {selectedDisclaimer.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={handleEditMode}
                    className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDisclaimer.id)}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">ID</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedDisclaimer.id}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Service</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedDisclaimer.service_name}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedDisclaimer.title}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {selectedDisclaimer.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                    <p className="text-sm text-gray-700 mt-1 capitalize">{selectedDisclaimer.type}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                    <p className="text-sm mt-1">
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          selectedDisclaimer.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedDisclaimer.is_active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Created At</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(selectedDisclaimer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : isEditMode ? (
            // EDIT / CREATE MODE
            <form
              onSubmit={handleFormSubmit}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
            >
              <h2 className="text-xl font-bold font-[var(--font-heading)]">
                {selectedDisclaimer ? "Edit Disclaimer" : "Add New Disclaimer"}
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Sensitivity Risk"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter disclaimer description..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
                  required
                >
                  <option value="warning">Warning</option>
                  <option value="risk">Risk</option>
                  <option value="consent">Consent</option>
                  <option value="contraindication">Contraindication</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="is-active"
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="is-active" className="text-sm text-gray-700 cursor-pointer">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : selectedDisclaimer ? "Update" : "Create"}
                </button>
              </div>
            </form>
          ) : (
            // EMPTY STATE
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-sm">Select a disclaimer from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
