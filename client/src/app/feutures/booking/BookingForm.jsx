"use client";
// import { useMemo, useState } from "react";
// import { Sparkles, Calendar, Clock, User, Mail, Phone, MessageSquare, X } from "lucide-react";
// import { toast } from "sonner";
// import { motion, AnimatePresence } from "framer-motion";
// void motion;
// import { GlowingButton } from "../../components/GlowingButtom";
// import { FloatingElement } from "../../components/AnimatedElements";

// const serviceCategories = [
//   {
//     name: "Face",
//     services: [
//       { name: "Classic Hydrating Facial", price: 120, duration: 60 },
//       { name: "Anti-Aging Treatment", price: 180, duration: 75 },
//       { name: "Brightening Facial", price: 150, duration: 60 },
//       { name: "Acne Treatment Facial", price: 140, duration: 60 },
//     ],
//   },
//   {
//     name: "Body",
//     services: [
//       { name: "Body Scrub & Wrap", price: 180, duration: 90 },
//       { name: "Cellulite Reduction", price: 160, duration: 60 },
//       { name: "Body Contouring", price: 220, duration: 75 },
//       { name: "Relaxation Massage", price: 140, duration: 60 },
//     ],
//   },
//   {
//     name: "Laser",
//     services: [
//       { name: "Laser Hair Removal - Full Face", price: 110, duration: 45 },
//       { name: "Laser Hair Removal - Legs", price: 190, duration: 60 },
//       { name: "Laser Skin Rejuvenation", price: 210, duration: 70 },
//     ],
//   },
//   {
//     name: "Wellness",
//     services: [
//       { name: "Aromatherapy Session", price: 110, duration: 60 },
//       { name: "Hot Stone Therapy", price: 150, duration: 75 },
//       { name: "Reflexology", price: 90, duration: 45 },
//       { name: "Spa Day Package", price: 350, duration: 180 },
//     ],
//   },
// ];

// const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

// const generateDates = () => {
//   const today = new Date();
//   return Array.from({ length: 14 }).map((_, i) => {
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);
//     return {
//       label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
//       value: date.toISOString().split("T")[0],
//     };
//   });
// };

// export function BookingForm({ isOpen, onClose }) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedCategory, setSelectedCategory] = useState(serviceCategories[0].name);
//   const [categoryIndex, setCategoryIndex] = useState(0);
//   const [selectedServices, setSelectedServices] = useState([]);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
//   const [note, setNote] = useState("");

//   const availableDates = useMemo(() => generateDates(), []);

//   const totalPrice = selectedServices.reduce((sum, item) => sum + item.price, 0);
//   const totalDuration = selectedServices.reduce((sum, item) => sum + item.duration, 0);

//   const toggleService = (service) => {
//     const exists = selectedServices.find((s) => s.name === service.name);
//     if (exists) {
//       setSelectedServices((prev) => prev.filter((s) => s.name !== service.name));
//     } else {
//       setSelectedServices((prev) => [...prev, service]);
//     }
//   };

//   const handleNextFromServices = () => {
//     if (!selectedServices.length) {
//       toast.error("Please select at least one service.");
//       return;
//     }
//     setCurrentStep(2);
//   };

//   const handleNextFromSchedule = () => {
//     if (!selectedDate || !selectedTime) {
//       toast.error("Please choose a date and time.");
//       return;
//     }
//     setCurrentStep(3);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!selectedServices.length || !selectedDate || !selectedTime) {
//       toast.error("Please complete all steps before booking.");
//       return;
//     }
//     if (!userInfo.name || !userInfo.email || !userInfo.phone) {
//       toast.error("Please fill your contact details.");
//       return;
//     }
//     toast.success("Your appointment has been booked! We'll send you a confirmation shortly.");
//     setCurrentStep(1);
//     setSelectedServices([]);
//     setSelectedDate("");
//     setSelectedTime("");
//     setUserInfo({ name: "", email: "", phone: "" });
//     setNote("");
//   };

//   const formatCurrency = (value) => `$${value}`;

