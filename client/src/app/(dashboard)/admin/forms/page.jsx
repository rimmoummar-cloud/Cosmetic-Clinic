
// "use client";

// import { useMemo, useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import api from "../../../../lib/api.js";
// import CompletedFormViewer from "./completedformviwer.jsx";

// const questionTypes = [
//   { value: "text", label: "Text" },
//   { value: "yes_no", label: "Yes / No" },
//   { value: "multiple_choice", label: "Multiple Choice" },
//   { value: "agreement", label: "Agreement" },
// ];

// const emptyTemplateForm = { name: "", description: "", is_active: true };

// const emptyQuestion = {
//   id: null,
//   question_text: "",
//   question_type: "text",
//   required: false,
//   sort_order: 0,
//   options: [],
// };

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

// function normalizeQuestion(question) {
//   return {
//     id: question?.id ?? null,
//     question_text: question?.question_text || "",
//     question_type: question?.question_type || "text",
//     required: Boolean(question?.required),
//     sort_order: question?.sort_order ?? 0,
//     options: (question?.options || []).map((option) => ({
//       id: option?.id ?? null,
//       option_label: option?.option_label || "",
//       sort_order: option?.sort_order ?? 0,
//     })),
//   };
// }

// function TemplatePreview({ template, details, loading, onClose }) {
//   if (loading) {
//     return (
//       <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-3 py-5">
//         <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
//           <div className="space-y-4 animate-pulse">
//             <div className="h-8 w-64 rounded-lg bg-gray-200" />
//             <div className="h-4 w-80 rounded bg-gray-200" />
//             <div className="h-24 rounded-2xl bg-gray-200" />
//             <div className="h-24 rounded-2xl bg-gray-200" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const questions = details?.questions || [];

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-3 py-5">
//       <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
//         <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 md:px-6">
//           <div className="min-w-0">
//             <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//               Form Preview
//             </p>

//             <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
//               {details?.name || template?.name || "Form Preview"}
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
//           >
//             Close
//           </button>
//         </div>

//         <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
//           <div className="space-y-5">
//             <div className="rounded-2xl bg-gray-50 p-4">
//               <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
//                 Form
//               </p>

//               <h3 className="mt-2 text-xl font-bold text-gray-900">
//                 {details?.name || template?.name || "Form"}
//               </h3>

//               {(details?.description || template?.description) && (
//                 <p className="mt-2 text-sm leading-6 text-gray-600">
//                   {details?.description || template?.description}
//                 </p>
//               )}
//             </div>

