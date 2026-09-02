// "use client";
// import { useQuery } from "@tanstack/react-query";
// import api from "../../../../../lib/api.js";
// import { useMemo, useState } from "react";
// import CustomerFormsManager from "../../forms/CustomerFormsManager.jsx";

// const getCustomerAnalytics = async (id) => {
//   const res = await api.get("/customers/analytics");
//   return res.data;
// };

// function SkeletonLoader() {
//   return (
//     <div className="space-y-6">
//       {/* Header Skeleton */}
//       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
//         <div className="space-y-4">
//           <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
//           <div className="h-4 w-72 bg-gray-150 rounded animate-pulse" />
//           <div className="space-y-3 mt-6">
//             <div className="h-5 w-64 bg-gray-150 rounded animate-pulse" />
//             <div className="h-5 w-56 bg-gray-150 rounded animate-pulse" />
//             <div className="h-5 w-60 bg-gray-150 rounded animate-pulse" />
//           </div>
//         </div>
//       </div>

//       {/* Stats Skeleton */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
//             <div className="h-4 w-24 bg-gray-150 rounded animate-pulse mb-4" />
//             <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ErrorState({ error, onRetry }) {
//   return (
//     <div className="bg-white rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
//       <div className="text-4xl mb-3">⚠️</div>
//       <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Customer</h3>
//       <p className="text-red-700 mb-4">{error?.message || "An error occurred while loading customer details."}</p>
//       <button
//         onClick={onRetry}
//         className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
//       >
//         Try Again
//       </button>
//     </div>
//   );
// }

// function EmptyState() {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
//       <div className="text-4xl mb-3">📭</div>
//       <h3 className="text-lg font-semibold text-gray-900 mb-1">No Customer Data</h3>
//       <p className="text-gray-600">Could not find the customer in the system.</p>
//     </div>
//   );
// }

// export default function CustomerDetails({ customerId, onBack }) {
//   const [formsModalOpen, setFormsModalOpen] = useState(false);
//   const { data: analyticsData, isLoading, error, refetch } = useQuery({
//     queryKey: ["customer-analytics", customerId],
//     queryFn: () => getCustomerAnalytics(customerId),
//     enabled: !!customerId,
//   });

//   const customer = useMemo(() => {
//     if (!analyticsData) return null;
//     const found = Array.isArray(analyticsData)
//       ? analyticsData.find((c) => c.id === parseInt(customerId))
//       : analyticsData.id === parseInt(customerId)
//         ? analyticsData
//         : null;
//     return found;
//   }, [analyticsData, customerId]);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount || 0);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "-";
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "-";
//     }
//   };

//   if (isLoading) {
//     return <SkeletonLoader />;
//   }

//   if (error) {
//     return <ErrorState error={error} onRetry={() => refetch()} />;
//   }

//   if (!customer) {
//     return <EmptyState />;
//   }

//   const stats = [
//     {
//       label: "Total Bookings",
//       value: customer.total_bookings || 0,
//       icon: "📅",
//       color: "from-blue-500 to-blue-600",
//       suffix: "",
//     },
//     {
//       label: "Total Spent",
//       value: formatCurrency(customer.total_spent),
//       icon: "💰",
//       color: "from-emerald-500 to-emerald-600",
//       suffix: "",
//     },
//     {
//       label: "Favorite Service",
//       value: customer.favorite_service || "-",
//       icon: "⭐",
//       color: "from-purple-500 to-purple-600",
//       suffix: "",
//       isText: true,
//     },
//     {
//       label: "Last Booking",
//       value: formatDate(customer.last_booking),
//       icon: "📍",
//       color: "from-primary to-primary-dark",
//       suffix: "",
//       isText: true,
//     },
//   ];

//   return (
//     <div className="space-y-6 animate-fadeIn">
//       {/* Back Button */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={onBack}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           title="Go back to customers"
//         >
//           <svg
//             className="w-5 h-5 text-gray-600"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold font-[var(--font-heading)]">Customer Profile</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             View customer details and analytics
//           </p>
//         </div>
//       </div>

//       {/* Customer Card */}
//       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
//         <div className="flex items-start gap-6">
//           {/* Avatar */}
//           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shrink-0">
//             {(customer.name?.[0] || "?").toUpperCase()}
//           </div>

//           {/* Info */}
//           <div className="flex-1 min-w-0">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               {customer.name || "Unknown Customer"}
//             </h2>

//             <div className="space-y-3">
//               {/* Email */}
//               <div className="flex items-start gap-3 text-sm">
//                 <span className="text-lg shrink-0">✉️</span>
//                 <div className="min-w-0">
//                   <p className="text-gray-600">Email</p>
//                   <p className="text-gray-900 font-medium break-all">
//                     {customer.email || "-"}
//                   </p>
//                 </div>
//               </div>

