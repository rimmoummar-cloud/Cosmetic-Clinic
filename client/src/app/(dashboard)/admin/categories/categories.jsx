"use client";

import { useEffect, useState } from "react";
import ServiceForm from "../services/components/ServiceForm";
import api from "../../../../lib/api.js";
export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [categoryList, setCategoryList] = useState([]);

  const [showServicesModal, setShowServicesModal] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceFormData, setServiceFormData] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // const fetchCategories = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/api/categorie", { cache: "no-store" });
  //     if (!res.ok) throw new Error("Failed to fetch categories");
  //     const data = await res.json();
  //     const list = Array.isArray(data) ? data : data?.categories || [];
  //     setCategoryList(list);
  //   } catch (error) {
  //     setStatus({ type: "error", message: error.message || "Unable to load categories" });
  //   }
  // };
const fetchCategories = async () => {
  try {
    const res = await api.get("/categorie");

    const data = res.data;

    const list = Array.isArray(data)
      ? data
      : data?.categories || [];

    setCategoryList(list);

  } catch (error) {
    setStatus({
      type: "error",
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to load categories",
    });
  }
};
  const fetchServicesByCategory = async (categoryId) => {
    try {
      setServiceLoading(true);
          setServicesList([]);
      const res = await fetch(`http://localhost:5000/api/services/samecategories/${categoryId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.services || [];
    
      setServicesList(list);
    } catch (error) {
      setServiceStatus("Unable to load services for this category.");
    } finally {
      setServiceLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setIsActive(true);
    setEditingCategoryId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setName(category.name || "");
    setDescription(category.description || "");
    setImageUrl(category.image_url || "");
    setIsActive(Boolean(category.is_active));
    setEditingCategoryId(category.id);
    setShowModal(true);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!name.trim() || !description.trim() || !imageUrl.trim()) {
  //     setStatus({ type: "error", message: "Please fill all required fields" });
  //     return;
  //   }

  //   setLoading(true);
  //   setStatus(null);

  //   const isEdit = Boolean(editingCategoryId);
  //   const endpoint = isEdit ? `http://localhost:5000/api/categorie/${editingCategoryId}` : "http://localhost:5000/api/categorie";
  //   const method = isEdit ? "PUT" : "POST";

  //   try {
  //     const res = await fetch(endpoint, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         name,
  //         description,
  //         image_url: imageUrl,
  //       //   is_active: isActive,
  //       }),
  //     });

  //     if (!res.ok) throw new Error("Failed to save category");

  //     setStatus({ type: "success", message: isEdit ? "Category updated successfully" : "Category created successfully" });
  //     resetForm();
  //     setShowModal(false);
  //     await fetchCategories();
  //   } catch (error) {
  //     setStatus({ type: "error", message: error.message || "Something went wrong" });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!name.trim() || !description.trim() || !imageUrl.trim()) {
    setStatus({ type: "error", message: "Please fill all required fields" });
    return;
  }

  setLoading(true);
  setStatus(null);

  const isEdit = Boolean(editingCategoryId);

  const endpoint = isEdit
    ? `/categorie/${editingCategoryId}`
    : `/categorie`;

  const method = isEdit ? "put" : "post";

  try {
    const res = await api({
      url: endpoint,
      method: method,
      data: {
        name,
        description,
        image_url: imageUrl,
        // is_active: isActive,
      },
    });

    if (!res) throw new Error("Failed to save category");

    setStatus({
      type: "success",
      message: isEdit
        ? "Category updated successfully"
        : "Category created successfully",
    });

    resetForm();
    setShowModal(false);
    await fetchCategories();

  } catch (error) {
    setStatus({
      type: "error",
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    });
  } finally {
    setLoading(false);
  }
};

  // const handleDelete = async (id) => {
  //   const confirmed = window.confirm("Are you sure you want to delete this category?");
  //   if (!confirmed) return;

  //   try {
  //     const res = await fetch(`http://localhost:5000/api/categorie/${id}`, { method: "DELETE" });
  //     if (!res.ok) throw new Error("Failed to delete category");
  //     setStatus({ type: "success", message: "Category deleted successfully" });
  //     await fetchCategories();
  //   } catch (error) {
  //     setStatus({ type: "error", message: error.message || "Unable to delete category" });
  //   }
  // };
const handleDelete = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this category?");
  if (!confirmed) return;

  try {
    const res = await api.delete(`/categorie/${id}`);

    if (!res) throw new Error("Failed to delete category");

    setStatus({ type: "success", message: "Category deleted successfully" });
    await fetchCategories();

  } catch (error) {
    setStatus({
      type: "error",
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to delete category",
    });
  }
};
  const openServicesModal = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowServicesModal(true);
    setServiceStatus("");
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceFormData(null);
    fetchServicesByCategory(categoryId);
  };

  const handleServiceEdit = (service) => {
    setEditingServiceId(service.id);
    setServiceFormData(service);
    setShowServiceForm(true);
  };

  const closeServicesModal = () => {
    setShowServicesModal(false);
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceFormData(null);
    setServiceStatus("");
  };

  const closeServiceForm = () => {
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceFormData(null);
  };

  const handleServiceFormSubmit = async (payload) => {
    setServiceStatus("");
    setServiceLoading(true);
    const isEditingService = Boolean(editingServiceId);
    const url = isEditingService ? `http://localhost:5000/api/services/${editingServiceId}` : "http://localhost:5000/api/services";
    const method = isEditingService ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setServiceLoading(false);
      setServiceStatus("Unable to save service. Please try again.");
      throw new Error("Request failed");
    }

    await fetchServicesByCategory(selectedCategoryId);
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceFormData(null);
    setServiceStatus(isEditingService ? "Service updated successfully." : "Service created successfully.");
    setServiceLoading(false);
  };

  const handleServiceDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this service?");
    if (!confirmed) return;

    try {
      setServiceLoading(true);
      const res = await fetch(`http://localhost:5000/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      await fetchServicesByCategory(selectedCategoryId);
    } catch (error) {
      setServiceStatus("Unable to delete service.");
    } finally {
      setServiceLoading(false);
    }
  };

  const statusStyles =
    status?.type === "error"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-green-50 text-green-700 border-green-100";

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage service categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          + Add Category
        </button>
      </div>

      {status?.message && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm ${statusStyles}`}>
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryList.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-[10px]">No Image</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => openServicesModal(cat.id)}
                  className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Show all services
                </button>
              </div>
            </div>
            <h3 className="font-semibold font-[var(--font-heading)] text-lg mb-2">
              {cat.name}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">{cat.description}</p>
          </div>
        ))}
        {categoryList.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10 border border-dashed border-gray-200 rounded-2xl">
            No categories yet.
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold font-[var(--font-heading)]">
                {editingCategoryId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                x
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
              {/* <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div> */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : editingCategoryId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showServicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeServicesModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-[var(--font-heading)]">Services</h2>
                {selectedCategoryId && (
                  <p className="text-xs text-gray-500">Category ID: {selectedCategoryId}</p>
                )}
              </div>
              <button onClick={closeServicesModal} className="text-2xl text-gray-400 hover:text-gray-600">
                x
              </button>
            </div>

            {!showServiceForm ? (
              <div className="p-6 space-y-4">
                {serviceStatus && <p className="text-sm text-gray-600">{serviceStatus}</p>}
                {serviceLoading && <p className="text-sm text-gray-500">Loading services...</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesList.map((svc) => (
                    <div key={svc.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent overflow-hidden flex items-center justify-center">
                          {svc.image_url ? (
                            <img src={svc.image_url} alt={svc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{svc.name}</p>
                          <p className="text-xs text-gray-500">{svc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Price: ${svc.price}</span>
                        <span>Duration: {svc.duration_minutes} min</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServiceEdit(svc)}
                          className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleServiceDelete(svc.id)}
                          className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {servicesList.length === 0 && !serviceLoading && (
                  <div className="text-center text-gray-500 py-6 border border-dashed border-gray-200 rounded-xl">
                    No services found for this category.
                  </div>
                )}
              </div>
            ) : (
              <ServiceForm
                onSubmit={handleServiceFormSubmit}
                loading={serviceLoading}
                initialData={serviceFormData}
                isEditing={Boolean(editingServiceId)}
                onClose={closeServiceForm}
                categories={categoryList}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
