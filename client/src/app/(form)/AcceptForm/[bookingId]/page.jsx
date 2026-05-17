"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import toast from "react-hot-toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:5000";

async function fetchJson(
  url,
  options = {}
) {

  const res = await fetch(
    url,
    options
  );

  if (!res.ok) {

    throw new Error(
      `Failed request: ${res.status}`
    );
  }

  return res.json();
}

export default function BookingReviewPage() {

  const params = useParams();

  const bookingId =
    params.bookingId;

  const [disclaimers, setDisclaimers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [accepted, setAccepted] =
    useState(false);

  useEffect(() => {

    if (bookingId) {

      fetchDisclaimers();
    }

  }, [bookingId]);

  const fetchDisclaimers =
    async () => {

      try {

        const res =
          await fetchJson(
            `${API_BASE}/api/disclaimers/booking/${bookingId}`
          );

        setDisclaimers(res);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load disclaimers"
        );

      } finally {

        setLoading(false);
      }
    };

  const handleAccept =
    async () => {

      if (!accepted) {

        toast.error(
          "Please accept the terms first"
        );

        return;
      }

      try {

        const disclaimerIds =
          disclaimers.map(
            (d) => d.id
          );

        await fetchJson(
          `${API_BASE}/api/acceptance/${bookingId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              disclaimerIds,
            }),
          }
        );

        toast.success(
          "Booking confirmed successfully 💖"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to confirm booking"
        );
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

      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-[32px]
          shadow-[0_10px_40px_rgba(0,0,0,0.08)]
          border border-[#e8ece3]
          overflow-hidden
        "
      >

        {/* Header */}

        <div className="px-7 pt-8 pb-6 border-b border-[#eef1ea]">

          <div className="flex flex-col items-center text-center">

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#e7f4df]
                flex
                items-center
                justify-center
                text-3xl
                mb-4
              "
            >

              ⚠️

            </div>

            <h1 className="text-2xl font-bold text-[#1f2937]">

              Treatment Warning

            </h1>

            <p className="text-sm text-[#6b7280] mt-2 leading-7">

              Please review all treatment
              information carefully before
              confirming your booking.

            </p>

          </div>

        </div>

        {/* Content */}

        <div className="px-7 py-6">

          <div className="space-y-7">

            {disclaimers.map((item) => (

              <div
                key={item.id}
                className="pb-6 border-b border-[#eef1ea]"
              >

                <div className="mb-2">

                  <div
                    className="
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-[#e7f4df]
                      text-[#4b7b37]
                      uppercase
                      tracking-wide
                      mb-3
                    "
                  >

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

          <div
            className="
              mt-8
              bg-[#f7f9f5]
              rounded-2xl
              p-5
              border border-[#e8ece3]
            "
          >

            <label className="flex items-start gap-4 cursor-pointer">

              <div className="relative mt-1">

                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) =>
                    setAccepted(
                      e.target.checked
                    )
                  }
                  className="
                    peer
                    appearance-none
                    w-6
                    h-6
                    rounded-md
                    border-2
                    border-[#b8c7ad]
                    bg-white
                    checked:bg-[#7aa35a]
                    checked:border-[#7aa35a]
                    transition
                    cursor-pointer
                  "
                />

                <svg
                  className="
                    absolute
                    w-4
                    h-4
                    text-white
                    top-1
                    left-1
                    hidden
                    peer-checked:block
                    pointer-events-none
                  "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />

                </svg>

              </div>

              <span className="text-sm leading-7 text-[#4b5563]">

                I confirm that I have read
                and understood all
                treatment risks, warnings,
                and medical disclaimers
                related to my selected
                services.

              </span>

            </label>

          </div>

          {/* Button */}

          <button
            onClick={handleAccept}
            className="
              w-full
              h-14
              rounded-2xl
              bg-[#7aa35a]
              hover:bg-[#6d934f]
              transition
              text-white
              font-semibold
              text-base
              mt-7
              shadow-md
            "
          >

            Accept & Confirm Booking

          </button>

        </div>

      </div>

    </div>
  );
}