//   const computedSchedule = () => {
//     if (!selectedTime) return [];
//     const parseTime = (timeStr) => {
//       const [raw, period] = timeStr.split(" ");
//       let [hours, minutes] = raw.split(":").map(Number);
//       if (period === "PM" && hours !== 12) hours += 12;
//       if (period === "AM" && hours === 12) hours = 0;
//       return hours * 60 + minutes;
//     };
//     const start = parseTime(selectedTime);
//     let cursor = start;
//     return selectedServices.map((service) => {
//       const end = cursor + service.duration;
//       const format = (mins) => {
//         const h = Math.floor(mins / 60);
//         const m = mins % 60;
//         const period = h >= 12 ? "PM" : "AM";
//         const normalized = h % 12 || 12;
//         return `${normalized}:${m.toString().padStart(2, "0")} ${period}`;
//       };
//       const slot = { ...service, start: format(cursor), end: format(end) };
//       cursor = end;
//       return slot;
//     });
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.25 }}
//       className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center z-[9999] overflow-y-auto pt-4 pb-4"
//       onClick={onClose}
//     >
//       <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 box-border" onClick={(e) => e.stopPropagation()}>
//         <section className="relative z-[9999]">
//           <div className="relative">
//             <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white rounded-full px-3 py-1 shadow">
//               x
//             </button>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#D4AF7A]/20 border border-[#D4AF7A]/20 overflow-hidden flex flex-col"
//             >
//               <div className="bg-gradient-to-r from-[#FFD700]/30 via-[#E8DDD0]/50 to-[#E8C7C3]/30 p-6 relative overflow-hidden">
//                 <FloatingElement delay={1} duration={4}>
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD700]/40 to-transparent rounded-full blur-2xl" />
//                 </FloatingElement>

//                 <h2 className="text-3xl text-[#2C2C2C] relative z-10" style={{ fontFamily: "var(--font-serif)" }}>
//                   Appointment Details
//                 </h2>
//                 {/* <p className="text-[#6B6B6B] mt-2 relative z-10">Follow the steps to complete your booking</p> */}
//               </div>

//        <div className="px-6 pt-4 bg-white">
//   <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.1em] text-[#6B6B6B] pb-2 justify-start lg:justify-center bg-white">
//     {["Services", "Schedule", "Review"].map((label, idx) => (
//       <div key={label} className="flex items-center gap-2 flex-shrink-0">
//         <div
//           className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
//             currentStep >= idx + 1
//               ? "bg-white text-[#2C2C2C] border-[#D4AF7A]"
//               : "bg-white text-[#6B6B6B] border-[#E8DDD0]"
//           }`}
//         >
//           {idx + 1}
//         </div>
//         <span className={currentStep >= idx + 1 ? "text-[#2C2C2C]" : ""}>
//           {label}
//         </span>
//       </div>
//     ))}
//   </div>
// </div>

