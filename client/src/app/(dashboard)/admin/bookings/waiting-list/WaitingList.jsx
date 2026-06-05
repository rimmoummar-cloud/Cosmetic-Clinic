"use client";
import api from "../../../../../lib/api.js";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-[90%] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}

export default function WaitingListPage() {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [localWaitingListData, setLocalWaitingListData] = useState(null);
  
  const { data: waitingListData = [], isLoading } = useQuery({
    queryKey: ["waiting-list"],
    queryFn: async () => {
      const res = await api.get("/waiting-list");
      return res.data || [];
    },
  });

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  const handleApprove = async (waitingListId) => {
    try {
      setApprovingId(waitingListId);
      
 await api.patch(
  `/waiting-list/${waitingListId}/approve`
);

      // Update local state to reflect the change
      const displayData = localWaitingListData || waitingListData;
      const updatedData = displayData.map((entry) =>
        entry.id === waitingListId ? { ...entry, status: "accepted" } : entry
      );
      setLocalWaitingListData(updatedData);

      toast.success("Waiting list entry approved successfully!");
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to approve waiting list entry"
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Waiting List
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customers on the waiting list
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/bookings")}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          Back to Bookings
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading waiting list...</p>
          </div>
        </div>
      ) : (localWaitingListData || waitingListData).length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Waiting List Entries
          </h3>
          <p className="text-gray-500 text-sm">
            There are currently no customers on the waiting list.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Customer Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Requested Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Services
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(localWaitingListData || waitingListData).map((entry) => {
                  const serviceNames = Array.isArray(entry.services)
                    ? entry.services
                        .map((s) => (typeof s === "string" ? s : s.name))
                        .join(", ")
                    : "-";

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {entry.customer_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {entry.customer_email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {entry.customer_phone}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {entry.requested_date
                            ? new Date(entry.requested_date).toLocaleString(
                                "en-US",
                                {
                                  timeZone: "America/Montreal",
                                  dateStyle: "medium",
                                }
                              )
                            : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize text-gray-700">
                          {entry.period || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {Array.isArray(entry.services) &&
                          entry.services.length > 0 ? (
                            <>
                              <div className="flex items-center flex-wrap gap-1">
                                {entry.services.slice(0, 2).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs"
                                  >
                                    {typeof s === "string" ? s : s.name}
                                  </span>
                                ))}

                                {entry.services.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{entry.services.length - 2}
                                  </span>
                                )}
                              </div>

                              {entry.services.length > 1 && (
                                <button
                                  onClick={() => setSelectedServices(entry.services)}
                                  className="text-blue-600 text-xs underline"
                                >
                                  See more
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            statusColors[entry.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {entry.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {entry.status !== "accepted" && (
                            <button
                              onClick={() => handleApprove(entry.id)}
                              disabled={approvingId === entry.id}
                              className="px-3 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
                            >
                              {approvingId === entry.id ? "Approving..." : "Approve"}
                            </button>
                          )}
                          <button className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Modal */}
      <Modal
        isOpen={!!selectedServices}
        onClose={() => setSelectedServices(null)}
        title="Service Details"
      >
        {selectedServices && Array.isArray(selectedServices) && selectedServices.map((service, idx) => (
          <div key={idx} className="border-b py-3 text-sm last:border-b-0">
            <p className="font-medium text-gray-800">
              {typeof service === "string" ? service : service.name}
            </p>
            {typeof service !== "string" && service.duration_minutes && (
              <p className="text-gray-500 text-xs mt-1">
                Duration: {service.duration_minutes} min
              </p>
            )}
            {typeof service !== "string" && service.price && (
              <p className="text-gray-500 text-xs">
                Price: ${service.price}
              </p>
            )}
          </div>
        ))}
      </Modal>
    </div>
  );
}