//               {/* Phone */}
//               <div className="flex items-start gap-3 text-sm">
//                 <span className="text-lg shrink-0">📱</span>
//                 <div className="min-w-0">
//                   <p className="text-gray-600">Phone</p>
//                   <p className="text-gray-900 font-medium">
//                     {customer.phone || "-"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Statistics Section */}
//       <div>
//         <div className="mb-4 flex items-center justify-between gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
//           <button
//             type="button"
//             onClick={() => setFormsModalOpen(true)}
//             className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
//           >
//             View All Forms
//           </button>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map((stat, index) => (
//             <div
//               key={stat.label}
//               className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
//               style={{
//                 animationDelay: `${index * 0.05}s`,
//               }}
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div
//                   className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl`}
//                 >
//                   {stat.icon}
//                 </div>
//               </div>

//               <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
//               <p
//                 className={`text-2xl font-bold font-[var(--font-heading)] ${
//                   stat.isText ? "text-base" : ""
//                 }`}
//               >
//                 {stat.value}
//                 {stat.suffix && <span className="text-sm ml-1">{stat.suffix}</span>}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {formsModalOpen && (
//         <CustomerFormsManager
//           customer={customer}
//           booking={null}
//           defaultTab="list"
//           onClose={() => setFormsModalOpen(false)}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../../../../../lib/api.js";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const getCustomerAnalytics = async (id) => {
  const res = await api.get("/customers/analytics");
  return res.data;
};

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-gray-150" />

          <div className="mt-6 space-y-3">
            <div className="h-5 w-64 animate-pulse rounded bg-gray-150" />
            <div className="h-5 w-56 animate-pulse rounded bg-gray-150" />
            <div className="h-5 w-60 animate-pulse rounded bg-gray-150" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-150" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-3 text-4xl">⚠️</div>

      <h3 className="mb-2 text-lg font-semibold text-red-900">
        Failed to Load Customer
      </h3>

      <p className="mb-4 text-red-700">
        {error?.message ||
          "An error occurred while loading customer details."}
      </p>

      <button
        onClick={onRetry}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
      <div className="mb-3 text-4xl">📭</div>

      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        No Customer Data
      </h3>

      <p className="text-gray-600">
        Could not find the customer in the system.
      </p>
    </div>
  );
}

export default function CustomerDetails({
  customerId,
  onBack,
}) {
  const router = useRouter();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer-analytics", customerId],
    queryFn: () => getCustomerAnalytics(customerId),
    enabled: !!customerId,
  });

  const customer = useMemo(() => {
    if (!analyticsData) return null;

    const numericCustomerId = Number(customerId);

    const found = Array.isArray(analyticsData)
      ? analyticsData.find(
          (c) => Number(c.id) === numericCustomerId
        )
      : Number(analyticsData.id) === numericCustomerId
        ? analyticsData
        : null;

    return found;
  }, [analyticsData, customerId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) return "-";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  if (!customer) {
    return <EmptyState />;
  }

  const stats = [
    {
      label: "Total Bookings",
      value: customer.total_bookings || 0,
      icon: "📅",
      color: "from-blue-500 to-blue-600",
      suffix: "",
    },
    {
      label: "Total Spent",
      value: formatCurrency(customer.total_spent),
      icon: "💰",
      color: "from-emerald-500 to-emerald-600",
      suffix: "",
    },
    {
      label: "Favorite Service",
      value: customer.favorite_service || "-",
      icon: "⭐",
      color: "from-purple-500 to-purple-600",
      suffix: "",
      isText: true,
    },
    {
      label: "Last Booking",
      value: formatDate(customer.last_booking),
      icon: "📍",
      color: "from-primary to-primary-dark",
      suffix: "",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          title="Go back to customers"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">
            Customer Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View customer details and analytics
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
            {(customer.name?.[0] || "?").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {customer.name || "Unknown Customer"}
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-lg">✉️</span>

                <div className="min-w-0">
                  <p className="text-gray-600">Email</p>

                  <p className="break-all font-medium text-gray-900">
                    {customer.email || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-lg">📱</span>

                <div className="min-w-0">
                  <p className="text-gray-600">Phone</p>

                  <p className="font-medium text-gray-900">
                    {customer.phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Analytics
          </h3>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/customers/${customerId}/forms`
              )
            }
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            View All Forms
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-xl text-white`}
                >
                  {stat.icon}
                </div>
              </div>

              <p className="mb-2 text-sm text-gray-600">
                {stat.label}
              </p>

              <p
                className={`font-[var(--font-heading)] text-2xl font-bold ${
                  stat.isText ? "text-base" : ""
                }`}
              >
                {stat.value}

                {stat.suffix && (
                  <span className="ml-1 text-sm">
                    {stat.suffix}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}