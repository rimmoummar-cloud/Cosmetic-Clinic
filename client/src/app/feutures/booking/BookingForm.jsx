"use client";
import { useMemo, useState } from "react";
import { Sparkles, Calendar, Clock, User, Mail, Phone, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
void motion;
import { GlowingButton } from "../../components/GlowingButtom";
import { FloatingElement } from "../../components/AnimatedElements";

const serviceCategories = [
  {
    name: "Face",
    services: [
      { name: "Classic Hydrating Facial", price: 120, duration: 60 },
      { name: "Anti-Aging Treatment", price: 180, duration: 75 },
      { name: "Brightening Facial", price: 150, duration: 60 },
      { name: "Acne Treatment Facial", price: 140, duration: 60 },
    ],
  },
  {
    name: "Body",
    services: [
      { name: "Body Scrub & Wrap", price: 180, duration: 90 },
      { name: "Cellulite Reduction", price: 160, duration: 60 },
      { name: "Body Contouring", price: 220, duration: 75 },
      { name: "Relaxation Massage", price: 140, duration: 60 },
    ],
  },
  {
    name: "Laser",
    services: [
      { name: "Laser Hair Removal - Full Face", price: 110, duration: 45 },
      { name: "Laser Hair Removal - Legs", price: 190, duration: 60 },
      { name: "Laser Skin Rejuvenation", price: 210, duration: 70 },
    ],
  },
  {
    name: "Wellness",
    services: [
      { name: "Aromatherapy Session", price: 110, duration: 60 },
      { name: "Hot Stone Therapy", price: 150, duration: 75 },
      { name: "Reflexology", price: 90, duration: 45 },
      { name: "Spa Day Package", price: 350, duration: 180 },
    ],
  },
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const generateDates = () => {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: date.toISOString().split("T")[0],
    };
  });
};

