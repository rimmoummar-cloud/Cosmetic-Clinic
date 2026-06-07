"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../../../lib/api";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

 const fetchMessages = async () => {
  try {
    setIsLoading(true);
    setError(null);

    const response = await api.get("/boxConect");

    setMessages(response.data.data || []);

  } catch (err) {
    setError("Failed to load messages");
    toast.error("Failed to load messages");
    setMessages([]);
  } finally {
    setIsLoading(false);
  }
};

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    if (!selected) {
      toast.error("No message selected");
      return;
    }

    setIsSending(true);
    try {
      await api.post("/boxConect/reply", {
        messageId: selected.id,
        reply: replyText.trim(),
      });

      toast.success("Reply sent successfully");
      setReplyText("");
      
      // Refresh messages list while keeping selection
      const currentSelectedId = selectedMessage;
      await fetchMessages();
      setSelectedMessage(currentSelectedId);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send reply";
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selected) {
      toast.error("No message selected");
      return;
    }

    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/boxConect/${selected.id}`);
      toast.success("Message deleted successfully");
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete message";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const safeMessages = Array.isArray(messages) ? messages : [];
  const selected = safeMessages.find((m) => m.id === selectedMessage);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">
          Customer inquiries and messages ({safeMessages.length} total)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-3">
            {safeMessages.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500">No messages yet</p>
              </div>
            ) : (
              safeMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                    selectedMessage === msg.id
                      ? "border-primary bg-accent/50 shadow-md"
                      : "border-gray-100 bg-white hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                        {msg.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium">
                          {msg.name}
                        </h3>
                        <span className="text-xs text-gray-400 shrink-0">{msg.created_at}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{msg.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {selected.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selected.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selected.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-cream rounded-2xl p-5 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
                    <p className="text-xs text-gray-400 mt-3">{selected.created_at}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      placeholder="Type your reply..."
                      className="w-full p-4 border border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={handleDeleteMessage}
                        disabled={isDeleting}
                        className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={isSending}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <p className="text-4xl mb-4">💬</p>
                <h3 className="font-semibold font-[var(--font-heading)] text-lg mb-2">No Message Selected</h3>
                <p className="text-sm text-gray-500">Select a message from the list to view and reply</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