//               <form onSubmit={handleSubmit} className="p-6 bg-white space-y-6 flex flex-col overflow-hidden">
//                 <AnimatePresence mode="wait">
//                   {currentStep === 1 && (
//                     <motion.div
//                       key="step1"
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -20 }}
//                       transition={{ duration: 0.25 }}
//                       className="space-y-5 min-h-[360px] flex flex-col"
//                     >
//                       <div>
//                         <label className="flex items-center gap-2 text-[#2C2C2C] mb-3 font-medium">
//                           <Sparkles className="w-4 h-4 text-[#D4AF7A]" />
//                           Choose Services
//                         </label>
//                         <div className="flex items-center gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setCategoryIndex((i) => Math.max(0, i - 1))}
//                             className="h-8 w-8 rounded-full border border-[#E8DDD0] text-[#6B6B6B] text-xs hover:border-[#D4AF7A] transition-colors"
//                           >
//                             ‹
//                           </button>
// <div className="flex w-full gap-2 flex-wrap">
//   {serviceCategories
//     .slice(categoryIndex, categoryIndex + serviceCategories.length) // ✅ يعرض كل العناصر المتبقية
//     .map((category) => (
//       <button
//         key={category.name}
//         type="button"
//         onClick={() => setSelectedCategory(category.name)}
//         className={`px-3 py-1 rounded-full border text-sm sm:text-base whitespace-nowrap transition-all ${
//           selectedCategory === category.name
//             ? "bg-[#D4AF7A] text-white border-[#D4AF7A] shadow"
//             : "bg-white text-[#2C2C2C] border-[#E8DDD0] hover:border-[#D4AF7A]"
//         }`}
//       >
//         {category.name}
//       </button>
//     ))}
// </div>
//                           <button
//                             type="button"
//                             onClick={() => setCategoryIndex((i) => Math.min(serviceCategories.length - 2, i + 1))}
//                             className="h-8 w-8 rounded-full border border-[#E8DDD0] text-[#6B6B6B] text-xs hover:border-[#D4AF7A] transition-colors"
//                           >
//                             ›
//                           </button>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {serviceCategories
//                           .find((cat) => cat.name === selectedCategory)
//                           ?.services.map((service) => {
//                             const active = selectedServices.some((s) => s.name === service.name);
//                             return (
//                               <button
//                                 type="button"
//                                 key={service.name}
//                                 onClick={() => toggleService(service)}
//                                 className={`w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md ${
//                                   active ? "border-[#D4AF7A] bg-[#FFF8EC]" : "border-[#E8DDD0] bg-white"
//                                 }`}
//                               >
//                                 <div className="flex items-center justify-between gap-3">
//                                   <div className="min-w-0">
//                                     <p className="font-semibold text-[#2C2C2C] break-words">{service.name}</p>
//                                     <p className="text-sm text-[#6B6B6B]">
//                                       {formatCurrency(service.price)} · {service.duration} mins
//                                     </p>
//                                   </div>
//                                   <span
//                                     className={`text-xs px-2 py-1 rounded-full ${
//                                       active ? "bg-[#D4AF7A] text-white" : "bg-[#F5F1ED] text-[#6B6B6B]"
//                                     }`}
//                                   >
//                                     {active ? "Added" : "Add"}
//                                   </span>
//                                 </div>
//                               </button>
//                             );
//                           })}
//                       </div>

//                       {selectedServices.length > 0 && (
//                         <div className="mt-2 rounded-2xl border border-[#E8DDD0] bg-[#FFF8EC] p-4 space-y-2 max-h-40 overflow-y-auto">
//                           <div className="text-sm font-semibold text-[#2C2C2C]">Selected services</div>
//                           <div className="flex flex-wrap gap-2">
//                             {selectedServices.map((service) => (
//                               <span
//                                 key={service.name}
//                                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DDD0] text-sm text-[#2C2C2C]"
//                               >
//                                 {service.name}
//                                 <button onClick={() => toggleService(service)} className="text-[#D4AF7A] hover:text-[#B98C5E]">
//                                   <X className="w-3 h-3" />
//                                 </button>
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       <div className="space-y-3 pt-1">
//                         <div className="text-sm text-[#6B6B6B] flex flex-wrap gap-4">
//                           <span>
//                             Total: <span className="font-semibold text-[#2C2C2C]">{formatCurrency(totalPrice)}</span>
//                           </span>
//                           <span>
//                             Duration: <span className="font-semibold text-[#2C2C2C]">{totalDuration} mins</span>
//                           </span>
//                         </div>
//                         <div className="flex gap-3 flex-col sm:flex-row">
//                           <GlowingButton type="button" variant="primary" onClick={handleNextFromServices} className="w-full">
//                             Next: Date &amp; Time
//                           </GlowingButton>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {currentStep === 2 && (
//                     <motion.div
//                       key="step2"
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -20 }}
//                       transition={{ duration: 0.25 }}
//                       className="space-y-5 min-h-[360px] flex flex-col"
//                     >
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="flex flex-col gap-3">
//                           <label className="flex items-center gap-2 text-[#2C2C2C] font-medium">
//                             <Calendar className="w-4 h-4 text-[#D4AF7A]" />
//                             Select Date
//                           </label>
//                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                             {availableDates.map((date) => (
//                               <button
//                                 key={date.value}
//                                 type="button"
//                                 onClick={() => setSelectedDate(date.value)}
//                                 className={`p-3 rounded-2xl border text-sm transition-all ${
//                                   selectedDate === date.value
//                                     ? "border-[#D4AF7A] bg-[#FFF8EC]"
//                                     : "border-[#E8DDD0] bg-white hover:border-[#D4AF7A]"
//                                 }`}
//                               >
//                                 {date.label}
//                               </button>
//                             ))}
//                           </div>
//                           <input
//                             type="date"
//                             value={selectedDate}
//                             onChange={(e) => setSelectedDate(e.target.value)}
//                             className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DDD0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
//                           />
//                         </div>

