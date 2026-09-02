// "use client";

// import { useParams, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import api from "../../../../../../lib/api.js";
// import { useMemo, useState } from "react";
// import CompletedFormViewer from "../../../forms/completedformviwer.jsx";

// const BUSINESS_TIMEZONE = "America/Montreal";

// const formatDate = (value) => {
//   if (!value) return "-";

//   try {
//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "-";

//     return date.toLocaleString("en-US", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     });
//   } catch {
//     return "-";
//   }
// };

// function SkeletonLoader() {
//   return (
//     <div className="space-y-6">
//       <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//         <div className="space-y-4">
//           <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
//           <div className="h-4 w-72 animate-pulse rounded bg-gray-150" />
//         </div>
//       </div>

//       <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//         <div className="space-y-4">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-12 animate-pulse rounded bg-gray-100"
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ErrorState({ error, onRetry }) {
//   return (
//     <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
//       <div className="mb-3 text-4xl">⚠️</div>

//       <h3 className="mb-2 text-lg font-semibold text-red-900">
//         Failed to Load
//       </h3>

//       <p className="mb-4 text-red-700">
//         {error?.message || "An error occurred."}
//       </p>

//       <button
//         onClick={onRetry}
//         className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
//       >
//         Try Again
//       </button>
//     </div>
//   );
// }

// function EmptyState() {
//   return (
//     <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
//       <div className="mb-3 text-4xl">📋</div>

//       <h3 className="mb-1 text-lg font-semibold text-gray-900">
//         No Forms
//       </h3>

//       <p className="text-gray-600">
//         This customer has not completed any forms yet.
//       </p>
//     </div>
//   );
// }

// export default function CustomerFormsPage() {
//   const params = useParams();
//   const router = useRouter();

//   const customerId = params.customerId;

//   const [selectedFormId, setSelectedFormId] =
//     useState(null);

//   const [viewingFormDetails, setViewingFormDetails] =
//     useState(false);

//   const {
//     data: analyticsData,
//     isLoading: customerLoading,
//   } = useQuery({
//     queryKey: ["customer-analytics", customerId],

//     queryFn: async () => {
//       const res = await api.get(
//         "/customers/analytics"
//       );

//       return res.data;
//     },

//     enabled: !!customerId,
//   });

//   const customer = useMemo(() => {
//     if (!analyticsData) return null;

//     const numericCustomerId = Number(customerId);

//     const found = Array.isArray(analyticsData)
//       ? analyticsData.find(
//           (c) => Number(c.id) === numericCustomerId
//         )
//       : Number(analyticsData.id) ===
//           numericCustomerId
//         ? analyticsData
//         : null;

//     return found;
//   }, [analyticsData, customerId]);

//   const {
//     data: forms = [],
//     isLoading: formsLoading,
//     error: formsError,
//     refetch: refetchForms,
//   } = useQuery({
//     queryKey: ["customer-forms", customerId],

//     queryFn: async () => {
//       const res = await api.get(
//         `/forms/customers/${customerId}/forms`
//       );

//       return Array.isArray(res.data)
//         ? res.data
//         : [];
//     },

//     enabled: !!customerId,
//   });

//   const handleViewForm = (formId) => {
//     setSelectedFormId(formId);
//     setViewingFormDetails(true);
//   };

//   const handleCloseFormDetails = () => {
//     setViewingFormDetails(false);
//     setSelectedFormId(null);
//   };

//   const handleDeleteForm = async (formId) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this form?"
//       )
//     ) {
//       return;
//     }

//     try {
//       await api.delete(
//         `/forms/completed-forms/${formId}`
//       );

//       refetchForms();

//       if (selectedFormId === formId) {
//         handleCloseFormDetails();
//       }
//     } catch (error) {
//       console.error(
//         "Failed to delete form:",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to delete form. Please try again."
//       );
//     }
//   };

//   if (viewingFormDetails && selectedFormId) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleCloseFormDetails}
//             className="rounded-lg p-2 transition-colors hover:bg-gray-100"
//             title="Go back to forms list"
//           >
//             <svg
//               className="h-5 w-5 text-gray-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>

//           <div>
//             <h1 className="font-[var(--font-heading)] text-2xl font-bold">
//               Form Details
//             </h1>

//             <p className="mt-1 text-sm text-gray-500">
//               Completed form for{" "}
//               {customer?.name || "Customer"}
//             </p>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//           <CompletedFormViewer
//             completedFormId={selectedFormId}
//             expectedCustomerId={customerId}
//           />
//         </div>
//       </div>
//     );
//   }

//   const isLoading =
//     customerLoading || formsLoading;

//   if (isLoading) {
//     return <SkeletonLoader />;
//   }

//   if (formsError) {
//     return (
//       <ErrorState
//         error={formsError}
//         onRetry={() => refetchForms()}
//       />
//     );
//   }

//   if (!customer) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => router.back()}
//             className="rounded-lg p-2 transition-colors hover:bg-gray-100"
//             title="Go back"
//           >
//             <svg
//               className="h-5 w-5 text-gray-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>

//           <h1 className="font-[var(--font-heading)] text-2xl font-bold">
//             Customer Forms
//           </h1>
//         </div>

//         <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
//           <div className="mb-3 text-4xl">⚠️</div>

//           <h3 className="mb-1 text-lg font-semibold text-gray-900">
//             Customer Not Found
//           </h3>

//           <p className="text-gray-600">
//             The customer could not be found in the
//             system.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 animate-fadeIn">
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => router.back()}
//           className="rounded-lg p-2 transition-colors hover:bg-gray-100"
//           title="Go back to customers"
//         >
//           <svg
//             className="h-5 w-5 text-gray-600"
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
//           <h1 className="font-[var(--font-heading)] text-2xl font-bold">
//             Customer Forms
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Forms completed by{" "}
//             {customer.name || "Customer"}
//           </p>
//         </div>
//       </div>

