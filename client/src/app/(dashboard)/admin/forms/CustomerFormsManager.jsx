
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import SignatureCanvas from "react-signature-canvas";
// import api from "../../../../lib/api.js";
// import {
//   getSignatureFromRef,
//   clearSignatureRef,
//   isSignaturePadEmpty,
// } from "../../../../lib/signatureUtils";

// const EMPTY_ANSWERS = {};

// function isValidId(value) {
//   return value !== null && value !== undefined && String(value).trim() !== "";
// }

// function getDirectCustomerId(customer, booking) {
//   if (isValidId(customer?.id)) return customer.id;
//   if (isValidId(booking?.customer_id)) return booking.customer_id;
//   if (isValidId(booking?.customer?.id)) return booking.customer.id;
//   return null;
// }

// function normalizeBoolean(value) {
//   if (value === true || value === "true") return true;
//   if (value === false || value === "false") return false;
//   return null;
// }

// function getCustomerFromCompletedForm(form, fallbackCustomer) {
//   return form?.customer || fallbackCustomer || {};
// }

// function getAppointmentFromCompletedForm(form, booking) {
//   return form?.appointment || booking || null;
// }

// function getSignatureValue(form) {
//   return (
//     form?.signature ||
//     form?.signature_data ||
//     form?.signature_url ||
//     form?.signature_image ||
//     form?.customer_signature ||
//     form?.signature?.data ||
//     form?.signature?.url ||
//     null
//   );
// }

// export default function CustomerFormsManager({
//   customer,
//   booking,
//   onClose,
//   defaultTab = "list",
// }) {
//   const [customerId, setCustomerId] = useState(() =>
//     getDirectCustomerId(customer, booking)
//   );
//   const [tab, setTab] = useState(defaultTab || "list");
//   const [templates, setTemplates] = useState([]);
//   const [templateLoading, setTemplateLoading] = useState(true);
//   const [completedForms, setCompletedForms] = useState([]);
//   const [formsLoading, setFormsLoading] = useState(true);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [selectedCompletedFormId, setSelectedCompletedFormId] =
//     useState(null);
//   const [selectedCompletedForm, setSelectedCompletedForm] = useState(null);
//   const [completedFormLoading, setCompletedFormLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [draftFormId, setDraftFormId] = useState(null);

//   const resolveCustomerId = async () => {
//     const directCustomerId = getDirectCustomerId(customer, booking);

//     if (directCustomerId) {
//       setCustomerId(directCustomerId);
//       return directCustomerId;
//     }

//     const email = customer?.email || booking?.customer_email;
//     const phone = customer?.phone || booking?.customer_phone;

//     if (!email && !phone) {
//       setCustomerId(null);
//       return null;
//     }

//     const res = await api.get("/customers");
//     const customers = Array.isArray(res.data) ? res.data : [];

//     const matchedCustomer = customers.find((item) => {
//       const emailMatches =
//         email && item?.email && String(item.email) === String(email);
//       const phoneMatches =
//         phone && item?.phone && String(item.phone) === String(phone);

//       return emailMatches || phoneMatches;
//     });

//     const resolvedId = matchedCustomer?.id ?? null;

//     setCustomerId(resolvedId);

//     return resolvedId;
//   };

//   const loadTemplates = async () => {
//     try {
//       setTemplateLoading(true);

//       const res = await api.get("/forms/templates/active");

//       setTemplates(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Failed to load active templates", error);
//       setTemplates([]);
//     } finally {
//       setTemplateLoading(false);
//     }
//   };

//   const loadCustomerForms = async () => {
//     if (!customerId) {
//       setCompletedForms([]);
//       setFormsLoading(false);
//       return;
//     }

//     try {
//       setFormsLoading(true);

//       const res = await api.get(`/forms/customers/${customerId}/forms`);

//       setCompletedForms(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Failed to load customer forms", error);
//       setCompletedForms([]);
//     } finally {
//       setFormsLoading(false);
//     }
//     console.log("CUSTOMER FORMS DEBUG", {
//   customerProp: customer,
//   bookingProp: booking,
//   resolvedCustomerId: customerId,
// });
//   };

//   useEffect(() => {
//     loadTemplates();
//     resolveCustomerId();
//   }, [customer, booking]);

//   useEffect(() => {
//     loadCustomerForms();
//   }, [customerId]);

//   const selectedCustomerName =
//     customer?.name || booking?.customer_name || "Customer";

//   const selectedCustomerEmail =
//     customer?.email || booking?.customer_email || "-";

//   const selectedCustomerPhone =
//     customer?.phone || booking?.customer_phone || "-";

//   const buildQuestionAnswerMap = (questions) => {
//     const map = {};

//     (questions || []).forEach((question) => {
//       map[question.id] = {
//         completed_form_question_id: question.id,
//         answer_text: question.answer?.answer_text ?? null,
//         selected_option_id: question.answer?.selected_option_id ?? null,
//         boolean_value: normalizeBoolean(
//           question.answer?.boolean_value
//         ),
//       };
//     });

//     return map;
//   };

//   const [answers, setAnswers] = useState(EMPTY_ANSWERS);
//   const signaturePadRef = useRef(null);

//   const clearSignature = () => {
//     clearSignatureRef(signaturePadRef);
//   };

//   const getSignatureData = () => {
//     if (isSignaturePadEmpty(signaturePadRef)) return null;

//     return getSignatureFromRef(signaturePadRef);
//   };

//   const loadCompletedFormDetails = async (formId) => {
//     if (!formId) return;

//     try {
//       setCompletedFormLoading(true);

//       const res = await api.get(
//         `/forms/completed-forms/${formId}/with-details`
//       );

//       setSelectedCompletedForm(res.data);
//       setSelectedCompletedFormId(formId);
//     } catch (error) {
//       console.error("Failed to load completed form details", error);
//       setSelectedCompletedForm(null);
//     } finally {
//       setCompletedFormLoading(false);
//     }
//   };

