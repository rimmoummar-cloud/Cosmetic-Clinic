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
  getWorkingHoursByDay,
} from "./dataBooking";

// const generateDates = () => {
//   const today = new Date();
//   return Array.from({ length: 14 }).map((_, i) => {
//     const date = new Date(today);
//     date.setDate(today.getDate() + i);
//     return {
//       label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
//     value: date.toLocaleDateString("en-CA"),
//     };
//   });
// };

const generateDates = (workingHourEnd = 18) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const currentHour = now.getHours();

  return Array.from({ length: 14 }).map((_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    const dateStr = date.toLocaleDateString("en-CA", { timeZone: userTimeZone });
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: userTimeZone });

    // Skip today if past working hours
    if (dateStr === todayStr && currentHour >= workingHourEnd) {
      console.log(`[generateDates] Skipping today (${todayStr}) because it's past working hours (current: ${currentHour}:00, end: ${workingHourEnd}:00)`);
      return null;
    }

    return {
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: userTimeZone }),
      value: dateStr,
    };
  }).filter(Boolean);
};


// const generateDates = () => {
//   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   const now = new Date();
//   const currentHour = now.getHours();
//   const workingHourEnd = 18; // 6 PM

//   return Array.from({ length: 14 }).map((_, i) => {
//     const date = new Date(now);
//     date.setDate(now.getDate() + i);

//     const dateStr = date.toLocaleDateString("en-CA", { timeZone: userTimeZone });
//     const todayStr = now.toLocaleDateString("en-CA", { timeZone: userTimeZone });

//     // Skip today if it's past working hours (in user timezone)
//     if (dateStr === todayStr && i === 0 && currentHour >= workingHourEnd) {
//       console.log(`[generateDates] Skipping today (${todayStr}) because it's past working hours (current time: ${currentHour}:00)`);
//       return null;
//     }

//     return {
//       label: date.toLocaleDateString("en-US", {
//         weekday: "short",
//         month: "short",
//         day: "numeric",
//         timeZone: userTimeZone,
//       }),

//       value: dateStr,
//     };
//   }).filter(Boolean);
// };



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
  const [workingHourEnd, setWorkingHourEnd] = useState(18); // Default to 6 PM
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [slotsByDate, setSlotsByDate] = useState({}); // Track available slots per date

  const availableDates = useMemo(() => generateDates(workingHourEnd), [workingHourEnd]);
  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDuration = getServicesDuration(selectedServices);

  // Fetch working hours on component mount
useEffect(() => {
  if (!selectedDate) return; // ما ننادي إلا إذا فيه تاريخ

  const fetchWorkingHours = async () => {
    try {
      setLoadingWorkingHours(true);
      // const workingHours = await getWorkingHoursByDay(selectedDate);
      const workingHours = await getWorkingHoursByDay(selectedDate); // ✅
      if (workingHours?.end_time) {
        setWorkingHourEnd(parseInt(workingHours.end_time.split(":")[0]));
      }
    } catch (error) {
      console.error("Failed to load working hours:", error);
    } finally {
      setLoadingWorkingHours(false);
    }
  };

  fetchWorkingHours();
}, [selectedDate]);

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
        
        // Track slots per date (filterPastSlots is already applied inside getAvailableSlots)
        setSlotsByDate(prev => ({ ...prev, [selectedDate]: slots }));
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
      // await createBookingAPI({
      //   name: userInfo.name,
      //   email: userInfo.email,
      //   phone: userInfo.phone,
      //   serviceIds: selectedServices.map(s => s.id),
      //   booking_date: selectedDate,
      //   booking_time: selectedTime,
      //   note: note
      // });

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