//       <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//         <div className="flex items-center gap-4">
//           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
//             {(customer.name?.[0] || "?").toUpperCase()}
//           </div>

//           <div className="min-w-0 flex-1">
//             <h2 className="text-lg font-bold text-gray-900">
//               {customer.name || "Unknown"}
//             </h2>

//             <p className="text-sm text-gray-600">
//               {customer.email || "-"}
//             </p>

//             <p className="text-sm text-gray-600">
//               {customer.phone || "-"}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
//         <div className="border-b border-gray-100 p-6">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Completed Forms{" "}
//             {forms.length > 0 &&
//               `(${forms.length})`}
//           </h3>
//         </div>

//         {forms.length === 0 ? (
//           <div className="p-6">
//             <EmptyState />
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50">
//                   <th className="px-6 py-3 text-left font-semibold text-gray-600">
//                     Form Name
//                   </th>

//                   <th className="px-6 py-3 text-left font-semibold text-gray-600">
//                     Status
//                   </th>

//                   <th className="px-6 py-3 text-left font-semibold text-gray-600">
//                     Submitted
//                   </th>

//                   <th className="px-6 py-3 text-right font-semibold text-gray-600">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {forms.map((form) => (
//                   <tr
//                     key={form.id}
//                     className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/60"
//                   >
//                     <td className="px-6 py-4">
//                       <p className="font-medium text-gray-900">
//                         {form.form_name ||
//                           `Form #${form.id}`}
//                       </p>
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`inline-block h-2 w-2 rounded-full ${
//                             form.status ===
//                             "completed"
//                               ? "bg-green-500"
//                               : form.status ===
//                                   "in_progress"
//                                 ? "bg-yellow-500"
//                                 : "bg-gray-500"
//                           }`}
//                         />

//                         <span className="capitalize text-gray-700">
//                           {form.status ||
//                             "unknown"}
//                         </span>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 text-gray-600">
//                       {formatDate(
//                         form.completed_at ||
//                           form.created_at
//                       )}
//                     </td>

//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleViewForm(form.id)
//                           }
//                           className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
//                         >
//                           View
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDeleteForm(
//                               form.id
//                             )
//                           }
//                           className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../../lib/api.js";
import { useMemo, useState } from "react";
import CompletedFormViewer from "../../../forms/completedformviwer.jsx";

const BUSINESS_TIMEZONE = "America/Montreal";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
};

function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-gray-150" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-3 text-4xl">⚠️</div>

      <h3 className="mb-2 text-lg font-semibold text-red-900">
        Failed to Load
      </h3>

      <p className="mb-4 text-red-700">
        {error?.message || "An error occurred."}
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
      <div className="mb-3 text-4xl">📋</div>

      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        No Forms
      </h3>

      <p className="text-gray-600">
        This customer has not completed any forms yet.
      </p>
    </div>
  );
}

