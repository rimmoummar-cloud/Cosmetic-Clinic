"use client";
import { useMemo, useState } from "react";
import api from "../../../../lib/api.js";
import { useQuery } from "@tanstack/react-query";
import CustomerDetails from "./components/CustomerDetails";

export const getCustomers = async () => {
  const res = await api.get("/customers");
  return res.data;
};
export const getCustomerById = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};
export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customers");
      return res.data;
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
        name.includes(term) || email.includes(term) || phone.includes(term)
      );
    });
  }, [customers, search]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
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
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage customer information</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Customer List</h2>
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Created At</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
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
                    <td className="py-3 px-4 text-gray-700">{customer?.email || "-"}</td>
                    <td className="py-3 px-4 text-gray-700">{customer?.phone || "-"}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(customer?.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-accent transition-colors"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