//   const openTemplateForm = async (templateId) => {
//     try {
//       setSaving(true);

//       const resolvedCustomerId = await resolveCustomerId();

//       if (!resolvedCustomerId) {
//         alert(
//           "Cannot create this form because the selected booking does not contain a valid customer ID."
//         );
//         return;
//       }

//       const templateRes = await api.get(
//         `/forms/templates/${templateId}/with-details`
//       );

//       const templateDetails = templateRes.data || {};

//       const created = await api.post("/forms/completed-forms", {
//         customer_id: resolvedCustomerId,
//         appointment_id: booking?.id || null,
//         form_template_id: templateId,
//       });

//       const formId = created?.data?.id;

//       const detailsRes = await api.get(
//         `/forms/completed-forms/${formId}/with-details`
//       );

//       const details = detailsRes.data;
//       const completedQuestions = details?.questions || [];

//       setDraftFormId(formId);

//       setSelectedTemplate({
//         id: templateId,
//         name:
//           details?.form_name ||
//           templateDetails?.name ||
//           "Form",
//         questions: completedQuestions,
//       });

//       setAnswers(buildQuestionAnswerMap(completedQuestions));

//       clearSignature();

//       setTab("create");
//     } catch (error) {
//       console.error("Failed to initialize form", error);

//       alert(
//         error?.response?.data?.error ||
//           "Failed to initialize form"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateAnswer = (questionId, value, type) => {
//     setAnswers((current) => ({
//       ...current,
//       [questionId]: {
//         ...(current[questionId] || {
//           completed_form_question_id: questionId,
//         }),
//         completed_form_question_id: questionId,
//         answer_text: type === "text" ? value : null,
//         selected_option_id:
//           type === "multiple_choice" ? value : null,
//         boolean_value:
//           type === "boolean" ? value : null,
//       },
//     }));
//   };

//   const submitCurrentForm = async (saveAsDraft = false) => {
//     if (!draftFormId || !customerId) return;

//     const payload =
//       selectedCompletedForm?.questions ||
//       selectedTemplate?.questions ||
//       [];

//     const builtAnswers = (payload || [])
//       .map((question) => {
//         const answer = answers[question.id] || {};

//         switch (question.question_type) {
//           case "text":
//             return {
//               completed_form_question_id: question.id,
//               answer_text: answer.answer_text ?? "",
//             };

//           case "yes_no":
//           case "agreement":
//             return {
//               completed_form_question_id: question.id,
//               boolean_value: normalizeBoolean(
//                 answer.boolean_value
//               ),
//             };

//           case "multiple_choice":
//             return {
//               completed_form_question_id: question.id,
//               selected_option_id:
//                 answer.selected_option_id ?? null,
//             };

//           default:
//             return {
//               completed_form_question_id: question.id,
//               answer_text: answer.answer_text ?? "",
//             };
//         }
//       })
//       .filter((answer) => {
//         if (
//           answer.answer_text !== undefined &&
//           answer.answer_text !== null &&
//           answer.answer_text !== ""
//         ) {
//           return true;
//         }

//         if (
//           answer.boolean_value !== undefined &&
//           answer.boolean_value !== null
//         ) {
//           return true;
//         }

//         if (
//           answer.selected_option_id !== undefined &&
//           answer.selected_option_id !== null
//         ) {
//           return true;
//         }

//         return false;
//       });

//     const signaturePayload = getSignatureData();

//     if (!saveAsDraft && !signaturePayload) {
//       alert(
//         "Please add a customer signature before submitting the form."
//       );
//       return;
//     }

//     try {
//       setSaving(true);

//       const endpoint = saveAsDraft
//         ? "/forms/save-draft"
//         : "/forms/submit";

//       await api.post(endpoint, {
//         completed_form_id: draftFormId,
//         customer_id: customerId,
//         appointment_id: booking?.id || null,
//         form_template_id: selectedTemplate?.id || null,
//         answers: builtAnswers,
//         signature: signaturePayload,
//       });

//       await loadCustomerForms();

//       setTab("list");
//       setDraftFormId(null);
//       setSelectedTemplate(null);
//       setAnswers(EMPTY_ANSWERS);

//       clearSignature();

//       onClose?.();
//     } catch (error) {
//       console.error("Failed to save form", error);

//       alert(
//         error?.response?.data?.error ||
//           error?.response?.data?.message ||
//           "Failed to save form"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const renderQuestionEditor = (question) => {
//     const questionAnswer = answers[question.id] || {};
//     const type = question.question_type;

//     if (type === "text") {
//       return (
//         <input
//           value={questionAnswer.answer_text ?? ""}
//           onChange={(event) =>
//             updateAnswer(
//               question.id,
//               event.target.value,
//               "text"
//             )
//           }
//           className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary"
//           placeholder="Your response"
//         />
//       );
//     }

//     if (type === "yes_no") {
//       return (
//         <div className="mt-3 flex flex-wrap gap-3">
//           {[
//             { label: "Yes", value: true },
//             { label: "No", value: false },
//           ].map((option) => (
//             <button
//               key={option.label}
//               type="button"
//               onClick={() =>
//                 updateAnswer(
//                   question.id,
//                   option.value,
//                   "boolean"
//                 )
//               }
//               className={`rounded-xl border px-4 py-2 text-sm font-medium ${
//                 questionAnswer.boolean_value === option.value
//                   ? "border-primary bg-primary text-white"
//                   : "border-gray-200 bg-gray-50 text-gray-700"
//               }`}
//             >
//               {option.label}
//             </button>
//           ))}
//         </div>
//       );
//     }