//                         <div className="flex flex-col gap-3">
//                           <label className="flex items-center gap-2 text-[#2C2C2C] font-medium">
//                             <Clock className="w-4 h-4 text-[#D4AF7A]" />
//                             Select Time
//                           </label>
//                           <div className="grid grid-cols-2 gap-3">
//                             {timeSlots.map((slot) => (
//                               <button
//                                 key={slot}
//                                 type="button"
//                                 onClick={() => setSelectedTime(slot)}
//                                 className={`p-3 rounded-2xl border text-sm transition-all ${
//                                   selectedTime === slot
//                                     ? "border-[#D4AF7A] bg-[#FFF8EC]"
//                                     : "border-[#E8DDD0] bg-white hover:border-[#D4AF7A]"
//                                 }`}
//                               >
//                                 {slot}
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-col sm:flex-row gap-3">
//                         <GlowingButton type="button" variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C] w-full" onClick={() => setCurrentStep(1)}>
//                           Back
//                         </GlowingButton>
//                         <GlowingButton type="button" variant="primary" className="w-full" onClick={handleNextFromSchedule}>
//                           Next: Review
//                         </GlowingButton>
//                       </div>
//                     </motion.div>
//                   )}

//                   {currentStep === 3 && (
//                     <motion.div
//                       key="step3"
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -20 }}
//                       transition={{ duration: 0.25 }}
//                       className="space-y-5 min-h-[360px] flex flex-col"
//                     >
//                       <div className="rounded-2xl border border-[#E8DDD0] bg-[#FFF8EC] p-4 space-y-2">
//                         <h4 className="font-semibold text-[#2C2C2C]">Schedule Summary</h4>
//                         <div className="space-y-2 text-sm text-[#4A4A4A]">
//                           <p>
//                             Date: <span className="font-semibold text-[#2C2C2C]">{selectedDate || "Not selected"}</span>
//                           </p>
//                           <p>
//                             Start Time: <span className="font-semibold text-[#2C2C2C]">{selectedTime || "Not selected"}</span>
//                           </p>
//                           <div className="space-y-3">
//                             {computedSchedule().map((item) => (
//                               <div key={item.name} className="rounded-xl bg-white/80 border border-[#E8DDD0] p-3">
//                                 <p className="font-semibold text-[#2C2C2C]">{item.name}</p>
//                                 <p className="text-sm text-[#4A4A4A] mt-1">
//                                   Start: <span className="font-medium text-[#2C2C2C]">{item.start}</span> | End:{" "}
//                                   <span className="font-medium text-[#2C2C2C]">{item.end}</span>
//                                 </p>
//                               </div>
//                             ))}
//                           </div>
//                           <p className="pt-1 font-semibold text-[#2C2C2C]">
//                             Total: {formatCurrency(totalPrice)} · {totalDuration} mins
//                           </p>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
//                             <User className="w-4 h-4 text-[#D4AF7A]" />
//                             Full Name *
//                           </label>
//                           <input
//                             type="text"
//                             name="name"
//                             value={userInfo.name}
//                             onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
//                             required
//                             className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
//                             placeholder="Enter your full name"
//                           />
//                         </div>

