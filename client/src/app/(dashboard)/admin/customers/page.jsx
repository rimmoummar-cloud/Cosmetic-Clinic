"use client";

import { useMemo, useState } from "react";
import api from "../../../../lib/api.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustomerDetails from "./components/CustomerDetails";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customers");
      return res.data;
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const res = await api.post("/customers", customerData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      setName("");
      setEmail("");
      setPhone("");
      setShowAddForm(false);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, customerData }) => {
      const res = await api.put(
        `/customers/${customerId}`,
        customerData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      setEditingCustomerId(null);
      setEditName("");
      setEditEmail("");
      setEditPhone("");
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      const res = await api.delete(`/customers/${customerId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) => {
      const name = customer?.name?.toLowerCase() || "";
      const email = customer?.email?.toLowerCase() || "";
      const phone = customer?.phone?.toLowerCase() || "";

      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      );
    });
  }, [customers, search]);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString();
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();

    addCustomerMutation.mutate({
      name,
      phone,
      email,
    });
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);
    setEditName(customer?.name || "");
    setEditEmail(customer?.email || "");
    setEditPhone(customer?.phone || "");

    addCustomerMutation.reset();
    updateCustomerMutation.reset();
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditName("");
    setEditEmail("");
    setEditPhone("");

    updateCustomerMutation.reset();
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();

    updateCustomerMutation.mutate({
      customerId: editingCustomerId,
      customerData: {
        name: editName,
        phone: editPhone,
        email: editEmail,
      },
    });
  };

  const handleDeleteCustomer = (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer?.name || "this customer"}?`
    );

    if (!confirmed) return;

    deleteCustomerMutation.mutate(customer.id);
  };

  // Show customer details if selected
  if (selectedCustomerId) {
    return (
      <CustomerDetails
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Customers
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          View and manage customer information
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer List
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="h-10 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {showAddForm ? "Cancel" : "Add Customer"}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddCustomer}
            className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={addCustomerMutation.isPending}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addCustomerMutation.isPending
                  ? "Adding..."
                  : "Add Customer"}
              </button>
            </div>

            {addCustomerMutation.isError && (
              <p className="text-sm text-red-500 mt-3">
                {addCustomerMutation.error?.response?.data?.message ||
                  "Failed to add customer. Please try again."}
              </p>
            )}
          </form>
        )}

        {editingCustomerId && (
          <form
            onSubmit={handleUpdateCustomer}
            className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Edit Customer
              </h3>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                required
                className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={updateCustomerMutation.isPending}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateCustomerMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>

            {updateCustomerMutation.isError && (
              <p className="text-sm text-red-500 mt-3">
                {updateCustomerMutation.error?.response?.data?.message ||
                  "Failed to update customer. Please try again."}
              </p>
            )}
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Name
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Email
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Phone
                </th>

                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Created At
                </th>

                <th className="text-right py-3 px-4 font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {customer?.name || "-"}
                    </td>

                    <td className="py-3 px-4 text-gray-700">
                      {customer?.email || "-"}
                    </td>

                    <td className="py-3 px-4 text-gray-700">
                      {customer?.phone || "-"}
                    </td>

                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(customer?.created_at)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
                          onClick={() =>
                            setSelectedCustomerId(customer.id)
                          }
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditCustomer(customer)
                          }
                          disabled={updateCustomerMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCustomer(customer)
                          }
                          disabled={deleteCustomerMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {deleteCustomerMutation.isError && (
          <p className="text-sm text-red-500 mt-4">
            Failed to delete customer. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}