"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../../lib/api.js";
import { useMemo, useState } from "react";

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
    <div className="p-12 text-center">
      <div className="mb-3 text-4xl">📝</div>

      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        No Notes
      </h3>

      <p className="text-gray-600">
        This customer has no notes yet.
      </p>
    </div>
  );
}

export default function CustomerNotesPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params.customerId;

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState(null);

  const [noteText, setNoteText] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [deletingNoteId, setDeletingNoteId] =
    useState(null);

  const [actionError, setActionError] =
    useState("");

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
    data: notes = [],
    isLoading: notesLoading,
    error: notesError,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["customer-notes", customerId],

    queryFn: async () => {
      const res = await api.get(
        `/note/customer/${customerId}`
      );

      const responseData = res.data;

      if (Array.isArray(responseData)) {
        return responseData;
      }

      if (Array.isArray(responseData?.notes)) {
        return responseData.notes;
      }

      if (Array.isArray(responseData?.data)) {
        return responseData.data;
      }

      return [];
    },

    enabled: !!customerId,
  });

  const openAddModal = () => {
    setEditingNote(null);
    setNoteText("");
    setActionError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setNoteText(note?.note || "");
    setActionError("");
    setIsAddModalOpen(true);
  };

  const closeNoteModal = () => {
    if (saving) return;

    setIsAddModalOpen(false);
    setEditingNote(null);
    setNoteText("");
    setActionError("");
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();

    const trimmedNote = noteText.trim();

    if (!trimmedNote) {
      setActionError("Please enter a note.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      if (editingNote) {
        await api.put(
          `/note/${editingNote.id}`,
          {
            note: trimmedNote,
          }
        );
      } else {
        await api.post(
          `/note/customer/${customerId}`,
          {
            note: trimmedNote,
          }
        );
      }

      await refetchNotes();
      closeNoteModal();
    } catch (error) {
      console.error(
        "Failed to save note:",
        error
      );

      setActionError(
        error?.response?.data?.error ||
          "Failed to save note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (
      !confirm(
        "Are you sure you want to delete this note?"
      )
    ) {
      return;
    }

    try {
      setDeletingNoteId(noteId);
      setActionError("");

      await api.delete(`/note/${noteId}`);

      await refetchNotes();
    } catch (error) {
      console.error(
        "Failed to delete note:",
        error
      );

      setActionError(
        error?.response?.data?.error ||
          "Failed to delete note. Please try again."
      );
    } finally {
      setDeletingNoteId(null);
    }
  };

  const isLoading =
    customerLoading || notesLoading;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (notesError) {
    return (
      <ErrorState
        error={notesError}
        onRetry={() => refetchNotes()}
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
            Customer Notes
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
          title="Go back to customer"
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
            Customer Notes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Notes for{" "}
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

      {actionError && !isAddModalOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Notes{" "}
              {notes.length > 0 &&
                `(${notes.length})`}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              All notes saved for this customer
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            + Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Note
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Created
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Updated
                  </th>

                  <th className="px-6 py-3 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {notes.map((note) => (
                  <tr
                    key={note.id}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="max-w-xl px-6 py-4">
                      <p className="whitespace-pre-wrap break-words font-medium text-gray-900">
                        {note.note || "-"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {formatDate(
                        note.created_at
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {formatDate(
                        note.updated_at ||
                          note.created_at
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(note)
                          }
                          className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNote(
                              note.id
                            )
                          }
                          disabled={
                            deletingNoteId ===
                            note.id
                          }
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingNoteId ===
                          note.id
                            ? "Deleting..."
                            : "Delete"}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer Note
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {editingNote
                    ? "Edit Note"
                    : "Add Note"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {customer.name ||
                    "Customer"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeNoteModal}
                disabled={saving}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSaveNote}
            >
              <div>
                <label
                  htmlFor="customer-note"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Note
                </label>

                <textarea
                  id="customer-note"
                  value={noteText}
                  onChange={(event) =>
                    setNoteText(
                      event.target.value
                    )
                  }
                  placeholder="Write a note about this customer..."
                  rows={7}
                  disabled={saving}
                  className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {actionError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeNoteModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !noteText.trim()
                  }
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingNote
                      ? "Save Changes"
                      : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}