//                         <div>
//                           <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
//                             <Mail className="w-4 h-4 text-[#D4AF7A]" />
//                             Email *
//                           </label>
//                           <input
//                             type="email"
//                             name="email"
//                             value={userInfo.email}
//                             onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
//                             required
//                             className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
//                             placeholder="Enter your email"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
//                           <Phone className="w-4 h-4 text-[#D4AF7A]" />
//                           Phone *
//                         </label>
//                         <input
//                           type="tel"
//                           name="phone"
//                           value={userInfo.phone}
//                           onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
//                           required
//                           className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
//                           placeholder="Enter your phone number"
//                         />
//                       </div>

//                       <div>
//                         <label className="flex items-center gap-2 text-[#2C2C2C] mb-2 font-medium">
//                           <MessageSquare className="w-4 h-4 text-[#D4AF7A]" />
//                           Notes (Optional)
//                         </label>
//                         <textarea
//                           rows={3}
//                           value={note}
//                           onChange={(e) => setNote(e.target.value)}
//                           className="w-full px-4 py-3 rounded-2xl bg-white border border-[#D4AF7A]/20 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all resize-none shadow-sm hover:shadow-md"
//                           placeholder="Any special requests?"
//                         />
//                       </div>

//                       <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                         <GlowingButton type="button" variant="outline" className="border-[#E8C7C3]/70 text-[#2C2C2C] w-full" onClick={() => setCurrentStep(2)}>
//                           Back
//                         </GlowingButton>
//                         <GlowingButton type="submit" variant="primary" className="w-full">
//                           Confirm Appointment
//                         </GlowingButton>
//                       </div>
//                       <p className="text-sm text-[#6B6B6B] text-center">
//                         By booking, you agree to our terms and conditions. We'll send a confirmation email within 24 hours.
//                       </p>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </form>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </motion.div>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  X,
  AlertCircle,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingButton } from "../../components/GlowingButtom";