export default function CustomerFormsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params.customerId;

  const [selectedFormId, setSelectedFormId] =
    useState(null);

  const [viewingFormDetails, setViewingFormDetails] =
    useState(false);

  const {
    data: analyticsData,
    isLoading: customerLoading,
  } = useQuery({
    queryKey: ["customer-analytics", customerId],

    queryFn: async () => {
      const res = await api.get(
        "/customers/analytics"
      );

      return res.data;
    },

    enabled: !!customerId,
  });

  const customer = useMemo(() => {
    if (!analyticsData) return null;

    const numericCustomerId = Number(customerId);

    const found = Array.isArray(analyticsData)
      ? analyticsData.find(
          (c) => Number(c.id) === numericCustomerId
        )
      : Number(analyticsData.id) ===
          numericCustomerId
        ? analyticsData
        : null;

    return found;
  }, [analyticsData, customerId]);

  const {
    data: forms = [],
    isLoading: formsLoading,
    error: formsError,
    refetch: refetchForms,
  } = useQuery({
    queryKey: ["customer-forms", customerId],

    queryFn: async () => {
      const res = await api.get(
        `/forms/customers/${customerId}/forms`
      );

      const responseData = res.data;

      if (Array.isArray(responseData)) {
        return responseData;
      }

      if (Array.isArray(responseData?.forms)) {
        return responseData.forms;
      }

      if (Array.isArray(responseData?.data)) {
        return responseData.data;
      }

      if (Array.isArray(responseData?.completedForms)) {
        return responseData.completedForms;
      }

      return [];
    },

    enabled: !!customerId,
  });

  const handleViewForm = (formId) => {
    setSelectedFormId(formId);
    setViewingFormDetails(true);
  };

  const handleCloseFormDetails = () => {
    setViewingFormDetails(false);
    setSelectedFormId(null);
  };

  const handleDeleteForm = async (formId) => {
    if (
      !confirm(
        "Are you sure you want to delete this form?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/forms/completed-forms/${formId}`
      );

      await refetchForms();

      if (selectedFormId === formId) {
        handleCloseFormDetails();
      }
    } catch (error) {
      console.error(
        "Failed to delete form:",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to delete form. Please try again."
      );
    }
  };

  if (viewingFormDetails && selectedFormId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseFormDetails}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            title="Go back to forms list"
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
              Form Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Completed form for{" "}
              {customer?.name || "Customer"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <CompletedFormViewer
            completedFormId={selectedFormId}
            expectedCustomerId={customerId}
          />
        </div>
      </div>
    );
  }

  const isLoading =
    customerLoading || formsLoading;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (formsError) {
    return (
      <ErrorState
        error={formsError}
        onRetry={() => refetchForms()}
      />
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            title="Go back"
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

          <h1 className="font-[var(--font-heading)] text-2xl font-bold">
            Customer Forms
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
          <div className="mb-3 text-4xl">⚠️</div>

          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Customer Not Found
          </h3>

          <p className="text-gray-600">
            The customer could not be found in the
            system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
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
            Customer Forms
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Forms completed by{" "}
            {customer.name || "Customer"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
            {(customer.name?.[0] || "?").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {customer.name || "Unknown"}
            </h2>

            <p className="text-sm text-gray-600">
              {customer.email || "-"}
            </p>

            <p className="text-sm text-gray-600">
              {customer.phone || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Completed Forms{" "}
            {forms.length > 0 &&
              `(${forms.length})`}
          </h3>
        </div>

        {forms.length === 0 ? (
          <div className="p-6">
            <EmptyState />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Form Name
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Submitted
                  </th>

                  <th className="px-6 py-3 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {form.form_name ||
                          `Form #${form.id}`}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            form.status ===
                            "completed"
                              ? "bg-green-500"
                              : form.status ===
                                  "in_progress"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          }`}
                        />

                        <span className="capitalize text-gray-700">
                          {form.status ||
                            "unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(
                        form.completed_at ||
                          form.created_at
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewForm(form.id)
                          }
                          className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteForm(
                              form.id
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
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
        )}
      </div>
    </div>
  );
}