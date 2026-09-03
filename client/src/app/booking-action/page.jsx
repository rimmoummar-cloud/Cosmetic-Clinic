"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "../../lib/api.js";

export default function BookingActionPage() {
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");
  const reminderId = searchParams.get("reminderId");
  const action = searchParams.get("action");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bookingId || !reminderId || !action) {
      setStatus("error");
      setMessage("Invalid booking link.");
      return;
    }

    if (action !== "confirm" && action !== "cancel") {
      setStatus("error");
      setMessage("Invalid booking action.");
      return;
    }

    const processBookingAction = async () => {
      try {
        const endpoint =
          action === "confirm"
            ? `/booking-reminders/confirm/${bookingId}/${reminderId}`
            : `/booking-reminders/cancel/${bookingId}/${reminderId}`;

        await api.get(endpoint);

        setStatus("success");

        if (action === "confirm") {
          setMessage("Your booking has been confirmed successfully.");
        } else {
          setMessage("Your booking has been cancelled successfully.");
        }
      } catch (error) {
        console.error("Booking action error:", error);

        setStatus("error");

        setMessage(
          action === "confirm"
            ? "We couldn't confirm your booking. Please try again."
            : "We couldn't cancel your booking. Please try again."
        );
      }
    };

    processBookingAction();
  }, [bookingId, reminderId, action]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">

        {status === "loading" && (
          <>
            <div className="text-4xl mb-4">⏳</div>

            <h1 className="text-xl font-semibold text-gray-900">
              Please wait...
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              We are processing your booking.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-4">
              {action === "confirm" ? "✅" : "❌"}
            </div>

            <h1 className="text-xl font-semibold text-gray-900">
              {action === "confirm"
                ? "Booking Confirmed"
                : "Booking Cancelled"}
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl mb-4">⚠️</div>

            <h1 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              {message}
            </p>
          </>
        )}

      </div>
    </div>
  );
}