import {
  getCategories,
  getServices,
  getAvailableSlots,
  getServicesDuration,
  validateBookingDuration,
  formatTimeForDisplay,
  calculateEndTime,
  formatDateForDisplay,
  createBooking as createBookingAPI,
} from "./dataBooking";

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
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Booking Data State
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });
  const [note, setNote] = useState("");

  // API Data State
  const [categories, setCategories] = useState([]);
  const [categoryServices, setCategoryServices] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Loading & Error State
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [durationWarning, setDurationWarning] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const availableDates = useMemo(() => generateDates(), []);
  
  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDuration = getServicesDuration(selectedServices);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        
        // Auto-select first category
        if (fetchedCategories.length > 0) {
          setSelectedCategoryId(fetchedCategories[0].id);
          setExpandedCategory(fetchedCategories[0].name);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load service categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch services when a category is selected
  useEffect(() => {
    const fetchCategoryServices = async () => {
      if (!selectedCategoryId) return;

      try {
        setLoadingServices(true);
        const services = await getServices(selectedCategoryId);
        
        // Cache services by category ID
        setCategoryServices(prev => ({
          ...prev,
          [selectedCategoryId]: services
        }));
      } catch (error) {
        console.error("Failed to load services:", error);
        toast.error("Failed to load services for this category");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchCategoryServices();
  }, [selectedCategoryId]);

  // Fetch available slots when date or services change
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || selectedServices.length === 0) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const serviceIds = selectedServices.map(s => s.id);
        const slots = await getAvailableSlots(serviceIds, selectedDate);
        setAvailableSlots(slots);
        
        // Clear previously selected time as slots changed
        setSelectedTime("");
      } catch (error) {
        console.error("Failed to load available slots:", error);
        toast.error("Failed to load available time slots");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedServices]);

  // Validate booking duration when time is selected
  useEffect(() => {
    if (selectedTime && selectedDate) {
      const validation = validateBookingDuration(totalDuration, selectedTime, selectedServices);
      setDurationWarning(validation.isValid ? "" : validation.message);
    }
  }, [selectedTime, selectedDate, totalDuration, selectedServices]);

  const toggleService = (service) => {
    const exists = selectedServices.find((s) => s.id === service.id);
    if (exists) {
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
  };

  const toggleCategory = (name, categoryId) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
    setSelectedCategoryId(categoryId);
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
    if (durationWarning) {
      toast.error(durationWarning);
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedServices.length || !selectedDate || !selectedTime) {
      toast.error("Please complete all steps before booking.");
      return;
    }
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      toast.error("Please fill your contact details.");
      return;
    }

    setBookingLoading(true);
    try {
      await createBookingAPI({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        serviceIds: selectedServices.map(s => s.id),
        booking_date: selectedDate,
        booking_time: selectedTime,
        note: note
      });

      toast.success("Your appointment has been booked! We'll send you a confirmation shortly.");
      
      // Reset form
      setCurrentStep(1);
      setSelectedServices([]);
      setSelectedDate("");
      setSelectedTime("");
      setUserInfo({ name: "", email: "", phone: "" });
      setNote("");
      setDurationWarning("");
      
      // Close modal after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCurrency = (value) => `$${value}`;

  // Get current category services
  const currentCategoryServices = selectedCategoryId ? categoryServices[selectedCategoryId] || [] : [];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex justify-center z-[9999] overflow-y-auto pt-6 pb-6"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl mx-auto px-4" onClick={(e) => e.stopPropagation()}>
        <motion.div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">

          <div className="bg-white border-b border-gray-200 px-6 py-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Appointment</h2>
            <p className="text-sm text-gray-500 mt-1">Fill your information please</p>
            <div className="flex justify-center items-center gap-4 mt-4">
              {[1,2,3].map((step) => (
                <div key={step} className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium ${currentStep >= step ? "border-black text-black" : "border-gray-300 text-gray-400"}`}>{step}</div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Loading Categories */}
                  {loadingCategories ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-600">Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No categories available
                    </div>
                  ) : (
                    <>
                      {/* Categories */}
                      <div className="space-y-3">
                        {categories.map((category) => (
                          <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category.name, category.id)}
                              className="w-full flex justify-between items-center px-4 py-4 bg-white hover:bg-gray-50 transition"
                            >
                              <span className="font-medium text-gray-800">{category.name}</span>
                              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === category.name ? "rotate-180" : ""}`} />
                            </button>
                            {expandedCategory === category.name && (
                              <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                                {loadingServices && selectedCategoryId === category.id ? (
                                  <div className="flex justify-center py-4">
                                    <Loader className="w-4 h-4 animate-spin text-gray-500" />
                                  </div>
                                ) : currentCategoryServices.length === 0 ? (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    No services available
                                  </div>
                                ) : (
                                  currentCategoryServices.map((service) => {
                                    const active = selectedServices.some((s) => s.id === service.id);
                                    return (
                                      <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => toggleService(service)}
                                        className={`w-full text-left p-3 rounded-lg border transition ${active ? "border-black bg-white" : "border-gray-200 bg-white hover:border-black"}`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="font-medium text-gray-800">{service.name}</p>
                                            <p className="text-sm text-gray-500">{formatCurrency(service.price || 0)} · {service.duration_minutes || 0} mins</p>
                                          </div>
                                          <span className={`text-xs px-2 py-1 rounded-full ${active ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`}>
                                            {active ? "Added" : "Add"}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Selected Services with Remove */}
                      {selectedServices.length > 0 && (
                        <div className="mt-3 border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Selected services ({selectedServices.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedServices.map((service) => (
                              <span key={service.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm">
                                {service.name}
                                <button type="button" onClick={() => toggleService(service)} className="text-gray-500 hover:text-black">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                            <p>Total: <span className="font-semibold text-gray-800">{formatCurrency(totalPrice)}</span></p>
                            <p>Duration: <span className="font-semibold text-gray-800">{totalDuration} mins</span></p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <GlowingButton type="button" variant="primary" className="w-full" onClick={handleNextFromServices} disabled={loadingCategories}>
                    Next: Date & Time
                  </GlowingButton>
                </motion.div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity:0, y:10 }} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-gray-800 font-medium"><Calendar className="w-4 h-4"/>Select Date</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableDates.map((date) => (
                          <button key={date.value} type="button" onClick={() => setSelectedDate(date.value)}
                            className={`p-3 rounded-xl border text-sm transition ${selectedDate===date.value?"border-black bg-gray-100":"border-gray-200 bg-white hover:border-black"}`}>
                            {date.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-gray-800 font-medium"><Clock className="w-4 h-4"/>Select Time</label>
                      {selectedDate ? (
                        <>
                          {loadingSlots ? (
                            <div className="flex justify-center items-center py-4">
                              <Loader className="w-4 h-4 animate-spin text-gray-500" />
                              <span className="ml-2 text-sm text-gray-600">Loading available times...</span>
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No available slots on this date
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                              {availableSlots.map((slot)=>(
                                <button key={slot} type="button" onClick={()=>setSelectedTime(slot)} className={`p-3 rounded-xl border text-sm transition ${selectedTime===slot?"border-black bg-gray-100":"border-gray-200 bg-white hover:border-black"}`}>{formatTimeForDisplay(slot)}</button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Please select a date first
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Warning */}
                  {durationWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">{durationWarning}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <GlowingButton type="button" variant="outline" className="w-full" onClick={()=>setCurrentStep(1)}>Back</GlowingButton>
                    <GlowingButton type="button" variant="primary" className="w-full" onClick={handleNextFromSchedule} disabled={!selectedDate || !selectedTime || !!durationWarning}>Next: Review</GlowingButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity:0, y:10 }} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-4">

                  {/* SUMMARY BOX */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3">
                    <h4 className="font-semibold text-gray-800">Appointment Summary</h4>
                    {selectedServices.length > 0 ? (
                      <div className="space-y-2 text-sm text-gray-700">
                        {selectedServices.map((service)=>(
                          <div key={service.id} className="flex justify-between">
                            <span>{service.name}</span>
                            <span>{service.duration_minutes || 0} mins · {formatCurrency(service.price || 0)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-semibold text-gray-800">
                          <span>Total Duration</span>
                          <span>{totalDuration} mins</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-800">
                          <span>Total Price</span>
                          <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-gray-700">
                          <span>Date</span>
                          <span className="font-medium">{formatDateForDisplay(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Time</span>
                          <span className="font-medium">{formatTimeForDisplay(selectedTime)} - {calculateEndTime(selectedTime, totalDuration)}</span>
                        </div>
                      </div>
                    ) : (<p className="text-sm text-gray-500">No services selected</p>)}
                  </div>

                  {/* USER FORM */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium"><User className="w-4 h-4"/>Full Name *</label>
                      <input type="text" value={userInfo.name} onChange={(e)=>setUserInfo({...userInfo,name:e.target.value})} required placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"/>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium"><Mail className="w-4 h-4"/>Email *</label>
                      <input type="email" value={userInfo.email} onChange={(e)=>setUserInfo({...userInfo,email:e.target.value})} required placeholder="Enter your email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"/>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium"><Phone className="w-4 h-4"/>Phone *</label>
                    <input type="tel" value={userInfo.phone} onChange={(e)=>setUserInfo({...userInfo,phone:e.target.value})} required placeholder="Enter your phone number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20"/>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-800 mb-2 font-medium"><MessageSquare className="w-4 h-4"/>Notes (Optional)</label>
                    <textarea rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Any special requests?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"/>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <GlowingButton type="button" variant="outline" className="w-full" onClick={()=>setCurrentStep(2)} disabled={bookingLoading}>Back</GlowingButton>
                    <GlowingButton type="submit" variant="primary" className="w-full" disabled={bookingLoading}>
                      {bookingLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          Booking...
                        </span>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </GlowingButton>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </form>

        </motion.div>
      </div>
    </motion.div>
  );
}