//     if (type === "agreement") {
//       return (
//         <div className="mt-3 flex flex-wrap gap-3">
//           {[
//             { label: "Agree", value: true },
//             { label: "Disagree", value: false },
//           ].map((option) => (
//             <button
//               key={option.label}
//               type="button"
//               onClick={() =>
//                 updateAnswer(
//                   question.id,
//                   option.value,
//                   "boolean"
//                 )
//               }
//               className={`rounded-xl border px-4 py-2 text-sm font-medium ${
//                 questionAnswer.boolean_value === option.value
//                   ? "border-primary bg-primary text-white"
//                   : "border-gray-200 bg-gray-50 text-gray-700"
//               }`}
//             >
//               {option.label}
//             </button>
//           ))}
//         </div>
//       );
//     }

//     return (
//       <div className="mt-3 space-y-2">
//         {(question.options || []).map((option) => (
//           <label
//             key={option.id}
//             className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
//               questionAnswer.selected_option_id === option.id
//                 ? "border-primary bg-primary/5 text-primary"
//                 : "border-gray-200 bg-gray-50 text-gray-700"
//             }`}
//           >
//             <input
//               type="radio"
//               name={`question-${question.id}`}
//               checked={
//                 questionAnswer.selected_option_id === option.id
//               }
//               onChange={() =>
//                 updateAnswer(
//                   question.id,
//                   option.id,
//                   "multiple_choice"
//                 )
//               }
//               className="h-4 w-4 text-primary"
//             />
//             <span>{option.option_label}</span>
//           </label>
//         ))}
//       </div>
//     );
//   };

//   const selectedTemplateQuestions = useMemo(() => {
//     if (!selectedTemplate) return [];

//     if (selectedTemplate.questions) {
//       return selectedTemplate.questions;
//     }

//     return [];
//   }, [selectedTemplate]);

//   const detailsCustomer = getCustomerFromCompletedForm(
//     selectedCompletedForm,
//     customer
//   );

//   const detailsCustomerName =
//     detailsCustomer?.name ||
//     selectedCustomerName ||
//     "Customer";

//   const detailsCustomerEmail =
//     detailsCustomer?.email ||
//     selectedCustomerEmail ||
//     "-";

//   const detailsCustomerPhone =
//     detailsCustomer?.phone ||
//     selectedCustomerPhone ||
//     "-";

//   const detailsAppointment = getAppointmentFromCompletedForm(
//     selectedCompletedForm,
//     booking
//   );

//   const appointmentId =
//     detailsAppointment?.id ||
//     selectedCompletedForm?.appointment_id ||
//     null;

//   const appointmentDate =
//     detailsAppointment?.appointment_date ||
//     detailsAppointment?.date ||
//     detailsAppointment?.scheduled_date ||
//     detailsAppointment?.start_time ||
//     detailsAppointment?.start_at ||
//     null;

//   const appointmentTime =
//     detailsAppointment?.appointment_time ||
//     detailsAppointment?.time ||
//     detailsAppointment?.scheduled_time ||
//     null;

//   const appointmentStatus =
//     detailsAppointment?.status ||
//     detailsAppointment?.appointment_status ||
//     null;

//   const appointmentServices =
//     detailsAppointment?.services ||
//     detailsAppointment?.appointment_services ||
//     detailsAppointment?.booking_services ||
//     [];

//   const appointmentServiceNames = Array.isArray(
//     appointmentServices
//   )
//     ? appointmentServices
//         .map(
//           (service) =>
//             service?.name ||
//             service?.service_name ||
//             service?.title ||
//             service?.service?.name
//         )
//         .filter(Boolean)
//     : [];

//   const formTemplateName =
//     selectedCompletedForm?.form_template?.name ||
//     selectedCompletedForm?.template?.name ||
//     selectedCompletedForm?.form_template_name ||
//     selectedCompletedForm?.template_name ||
//     selectedCompletedForm?.form_name ||
//     "Form";

//   const formStatus =
//     selectedCompletedForm?.status ||
//     selectedCompletedForm?.form_status ||
//     "-";

//   const signatureValue = getSignatureValue(
//     selectedCompletedForm
//   );

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 md:p-6">
//       <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-6">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//               Customer forms
//             </p>

//             <h2 className="mt-1 text-xl font-bold text-gray-900">
//               {selectedCustomerName}
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
//           >
//             Close
//           </button>
//         </div>

//         <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 md:px-6">
//           <div className="flex flex-wrap gap-2">
//             {[
//               {
//                 key: "list",
//                 label: "View All Forms",
//               },
//               {
//                 key: "create",
//                 label: "Create Form",
//               },
//             ].map((item) => (
//               <button
//                 key={item.key}
//                 type="button"
//                 onClick={() => setTab(item.key)}
//                 className={`rounded-xl px-3 py-2 text-sm font-medium ${
//                   tab === item.key
//                     ? "bg-primary text-white"
//                     : "border border-gray-200 bg-white text-gray-700"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-6 p-4 md:p-6">
//           <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
//             <div className="grid gap-3 md:grid-cols-3">
//               <div>
//                 <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
//                   Name
//                 </p>

//                 <p className="mt-1 font-medium text-gray-900">
//                   {selectedCustomerName}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
//                   Email
//                 </p>

//                 <p className="mt-1 font-medium text-gray-900">
//                   {selectedCustomerEmail}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
//                   Phone
//                 </p>

//                 <p className="mt-1 font-medium text-gray-900">
//                   {selectedCustomerPhone}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {tab === "list" ? (
//             <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
//               <div className="rounded-2xl border border-gray-200 bg-white p-4">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Completed forms
//                 </h3>

