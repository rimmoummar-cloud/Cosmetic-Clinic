"use client";
import api from "../../../../lib/api.js";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

// useEffect(() => {
//   const getCsrfToken = async () => {
//     try {
//       const res = await api.get("/csrf-token");

//       localStorage.setItem(
//         "csrfToken",
//         res.data.csrfToken
//       );

//     } catch (err) {
//       console.error("CSRF ERROR", err);
//     }
//   };

//   getCsrfToken();
// }, []);




  const router = useRouter();
  
  const { data: bookingData = [] } = useQuery({
  // queryKey: ["bookings"],
  // queryFn: async () => {
  //   const res = await fetch(
  //     `${API_BASE_URL}/bookings/WithDetails`
  //   );
  //   if (!res.ok) throw new Error("Unauthorized");
  //   return res.json();
  // },
   queryKey: ["bookings"],
   queryFn: async () => {
  const res = await api.get("/bookings/WithDetails");

  return res.data;
},
//   queryFn: async () => {
//   const token = localStorage.getItem("token");

//   const res = await api.get(
//     `${API_BASE_URL}/bookings/WithDetails`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }
//   );

//   if (!res.ok) throw new Error("Unauthorized");

//   return res.json();
// },
});
// const { data: bookingData = [] } = useQuery({
//   queryKey: ["bookings"],
//   queryFn: async () => {
//     const res = await fetch(`${API_BASE_URL}/bookings/WithDetails`);
//     const data = await res.json();

//     return data.bookings || data.data || data || [];
//   },
// });
    const queryClient = useQueryClient();
    
    const updateStatus = async (id, newStatus) => {
  try {
 const csrfToken =
  localStorage.getItem("csrfToken");

const res = await api.put(
  `/bookings/${id}/status`,
  {
    status: newStatus,
  },
  {
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  }
);

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
const [selectedAcceptance, setSelectedAcceptance] = useState(null);
const [acceptanceLoading, setAcceptanceLoading] = useState(false);
const [acceptanceData, setAcceptanceData] = useState([]);
const [selectedReminders, setSelectedReminders] = useState(null);

  const [filter, setFilter] = useState("all");

  const fetchAcceptanceDetails = async (bookingId) => {
    setAcceptanceLoading(true);
    try {
      const res = await api.get("/acceptance");
      const allAcceptance = res.data || [];
      const filtered = allAcceptance.filter(a => a.booking_id === bookingId);
      setAcceptanceData(filtered);
      setSelectedAcceptance(bookingId);
    } catch (err) {
      console.error("Failed to fetch acceptance details:", err);
      setAcceptanceData([]);
      setSelectedAcceptance(bookingId);
    } finally {
      setAcceptanceLoading(false);
    }
  };

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
  const disclaimerColors = {
  accepted: "bg-emerald-500",
  pending: "bg-red-500",
  no_disclaimers: "bg-yellow-400",
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
        <button
          onClick={() => router.push("/admin/bookings/AllBooking")}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          View All Bookings
        </button>
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

      <div className="bg-white rounded-2xl border border-gray-100">
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
               <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase min-w-[220px]">
  Date & Time
</th>
                              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
  Disclaimer
</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
  
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Reminders
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



                  {/* <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                      {booking.booking_datetime} 
                      </p>
                      <p className="text-xs text-gray-400">
                     
                         {booking.created_at.split("T")[0]} at {booking.created_at.split("T")[1].slice(0, 5)}
                      </p>
                    </div>
                  </td> */}
<td className="px-6 py-4">
  <div>
    <p className="text-sm font-medium">
      {new Date(booking.booking_datetime).toLocaleString("en-US", {
        timeZone: "America/Montreal",
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </p>

    <p className="text-xs text-gray-400">
      {new Date(booking.created_at).toLocaleString("en-US", {
        timeZone: "America/Montreal",
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </p>
  </div>
</td>

<td className="px-6 py-4">
  <div className="flex items-center gap-2">

    <div
      className={`w-3 h-3 rounded-full ${
        disclaimerColors[
          booking.disclaimer_status
        ] || "bg-gray-300"
      }`}
    />

    <span className="text-xs capitalize text-gray-600">
      {booking.disclaimer_status
        ?.replace("_", " ")}
    </span>

  </div>
  {["accepted", "pending"].includes(booking.disclaimer_status) && (
    <button
      onClick={() => fetchAcceptanceDetails(booking.id)}
      className="mt-1 text-xs text-blue-600 underline hover:text-blue-800 transition-colors"
    >
      View all details
    </button>
  )}
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
                  <td className="px-6 py-4">
                    {booking.reminders && booking.reminders.length > 0 ? (
                      <button
                        onClick={() => setSelectedReminders(booking.reminders)}
                        className="text-blue-600 text-xs underline hover:text-blue-800 transition-colors"
                      >
                        Show All Reminders
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                
             ))}
          
            </tbody>
          </table>
        </div>
      </div>

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
      <Modal
        isOpen={!!selectedAcceptance}
        onClose={() => setSelectedAcceptance(null)}
        title="Disclaimer Details"
      >
        {acceptanceLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : acceptanceData.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">
            No acceptance records found
          </p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {acceptanceData.map((record, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                {/* Dynamic field rendering */}
                {Object.entries(record).map(([key, value]) => {
                  // Skip id and booking_id from display if they're already shown
                  if (key === 'id' || key === 'booking_id') return null;
                  
                  // Handle signature image
                  if (key === 'signature' && value) {
                    return (
                      <div key={key} className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                          {key.replace(/_/g, " ")}
                        </p>
                        <img
                          src={value}
                          alt="Signature"
                          className="max-w-[200px] max-h-[100px] border border-gray-200 rounded"
                        />
                      </div>
                    );
                  }
                  
                  // Skip null/undefined values
                  if (!value) return null;
                  
                  // Format field name
                  const fieldName = key.replace(/_/g, " ");
                  
                  // Format value
                  let displayValue = value;
                  if (key.includes('date') || key.includes('at')) {
                    try {
                      displayValue = new Date(value).toLocaleString("en-US", {
                        timeZone: "America/Montreal",
                        dateStyle: "medium",
                        timeStyle: "short",
                      });
                    } catch (e) {
                      displayValue = value;
                    }
                  }
                  
                  return (
                    <div key={key} className="mb-2">
                      <p className="text-xs font-semibold text-gray-600 capitalize">
                        {fieldName}
                      </p>
                      <p className="text-sm text-gray-700 break-words">
                        {typeof displayValue === 'boolean' ? (displayValue ? 'Yes' : 'No') : String(displayValue)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!selectedReminders}
        onClose={() => setSelectedReminders(null)}
        title="Reminders"
      >
        {selectedReminders && selectedReminders.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedReminders.map((reminder, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="mb-2">
                  {/* <p className="text-xs font-semibold text-gray-600">
                    ID
                  </p>
                  <p className="text-sm text-gray-700">
                    {reminder.id}
                  </p> */}
                </div>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Type
                  </p>
                  <p className="text-sm text-gray-700 capitalize">
                    {reminder.type?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Status
                  </p>
                  <p className="text-sm text-gray-700 capitalize">
                    {reminder.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Scheduled At
                  </p>
                  <p className="text-sm text-gray-700">
                    {new Date(reminder.scheduled_at).toLocaleString("en-US", {
                      timeZone: "America/Montreal",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">
            No reminders found
          </p>
        )}
      </Modal>
    </div>
  );
}
