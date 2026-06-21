"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { GlowingButton } from "../../../../../components/GlowingButtom";
import { BookingForm } from "../../../../../feutures/booking/BookingForm";

export default function ServiceCTA() {
  const [openBooking, setOpenBooking] = useState(false);

  return (
    <>
      <BookingForm
        isOpen={openBooking}
        onClose={() => setOpenBooking(false)}
      />

      <div className="fixed bottom-6 right-6 z-40">
        <GlowingButton
          variant="primary"
          onClick={() => setOpenBooking(true)}
        >
          <span className="inline-flex items-center gap-2">
            Book Now
            <ArrowRight className="w-4 h-4" />
          </span>
        </GlowingButton>
      </div>
    </>
  );
}