//             {questions.length === 0 ? (
//               <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
//                 No questions configured for this form.
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {questions.map((question, index) => {
//                   const type = question.question_type;

//                   return (
//                     <div
//                       key={question.id || `preview-question-${index}`}
//                       className="rounded-2xl border border-gray-200 p-4"
//                     >
//                       <div className="flex items-start justify-between gap-3">
//                         <div className="min-w-0">
//                           <div className="flex items-start gap-2">
//                             <span className="shrink-0 font-semibold text-gray-500">
//                               {index + 1}.
//                             </span>

//                             <p className="break-words font-medium text-gray-900">
//                               {question.question_text}
//                             </p>
//                           </div>

//                           {question.required && (
//                             <p className="mt-1 ml-6 text-xs font-medium text-red-500">
//                               Required
//                             </p>
//                           )}
//                         </div>

//                         <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
//                           {type?.replace("_", " ")}
//                         </span>
//                       </div>

//                       <div className="mt-4">
//                         {type === "text" ? (
//                           <input
//                             type="text"
//                             disabled
//                             value=""
//                             placeholder="Your response"
//                             className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
//                           />
//                         ) : type === "yes_no" ? (
//                           <div className="flex flex-wrap gap-3">
//                             {["Yes", "No"].map((option) => (
//                               <label
//                                 key={option}
//                                 className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
//                               >
//                                 <input
//                                   type="radio"
//                                   disabled
//                                   name={`preview-question-${question.id}`}
//                                   className="h-4 w-4"
//                                 />
//                                 {option}
//                               </label>
//                             ))}
//                           </div>
//                         ) : type === "agreement" ? (
//                           <div className="flex flex-wrap gap-3">
//                             {["Agree", "Disagree"].map((option) => (
//                               <label
//                                 key={option}
//                                 className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
//                               >
//                                 <input
//                                   type="radio"
//                                   disabled
//                                   name={`preview-question-${question.id}`}
//                                   className="h-4 w-4"
//                                 />
//                                 {option}
//                               </label>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="space-y-2">
//                             {(question.options || []).map((option, optionIndex) => (
//                               <label
//                                 key={
//                                   option.id ||
//                                   `preview-option-${question.id}-${optionIndex}`
//                                 }
//                                 className="flex cursor-default items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
//                               >
//                                 <input
//                                   type="radio"
//                                   disabled
//                                   name={`preview-question-${question.id}`}
//                                   className="h-4 w-4"
//                                 />

//                                 <span>{option.option_label}</span>
//                               </label>
//                             ))}

//                             {(question.options || []).length === 0 && (
//                               <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
//                                 No options configured.
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
//               Preview only. No customer, completed form, answers, or signature
//               are associated with this preview.
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminFormsPage() {
//   const queryClient = useQueryClient();

//   const [activeTab, setActiveTab] = useState("templates");
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [builderOpen, setBuilderOpen] = useState(false);
//   const [builderMode, setBuilderMode] = useState("create");
//   const [builderTemplate, setBuilderTemplate] = useState({
//     ...emptyTemplateForm,
//   });
//   const [builderQuestions, setBuilderQuestions] = useState([]);
//   const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
//   const [removedOptionIds, setRemovedOptionIds] = useState([]);
//   const [selectedCompletedFormId, setSelectedCompletedFormId] = useState(null);

//   const [previewTemplateId, setPreviewTemplateId] = useState(null);
//   const [previewTemplate, setPreviewTemplate] = useState(null);

//   const {
//     data: templates = [],
//     isLoading: templatesLoading,
//   } = useQuery({
//     queryKey: ["forms-templates"],
//     queryFn: async () => {
//       const res = await api.get("/forms/templates");
//       return res.data || [];
//     },
//   });

//   const {
//     data: completedForms = [],
//     isLoading: completedFormsLoading,
//   } = useQuery({
//     queryKey: ["forms-completed"],
//     queryFn: async () => {
//       const res = await api.get("/forms/completed-forms");
//       return res.data || [];
//     },
//   });

//   const selectedTemplate = useMemo(
//     () =>
//       templates.find(
//         (template) =>
//           String(template.id) === String(selectedTemplateId)
//       ) || null,
//     [selectedTemplateId, templates]
//   );

//   const {
//     data: selectedTemplateDetails,
//     isLoading: templateDetailsLoading,
//     refetch: refetchTemplateDetails,
//   } = useQuery({
//     queryKey: ["form-template-details", selectedTemplateId],
//     queryFn: async () => {
//       if (!selectedTemplateId) return null;

//       const res = await api.get(
//         `/forms/templates/${selectedTemplateId}/with-details`
//       );

//       return res.data;
//     },
//     enabled: !!selectedTemplateId,
//   });

//   const {
//     data: previewTemplateDetails,
//     isLoading: previewTemplateLoading,
//   } = useQuery({
//     queryKey: ["form-template-preview", previewTemplateId],
//     queryFn: async () => {
//       if (!previewTemplateId) return null;

//       const res = await api.get(
//         `/forms/templates/${previewTemplateId}/with-details`
//       );

//       return res.data;
//     },
//     enabled: !!previewTemplateId,
//   });

//   const openTemplatePreview = (template) => {
//     setPreviewTemplate(template);
//     setPreviewTemplateId(template.id);
//   };

//   const closeTemplatePreview = () => {
//     setPreviewTemplate(null);
//     setPreviewTemplateId(null);
//   };

//   const openCreateBuilder = () => {
//     setBuilderMode("create");
//     setBuilderTemplate({ ...emptyTemplateForm });
//     setBuilderQuestions([]);
//     setRemovedQuestionIds([]);
//     setRemovedOptionIds([]);
//     setBuilderOpen(true);
//   };

//   const openEditBuilder = async (template) => {
//     try {
//       const res = await api.get(
//         `/forms/templates/${template.id}/with-details`
//       );

//       const details = res.data || {};

//       setBuilderMode("edit");

//       setBuilderTemplate({
//         id: details.id,
//         name: details.name || "",
//         description: details.description || "",
//         is_active: details.is_active !== false,
//       });

//       setBuilderQuestions(
//         (details.questions || []).map((question) =>
//           normalizeQuestion(question)
//         )
//       );

//       setRemovedQuestionIds([]);
//       setRemovedOptionIds([]);
//       setBuilderOpen(true);
//     } catch (error) {
//       console.error("Failed to load template details", error);

//       alert(
//         error?.response?.data?.error ||
//           "Failed to load template details"
//       );
//     }
//   };

//   const handleAddQuestion = () => {
//     setBuilderQuestions((current) => [
//       ...current,
//       {
//         ...emptyQuestion,
//         sort_order: current.length,
//       },
//     ]);
//   };

//   const handleQuestionChange = (
//     questionIndex,
//     field,
//     value
//   ) => {
//     setBuilderQuestions((current) =>
//       current.map((question, index) => {
//         if (index !== questionIndex) return question;

//         if (
//           field === "question_type" &&
//           value !== "multiple_choice"
//         ) {
//           return {
//             ...question,
//             question_type: value,
//             options: [],
//           };
//         }

//         return {
//           ...question,
//           [field]: value,
//         };
//       })
//     );
//   };

//   const ensureQuestionIsPersisted = async (questionIndex) => {
//     const question = builderQuestions[questionIndex];

//     if (!question) return null;

//     let templateId = builderTemplate.id;

//     if (!templateId) {
//       if (!builderTemplate.name.trim()) {
//         alert(
//           "Form name is required before adding an option."
//         );
//         return null;
//       }

//       const createdTemplate = await api.post(
//         "/forms/templates",
//         {
//           name: builderTemplate.name.trim(),
//           description: builderTemplate.description.trim(),
//         }
//       );

//       templateId =
//         createdTemplate.data?.id ||
//         createdTemplate.data?.template?.id;

//       setBuilderTemplate((current) => ({
//         ...current,
//         id: templateId,
//       }));

//       setBuilderMode("edit");
//     }

//     if (question.id) return question.id;

//     if (!question.question_text.trim()) {
//       alert(
//         "Question text is required before adding an option."
//       );
//       return null;
//     }

//     const createdQuestion = await api.post(
//       "/forms/questions",
//       {
//         form_template_id: templateId,
//         question_text: question.question_text.trim(),
//         question_type: question.question_type,
//         required: Boolean(question.required),
//         sort_order: question.sort_order,
//       }
//     );

//     const questionId = createdQuestion.data?.id;

//     setBuilderQuestions((current) =>
//       current.map((item, index) =>
//         index === questionIndex
//           ? {
//               ...item,
//               id: questionId,
//             }
//           : item
//       )
//     );

//     return questionId;
//   };

//   const handleAddOption = async (questionIndex) => {
//     try {
//       const questionId =
//         await ensureQuestionIsPersisted(questionIndex);

//       if (!questionId) return;

//       setBuilderQuestions((current) =>
//         current.map((question, index) => {
//           if (index !== questionIndex) return question;

//           return {
//             ...question,
//             options: [
//               ...question.options,
//               {
//                 id: null,
//                 option_label: "",
//                 sort_order: question.options.length,
//               },
//             ],
//           };
//         })
//       );
//     } catch (error) {
//       console.error(
//         "Failed to prepare question for an option",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to prepare question for an option"
//       );
//     }
//   };

//   const saveOption = async (
//     questionIndex,
//     optionIndex
//   ) => {
//     const question = builderQuestions[questionIndex];
//     const option = question?.options?.[optionIndex];

//     if (
//       !question ||
//       !option ||
//       option.id ||
//       !option.option_label.trim()
//     ) {
//       return;
//     }

//     try {
//       const questionId =
//         await ensureQuestionIsPersisted(questionIndex);

//       if (!questionId) return;

//       const response = await api.post(
//         "/forms/options",
//         {
//           question_id: questionId,
//           option_label: option.option_label.trim(),
//           sort_order: option.sort_order,
//         }
//       );

//       const createdOption = response.data;

//       setBuilderQuestions((current) =>
//         current.map((item, index) => {
//           if (index !== questionIndex) return item;

//           return {
//             ...item,
//             options: item.options.map(
//               (itemOption, indexInQuestion) =>
//                 indexInQuestion === optionIndex
//                   ? {
//                       id: createdOption?.id,
//                       option_label:
//                         createdOption?.option_label ||
//                         option.option_label.trim(),
//                       sort_order:
//                         createdOption?.sort_order ??
//                         option.sort_order,
//                     }
//                   : itemOption
//             ),
//           };
//         })
//       );
//     } catch (error) {
//       console.error(
//         "Failed to create form option",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to create form option"
//       );
//     }
//   };

//   const handleOptionKeyDown = (
//     event,
//     questionIndex,
//     optionIndex
//   ) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       event.currentTarget.blur();
//     }
//   };

//   const handleOptionChange = (
//     questionIndex,
//     optionIndex,
//     field,
//     value
//   ) => {
//     setBuilderQuestions((current) =>
//       current.map((question, index) => {
//         if (index !== questionIndex) return question;

//         return {
//           ...question,
//           options: question.options.map(
//             (option, idx) =>
//               idx === optionIndex
//                 ? {
//                     ...option,
//                     [field]: value,
//                   }
//                 : option
//           ),
//         };
//       })
//     );
//   };

//   const handleRemoveQuestion = (questionIndex) => {
//     setBuilderQuestions((current) => {
//       const question = current[questionIndex];

//       if (question?.id) {
//         setRemovedQuestionIds((prev) => [
//           ...prev,
//           question.id,
//         ]);
//       }

//       return current.filter(
//         (_, index) => index !== questionIndex
//       );
//     });
//   };

//   const handleRemoveOption = (
//     questionIndex,
//     optionIndex
//   ) => {
//     setBuilderQuestions((current) =>
//       current.map((question, index) => {
//         if (index !== questionIndex) return question;

//         const option = question.options[optionIndex];

//         if (option?.id) {
//           setRemovedOptionIds((prev) => [
//             ...prev,
//             option.id,
//           ]);
//         }

//         return {
//           ...question,
//           options: question.options.filter(
//             (_, idx) => idx !== optionIndex
//           ),
//         };
//       })
//     );
//   };

//   const saveTemplateBuilder = async () => {
//     try {
//       if (!builderTemplate.name.trim()) {
//         alert("Form name is required.");
//         return;
//       }

//       const cleanQuestions = builderQuestions.map(
//         (question, index) => ({
//           ...question,
//           question_text:
//             question.question_text.trim(),
//           required: Boolean(question.required),
//           sort_order: index,
//           options: (question.options || []).map(
//             (option, optionIndex) => ({
//               ...option,
//               option_label:
//                 option.option_label.trim(),
//               sort_order: optionIndex,
//             })
//           ),
//         })
//       );

//       const invalidQuestions =
//         cleanQuestions.filter(
//           (question) => !question.question_text
//         );

//       if (invalidQuestions.length > 0) {
//         alert(
//           "Each question must have text before saving."
//         );
//         return;
//       }

//       if (builderMode === "create") {
//         const createdTemplate = await api.post(
//           "/forms/templates",
//           {
//             name: builderTemplate.name.trim(),
//             description:
//               builderTemplate.description.trim(),
//           }
//         );

//         const templateId =
//           createdTemplate.data?.id ||
//           createdTemplate.data?.template?.id;

//         for (const question of cleanQuestions) {
//           const createdQuestion = await api.post(
//             "/forms/questions",
//             {
//               form_template_id: templateId,
//               question_text:
//                 question.question_text,
//               question_type:
//                 question.question_type,
//               required: question.required,
//               sort_order: question.sort_order,
//             }
//           );

//           const questionId =
//             createdQuestion.data?.id;

//           if (
//             question.question_type ===
//             "multiple_choice"
//           ) {
//             for (const option of question.options) {
//               if (!option.option_label) continue;

//               await api.post(
//                 "/forms/options",
//                 {
//                   question_id: questionId,
//                   option_label:
//                     option.option_label,
//                   sort_order:
//                     option.sort_order,
//                 }
//               );
//             }
//           }
//         }
//       } else {
//         const templateId = builderTemplate.id;

//         await api.put(
//           `/forms/templates/${templateId}`,
//           {
//             name: builderTemplate.name.trim(),
//             description:
//               builderTemplate.description.trim(),
//             is_active:
//               builderTemplate.is_active,
//           }
//         );

//         const originalQuestionIds = new Set(
//           (selectedTemplateDetails?.questions || [])
//             .map((question) => question.id)
//         );

//         const currentQuestionIds = new Set(
//           cleanQuestions
//             .filter((question) => question.id)
//             .map((question) => question.id)
//         );

//         for (const questionId of [
//           ...originalQuestionIds,
//         ]) {
//           if (!currentQuestionIds.has(questionId)) {
//             await api.delete(
//               `/forms/questions/${questionId}`
//             );
//           }
//         }

//         for (const question of cleanQuestions) {
//           if (question.id) {
//             await api.put(
//               `/forms/questions/${question.id}`,
//               {
//                 question_text:
//                   question.question_text,
//                 question_type:
//                   question.question_type,
//                 required: question.required,
//                 sort_order:
//                   question.sort_order,
//               }
//             );
//           } else {
//             const createdQuestion =
//               await api.post(
//                 "/forms/questions",
//                 {
//                   form_template_id: templateId,
//                   question_text:
//                     question.question_text,
//                   question_type:
//                     question.question_type,
//                   required: question.required,
//                   sort_order:
//                     question.sort_order,
//                 }
//               );

//             question.id =
//               createdQuestion.data?.id;
//           }

//           const existingQuestionOptions =
//             (
//               selectedTemplateDetails?.questions ||
//               []
//             ).find(
//               (item) => item.id === question.id
//             )?.options || [];

//           const questionOptionIds = new Set(
//             existingQuestionOptions
//               .filter((option) => option.id)
//               .map((option) => option.id)
//           );

//           const currentOptionIds = new Set(
//             (question.options || [])
//               .filter((option) => option.id)
//               .map((option) => option.id)
//           );

//           for (const optionId of [
//             ...questionOptionIds,
//           ]) {
//             if (!currentOptionIds.has(optionId)) {
//               await api.delete(
//                 `/forms/options/${optionId}`
//               );
//             }
//           }

//           for (const option of question.options || []) {
//             if (!option.option_label) continue;

//             if (option.id) {
//               await api.put(
//                 `/forms/options/${option.id}`,
//                 {
//                   option_label:
//                     option.option_label,
//                   sort_order:
//                     option.sort_order,
//                 }
//               );
//             } else {
//               await api.post(
//                 "/forms/options",
//                 {
//                   question_id: question.id,
//                   option_label:
//                     option.option_label,
//                   sort_order:
//                     option.sort_order,
//                 }
//               );
//             }
//           }
//         }
//       }

//       setBuilderOpen(false);
//       setBuilderTemplate({
//         ...emptyTemplateForm,
//       });
//       setBuilderQuestions([]);

//       await Promise.all([
//         queryClient.invalidateQueries({
//           queryKey: ["forms-templates"],
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["forms-completed"],
//         }),
//       ]);

//       if (selectedTemplateId) {
//         await refetchTemplateDetails();
//       }
//     } catch (error) {
//       console.error(
//         "Failed to save form template",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to save form template"
//       );
//     }
//   };

//   const deleteTemplate = async (template) => {
//     if (!template?.id) return;

//     if (!window.confirm("Delete this template?")) {
//       return;
//     }

//     try {
//       await api.delete(
//         `/forms/templates/${template.id}`
//       );

//       if (selectedTemplateId === template.id) {
//         setSelectedTemplateId(null);
//       }

//       await queryClient.invalidateQueries({
//         queryKey: ["forms-templates"],
//       });
//     } catch (error) {
//       console.error(
//         "Failed to delete template",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to delete template"
//       );
//     }
//   };

//   const deleteCompletedForm = async (form) => {
//     if (!form?.id) return;

//     if (
//       !window.confirm(
//         "Delete this completed form?"
//       )
//     ) {
//       return;
//     }

//     try {
//       await api.delete(
//         `/forms/completed-forms/${form.id}`
//       );

//       await queryClient.invalidateQueries({
//         queryKey: ["forms-completed"],
//       });
//     } catch (error) {
//       console.error(
//         "Failed to delete completed form",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to delete completed form"
//       );
//     }
//   };

//   const toggleTemplateActive = async (template) => {
//     if (!template?.id) return;

//     try {
//       await api.patch(
//         `/forms/templates/${template.id}/deactivate`
//       );

//       await queryClient.invalidateQueries({
//         queryKey: ["forms-templates"],
//       });
//     } catch (error) {
//       console.error(
//         "Failed to update template state",
//         error
//       );

//       alert(
//         error?.response?.data?.error ||
//           "Failed to update template state"
//       );
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold font-[var(--font-heading)] text-gray-900">
//             Forms
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage form templates and historical completed
//             submissions.
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <button
//             type="button"
//             onClick={openCreateBuilder}
//             className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
//           >
//             Add Form
//           </button>

//           <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
//             {[
//               {
//                 key: "templates",
//                 label: "Templates",
//               },
//               {
//                 key: "completed",
//                 label: "Completed Forms",
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 type="button"
//                 onClick={() => setActiveTab(tab.key)}
//                 className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
//                   activeTab === tab.key
//                     ? "bg-primary text-white"
//                     : "text-gray-600 hover:text-primary"
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {activeTab === "templates" ? (
//         <div className="space-y-6">
//           {templatesLoading ? (
//             <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
//               Loading templates...
//             </div>
//           ) : templates.length === 0 ? (
//             <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
//               No form templates yet.
//             </div>
//           ) : (
//             <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//               {templates.map((template) => (
//                 <div
//                   key={template.id}
//                   className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <h2 className="truncate text-lg font-semibold text-gray-900">
//                         {template.name}
//                       </h2>

//                       <p className="mt-1 text-sm text-gray-500">
//                         {template.description ||
//                           "No description provided."}
//                       </p>
//                     </div>

//                     <span
//                       className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
//                         template.is_active
//                           ? "bg-emerald-100 text-emerald-700"
//                           : "bg-gray-200 text-gray-600"
//                       }`}
//                     >
//                       {template.is_active
//                         ? "Active"
//                         : "Inactive"}
//                     </span>
//                   </div>

//                   <div className="mt-5 flex flex-wrap gap-2">
//                     <button
//                       type="button"
//                       onClick={() =>
//                         openTemplatePreview(template)
//                       }
//                       className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90"
//                     >
//                       Preview
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => {
//                         setSelectedTemplateId(
//                           template.id
//                         );
//                         openEditBuilder(template);
//                       }}
//                       className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary hover:text-primary"
//                     >
//                       Edit
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         toggleTemplateActive(template)
//                       }
//                       className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
//                     >
//                       {template.is_active
//                         ? "Deactivate"
//                         : "Activate"}
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         deleteTemplate(template)
//                       }
//                       className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="border-b border-gray-200 px-4 py-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Completed Forms
//             </h2>
//           </div>

//           {completedFormsLoading ? (
//             <div className="p-6 text-sm text-gray-500">
//               Loading completed forms...
//             </div>
//           ) : completedForms.length === 0 ? (
//             <div className="p-8 text-center text-sm text-gray-500">
//               No completed forms found.
//             </div>
//           ) : (
//             <div className="w-full overflow-x-auto overscroll-x-contain">
//               <table className="min-w-[720px] w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-200 bg-gray-50">
//                     <th className="px-4 py-3 text-left font-semibold text-gray-600">
//                       Form
//                     </th>

//                     <th className="px-4 py-3 text-left font-semibold text-gray-600">
//                       Customer
//                     </th>

//                     <th className="px-4 py-3 text-left font-semibold text-gray-600">
//                       Status
//                     </th>

//                     <th className="px-4 py-3 text-left font-semibold text-gray-600">
//                       Created
//                     </th>

//                     <th className="px-4 py-3 text-right font-semibold text-gray-600">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {completedForms.map((form) => (
//                     <tr
//                       key={form.id}
//                       className="border-b border-gray-100 last:border-0"
//                     >
//                       <td className="px-4 py-3">
//                         <div className="font-medium text-gray-900">
//                           {form.form_name ||
//                             `Form #${form.id}`}
//                         </div>

//                         <div className="text-xs text-gray-500">
//                           #{form.id}
//                         </div>
//                       </td>

//                       <td className="px-4 py-3 text-gray-700">
//                         {form.customer_name ||
//                           form.customer_id ||
//                           "-"}
//                       </td>

//                       <td className="px-4 py-3">
//                         <span
//                           className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
//                             form.status === "completed"
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-amber-100 text-amber-700"
//                           }`}
//                         >
//                           {form.status}
//                         </span>
//                       </td>

//                       <td className="px-4 py-3 text-gray-600">
//                         {formatDate(form.created_at)}
//                       </td>

//                       <td className="px-4 py-3 text-right">
//                         <div className="flex justify-end gap-2">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setSelectedCompletedFormId(
//                                 form.id
//                               );
//                               setBuilderOpen(true);
//                               setBuilderMode("view");
//                             }}
//                             className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90"
//                           >
//                             View
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() =>
//                               deleteCompletedForm(form)
//                             }
//                             className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {builderOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-5">
//           <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl md:p-6">
//             <div className="mb-5 flex items-center justify-between gap-3">
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//                   Form builder
//                 </p>

//                 <h2 className="mt-1 text-2xl font-bold text-gray-900">
//                   {builderMode === "create"
//                     ? "Create Form"
//                     : builderMode === "view"
//                       ? "Completed Form"
//                       : "Edit Form"}
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setBuilderOpen(false)}
//                 className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
//               >
//                 Close
//               </button>
//             </div>

//             {builderMode === "view" ? (
//               <CompletedFormViewer
//                 completedFormId={selectedCompletedFormId}
//               />
//             ) : (
//               <div className="space-y-5">
//                 <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
//                   <div>
//                     <label className="mb-1 block text-sm font-medium text-gray-700">
//                       Form name
//                     </label>

//                     <input
//                       value={builderTemplate.name}
//                       onChange={(event) =>
//                         setBuilderTemplate({
//                           ...builderTemplate,
//                           name: event.target.value,
//                         })
//                       }
//                       className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
//                       placeholder="Patient intake form"
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-1 block text-sm font-medium text-gray-700">
//                       Description
//                     </label>

//                     <textarea
//                       value={builderTemplate.description}
//                       onChange={(event) =>
//                         setBuilderTemplate({
//                           ...builderTemplate,
//                           description:
//                             event.target.value,
//                         })
//                       }
//                       rows={3}
//                       className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
//                       placeholder="This form captures consultation details before treatment."
//                     />
//                   </div>

//                   <label className="flex items-center gap-2 text-sm text-gray-700">
//                     <input
//                       type="checkbox"
//                       checked={
//                         builderTemplate.is_active !== false
//                       }
//                       onChange={(event) =>
//                         setBuilderTemplate({
//                           ...builderTemplate,
//                           is_active:
//                             event.target.checked,
//                         })
//                       }
//                     />

//                     Active template
//                   </label>
//                 </div>

//                 <div className="rounded-2xl border border-gray-200 bg-white p-4">
//                   <div className="mb-4 flex items-center justify-between gap-3">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Questions
//                     </h3>

//                     <button
//                       type="button"
//                       onClick={handleAddQuestion}
//                       className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
//                     >
//                       Add Question
//                     </button>
//                   </div>

//                   <div className="space-y-4">
//                     {builderQuestions.length === 0 ? (
//                       <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
//                         No questions yet. Start building the
//                         form.
//                       </div>
//                     ) : (
//                       builderQuestions.map(
//                         (question, questionIndex) => (
//                           <div
//                             key={`${question.id || "new"}-${questionIndex}`}
//                             className="rounded-2xl border border-gray-200 p-4"
//                           >
//                             <div className="flex items-start justify-between gap-3">
//                               <div className="min-w-0 flex-1 space-y-3">
//                                 <input
//                                   value={
//                                     question.question_text
//                                   }
//                                   onChange={(event) =>
//                                     handleQuestionChange(
//                                       questionIndex,
//                                       "question_text",
//                                       event.target.value
//                                     )
//                                   }
//                                   placeholder="Question text"
//                                   className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
//                                 />

//                                 <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
//                                   <select
//                                     value={
//                                       question.question_type
//                                     }
//                                     onChange={(event) =>
//                                       handleQuestionChange(
//                                         questionIndex,
//                                         "question_type",
//                                         event.target.value
//                                       )
//                                     }
//                                     className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
//                                   >
//                                     {questionTypes.map(
//                                       (type) => (
//                                         <option
//                                           key={type.value}
//                                           value={type.value}
//                                         >
//                                           {type.label}
//                                         </option>
//                                       )
//                                     )}
//                                   </select>

//                                   <label className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
//                                     <input
//                                       type="checkbox"
//                                       checked={Boolean(
//                                         question.required
//                                       )}
//                                       onChange={(event) =>
//                                         handleQuestionChange(
//                                           questionIndex,
//                                           "required",
//                                           event.target.checked
//                                         )
//                                       }
//                                     />

//                                     Required
//                                   </label>
//                                 </div>
//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleRemoveQuestion(
//                                     questionIndex
//                                   )
//                                 }
//                                 className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
//                               >
//                                 Delete
//                               </button>
//                             </div>

//                             {question.question_type ===
//                               "multiple_choice" && (
//                               <div className="mt-4 rounded-xl bg-gray-50 p-3">
//                                 <div className="mb-3 flex items-center justify-between">
//                                   <h4 className="text-sm font-semibold text-gray-800">
//                                     Options
//                                   </h4>

//                                   <button
//                                     type="button"
//                                     onClick={() =>
//                                       handleAddOption(
//                                         questionIndex
//                                       )
//                                     }
//                                     className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary/90"
//                                   >
//                                     Add option
//                                   </button>
//                                 </div>

//                                 <div className="space-y-2">
//                                   {question.options.length ===
//                                   0 ? (
//                                     <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
//                                       Add one or more choices
//                                       for this multiple-choice
//                                       question.
//                                     </div>
//                                   ) : (
//                                     question.options.map(
//                                       (
//                                         option,
//                                         optionIndex
//                                       ) => (
//                                         <div
//                                           key={`${option.id || "new-option"}-${optionIndex}`}
//                                           className="flex gap-2"
//                                         >
//                                           <input
//                                             value={
//                                               option.option_label
//                                             }
//                                             onChange={(event) =>
//                                               handleOptionChange(
//                                                 questionIndex,
//                                                 optionIndex,
//                                                 "option_label",
//                                                 event.target.value
//                                               )
//                                             }
//                                             onBlur={() =>
//                                               saveOption(
//                                                 questionIndex,
//                                                 optionIndex
//                                               )
//                                             }
//                                             onKeyDown={(event) =>
//                                               handleOptionKeyDown(
//                                                 event,
//                                                 questionIndex,
//                                                 optionIndex
//                                               )
//                                             }
//                                             placeholder="Option label"
//                                             className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
//                                           />

//                                           <button
//                                             type="button"
//                                             onClick={() =>
//                                               handleRemoveOption(
//                                                 questionIndex,
//                                                 optionIndex
//                                               )
//                                             }
//                                             className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
//                                           >
//                                             Remove
//                                           </button>
//                                         </div>
//                                       )
//                                     )
//                                   )}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )
//                       )
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <button
//                     type="button"
//                     onClick={saveTemplateBuilder}
//                     className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
//                   >
//                     {builderMode === "create"
//                       ? "Done"
//                       : "Save Changes"}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {previewTemplateId && (
//         <TemplatePreview
//           template={previewTemplate}
//           details={previewTemplateDetails}
//           loading={previewTemplateLoading}
//           onClose={closeTemplatePreview}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/api.js";
import CompletedFormViewer from "./completedformviwer.jsx";

const questionTypes = [
  { value: "text", label: "Text" },
  { value: "yes_no", label: "Yes / No" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "agreement", label: "Agreement" },
  { value: "confirmation", label: "Confirmation" },
];

const emptyTemplateForm = { name: "", description: "", is_active: true };

const emptyQuestion = {
  id: null,
  question_text: "",
  question_type: "text",
  required: false,
  sort_order: 0,
  options: [],
};

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

function normalizeQuestion(question) {
  return {
    id: question?.id ?? null,
    question_text: question?.question_text || "",
    question_type: question?.question_type || "text",
    required: Boolean(question?.required),
    sort_order: question?.sort_order ?? 0,
    options: (question?.options || []).map((option) => ({
      id: option?.id ?? null,
      option_label: option?.option_label || "",
      sort_order: option?.sort_order ?? 0,
    })),
  };
}

function TemplatePreview({ template, details, loading, onClose }) {
  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-3 py-5">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="h-4 w-80 rounded bg-gray-200" />
            <div className="h-24 rounded-2xl bg-gray-200" />
            <div className="h-24 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  const questions = details?.questions || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-3 py-5">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Form Preview
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
              {details?.name || template?.name || "Form Preview"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-5">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                Form
              </p>

              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {details?.name || template?.name || "Form"}
              </h3>

              {(details?.description || template?.description) && (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {details?.description || template?.description}
                </p>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No questions configured for this form.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const type = question.question_type;

                  return (
                    <div
                      key={question.id || `preview-question-${index}`}
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 font-semibold text-gray-500">
                              {index + 1}.
                            </span>

                            <p className="break-words font-medium text-gray-900">
                              {question.question_text}
                            </p>
                          </div>

                          {question.required && (
                            <p className="mt-1 ml-6 text-xs font-medium text-red-500">
                              Required
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
                          {type?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-4">
                        {type === "text" ? (
                          <input
                            type="text"
                            disabled
                            value=""
                            placeholder="Your response"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
                          />
                        ) : type === "yes_no" ? (
                          <div className="flex flex-wrap gap-3">
                            {["Yes", "No"].map((option) => (
                              <label
                                key={option}
                                className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                              >
                                <input
                                  type="radio"
                                  disabled
                                  name={`preview-question-${question.id}`}
                                  className="h-4 w-4"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ) : type === "agreement" ? (
                          <div className="flex flex-wrap gap-3">
                            {["Agree", "Disagree"].map((option) => (
                              <label
                                key={option}
                                className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                              >
                                <input
                                  type="radio"
                                  disabled
                                  name={`preview-question-${question.id}`}
                                  className="h-4 w-4"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ) : type === "confirmation" ? (
                          <label className="flex cursor-default items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              disabled
                              className="mt-0.5 h-4 w-4 shrink-0"
                            />

                            <span>
                              {question.question_text ||
                                "I confirm that I have read and understood all the information provided in this form."}
                            </span>
                          </label>
                        ) : (
                          <div className="space-y-2">
                            {(question.options || []).map(
                              (option, optionIndex) => (
                                <label
                                  key={
                                    option.id ||
                                    `preview-option-${question.id}-${optionIndex}`
                                  }
                                  className="flex cursor-default items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                                >
                                  <input
                                    type="radio"
                                    disabled
                                    name={`preview-question-${question.id}`}
                                    className="h-4 w-4"
                                  />

                                  <span>{option.option_label}</span>
                                </label>
                              )
                            )}

                            {(question.options || []).length === 0 && (
                              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                                No options configured.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
              Preview only. No customer, completed form, answers, or signature
              are associated with this preview.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminFormsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderMode, setBuilderMode] = useState("create");
  const [builderTemplate, setBuilderTemplate] = useState({
    ...emptyTemplateForm,
  });
  const [builderQuestions, setBuilderQuestions] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [removedOptionIds, setRemovedOptionIds] = useState([]);
  const [selectedCompletedFormId, setSelectedCompletedFormId] = useState(null);

  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const {
    data: templates = [],
    isLoading: templatesLoading,
  } = useQuery({
    queryKey: ["forms-templates"],
    queryFn: async () => {
      const res = await api.get("/forms/templates");
      return res.data || [];
    },
  });

  const {
    data: completedForms = [],
    isLoading: completedFormsLoading,
  } = useQuery({
    queryKey: ["forms-completed"],
    queryFn: async () => {
      const res = await api.get("/forms/completed-forms");
      return res.data || [];
    },
  });

  const selectedTemplate = useMemo(
    () =>
      templates.find(
        (template) =>
          String(template.id) === String(selectedTemplateId)
      ) || null,
    [selectedTemplateId, templates]
  );

  const {
    data: selectedTemplateDetails,
    isLoading: templateDetailsLoading,
    refetch: refetchTemplateDetails,
  } = useQuery({
    queryKey: ["form-template-details", selectedTemplateId],
    queryFn: async () => {
      if (!selectedTemplateId) return null;

      const res = await api.get(
        `/forms/templates/${selectedTemplateId}/with-details`
      );

      return res.data;
    },
    enabled: !!selectedTemplateId,
  });

  const {
    data: previewTemplateDetails,
    isLoading: previewTemplateLoading,
  } = useQuery({
    queryKey: ["form-template-preview", previewTemplateId],
    queryFn: async () => {
      if (!previewTemplateId) return null;

      const res = await api.get(
        `/forms/templates/${previewTemplateId}/with-details`
      );

      return res.data;
    },
    enabled: !!previewTemplateId,
  });

  const openTemplatePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewTemplateId(template.id);
  };

  const closeTemplatePreview = () => {
    setPreviewTemplate(null);
    setPreviewTemplateId(null);
  };

  const openCreateBuilder = () => {
    setBuilderMode("create");
    setBuilderTemplate({ ...emptyTemplateForm });
    setBuilderQuestions([]);
    setRemovedQuestionIds([]);
    setRemovedOptionIds([]);
    setBuilderOpen(true);
  };

  const openEditBuilder = async (template) => {
    try {
      const res = await api.get(
        `/forms/templates/${template.id}/with-details`
      );

      const details = res.data || {};

      setBuilderMode("edit");

      setBuilderTemplate({
        id: details.id,
        name: details.name || "",
        description: details.description || "",
        is_active: details.is_active !== false,
      });

      setBuilderQuestions(
        (details.questions || []).map((question) =>
          normalizeQuestion(question)
        )
      );

      setRemovedQuestionIds([]);
      setRemovedOptionIds([]);
      setBuilderOpen(true);
    } catch (error) {
      console.error("Failed to load template details", error);

      alert(
        error?.response?.data?.error ||
          "Failed to load template details"
      );
    }
  };

  const handleAddQuestion = () => {
    setBuilderQuestions((current) => [
      ...current,
      {
        ...emptyQuestion,
        sort_order: current.length,
      },
    ]);
  };

  const handleQuestionChange = (
    questionIndex,
    field,
    value
  ) => {
    setBuilderQuestions((current) => {
      const updatedQuestions = current.map((question, index) => {
        if (index !== questionIndex) return question;

        if (
          field === "question_type" &&
          value !== "multiple_choice"
        ) {
          return {
            ...question,
            question_type: value,
            options: [],
          };
        }

        return {
          ...question,
          [field]: value,
        };
      });

      if (
        field === "question_type" &&
        value === "confirmation"
      ) {
        const selectedQuestion = updatedQuestions[questionIndex];

        const questionsWithoutSelected = updatedQuestions.filter(
          (_, index) => index !== questionIndex
        );

        const confirmationQuestion = {
          ...selectedQuestion,
          sort_order: questionsWithoutSelected.length,
        };

        return [
          ...questionsWithoutSelected,
          confirmationQuestion,
        ].map((question, index) => ({
          ...question,
          sort_order: index,
        }));
      }

      return updatedQuestions.map((question, index) => ({
        ...question,
        sort_order: index,
      }));
    });
  };

  const ensureQuestionIsPersisted = async (questionIndex) => {
    const question = builderQuestions[questionIndex];

    if (!question) return null;

    let templateId = builderTemplate.id;

    if (!templateId) {
      if (!builderTemplate.name.trim()) {
        alert(
          "Form name is required before adding an option."
        );
        return null;
      }

      const createdTemplate = await api.post(
        "/forms/templates",
        {
          name: builderTemplate.name.trim(),
          description: builderTemplate.description.trim(),
        }
      );

      templateId =
        createdTemplate.data?.id ||
        createdTemplate.data?.template?.id;

      setBuilderTemplate((current) => ({
        ...current,
        id: templateId,
      }));

      setBuilderMode("edit");
    }

    if (question.id) return question.id;

    if (!question.question_text.trim()) {
      alert(
        "Question text is required before adding an option."
      );
      return null;
    }

    const createdQuestion = await api.post(
      "/forms/questions",
      {
        form_template_id: templateId,
        question_text: question.question_text.trim(),
        question_type: question.question_type,
        required: Boolean(question.required),
        sort_order: question.sort_order,
      }
    );

    const questionId = createdQuestion.data?.id;

    setBuilderQuestions((current) =>
      current.map((item, index) =>
        index === questionIndex
          ? {
              ...item,
              id: questionId,
            }
          : item
      )
    );

    return questionId;
  };

  const handleAddOption = async (questionIndex) => {
    try {
      const questionId =
        await ensureQuestionIsPersisted(questionIndex);

      if (!questionId) return;

      setBuilderQuestions((current) =>
        current.map((question, index) => {
          if (index !== questionIndex) return question;

          return {
            ...question,
            options: [
              ...question.options,
              {
                id: null,
                option_label: "",
                sort_order: question.options.length,
              },
            ],
          };
        })
      );
    } catch (error) {
      console.error(
        "Failed to prepare question for an option",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to prepare question for an option"
      );
    }
  };

  const saveOption = async (
    questionIndex,
    optionIndex
  ) => {
    const question = builderQuestions[questionIndex];
    const option = question?.options?.[optionIndex];

    if (
      !question ||
      !option ||
      option.id ||
      !option.option_label.trim()
    ) {
      return;
    }

    try {
      const questionId =
        await ensureQuestionIsPersisted(questionIndex);

      if (!questionId) return;

      const response = await api.post(
        "/forms/options",
        {
          question_id: questionId,
          option_label: option.option_label.trim(),
          sort_order: option.sort_order,
        }
      );

      const createdOption = response.data;

      setBuilderQuestions((current) =>
        current.map((item, index) => {
          if (index !== questionIndex) return item;

          return {
            ...item,
            options: item.options.map(
              (itemOption, indexInQuestion) =>
                indexInQuestion === optionIndex
                  ? {
                      id: createdOption?.id,
                      option_label:
                        createdOption?.option_label ||
                        option.option_label.trim(),
                      sort_order:
                        createdOption?.sort_order ??
                        option.sort_order,
                    }
                  : itemOption
            ),
          };
        })
      );
    } catch (error) {
      console.error(
        "Failed to create form option",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to create form option"
      );
    }
  };

  const handleOptionKeyDown = (
    event,
    questionIndex,
    optionIndex
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const handleOptionChange = (
    questionIndex,
    optionIndex,
    field,
    value
  ) => {
    setBuilderQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map(
            (option, idx) =>
              idx === optionIndex
                ? {
                    ...option,
                    [field]: value,
                  }
                : option
          ),
        };
      })
    );
  };

  const handleRemoveQuestion = (questionIndex) => {
    setBuilderQuestions((current) => {
      const question = current[questionIndex];

      if (question?.id) {
        setRemovedQuestionIds((prev) => [
          ...prev,
          question.id,
        ]);
      }

      return current.filter(
        (_, index) => index !== questionIndex
      );
    });
  };

  const handleRemoveOption = (
    questionIndex,
    optionIndex
  ) => {
    setBuilderQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;

        const option = question.options[optionIndex];

        if (option?.id) {
          setRemovedOptionIds((prev) => [
            ...prev,
            option.id,
          ]);
        }

        return {
          ...question,
          options: question.options.filter(
            (_, idx) => idx !== optionIndex
          ),
        };
      })
    );
  };

  const saveTemplateBuilder = async () => {
    try {
      if (!builderTemplate.name.trim()) {
        alert("Form name is required.");
        return;
      }

      const cleanQuestions = builderQuestions.map(
        (question, index) => ({
          ...question,
          question_text:
            question.question_text.trim(),
          required: Boolean(question.required),
          sort_order: index,
          options: (question.options || []).map(
            (option, optionIndex) => ({
              ...option,
              option_label:
                option.option_label.trim(),
              sort_order: optionIndex,
            })
          ),
        })
      );

      const invalidQuestions =
        cleanQuestions.filter(
          (question) => !question.question_text
        );

      if (invalidQuestions.length > 0) {
        alert(
          "Each question must have text before saving."
        );
        return;
      }

      if (builderMode === "create") {
        const createdTemplate = await api.post(
          "/forms/templates",
          {
            name: builderTemplate.name.trim(),
            description:
              builderTemplate.description.trim(),
          }
        );

        const templateId =
          createdTemplate.data?.id ||
          createdTemplate.data?.template?.id;

        for (const question of cleanQuestions) {
          const createdQuestion = await api.post(
            "/forms/questions",
            {
              form_template_id: templateId,
              question_text:
                question.question_text,
              question_type:
                question.question_type,
              required: question.required,
              sort_order: question.sort_order,
            }
          );

          const questionId =
            createdQuestion.data?.id;

          if (
            question.question_type ===
            "multiple_choice"
          ) {
            for (const option of question.options) {
              if (!option.option_label) continue;

              await api.post(
                "/forms/options",
                {
                  question_id: questionId,
                  option_label:
                    option.option_label,
                  sort_order:
                    option.sort_order,
                }
              );
            }
          }
        }
      } else {
        const templateId = builderTemplate.id;

        await api.put(
          `/forms/templates/${templateId}`,
          {
            name: builderTemplate.name.trim(),
            description:
              builderTemplate.description.trim(),
            is_active:
              builderTemplate.is_active,
          }
        );

        const originalQuestionIds = new Set(
          (selectedTemplateDetails?.questions || [])
            .map((question) => question.id)
        );

        const currentQuestionIds = new Set(
          cleanQuestions
            .filter((question) => question.id)
            .map((question) => question.id)
        );

        for (const questionId of [
          ...originalQuestionIds,
        ]) {
          if (!currentQuestionIds.has(questionId)) {
            await api.delete(
              `/forms/questions/${questionId}`
            );
          }
        }

        for (const question of cleanQuestions) {
          if (question.id) {
            await api.put(
              `/forms/questions/${question.id}`,
              {
                question_text:
                  question.question_text,
                question_type:
                  question.question_type,
                required: question.required,
                sort_order:
                  question.sort_order,
              }
            );
          } else {
            const createdQuestion =
              await api.post(
                "/forms/questions",
                {
                  form_template_id: templateId,
                  question_text:
                    question.question_text,
                  question_type:
                    question.question_type,
                  required: question.required,
                  sort_order:
                    question.sort_order,
                }
              );

            question.id =
              createdQuestion.data?.id;
          }

          const existingQuestionOptions =
            (
              selectedTemplateDetails?.questions ||
              []
            ).find(
              (item) => item.id === question.id
            )?.options || [];

          const questionOptionIds = new Set(
            existingQuestionOptions
              .filter((option) => option.id)
              .map((option) => option.id)
          );

          const currentOptionIds = new Set(
            (question.options || [])
              .filter((option) => option.id)
              .map((option) => option.id)
          );

          for (const optionId of [
            ...questionOptionIds,
          ]) {
            if (!currentOptionIds.has(optionId)) {
              await api.delete(
                `/forms/options/${optionId}`
              );
            }
          }

          for (const option of question.options || []) {
            if (!option.option_label) continue;

            if (option.id) {
              await api.put(
                `/forms/options/${option.id}`,
                {
                  option_label:
                    option.option_label,
                  sort_order:
                    option.sort_order,
                }
              );
            } else {
              await api.post(
                "/forms/options",
                {
                  question_id: question.id,
                  option_label:
                    option.option_label,
                  sort_order:
                    option.sort_order,
                }
              );
            }
          }
        }
      }

      setBuilderOpen(false);
      setBuilderTemplate({
        ...emptyTemplateForm,
      });
      setBuilderQuestions([]);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["forms-templates"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["forms-completed"],
        }),
      ]);

      if (selectedTemplateId) {
        await refetchTemplateDetails();
      }
    } catch (error) {
      console.error(
        "Failed to save form template",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to save form template"
      );
    }
  };

  const deleteTemplate = async (template) => {
    if (!template?.id) return;

    if (!window.confirm("Delete this template?")) {
      return;
    }

    try {
      await api.delete(
        `/forms/templates/${template.id}`
      );

      if (selectedTemplateId === template.id) {
        setSelectedTemplateId(null);
      }

      await queryClient.invalidateQueries({
        queryKey: ["forms-templates"],
      });
    } catch (error) {
      console.error(
        "Failed to delete template",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to delete form template"
      );
    }
  };

  const deleteCompletedForm = async (form) => {
    if (!form?.id) return;

    if (
      !window.confirm(
        "Delete this completed form?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/forms/completed-forms/${form.id}`
      );

      await queryClient.invalidateQueries({
        queryKey: ["forms-completed"],
      });
    } catch (error) {
      console.error(
        "Failed to delete completed form",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to delete completed form"
      );
    }
  };

  const toggleTemplateActive = async (template) => {
    if (!template?.id) return;

    try {
      await api.patch(
        `/forms/templates/${template.id}/deactivate`
      );

      await queryClient.invalidateQueries({
        queryKey: ["forms-templates"],
      });
    } catch (error) {
      console.error(
        "Failed to update template state",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Failed to update template state"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-gray-900">
            Forms
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage form templates and historical completed
            submissions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreateBuilder}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            Add Form
          </button>

          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {[
              {
                key: "templates",
                label: "Templates",
              },
              {
                key: "completed",
                label: "Completed Forms",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "templates" ? (
        <div className="space-y-6">
          {templatesLoading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
              No form templates yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-gray-900">
                        {template.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {template.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        template.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {template.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openTemplatePreview(template)
                      }
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90"
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(
                          template.id
                        );
                        openEditBuilder(template);
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary hover:text-primary"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleTemplateActive(template)
                      }
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      {template.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTemplate(template)
                      }
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Completed Forms
            </h2>
          </div>

          {completedFormsLoading ? (
            <div className="p-6 text-sm text-gray-500">
              Loading completed forms...
            </div>
          ) : completedForms.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No completed forms found.
            </div>
          ) : (
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Form
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {completedForms.map((form) => (
                    <tr
                      key={form.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {form.form_name ||
                            `Form #${form.id}`}
                        </div>

                        <div className="text-xs text-gray-500">
                          #{form.id}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {form.customer_name ||
                          form.customer_id ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            form.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {form.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(form.created_at)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCompletedFormId(
                                form.id
                              );
                              setBuilderOpen(true);
                              setBuilderMode("view");
                            }}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCompletedForm(form)
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
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
      )}

      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-5">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Form builder
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {builderMode === "create"
                    ? "Create Form"
                    : builderMode === "view"
                      ? "Completed Form"
                      : "Edit Form"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setBuilderOpen(false)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            {builderMode === "view" ? (
              <CompletedFormViewer
                completedFormId={selectedCompletedFormId}
              />
            ) : (
              <div className="space-y-5">
                <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Form name
                    </label>

                    <input
                      value={builderTemplate.name}
                      onChange={(event) =>
                        setBuilderTemplate({
                          ...builderTemplate,
                          name: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                      placeholder="Patient intake form"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <textarea
                      value={builderTemplate.description}
                      onChange={(event) =>
                        setBuilderTemplate({
                          ...builderTemplate,
                          description:
                            event.target.value,
                        })
                      }
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                      placeholder="This form captures consultation details before treatment."
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        builderTemplate.is_active !== false
                      }
                      onChange={(event) =>
                        setBuilderTemplate({
                          ...builderTemplate,
                          is_active:
                            event.target.checked,
                        })
                      }
                    />

                    Active template
                  </label>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Questions
                    </h3>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {builderQuestions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                        No questions yet. Start building the
                        form.
                      </div>
                    ) : (
                      builderQuestions.map(
                        (question, questionIndex) => (
                          <div
                            key={`${question.id || "new"}-${questionIndex}`}
                            className="rounded-2xl border border-gray-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 space-y-3">
                                <input
                                  value={
                                    question.question_text
                                  }
                                  onChange={(event) =>
                                    handleQuestionChange(
                                      questionIndex,
                                      "question_text",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Question text"
                                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                                />

                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                  <select
                                    value={
                                      question.question_type
                                    }
                                    onChange={(event) =>
                                      handleQuestionChange(
                                        questionIndex,
                                        "question_type",
                                        event.target.value
                                      )
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                                  >
                                    {questionTypes.map(
                                      (type) => (
                                        <option
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </option>
                                      )
                                    )}
                                  </select>

                                  <label className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(
                                        question.required
                                      )}
                                      onChange={(event) =>
                                        handleQuestionChange(
                                          questionIndex,
                                          "required",
                                          event.target.checked
                                        )
                                      }
                                    />

                                    Required
                                  </label>
                                </div>

                                {question.question_type ===
                                  "confirmation" && (
                                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        disabled
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                      />

                                      <div>
                                        <p className="text-sm font-medium text-gray-800">
                                          {question.question_text ||
                                            "I confirm that I have read and understood all the information provided in this form."}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                          This is the final confirmation
                                          checkbox. When duplicating a
                                          completed form, this checkbox
                                          will be reset and the customer
                                          must check it again.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveQuestion(
                                    questionIndex
                                  )
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>

                            {question.question_type ===
                              "multiple_choice" && (
                              <div className="mt-4 rounded-xl bg-gray-50 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-gray-800">
                                    Options
                                  </h4>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddOption(
                                        questionIndex
                                      )
                                    }
                                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-white hover:bg-secondary/90"
                                  >
                                    Add option
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {question.options.length ===
                                  0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                                      Add one or more choices
                                      for this multiple-choice
                                      question.
                                    </div>
                                  ) : (
                                    question.options.map(
                                      (
                                        option,
                                        optionIndex
                                      ) => (
                                        <div
                                          key={`${option.id || "new-option"}-${optionIndex}`}
                                          className="flex gap-2"
                                        >
                                          <input
                                            value={
                                              option.option_label
                                            }
                                            onChange={(event) =>
                                              handleOptionChange(
                                                questionIndex,
                                                optionIndex,
                                                "option_label",
                                                event.target.value
                                              )
                                            }
                                            onBlur={() =>
                                              saveOption(
                                                questionIndex,
                                                optionIndex
                                              )
                                            }
                                            onKeyDown={(event) =>
                                              handleOptionKeyDown(
                                                event,
                                                questionIndex,
                                                optionIndex
                                              )
                                            }
                                            placeholder="Option label"
                                            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                                          />

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveOption(
                                                questionIndex,
                                                optionIndex
                                              )
                                            }
                                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveTemplateBuilder}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    {builderMode === "create"
                      ? "Done"
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {previewTemplateId && (
        <TemplatePreview
          template={previewTemplate}
          details={previewTemplateDetails}
          loading={previewTemplateLoading}
          onClose={closeTemplatePreview}
        />
      )}
    </div>
  );
}