/**
 * dataBooking.js
 * Handles all API interactions for the booking system
 * Provides functions to fetch categories, services, available slots, and create bookings
 */

import { DateTime } from "luxon";
  const BUSINESS_TIME_ZONE = "America/Montreal";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;


export function getNowInUserTZ() {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = DateTime.now().setZone(userTimeZone);
  console.log("User timezone:", userTimeZone);
  console.log(
    "Current local time:",
    now.toFormat("yyyy-MM-dd HH:mm")
  );
  return now;
}


export function filterPastSlots(slots, selectedDate) {
  if (!slots || slots.length === 0) return [];

  const nowBusiness = DateTime.now().setZone(BUSINESS_TIME_ZONE);

  const todayBusiness = nowBusiness.toFormat("yyyy-MM-dd");
  const currentTimeBusiness = nowBusiness.toFormat("HH:mm");

  if (selectedDate === todayBusiness) {
    return slots.filter(slot => slot > currentTimeBusiness);
  }

  return slots;
}

export const getWorkingHoursByDay = async (dateStr) => {
  if (!dateStr) throw new Error("Date is required");

  // const dayNumber = new Date(dateStr + "T00:00:00").getDay();
const dayNumber = DateTime
  .fromISO(dateStr, { zone: BUSINESS_TIME_ZONE })
  .weekday % 7;


  const response = await fetch(`${API_BASE_URL}/workingHours/day/${dayNumber}`);
  if (!response.ok) throw new Error("Failed to fetch working hours");

  const data = await response.json();
  return data || null;
};

export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categorie`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    // Handle both single object and array responses
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}




export async function getServices(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/services/samecategories/${categoryId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    const data = await response.json();
    // Handle both single object and array responses
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching services for category:", error);
    throw error;
  }
}


export async function getAvailableSlots(serviceIds, bookingDate) {
  try {

    // =========================
    // SAFETY — no services
    // =========================
    if (!serviceIds || serviceIds.length === 0) {
      return [];
    }

    // Convert array to comma-separated string
    const serviceIdsParam = Array.isArray(serviceIds)
      ? serviceIds.join(",")
      : serviceIds;

    const userTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone;


const bookingDateTime = DateTime.fromISO(
  `${bookingDate}T12:00:00`,
  { zone: BUSINESS_TIME_ZONE }
);

const booking_datetime = bookingDateTime
  .toUTC()
  .toISO();




    const url =
      `${API_BASE_URL}/bookings/available-slots-multi` +
      `?serviceIds=${encodeURIComponent(serviceIdsParam)}` +
      `&booking_datetime=${encodeURIComponent(booking_datetime)}` +
      `&timeZone=${encodeURIComponent(userTimeZone)}`;

    // IMPORTANT: timeZone param tells backend how to interpret "today" relative to user's timezone
    console.log("Fetching slots with:", {
      serviceIdsParam,
      bookingDate,
      booking_datetime,
      userTimeZone
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch available slots: ${response.status}`
      );
    }

    const data = await response.json();

    // Filter out past slots if the selected date is today
    const filteredSlots = filterPastSlots(data.availableSlots || [], bookingDate);

    return filteredSlots;

  } catch (error) {
    console.error(
      "Error fetching available slots:",
      error
    );

    throw error;
  }
}






export function getServicesDuration(services) {
  return services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0);
}


export function validateBookingDuration(
  totalDuration,
  selectedTime,
  bookingServices,
  workingHourStart = 9,
  workingHourEnd = 18
) {
  // Parse the selected time to get start time in minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;

    // Handle both "HH:MM AM/PM" and "HH:MM" formats
    const parts = timeStr.split(" ");
    const [hours, minutes] = parts[0].split(":").map(Number);

    let totalMinutes = hours * 60 + (minutes || 0);

    // If AM/PM is present, adjust for AM/PM
    if (parts[1]) {
      const period = parts[1].toUpperCase();
      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }
    }

    return totalMinutes;
  };

  if (!selectedTime) {
    return { isValid: false, message: "Select a start time" };
  }


  
const dt = DateTime.fromFormat(selectedTime, "HH:mm", {
  zone: BUSINESS_TIME_ZONE,
});

const startMinutes = dt.hour * 60 + dt.minute;


  const endMinutes = startMinutes + totalDuration;

  const workingStartMinutes = workingHourStart * 60;
  const workingEndMinutes = workingHourEnd * 60;

  if (startMinutes < workingStartMinutes) {
    return {
      isValid: false,
      message: `Selected time is before working hours (${workingHourStart}:00)`,
    };
  }

  if (endMinutes > workingEndMinutes) {
    const endTime = new Date(new Date().setHours(0, 0, 0, 0));
    endTime.setMinutes(endMinutes);
    const formattedEndTime = endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      isValid: false,
      message: `Services end at ${formattedEndTime}, which is after working hours (${workingHourEnd}:00). Total duration: ${totalDuration} minutes`,
    };
  }

  return { isValid: true, message: "" };
}






export const formatTimeForDisplay = (time) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Use Luxon to parse time without timezone shift
  const dt = DateTime.fromFormat(time, "HH:mm", { zone: userTimeZone });
  return dt.toFormat("h:mm a");
};



export function calculateEndTime(startTime, duration) {
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(" ");
    const [hours, minutes] = parts[0].split(":").map(Number);
    let totalMinutes = hours * 60 + (minutes || 0);
    
    if (parts[1]) {
      const period = parts[1].toUpperCase();
      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }
    }
    return totalMinutes;
  };

  const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayHours = h % 12 || 12;
    return `${displayHours}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const startMinutes = timeToMinutes(startTime);
  if (startMinutes === null) return "";
  
  const endMinutes = startMinutes + duration;
  return minutesToTime(endMinutes);
}


export const formatDateForDisplay = (dateString) => {
  return DateTime.fromISO(
    dateString,
    { zone: BUSINESS_TIME_ZONE }
  ).toFormat("cccc, LLLL d, yyyy");
};

export function getTimezoneOffset() {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}


export async function createBooking(bookingData) {
  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        serviceIds: bookingData.serviceIds,
        booking_datetime: bookingData.booking_datetime,
        note: bookingData.note || "",
        timeZone: userTimeZone
      })
    });

   
if (!response.ok) {
  let errorMessage = "Booking failed";

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
  } catch (err) {
    errorMessage = `Server error: ${response.status}`;
  }

  throw new Error(errorMessage);
}
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export default {
  getCategories,
  getServices,
  getAvailableSlots,
  getServicesDuration,
  validateBookingDuration,
  formatTimeForDisplay,
  calculateEndTime,
  formatDateForDisplay,
  getTimezoneOffset,
  createBooking,
  getNowInUserTZ,
  filterPastSlots,
  getWorkingHoursByDay
};

