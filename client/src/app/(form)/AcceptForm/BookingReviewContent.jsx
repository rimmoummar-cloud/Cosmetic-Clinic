
"use client";

import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const API_BASE =
process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Failed request: ${res.status}`);
  }

  return data;
}

export default function BookingReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [disclaimers, setDisclaimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const sigRef = useRef(null);

  useEffect(() => {
    if (token) fetchDisclaimers();
  }, [token]);

  const fetchDisclaimers = async () => {
    try {
      setLoading(true);

      const res = await fetchJson(
        `${API_BASE}/disclaimers/booking/${token}`
      );

      setDisclaimers(res);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load disclaimers");
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  const getSignature = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return null;

    return sigRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
  };

  const handleAccept = async () => {
    if (submitting || completed) return;

    if (!accepted) {
      toast.error("Please accept the terms first");
      return;
    }

    const signature = getSignature();

    if (!signature) {
      toast.error("Please add your signature first");
      return;
    }

    if (!token) {
      toast.error("Missing booking token");
      return;
    }

    try {
      setSubmitting(true);

      const disclaimerIds = disclaimers.map((d) => d.id);

      const res = await fetch(
        `${API_BASE}/acceptance/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            disclaimerIds,
            signature,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      // if (!res.ok) {
      //   throw new Error(data?.message || "Request failed");
      // }
if (!res.ok) {
  if (res.status === 409) {
    toast.success("You have already confirmed this booking ✔️");
    setCompleted(true);
    return;
  }

  toast.error(data?.message || "Something went wrong");
  return;
}
      setCompleted(true);

      toast.success("Booking confirmed successfully ");

      // setTimeout(() => {
      //   router.push("/booking-success");
      // }, 1500);

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to confirm booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f6f7f3]">
        <span className="loading loading-spinner loading-lg text-green-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f3] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#e8ece3] overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-8 pb-6 border-b border-[#eef1ea] text-center">

          <div className="w-16 h-16 rounded-full bg-[#e7f4df] flex items-center justify-center text-3xl mb-4 mx-auto">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-[#1f2937]">
            Treatment Warning
          </h1>

          <p className="text-sm text-[#6b7280] mt-2 leading-7">
            Please review all treatment information carefully before confirming your booking.
          </p>

        </div>

        {/* Content */}
        <div className="px-7 py-6">

          <div className="space-y-7">
            {disclaimers.map((item) => (
              <div key={item.id} className="pb-6 border-b border-[#eef1ea]">

                <div className="mb-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e7f4df] text-[#4b7b37] uppercase tracking-wide mb-3">
                    {item.type}
                  </div>

                  <h2 className="text-lg font-semibold text-[#1f2937]">
                    {item.title}
                  </h2>

                  <p className="text-sm text-[#7a7a7a] mt-1">
                    {item.service_name}
                  </p>
                </div>

                <p className="text-[15px] leading-8 text-[#4b5563]">
                  {item.description}
                </p>

              </div>
            ))}
          </div>

          {/* Checkbox */}
          <div className="mt-8 bg-[#f7f9f5] rounded-2xl p-5 border border-[#e8ece3]">

            <label className="flex items-start gap-4 cursor-pointer">

              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-6 h-6 accent-[#7aa35a] mt-1"
                disabled={completed}
              />

              <span className="text-sm leading-7 text-[#4b5563]">
                I confirm that I have read and understood all treatment risks,
                warnings, and medical disclaimers.
              </span>

            </label>

          </div>

          {/* Signature */}
          <div className="mt-6 border rounded-xl bg-white">
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{
                className: "w-full h-40",
              }}
            />
          </div>

          <button
            onClick={clearSignature}
            disabled={submitting || completed}
            className="text-sm text-gray-500 mt-2"
          >
            Clear signature
          </button>

          {/* Submit */}
          <button
            onClick={handleAccept}
            disabled={!accepted || submitting || completed}
            className={`w-full h-14 rounded-2xl transition text-white font-semibold text-base mt-7 shadow-md ${
              accepted && !submitting && !completed
                ? "bg-[#7aa35a] hover:bg-[#6d934f] cursor-pointer"
                : "bg-gray-300 cursor-not-allowed opacity-70"
            }`}
          >
            {submitting
              ? "Confirming..."
              : completed
              ? "Confirmed ✓"
              : "Accept & Confirm Booking"}
          </button>

        </div>

      </div>
    </div>
  );
}