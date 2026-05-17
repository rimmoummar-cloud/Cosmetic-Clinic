"use client";

import { useState } from "react";
import { messages } from "../../../data/bookings";

export default function AdminMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const selected = messages.find((m) => m.id === selectedMessage);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">
          Customer inquiries and messages ({messages.filter((m) => !m.read).length} unread)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-3">
          {messages.map((msg) => (
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
                    {msg.customerName[0]}
                  </div>
                  {!msg.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm ${msg.read ? "font-medium" : "font-bold"}`}>
                      {msg.customerName}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">{msg.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{msg.message}</p>
                  <div className="flex gap-2 mt-2">
                    {msg.replied && (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Replied</span>
                    )}
                    {!msg.read && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {selected.customerName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selected.customerName}</h3>
                    <p className="text-sm text-gray-500">
                      {selected.customerEmail} · {selected.phone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-cream rounded-2xl p-5 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.message}</p>
                  <p className="text-xs text-gray-400 mt-3">{selected.date}</p>
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
                  <div className="flex justify-end mt-3">
                    <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                      Send Reply
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
    </div>
  );
}
