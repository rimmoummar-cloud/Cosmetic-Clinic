"use client"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowingButton } from "../../../../../components/GlowingButtom";

export default function ServiceCTA() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <GlowingButton variant="primary">
        <Link href="/booking" className="inline-flex items-center gap-2">
          Book Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </GlowingButton>
    </div>
  );
}
