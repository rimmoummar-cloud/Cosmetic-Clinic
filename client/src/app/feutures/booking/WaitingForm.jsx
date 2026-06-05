"use client";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  X,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GlowingButton } from "../../components/GlowingButtom";
import { formatTimeForDisplay, formatDateForDisplay } from "./dataBooking";
import api from "../../../lib/api.js";

export function WaitingForm({ 
  isOpen, 
  onClose, 
  selectedServices = [], 
  selectedDate = "" 
}) {
  // Form State
  const [period, setPeriod] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!period) {
      toast.error("Please select a preferred period.");
      return;
    }

    if (selectedServices.length === 0 || !selectedDate) {
      toast.error("Missing service or date information.");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare payload
      const payload = {
        customer_name: userInfo.name,
        customer_email: userInfo.email,
        customer_phone: userInfo.phone,
        requested_date: selectedDate,
        period: period,
        notes: note || "",
        services: selectedServices.map(service => ({
          id: service.id,
          duration_minutes: service.duration_minutes,
          price: service.price
        }))
      };

      // Send to backend
      await api.post("/waiting-list", payload);

      toast.success("You've been added to the waiting list! We'll notify you when a slot becomes available.");

      // Reset form
      setPeriod("");
      setUserInfo({ name: "", email: "", phone: "" });
      setNote("");

      onClose();
    } catch (error) {
      console.error("Waiting list submission error:", error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to join waiting list. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex justify-center z-[10000] overflow-y-auto pt-6 pb-6"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl mx-auto px-4" onClick={(e) => e.stopPropagation()}>
        <motion.div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Join Waiting List</h2>
              <p className="text-sm text-gray-500 mt-1">We'll notify you when a slot opens up</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* SUMMARY SECTION */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
              <h4 className="font-semibold text-gray-800">Requested Services</h4>
              
              {selectedServices.length > 0 ? (
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="text-sm text-gray-700">
                      <span className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200">
                        {service.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No services selected</p>
              )}
            </div>

            {/* DATE SECTION */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
              <h4 className="font-semibold text-gray-800">Requested Date</h4>
              <div className="text-sm text-gray-700">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-gray-200 font-medium">
                  {formatDateForDisplay(selectedDate)}
                </span>
              </div>
            </div>

            {/* PERIOD SELECTOR */}
            <div>
              <label className="block text-gray-800 mb-3 font-medium">Preferred Period *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Morning", value: "morning" },
                  { label: "Afternoon", value: "afternoon" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={`p-4 rounded-xl border transition font-medium ${
                      period === option.value
                        ? "border-black bg-gray-100 text-gray-800"
                        : "border-gray-200 bg-white hover:border-black text-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOMER FIELDS */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium">
                  <Mail className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium">
                  <Phone className="w-4 h-4" />
                  Phone *
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  required
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>

            {/* NOTES FIELD */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium">
                <MessageSquare className="w-4 h-4" />
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests or preferences?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-2">
              <GlowingButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </GlowingButton>
              <GlowingButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Join Waiting List"
                )}
              </GlowingButton>
            </div>

          </form>

        </motion.div>
      </div>
    </motion.div>
  );
}