//                 {formsLoading ? (
//                   <div className="mt-4 text-sm text-gray-500">
//                     Loading forms...
//                   </div>
//                 ) : completedForms.length === 0 ? (
//                   <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
//                     No completed forms found for this customer.
//                   </div>
//                 ) : (
//                   <div className="mt-4 space-y-3">
//                     {completedForms.map((form) => (
//                       <button
//                         key={form.id}
//                         type="button"
//                         onClick={() =>
//                           loadCompletedFormDetails(form.id)
//                         }
//                         className={`w-full rounded-2xl border p-3 text-left transition ${
//                           selectedCompletedFormId === form.id
//                             ? "border-primary bg-primary/5"
//                             : "border-gray-200 bg-white hover:border-primary/40"
//                         }`}
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {form.form_name ||
//                                 form.form_template_name ||
//                                 `Form #${form.id}`}
//                             </p>

//                             <p className="mt-1 text-xs text-gray-500">
//                               {form.status || "-"}
//                             </p>
//                           </div>

//                           <span className="text-xs text-gray-500">
//                             #{form.id}
//                           </span>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="rounded-2xl border border-gray-200 bg-white p-4">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Form details
//                 </h3>

//                 {completedFormLoading ? (
//                   <div className="mt-4 text-sm text-gray-500">
//                     Loading form details...
//                   </div>
//                 ) : !selectedCompletedForm ? (
//                   <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
//                     Select a completed form to view the historical
//                     answers.
//                   </div>
//                 ) : (
//                   <div className="mt-4 space-y-4">
//                     <div className="rounded-2xl bg-gray-50 p-4">
//                       <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
//                         Customer
//                       </p>

//                       <div className="mt-3 grid gap-3 md:grid-cols-3">
//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Name
//                           </p>

//                           <p className="mt-1 font-medium text-gray-900">
//                             {detailsCustomerName}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Email
//                           </p>

//                           <p className="mt-1 break-all font-medium text-gray-900">
//                             {detailsCustomerEmail}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Phone
//                           </p>

//                           <p className="mt-1 font-medium text-gray-900">
//                             {detailsCustomerPhone}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-2xl bg-gray-50 p-4">
//                       <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
//                         Form information
//                       </p>

//                       <div className="mt-3 grid gap-3 md:grid-cols-2">
//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Template
//                           </p>

//                           <p className="mt-1 font-semibold text-gray-900">
//                             {formTemplateName}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Status
//                           </p>

//                           <p className="mt-1 font-semibold capitalize text-gray-900">
//                             {formStatus}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-xs text-gray-400">
//                             Form ID
//                           </p>

//                           <p className="mt-1 font-medium text-gray-900">
//                             #{selectedCompletedForm.id}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="rounded-2xl bg-gray-50 p-4">
//                       <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
//                         Appointment
//                       </p>

//                       {!detailsAppointment && !appointmentId ? (
//                         <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
//                           No appointment information recorded.
//                         </div>
//                       ) : (
//                         <div className="mt-3 space-y-3">
//                           <div className="grid gap-3 md:grid-cols-2">
//                             <div>
//                               <p className="text-xs text-gray-400">
//                                 Appointment ID
//                               </p>

//                               <p className="mt-1 font-medium text-gray-900">
//                                 {appointmentId
//                                   ? `#${appointmentId}`
//                                   : "-"}
//                               </p>
//                             </div>

//                             {appointmentStatus && (
//                               <div>
//                                 <p className="text-xs text-gray-400">
//                                   Status
//                                 </p>

//                                 <p className="mt-1 font-medium capitalize text-gray-900">
//                                   {appointmentStatus}
//                                 </p>
//                               </div>
//                             )}

//                             {appointmentDate && (
//                               <div>
//                                 <p className="text-xs text-gray-400">
//                                   Date
//                                 </p>

//                                 <p className="mt-1 font-medium text-gray-900">
//                                   {appointmentDate}
//                                 </p>
//                               </div>
//                             )}

//                             {appointmentTime && (
//                               <div>
//                                 <p className="text-xs text-gray-400">
//                                   Time
//                                 </p>

//                                 <p className="mt-1 font-medium text-gray-900">
//                                   {appointmentTime}
//                                 </p>
//                               </div>
//                             )}
//                           </div>

//                           {appointmentServiceNames.length > 0 && (
//                             <div>
//                               <p className="text-xs text-gray-400">
//                                 Services booked
//                               </p>

//                               <div className="mt-2 flex flex-wrap gap-2">
//                                 {appointmentServiceNames.map(
//                                   (serviceName, index) => (
//                                     <span
//                                       key={`${serviceName}-${index}`}
//                                       className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200"
//                                     >
//                                       {serviceName}
//                                     </span>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     <div className="rounded-2xl border border-gray-200 p-4">
//                       <div className="flex items-center justify-between gap-3">
//                         <div>
//                           <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
//                             Customer Signature
//                           </p>

//                           <p className="mt-1 text-sm text-gray-500">
//                             Signature saved with this form
//                           </p>
//                         </div>
//                       </div>

//                       <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
//                         {signatureValue ? (
//                           <img
//                             src={signatureValue}
//                             alt="Customer signature"
//                             className="h-36 w-full object-contain"
//                           />
//                         ) : (
//                           <div className="flex h-36 items-center justify-center text-sm text-gray-500">
//                             No signature recorded.
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {(selectedCompletedForm.questions || []).map(
//                       (question) => (
//                         <div
//                           key={question.id}
//                           className="rounded-2xl border border-gray-200 p-3"
//                         >
//                           <div className="flex items-center justify-between gap-3">
//                             <p className="font-medium text-gray-900">
//                               {question.question_text}
//                             </p>

//                             <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
//                               {question.question_type?.replace(
//                                 "_",
//                                 " "
//                               )}
//                             </span>
//                           </div>

//                           <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
//                             {question.question_type ===
//                             "multiple_choice" ? (
//                               question.options?.find(
//                                 (option) =>
//                                   String(option.id) ===
//                                   String(
//                                     question.answer
//                                       ?.selected_option_id
//                                   )
//                               )?.option_label ||
//                               "No option selected"
//                             ) : question.question_type ===
//                                 "yes_no" ||
//                               question.question_type ===
//                                 "agreement" ? (
//                               question.answer?.boolean_value ===
//                               true ? (
//                                 "Yes"
//                               ) : question.answer
//                                   ?.boolean_value === false ? (
//                                 "No"
//                               ) : (
//                                 "Not answered"
//                               )
//                             ) : (
//                               question.answer?.answer_text ||
//                               "No response recorded"
//                             )}
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-5">
//               <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
//                 <div className="mb-3">
//                   <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
//                     Available forms
//                   </p>
//                 </div>

//                 {templateLoading ? (
//                   <div className="text-sm text-gray-500">
//                     Loading active templates...
//                   </div>
//                 ) : templates.length === 0 ? (
//                   <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
//                     No active form templates are available right now.
//                   </div>
//                 ) : (
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {templates.map((template) => (
//                       <button
//                         key={template.id}
//                         type="button"
//                         onClick={() =>
//                           openTemplateForm(template.id)
//                         }
//                         className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <p className="font-semibold text-gray-900">
//                               {template.name}
//                             </p>

//                             <p className="mt-1 text-sm text-gray-500">
//                               {template.description ||
//                                 "No description"}
//                             </p>
//                           </div>

//                           <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
//                             Active
//                           </span>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {selectedTemplate && (
//                 <div className="rounded-2xl border border-gray-200 bg-white p-4">
//                   <div className="mb-4 flex items-center justify-between gap-3">
//                     <div>
//                       <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
//                         Selected template
//                       </p>

//                       <h3 className="mt-1 text-xl font-bold text-gray-900">
//                         {selectedTemplate.name}
//                       </h3>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     {(selectedTemplate.questions || []).map(
//                       (question) => (
//                         <div
//                           key={question.id}
//                           className="rounded-2xl border border-gray-200 p-4"
//                         >
//                           <p className="font-medium text-gray-900">
//                             {question.question_text}
//                           </p>

//                           <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-400">
//                             {question.question_type?.replace(
//                               "_",
//                               " "
//                             )}
//                           </p>

//                           {renderQuestionEditor(question)}
//                         </div>
//                       )
//                     )}
//                   </div>

//                   <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
//                     <label className="mb-2 block text-sm font-semibold text-gray-800">
//                       Customer Signature
//                     </label>

//                     <div className="rounded-xl border border-gray-200 bg-white">
//                       <SignatureCanvas
//                         ref={signaturePadRef}
//                         canvasProps={{
//                           className: "w-full h-36 rounded-xl",
//                         }}
//                       />
//                     </div>

//                     <button
//                       type="button"
//                       onClick={clearSignature}
//                       className="mt-2 text-sm text-gray-500 hover:text-gray-700"
//                     >
//                       Clear signature
//                     </button>
//                   </div>

//                   <div className="mt-5 flex flex-wrap gap-3">
//                     <button
//                       type="button"
//                       onClick={() =>
//                         submitCurrentForm(false)
//                       }
//                       disabled={saving || !draftFormId}
//                       className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       {saving ? "Saving..." : "Submit form"}
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         submitCurrentForm(true)
//                       }
//                       disabled={saving || !draftFormId}
//                       className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                       Save draft
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../../../../lib/api.js";
import {
  getSignatureFromRef,
  clearSignatureRef,
  isSignaturePadEmpty,
} from "../../../../lib/signatureUtils";

const EMPTY_ANSWERS = {};

function isValidId(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function getDirectCustomerId(customer, booking) {
  if (isValidId(booking?.customer_id)) return booking.customer_id;
  if (isValidId(booking?.customer?.id)) return booking.customer.id;
  if (isValidId(customer?.id)) return customer.id;
  return null;
}

function normalizeBoolean(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function getCustomerFromCompletedForm(form, fallbackCustomer, booking) {
  if (isValidId(form?.customer_id)) {
    if (isValidId(fallbackCustomer?.id) &&
        String(fallbackCustomer.id) === String(form.customer_id)) {
      return fallbackCustomer;
    }

    if (
      isValidId(booking?.customer_id) &&
      String(booking.customer_id) === String(form.customer_id) &&
      booking?.customer
    ) {
      return booking.customer;
    }
  }

  // No fallback - require explicit customer ID match
  return null;
}

function getAppointmentFromCompletedForm(form, booking) {
  return form?.appointment || booking || null;
}

function getSignatureValue(form) {
  return (
    form?.signature ||
    form?.signature_data ||
    form?.signature_url ||
    form?.signature_image ||
    form?.customer_signature ||
    form?.signature?.data ||
    form?.signature?.url ||
    null
  );
}

export default function CustomerFormsManager({
  customer,
  booking,
  onClose,
  defaultTab = "list",
}) {
  const [customerId, setCustomerId] = useState(() =>
    getDirectCustomerId(customer, booking)
  );
  const [tab, setTab] = useState(defaultTab || "list");
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [completedForms, setCompletedForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCompletedFormId, setSelectedCompletedFormId] =
    useState(null);
  const [selectedCompletedForm, setSelectedCompletedForm] = useState(null);
  const [completedFormLoading, setCompletedFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftFormId, setDraftFormId] = useState(null);

  const resolveCustomerId = async () => {
    const bookingCustomerId = booking?.customer_id;

    if (isValidId(bookingCustomerId)) {
      setCustomerId(bookingCustomerId);
      return bookingCustomerId;
    }

    const bookingNestedCustomerId = booking?.customer?.id;

    if (isValidId(bookingNestedCustomerId)) {
      setCustomerId(bookingNestedCustomerId);
      return bookingNestedCustomerId;
    }

    const directCustomerId = customer?.id;

    if (isValidId(directCustomerId)) {
      setCustomerId(directCustomerId);
      return directCustomerId;
    }

    setCustomerId(null);
    return null;
  };

  const loadTemplates = async () => {
    try {
      setTemplateLoading(true);

      const res = await api.get("/forms/templates/active");

      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load active templates", error);
      setTemplates([]);
    } finally {
      setTemplateLoading(false);
    }
  };

  const loadCustomerForms = async (id = customerId) => {
    if (!isValidId(id)) {
      setCompletedForms([]);
      setFormsLoading(false);
      return;
    }

    try {
      setFormsLoading(true);

      const res = await api.get(`/forms/customers/${id}/forms`);

      setCompletedForms(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load customer forms", error);
      setCompletedForms([]);
    } finally {
      setFormsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    resolveCustomerId();
  }, [customer, booking]);

  useEffect(() => {
    if (isValidId(customerId)) {
      loadCustomerForms(customerId);
    } else {
      setCompletedForms([]);
      setFormsLoading(false);
    }
  }, [customerId]);

  const selectedCustomerName =
    booking?.customer?.name ||
    customer?.name ||
    booking?.customer_name ||
    "Customer";

  const selectedCustomerEmail =
    booking?.customer?.email ||
    customer?.email ||
    booking?.customer_email ||
    "-";

  const selectedCustomerPhone =
    booking?.customer?.phone ||
    customer?.phone ||
    booking?.customer_phone ||
    "-";

  const buildQuestionAnswerMap = (questions) => {
    const map = {};

    (questions || []).forEach((question) => {
      map[question.id] = {
        completed_form_question_id: question.id,
        answer_text: question.answer?.answer_text ?? null,
        selected_option_id: question.answer?.selected_option_id ?? null,
        boolean_value: normalizeBoolean(
          question.answer?.boolean_value
        ),
      };
    });

    return map;
  };

  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const signaturePadRef = useRef(null);

  const clearSignature = () => {
    clearSignatureRef(signaturePadRef);
  };

  const getSignatureData = () => {
    if (isSignaturePadEmpty(signaturePadRef)) return null;

    return getSignatureFromRef(signaturePadRef);
  };

  const loadCompletedFormDetails = async (formId) => {
    if (!formId) return;

    try {
      setCompletedFormLoading(true);

      const res = await api.get(
        `/forms/completed-forms/${formId}/with-details`
      );

      // Validate that the form belongs to the current customer
      if (String(res.data.customer_id) !== String(customerId)) {
        alert("The selected form does not belong to the current customer.");
        setSelectedCompletedForm(null);
        setSelectedCompletedFormId(null);
        return;
      }

      setSelectedCompletedForm(res.data);
      setSelectedCompletedFormId(formId);
    } catch (error) {
      console.error("Failed to load completed form details", error);
      setSelectedCompletedForm(null);
    } finally {
      setCompletedFormLoading(false);
    }
  };

  const openTemplateForm = async (templateId) => {
    try {
      setSaving(true);

      const resolvedCustomerId = await resolveCustomerId();

      if (!resolvedCustomerId) {
        alert(
          "Cannot create this form because the selected booking does not contain a valid customer ID."
        );
        return;
      }

      const templateRes = await api.get(
        `/forms/templates/${templateId}/with-details`
      );

      const templateDetails = templateRes.data || {};

      const created = await api.post("/forms/completed-forms", {
        customer_id: resolvedCustomerId,
        appointment_id: booking?.id || null,
        form_template_id: templateId,
      });

      const formId = created?.data?.id;

      if (!formId) {
        throw new Error("The completed form ID was not returned.");
      }

      const detailsRes = await api.get(
        `/forms/completed-forms/${formId}/with-details`
      );

      const details = detailsRes.data;
      const completedQuestions = details?.questions || [];

      setDraftFormId(formId);

      setSelectedTemplate({
        id: templateId,
        name:
          details?.form_name ||
          templateDetails?.name ||
          "Form",
        questions: completedQuestions,
      });

      setAnswers(buildQuestionAnswerMap(completedQuestions));

      clearSignature();

      setTab("create");
    } catch (error) {
      console.error("Failed to initialize form", error);

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to initialize form"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateAnswer = (questionId, value, type) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] || {
          completed_form_question_id: questionId,
        }),
        completed_form_question_id: questionId,
        answer_text: type === "text" ? value : null,
        selected_option_id:
          type === "multiple_choice" ? value : null,
        boolean_value:
          type === "boolean" ? value : null,
      },
    }));
  };

  const submitCurrentForm = async (saveAsDraft = false) => {
    if (!draftFormId || !customerId) return;

    const payload =
      selectedCompletedForm?.questions ||
      selectedTemplate?.questions ||
      [];

    const builtAnswers = (payload || [])
      .map((question) => {
        const answer = answers[question.id] || {};

        switch (question.question_type) {
          case "text":
            return {
              completed_form_question_id: question.id,
              answer_text: answer.answer_text ?? "",
            };

          case "yes_no":
          case "agreement":
            return {
              completed_form_question_id: question.id,
              boolean_value: normalizeBoolean(
                answer.boolean_value
              ),
            };

          case "multiple_choice":
            return {
              completed_form_question_id: question.id,
              selected_option_id:
                answer.selected_option_id ?? null,
            };

          default:
            return {
              completed_form_question_id: question.id,
              answer_text: answer.answer_text ?? "",
            };
        }
      })
      .filter((answer) => {
        if (
          answer.answer_text !== undefined &&
          answer.answer_text !== null &&
          answer.answer_text !== ""
        ) {
          return true;
        }

        if (
          answer.boolean_value !== undefined &&
          answer.boolean_value !== null
        ) {
          return true;
        }

        if (
          answer.selected_option_id !== undefined &&
          answer.selected_option_id !== null
        ) {
          return true;
        }

        return false;
      });

    const signaturePayload = getSignatureData();

    if (!saveAsDraft && !signaturePayload) {
      alert(
        "Please add a customer signature before submitting the form."
      );
      return;
    }

    try {
      setSaving(true);

      const endpoint = saveAsDraft
        ? "/forms/save-draft"
        : "/forms/submit";

      await api.post(endpoint, {
        completed_form_id: draftFormId,
        customer_id: customerId,
        appointment_id: booking?.id || null,
        form_template_id: selectedTemplate?.id || null,
        answers: builtAnswers,
        signature: signaturePayload,
      });

      await loadCustomerForms(customerId);

      setTab("list");
      setDraftFormId(null);
      setSelectedTemplate(null);
      setAnswers(EMPTY_ANSWERS);

      clearSignature();

      onClose?.();
    } catch (error) {
      console.error("Failed to save form", error);

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to save form"
      );
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionEditor = (question) => {
    const questionAnswer = answers[question.id] || {};
    const type = question.question_type;

    if (type === "text") {
      return (
        <input
          value={questionAnswer.answer_text ?? ""}
          onChange={(event) =>
            updateAnswer(
              question.id,
              event.target.value,
              "text"
            )
          }
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary"
          placeholder="Your response"
        />
      );
    }

    if (type === "yes_no") {
      return (
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                updateAnswer(
                  question.id,
                  option.value,
                  "boolean"
                )
              }
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                questionAnswer.boolean_value === option.value
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    if (type === "agreement") {
      return (
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: "Agree", value: true },
            { label: "Disagree", value: false },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                updateAnswer(
                  question.id,
                  option.value,
                  "boolean"
                )
              }
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                questionAnswer.boolean_value === option.value
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-2">
        {(question.options || []).map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
              questionAnswer.selected_option_id === option.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={
                questionAnswer.selected_option_id === option.id
              }
              onChange={() =>
                updateAnswer(
                  question.id,
                  option.id,
                  "multiple_choice"
                )
              }
              className="h-4 w-4 text-primary"
            />
            <span>{option.option_label}</span>
          </label>
        ))}
      </div>
    );
  };

  const selectedTemplateQuestions = useMemo(() => {
    if (!selectedTemplate) return [];

    if (selectedTemplate.questions) {
      return selectedTemplate.questions;
    }

    return [];
  }, [selectedTemplate]);

  const detailsCustomer = getCustomerFromCompletedForm(
    selectedCompletedForm,
    booking?.customer || customer,
    booking
  );

  const detailsCustomerName =
    detailsCustomer?.name ||
    selectedCustomerName ||
    "Customer";

  const detailsCustomerEmail =
    detailsCustomer?.email ||
    selectedCustomerEmail ||
    "-";

  const detailsCustomerPhone =
    detailsCustomer?.phone ||
    selectedCustomerPhone ||
    "-";

  const detailsAppointment = getAppointmentFromCompletedForm(
    selectedCompletedForm,
    booking
  );

  const appointmentId =
    detailsAppointment?.id ||
    selectedCompletedForm?.appointment_id ||
    null;

  const appointmentDate =
    detailsAppointment?.appointment_date ||
    detailsAppointment?.date ||
    detailsAppointment?.scheduled_date ||
    detailsAppointment?.start_time ||
    detailsAppointment?.start_at ||
    null;

  const appointmentTime =
    detailsAppointment?.appointment_time ||
    detailsAppointment?.time ||
    detailsAppointment?.scheduled_time ||
    null;

  const appointmentStatus =
    detailsAppointment?.status ||
    detailsAppointment?.appointment_status ||
    null;

  const appointmentServices =
    detailsAppointment?.services ||
    detailsAppointment?.appointment_services ||
    detailsAppointment?.booking_services ||
    [];

  const appointmentServiceNames = Array.isArray(
    appointmentServices
  )
    ? appointmentServices
        .map(
          (service) =>
            service?.name ||
            service?.service_name ||
            service?.title ||
            service?.service?.name
        )
        .filter(Boolean)
    : [];

  const formTemplateName =
    selectedCompletedForm?.form_template?.name ||
    selectedCompletedForm?.template?.name ||
    selectedCompletedForm?.form_template_name ||
    selectedCompletedForm?.template_name ||
    selectedCompletedForm?.form_name ||
    "Form";

  const formStatus =
    selectedCompletedForm?.status ||
    selectedCompletedForm?.form_status ||
    "-";

  const signatureValue = getSignatureValue(
    selectedCompletedForm
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2 sm:p-3 md:p-6">
      <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl md:max-h-[90vh]">
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
              Customer forms
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-gray-900 sm:text-xl">
              {selectedCustomerName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 sm:px-3 sm:py-1 sm:text-sm"
          >
            Close
          </button>
        </div>

        <div className="shrink-0 overflow-x-auto border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          <div className="flex min-w-max gap-2">
            {[
              {
                key: "list",
                label: "View All Forms",
              },
              {
                key: "create",
                label: "Create Form",
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-xl px-3 py-2 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm ${
                  tab === item.key
                    ? "bg-primary text-white"
                    : "border border-gray-200 bg-white text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-3 sm:space-y-6 sm:p-4 md:p-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                    Name
                  </p>

                  <p className="mt-1 truncate font-medium text-gray-900">
                    {selectedCustomerName}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                    Email
                  </p>

                  <p className="mt-1 break-all font-medium text-gray-900">
                    {selectedCustomerEmail}
                  </p>
                </div>

                <div className="min-w-0 sm:col-span-2 md:col-span-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                    Phone
                  </p>

                  <p className="mt-1 break-all font-medium text-gray-900">
                    {selectedCustomerPhone}
                  </p>
                </div>
              </div>
            </div>

            {tab === "list" ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                    Completed forms
                  </h3>

                  {formsLoading ? (
                    <div className="mt-4 text-sm text-gray-500">
                      Loading forms...
                    </div>
                  ) : completedForms.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 sm:p-6">
                      No completed forms found for this customer.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {completedForms.map((form) => (
                        <button
                          key={form.id}
                          type="button"
                          onClick={() =>
                            loadCompletedFormDetails(form.id)
                          }
                          className={`w-full rounded-2xl border p-3 text-left transition ${
                            selectedCompletedFormId === form.id
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 bg-white hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words font-medium text-gray-900">
                                {form.form_name ||
                                  form.form_template_name ||
                                  `Form #${form.id}`}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {form.status || "-"}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs text-gray-500">
                              #{form.id}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                    Form details
                  </h3>

                  {completedFormLoading ? (
                    <div className="mt-4 text-sm text-gray-500">
                      Loading form details...
                    </div>
                  ) : !selectedCompletedForm ? (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 sm:p-6">
                      Select a completed form to view the historical
                      answers.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                          Customer
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">
                              Name
                            </p>

                            <p className="mt-1 break-words font-medium text-gray-900">
                              {detailsCustomerName}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">
                              Email
                            </p>

                            <p className="mt-1 break-all font-medium text-gray-900">
                              {detailsCustomerEmail}
                            </p>
                          </div>

                          <div className="min-w-0 sm:col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-400">
                              Phone
                            </p>

                            <p className="mt-1 break-all font-medium text-gray-900">
                              {detailsCustomerPhone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                          Form information
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">
                              Template
                            </p>

                            <p className="mt-1 break-words font-semibold text-gray-900">
                              {formTemplateName}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">
                              Status
                            </p>

                            <p className="mt-1 break-words font-semibold capitalize text-gray-900">
                              {formStatus}
                            </p>
                          </div>

                          <div className="min-w-0 sm:col-span-2">
                            <p className="text-xs text-gray-400">
                              Form ID
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                              #{selectedCompletedForm.id}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3 sm:p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                          Appointment
                        </p>

                        {!detailsAppointment && !appointmentId ? (
                          <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                            No appointment information recorded.
                          </div>
                        ) : (
                          <div className="mt-3 space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="min-w-0">
                                <p className="text-xs text-gray-400">
                                  Appointment ID
                                </p>

                                <p className="mt-1 break-words font-medium text-gray-900">
                                  {appointmentId
                                    ? `#${appointmentId}`
                                    : "-"}
                                </p>
                              </div>

                              {appointmentStatus && (
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-400">
                                    Status
                                  </p>

                                  <p className="mt-1 break-words font-medium capitalize text-gray-900">
                                    {appointmentStatus}
                                  </p>
                                </div>
                              )}

                              {appointmentDate && (
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-400">
                                    Date
                                  </p>

                                  <p className="mt-1 break-words font-medium text-gray-900">
                                    {appointmentDate}
                                  </p>
                                </div>
                              )}

                              {appointmentTime && (
                                <div className="min-w-0">
                                  <p className="text-xs text-gray-400">
                                    Time
                                  </p>

                                  <p className="mt-1 break-words font-medium text-gray-900">
                                    {appointmentTime}
                                  </p>
                                </div>
                              )}
                            </div>

                            {appointmentServiceNames.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-400">
                                  Services booked
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {appointmentServiceNames.map(
                                    (serviceName, index) => (
                                      <span
                                        key={`${serviceName}-${index}`}
                                        className="max-w-full break-words rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200"
                                      >
                                        {serviceName}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                              Customer Signature
                            </p>

                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                              Signature saved with this form
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
                          {signatureValue ? (
                            <img
                              src={signatureValue}
                              alt="Customer signature"
                              className="h-28 w-full object-contain sm:h-36"
                            />
                          ) : (
                            <div className="flex h-28 items-center justify-center text-sm text-gray-500 sm:h-36">
                              No signature recorded.
                            </div>
                          )}
                        </div>
                      </div>

                      {(selectedCompletedForm.questions || []).map(
                        (question) => (
                          <div
                            key={question.id}
                            className="rounded-2xl border border-gray-200 p-3 sm:p-4"
                          >
                            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                              <p className="break-words font-medium text-gray-900">
                                {question.question_text}
                              </p>

                              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
                                {question.question_type?.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>

                            <div className="mt-3 break-words rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                              {question.question_type ===
                              "multiple_choice" ? (
                                question.options?.find(
                                  (option) =>
                                    String(option.id) ===
                                    String(
                                      question.answer
                                        ?.selected_option_id
                                    )
                                )?.option_label ||
                                "No option selected"
                              ) : question.question_type ===
                                  "yes_no" ||
                                question.question_type ===
                                  "agreement" ? (
                                question.answer?.boolean_value ===
                                true ? (
                                  "Yes"
                                ) : question.answer
                                    ?.boolean_value === false ? (
                                  "No"
                                ) : (
                                  "Not answered"
                                )
                              ) : (
                                question.answer?.answer_text ||
                                "No response recorded"
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Available forms
                    </p>
                  </div>

                  {templateLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading active templates...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-center text-sm text-gray-500 sm:p-6">
                      No active form templates are available right now.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            openTemplateForm(template.id)
                          }
                          disabled={saving}
                          className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3 text-left transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60 sm:p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-words font-semibold text-gray-900">
                                {template.name}
                              </p>

                              <p className="mt-1 break-words text-sm text-gray-500">
                                {template.description ||
                                  "No description"}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              Active
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                          Selected template
                        </p>

                        <h3 className="mt-1 break-words text-lg font-bold text-gray-900 sm:text-xl">
                          {selectedTemplate.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedTemplateQuestions.map(
                        (question) => (
                          <div
                            key={question.id}
                            className="rounded-2xl border border-gray-200 p-3 sm:p-4"
                          >
                            <p className="break-words font-medium text-gray-900">
                              {question.question_text}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-gray-400 sm:text-xs">
                              {question.question_type?.replace(
                                "_",
                                " "
                              )}
                            </p>

                            {renderQuestionEditor(question)}
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                      <label className="mb-2 block text-sm font-semibold text-gray-800">
                        Customer Signature
                      </label>

                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <SignatureCanvas
                          ref={signaturePadRef}
                          canvasProps={{
                            className:
                              "w-full h-32 sm:h-36 rounded-xl",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={clearSignature}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear signature
                      </button>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          submitCurrentForm(false)
                        }
                        disabled={saving || !draftFormId}
                        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {saving ? "Saving..." : "Submit form"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          submitCurrentForm(true)
                        }
                        disabled={saving || !draftFormId}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        Save draft
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}