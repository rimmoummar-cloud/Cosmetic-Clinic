"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/api.js";
import { useMemo } from "react";

function isValidId(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

/**
 * Safely extracts signature value from a completed form object.
 */
function getSignatureValue(form) {
  if (!form) return null;

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

const formatDateTime = (value) => {
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

export default function CompletedFormViewer({
  completedFormId,
  expectedCustomerId = null,
  isLoading: externalLoading,
}) {
  const {
    data: completedForm,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "completed-form-details-viewer",
      completedFormId,
      expectedCustomerId,
    ],

    queryFn: async () => {
      if (!completedFormId) return null;

      const res = await api.get(
        `/forms/completed-forms/${completedFormId}/with-details`
      );

      const form = res.data;

      if (
        isValidId(expectedCustomerId) &&
        !isValidId(form?.customer_id)
      ) {
        throw new Error(
          "The completed form does not contain a valid customer ID."
        );
      }

      if (
        isValidId(expectedCustomerId) &&
        isValidId(form?.customer_id) &&
        String(form.customer_id) !==
          String(expectedCustomerId)
      ) {
        throw new Error(
          "Customer ID mismatch: this completed form does not belong to the selected customer."
        );
      }

      return form;
    },

    enabled: !!completedFormId,
  });

  const isFormLoading =
    isLoading || externalLoading;

  const customerName = useMemo(() => {
    return (
      completedForm?.customer?.name ||
      completedForm?.customer_name ||
      "Unknown Customer"
    );
  }, [completedForm]);

  const customerEmail = useMemo(() => {
    return (
      completedForm?.customer?.email ||
      completedForm?.customer_email ||
      "-"
    );
  }, [completedForm]);

  const customerPhone = useMemo(() => {
    return (
      completedForm?.customer?.phone ||
      completedForm?.customer_phone ||
      "-"
    );
  }, [completedForm]);

  const formName = useMemo(() => {
    return (
      completedForm?.form_name ||
      completedForm?.form_template?.name ||
      "Completed Form"
    );
  }, [completedForm]);

  const formStatus = useMemo(() => {
    return completedForm?.status || "unknown";
  }, [completedForm]);

  const appointmentId = useMemo(() => {
    return (
      completedForm?.appointment?.id ||
      completedForm?.appointment_id ||
      null
    );
  }, [completedForm]);

  const appointmentDate = useMemo(() => {
    if (!completedForm?.appointment) return null;

    return (
      completedForm.appointment.booking_datetime ||
      completedForm.appointment.date ||
      completedForm.appointment.scheduled_date ||
      null
    );
  }, [completedForm]);

  const appointmentStatus = useMemo(() => {
    return completedForm?.appointment?.status || null;
  }, [completedForm]);

  const signatureValue = useMemo(() => {
    return getSignatureValue(completedForm);
  }, [completedForm]);

  const questions = useMemo(() => {
    return completedForm?.questions || [];
  }, [completedForm]);

  if (isFormLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-lg bg-gray-200" />
        <div className="h-24 rounded-lg bg-gray-200" />
        <div className="h-48 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">
          Failed to load form details
        </p>

        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  if (!completedForm) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
        No form data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
          Customer Information
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-600">Name</p>
            <p className="mt-1 font-medium text-gray-900">
              {customerName}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Email</p>
            <p className="mt-1 break-all font-medium text-gray-900">
              {customerEmail}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Phone</p>
            <p className="mt-1 font-medium text-gray-900">
              {customerPhone}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
          Form Information
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-600">
              Form Name
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {formName}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Status
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  formStatus === "completed"
                    ? "bg-green-500"
                    : formStatus === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                }`}
              />

              <span className="font-medium capitalize text-gray-900">
                {formStatus}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Form ID
            </p>

            <p className="mt-1 font-medium text-gray-900">
              #{completedForm.id}
            </p>
          </div>
        </div>
      </div>

      {(appointmentId || appointmentDate) && (
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Appointment Information
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {appointmentId && (
              <div>
                <p className="text-xs text-gray-600">
                  Appointment ID
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  #{appointmentId}
                </p>
              </div>
            )}

            {appointmentStatus && (
              <div>
                <p className="text-xs text-gray-600">
                  Status
                </p>

                <p className="mt-1 font-medium capitalize text-gray-900">
                  {appointmentStatus}
                </p>
              </div>
            )}

            {appointmentDate && (
              <div>
                <p className="text-xs text-gray-600">
                  Date/Time
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(appointmentDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Customer Signature
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Signature saved with this form
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          {signatureValue ? (
            <img
              src={signatureValue}
              alt="Customer signature"
              className="h-36 w-full object-contain"
            />
          ) : (
            <div className="flex h-36 items-center justify-center text-sm text-gray-500">
              No signature recorded.
            </div>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          <p className="px-1 text-xs uppercase tracking-[0.16em] text-gray-400">
            Form Responses
          </p>

          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-medium text-gray-900">
                  {question.question_text}
                </p>

                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
                  {question.question_type?.replace(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
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
          ))}
        </div>
      )}

      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No questions in this form.
        </div>
      )}
    </div>
  );
}