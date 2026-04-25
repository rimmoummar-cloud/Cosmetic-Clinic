"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function AdminBookingsPage() {
  const { data: bookingData = [] } = useQuery({
  queryKey: ["bookings"],
  queryFn: async () => {
    const res = await fetch(
      `${API_BASE_URL}/bookings/WithDetails`
    );
    return res.json();
  },
});
    const queryClient = useQueryClient();
    
    const updateStatus = async (id, newStatus) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/bookings/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update");
    }
  // 🔥 أهم سطر في المشروع كله
 queryClient.invalidateQueries({
  queryKey: ["availableSlots"],
  exact: false,
});

queryClient.invalidateQueries({
  queryKey: ["bookings"],
});
   await queryClient.invalidateQueries({
      queryKey: ["bookings"],
    });

    await queryClient.invalidateQueries({
      queryKey: ["slots"],
      exact: false,
    });

    await queryClient.invalidateQueries({
      queryKey: ["availableSlots"],
      exact: false,
    });
    // window.location.reload();
  } catch (err) {
    console.error(err);
  }
};
    const [selectedService, setSelectedService] = useState(null);
const [selectedNote, setSelectedNote] = useState(null);
const [actionLoadingId, setActionLoadingId] = useState(null);

  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? bookingData
      : bookingData.filter((b) => b.status === filter);

  const statusColors = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)]">
            Bookings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all appointments
          </p>
        </div>
      </div>

      {/* Filters */}
{/* Filters */}
{/* Filters */}
<div className="flex flex-wrap items-center gap-2 mb-6">
  {["all", "pending", "approved", "completed", "cancelled"].map((f) => {
    const count =
      f === "all"
        ? bookingData.length
        : bookingData.filter(
            (b) => b.status?.toLowerCase() === f
          ).length;

    return (
      <button
        key={f}
        onClick={() => setFilter(f)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize flex items-center gap-2 ${
          filter === f
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
        }`}
      >
        {f}
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            filter === f
              ? "bg-white/20 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      </button>
    );
  })}
</div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">




            
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Services
                </th>
                 <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                 Note
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Date & Time
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
              {bookingData.map((booking) => (
              
              
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-400">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {booking.customer_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.customer_email} | {booking.customer_phone}
                      </p>
                    </div>
                  </td>
                        {/* <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.services.map((s) => (
            <div key={s.id}>
            {s.name} — {s.duration} min — ${s.price}
    </div>
  ))}

                  </td> */}
<td className="px-6 py-4">
  {booking.services?.length > 0 ? (
    <div className="flex items-center flex-wrap gap-1">
      
      {/* عرض أول 2 خدمات فقط بشكل مختصر */}
      {booking.services.slice(0, 2).map((s) => (
        <span
          key={s.id}
         className="px-8 py-1 bg-gray-100 rounded-full text-xs">
        
          {s.name}
        </span>
        
      ))}

      {/* إذا أكثر من 2 → نكتب +X */}
      {booking.services.length > 2 && (
        <span className="text-xs text-gray-500">
          +{booking.services.length - 2}
        </span>
      )}

      {/* زر See more إذا في أكثر من خدمة */}
      {booking.services.length > 1 && (
        <button
       onClick={() => setSelectedService([...booking.services])}
          className="ml-2 text-blue-600 text-xs underline"
        >
          See more
        </button>
      )}

    </div>
  ) : (
    "-"
  )}
</td>

                   {/* <td className="px-6 py-4 text-sm text-gray-600">
                    {booking.note || "—"}
                  </td> */}
<td className="px-6 py-4 text-sm">
  {booking.note ? (
    <>
      {booking.note.slice(0, 20)}

      {booking.note.length > 20 && (
        <button
          onClick={() => setSelectedNote(booking.note)}
          className="ml-2 text-blue-600 text-xs underline"
        >
          See more
        </button>
      )}
    </>
  ) : (
    "-"
  )}
</td>



                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                      {booking.booking_datetime} 
                      </p>
                      <p className="text-xs text-gray-400">
                     
                         {booking.created_at.split("T")[0]} at {booking.created_at.split("T")[1].slice(0, 5)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusColors[booking.status] || ""
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                <div className="flex gap-1">

  {["pending", "approved"].includes(booking.status) && (
    <>
      {booking.status === "pending" && (
        <button
          className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
          onClick={() =>
            updateStatus(
              booking.id,
              "approved"
            )
          }
        >
          Approve
        </button>
      )}

      <button
        className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        onClick={() =>
          updateStatus(
            booking.id,
            "cancelled"
          )
        }
      >
        Cancel
      </button>
    </>
  )}

  {booking.status === "approved" && (
    <button
      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      onClick={() =>
        updateStatus(
          booking.id,
          "completed"
        )
      }
    >
      Done
    </button>
  )}

</div>
                  </td>
                </tr>
                
             ))}
          
            </tbody>
          </table>
             <Modal
  isOpen={!!selectedService}
  onClose={() => setSelectedService(null)}
  title="Service Details"
>
  {selectedService?.map((service) => (
    <div
      key={service.id}
      className="border-b py-2 text-sm"
    >
      <p className="font-medium">
        {service.name}
      </p>

      <p className="text-gray-500">
        Duration: {service.duration} min
      </p>

      <p className="text-gray-500">
        Price: ${service.price}
      </p>
    </div>
  ))}
</Modal>
<Modal
  isOpen={!!selectedNote}
  onClose={() => setSelectedNote(null)}
  title="Notes"
>
<p className="text-sm text-gray-600">
  {selectedNote || "-"}
</p>
</Modal>
        </div>
      </div>
    </div>
  );
}