export function BookingForm({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(serviceCategories[0].name);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [note, setNote] = useState("");

  const availableDates = useMemo(() => generateDates(), []);

  const totalPrice = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = selectedServices.reduce((sum, item) => sum + item.duration, 0);

  const toggleService = (service) => {
    const exists = selectedServices.find((s) => s.name === service.name);
    if (exists) {
      setSelectedServices((prev) => prev.filter((s) => s.name !== service.name));
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
  };

  const handleNextFromServices = () => {
    if (!selectedServices.length) {
      toast.error("Please select at least one service.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please choose a date and time.");
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedServices.length || !selectedDate || !selectedTime) {
      toast.error("Please complete all steps before booking.");
      return;
    }
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      toast.error("Please fill your contact details.");
      return;
    }
    toast.success("Your appointment has been booked! We'll send you a confirmation shortly.");
    setCurrentStep(1);
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTime("");
    setUserInfo({ name: "", email: "", phone: "" });
    setNote("");
  };

  const formatCurrency = (value) => `$${value}`;

  const computedSchedule = () => {
    if (!selectedTime) return [];
    const parseTime = (timeStr) => {
      const [raw, period] = timeStr.split(" ");
      let [hours, minutes] = raw.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    const start = parseTime(selectedTime);
    let cursor = start;
    return selectedServices.map((service) => {
      const end = cursor + service.duration;
      const format = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const period = h >= 12 ? "PM" : "AM";
        const normalized = h % 12 || 12;
        return `${normalized}:${m.toString().padStart(2, "0")} ${period}`;
      };
      const slot = { ...service, start: format(cursor), end: format(end) };
      cursor = end;
      return slot;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center z-[9999] overflow-y-auto pt-4 pb-4"
      onClick={onClose}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 box-border" onClick={(e) => e.stopPropagation()}>
        <section className="relative z-[9999]">
          <div className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white rounded-full px-3 py-1 shadow">
              x
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#D4AF7A]/20 border border-[#D4AF7A]/20 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-[#FFD700]/30 via-[#E8DDD0]/50 to-[#E8C7C3]/30 p-6 relative overflow-hidden">
                <FloatingElement delay={1} duration={4}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD700]/40 to-transparent rounded-full blur-2xl" />
                </FloatingElement>

                <h2 className="text-3xl text-[#2C2C2C] relative z-10" style={{ fontFamily: "var(--font-serif)" }}>
                  Appointment Details
                </h2>
                {/* <p className="text-[#6B6B6B] mt-2 relative z-10">Follow the steps to complete your booking</p> */}
              </div>

       <div className="px-6 pt-4 bg-white">
  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.1em] text-[#6B6B6B] pb-2 justify-start lg:justify-center bg-white">
    {["Services", "Schedule", "Review"].map((label, idx) => (
      <div key={label} className="flex items-center gap-2 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
            currentStep >= idx + 1
              ? "bg-white text-[#2C2C2C] border-[#D4AF7A]"
              : "bg-white text-[#6B6B6B] border-[#E8DDD0]"
          }`}
        >
          {idx + 1}
        </div>
        <span className={currentStep >= idx + 1 ? "text-[#2C2C2C]" : ""}>
          {label}
        </span>
      </div>
    ))}
  </div>
</div>

              <form onSubmit={handleSubmit} className="p-6 bg-white space-y-6 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5 min-h-[360px] flex flex-col"
                    >
                      <div>
                        <label className="flex items-center gap-2 text-[#2C2C2C] mb-3 font-medium">
                          <Sparkles className="w-4 h-4 text-[#D4AF7A]" />
                          Choose Services
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCategoryIndex((i) => Math.max(0, i - 1))}
                            className="h-8 w-8 rounded-full border border-[#E8DDD0] text-[#6B6B6B] text-xs hover:border-[#D4AF7A] transition-colors"
                          >
                            ‹
                          </button>
<div className="flex w-full gap-2 flex-wrap">
  {serviceCategories
    .slice(categoryIndex, categoryIndex + serviceCategories.length) // ✅ يعرض كل العناصر المتبقية
    .map((category) => (
      <button
        key={category.name}
        type="button"
        onClick={() => setSelectedCategory(category.name)}
        className={`px-3 py-1 rounded-full border text-sm sm:text-base whitespace-nowrap transition-all ${
          selectedCategory === category.name
            ? "bg-[#D4AF7A] text-white border-[#D4AF7A] shadow"
            : "bg-white text-[#2C2C2C] border-[#E8DDD0] hover:border-[#D4AF7A]"
        }`}
      >
        {category.name}
      </button>
    ))}
</div>
                          <button
                            type="button"
                            onClick={() => setCategoryIndex((i) => Math.min(serviceCategories.length - 2, i + 1))}
                            className="h-8 w-8 rounded-full border border-[#E8DDD0] text-[#6B6B6B] text-xs hover:border-[#D4AF7A] transition-colors"
                          >
                            ›
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {serviceCategories
                          .find((cat) => cat.name === selectedCategory)
                          ?.services.map((service) => {
                            const active = selectedServices.some((s) => s.name === service.name);
                            return (
                              <button
                                type="button"
                                key={service.name}
                                onClick={() => toggleService(service)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md ${
                                  active ? "border-[#D4AF7A] bg-[#FFF8EC]" : "border-[#E8DDD0] bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#2C2C2C] break-words">{service.name}</p>
                                    <p className="text-sm text-[#6B6B6B]">
                                      {formatCurrency(service.price)} · {service.duration} mins
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      active ? "bg-[#D4AF7A] text-white" : "bg-[#F5F1ED] text-[#6B6B6B]"
                                    }`}
                                  >
                                    {active ? "Added" : "Add"}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {selectedServices.length > 0 && (
                        <div className="mt-2 rounded-2xl border border-[#E8DDD0] bg-[#FFF8EC] p-4 space-y-2 max-h-40 overflow-y-auto">
                          <div className="text-sm font-semibold text-[#2C2C2C]">Selected services</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedServices.map((service) => (
                              <span
                                key={service.name}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DDD0] text-sm text-[#2C2C2C]"
                              >
                                {service.name}
                                <button onClick={() => toggleService(service)} className="text-[#D4AF7A] hover:text-[#B98C5E]">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 pt-1">
                        <div className="text-sm text-[#6B6B6B] flex flex-wrap gap-4">
                          <span>
                            Total: <span className="font-semibold text-[#2C2C2C]">{formatCurrency(totalPrice)}</span>
                          </span>
                          <span>
                            Duration: <span className="font-semibold text-[#2C2C2C]">{totalDuration} mins</span>
                          </span>
                        </div>
                        <div className="flex gap-3 flex-col sm:flex-row">
                          <GlowingButton type="button" variant="primary" onClick={handleNextFromServices} className="w-full">
                            Next: Date &amp; Time
                          </GlowingButton>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5 min-h-[360px] flex flex-col"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2 text-[#2C2C2C] font-medium">
                            <Calendar className="w-4 h-4 text-[#D4AF7A]" />
                            Select Date
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableDates.map((date) => (
                              <button
                                key={date.value}
                                type="button"
                                onClick={() => setSelectedDate(date.value)}
                                className={`p-3 rounded-2xl border text-sm transition-all ${
                                  selectedDate === date.value
                                    ? "border-[#D4AF7A] bg-[#FFF8EC]"
                                    : "border-[#E8DDD0] bg-white hover:border-[#D4AF7A]"
                                }`}
                              >
                                {date.label}
                              </button>
                            ))}
                          </div>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2 text-[#2C2C2C] font-medium">
                            <Clock className="w-4 h-4 text-[#D4AF7A]" />
                            Select Time
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`p-3 rounded-2xl border text-sm transition-all ${
                                  selectedTime === slot
                                    ? "border-[#D4AF7A] bg-[#FFF8EC]"
                                    : "border-[#E8DDD0] bg-white hover:border-[#D4AF7A]"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <GlowingButton type="button" variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C] w-full" onClick={() => setCurrentStep(1)}>
                          Back
                        </GlowingButton>
                        <GlowingButton type="button" variant="primary" className="w-full" onClick={handleNextFromSchedule}>
                          Next: Review
                        </GlowingButton>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5 min-h-[360px] flex flex-col"
                    >
                      <div className="rounded-2xl border border-[#E8DDD0] bg-[#FFF8EC] p-4 space-y-2">
                        <h4 className="font-semibold text-[#2C2C2C]">Schedule Summary</h4>
                        <div className="space-y-2 text-sm text-[#4A4A4A]">
                          <p>
                            Date: <span className="font-semibold text-[#2C2C2C]">{selectedDate || "Not selected"}</span>
                          </p>
                          <p>
                            Start Time: <span className="font-semibold text-[#2C2C2C]">{selectedTime || "Not selected"}</span>
                          </p>
                          <div className="space-y-3">
                            {computedSchedule().map((item) => (
                              <div key={item.name} className="rounded-xl bg-white/80 border border-[#E8DDD0] p-3">
                                <p className="font-semibold text-[#2C2C2C]">{item.name}</p>
                                <p className="text-sm text-[#4A4A4A] mt-1">
                                  Start: <span className="font-medium text-[#2C2C2C]">{item.start}</span> | End:{" "}
                                  <span className="font-medium text-[#2C2C2C]">{item.end}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                          <p className="pt-1 font-semibold text-[#2C2C2C]">
                            Total: {formatCurrency(totalPrice)} · {totalDuration} mins
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
                            <User className="w-4 h-4 text-[#D4AF7A]" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={userInfo.name}
                            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
                            <Mail className="w-4 h-4 text-[#D4AF7A]" />
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
                          <Phone className="w-4 h-4 text-[#D4AF7A]" />
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
                          <MessageSquare className="w-4 h-4 text-[#D4AF7A]" />
                          Notes (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all resize-none shadow-sm hover:shadow-md"
                          placeholder="Any special requests?"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <GlowingButton type="button" variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C] w-full" onClick={() => setCurrentStep(2)}>
                          Back
                        </GlowingButton>
                        <GlowingButton type="submit" variant="primary" className="w-full">
                          Confirm Appointment
                        </GlowingButton>
                      </div>
                      <p className="text-sm text-[#6B6B6B] text-center">
                        By booking, you agree to our terms and conditions. We'll send a confirmation email within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
