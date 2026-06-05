"use client";

import { useState, useEffect } from "react";
import api from "../../../../lib/api";

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
     const response = await api.get(
  "/notifications/admin/1"
);

        const data = response.data || [];
        // Sort by created_at descending (newest first)
        const sorted = data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setNotifications(sorted);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle marking notification as read
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Already read

    try {
      setMarkingAsRead(id);

     

await api.put(
  `/notifications/${id}/read`
);

      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 text-lg font-normal text-gray-500">
              ({unreadCount})
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {notifications.length === 0
            ? "No notifications yet"
            : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔔</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Notifications Yet
          </h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            You're all caught up! Check back later for updates.
          </p>
        </div>
      ) : (
        /* Notifications Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => {
            const isUnread = !notification.is_read;
            const notificationDate = new Date(notification.created_at);
            const formattedTime = notificationDate.toLocaleString("en-US", {
              timeZone: "America/Montreal",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id, isUnread === false)}
                className={`cursor-pointer rounded-2xl border transition-all duration-300 p-5 ${
                  isUnread
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md shadow-blue-100/50"
                    : "bg-white border-gray-100 hover:shadow-md"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-sm line-clamp-2 ${
                        isUnread
                          ? "text-gray-800"
                          : "text-gray-600"
                      }`}
                    >
                      {notification.title}
                    </h3>
                  </div>

                  {/* Unread Badge */}
                  {isUnread && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                        New
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {notification.message}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formattedTime}
                  </span>

                  {/* Read Status Indicator */}
                  {isUnread && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id, false);
                        }}
                        disabled={markingAsRead === notification.id}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
                      >
                        {markingAsRead === notification.id ? "Marking..." : "Mark as read"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Type Badge */}
                {notification.type && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                      {notification.type.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
