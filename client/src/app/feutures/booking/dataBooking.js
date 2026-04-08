/**
 * dataBooking.js
 * Handles all API interactions for the booking system
 * Provides functions to fetch categories, services, available slots, and create bookings
 */

import { DateTime } from "luxon";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BUSINESS_TIMEZONE = "America/Toronto";

/**
 * Get the current time in the user's local timezone
 * @returns {DateTime} Current time in user's timezone (Luxon DateTime object)
 */
export function getNowInBusinessTZ() {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = DateTime.now().setZone(userTimeZone);
  console.log("User timezone:", userTimeZone);
  console.log(
    "Current local time:",
    now.toFormat("yyyy-MM-dd HH:mm")
  );
  return now;
}

/**
 * Filter out past time slots based on user's local timezone
 * @param {Array<string>} slots - Array of time slots in HH:MM format
 * @param {string} selectedDate - Selected date in YYYY-MM-DD format
 * @returns {Array<string>} Filtered slots (excludes past times if date is today in user timezone)
 */

export function filterPastSlots(slots, selectedDate) {
  if (!slots || slots.length === 0) return [];

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nowUser = DateTime.now().setZone(userTimeZone);
  const todayUser = nowUser.toFormat("yyyy-MM-dd");
  const currentTimeUser = nowUser.toFormat("HH:mm");

  // إذا التاريخ اليوم الحالي، فلتر الـ slots الماضية
  if (selectedDate === todayUser) {
    const filteredSlots = slots.filter(slot => slot > currentTimeUser);
    console.log(`[filterPastSlots] Today (${todayUser}) at ${currentTimeUser}: ${slots.length} slots -> ${filteredSlots.length} slots`);
    return filteredSlots;
  }

  // إذا مش اليوم، رجع كل الـ slots
  return slots;
}
// export function filterPastSlots(slots, selectedDate) {
//   if (!slots || slots.length === 0) {
//     return [];
//   }

//   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   const nowUser = DateTime.now().setZone(userTimeZone);
//   const todayUser = nowUser.toFormat("yyyy-MM-dd");
//   const currentTimeUser = nowUser.toFormat("HH:mm");

//   // If the selected date is not today (in user timezone), return all slots
//   if (selectedDate !== todayUser) {
//     console.log(
//       `[filterPastSlots] Selected date (${selectedDate}) is not today (${todayUser}), returning all slots`
//     );
//     return slots;
//   }

//   // Filter slots that are after current user time
//   const filteredSlots = slots.filter((slot) => {
//     const isAfterCurrent = slot > currentTimeUser;
//     console.log(
//       `[filterPastSlots] Slot ${slot} vs current ${currentTimeUser}: ${isAfterCurrent ? "KEEP" : "REMOVE"}`
//     );
//     return isAfterCurrent;
//   });

//   console.log(
//     `[filterPastSlots] Today (${todayUser}) at ${currentTimeUser}: ${slots.length} slots -> ${filteredSlots.length} slots`
//   );

//   return filteredSlots;
// }



/**
 * Convert booking date and time from user's local timezone to UTC
 * @param {string} bookingDate - Date in YYYY-MM-DD format (in user timezone)
 * @param {string} bookingTime - Time in HH:MM format (in user timezone)
 * @returns {Object} { utcDate: string, utcTime: string } in UTC
 */
export function convertToUTC(bookingDate, bookingTime) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Parse the date and time in user's timezone
  const dateTimeStr = `${bookingDate}T${bookingTime}`;
  const userDateTime = DateTime.fromISO(dateTimeStr, {
    zone: userTimeZone,
  });

  // Convert to UTC
  const utcDateTime = userDateTime.toUTC();

  console.log(
    `[convertToUTC] Converting booking: ${bookingDate} ${bookingTime} (${userTimeZone}) -> UTC: ${utcDateTime.toFormat("yyyy-MM-dd HH:mm")}`
  );

  return {
    utcDate: utcDateTime.toFormat("yyyy-MM-dd"),
    utcTime: utcDateTime.toFormat("HH:mm"),
  };
}

/**
 * Get all categories from the backend
 * @returns {Promise<Array>} Array of categories with id, name, description, image_url
 */
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



/**
 * Get services for a specific category
 * @param {number|string} categoryId - The category ID
 * @returns {Promise<Array>} Array of services with id, name, description, price, duration_minutes, category_id
 */
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

/**
 * Get available time slots for multiple services on a specific date
 * @param {Array<number>} serviceIds - Array of service IDs
 * @param {string} bookingDate - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of available time slots in HH:MM format
 */
// export async function getAvailableSlots(serviceIds, bookingDate) {
//   try {
//     // Convert array to comma-separated string
//     const serviceIdsParam = Array.isArray(serviceIds) ? serviceIds.join(",") : serviceIds;
    
//     const response = await fetch(
//       `${API_BASE_URL}/bookings/available-slots-multi?serviceIds=${serviceIdsParam}&booking_date=${bookingDate}`
//     );
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch available slots: ${response.statusText}`);
//     }
    
//     const data = await response.json();
//     return data.availableSlots || [];
//   } catch (error) {
//     console.error("Error fetching available slots:", error);
//     throw error;
//   }
// }


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

    // const url =
    //   `${API_BASE_URL}/bookings/available-slots-multi` +
    //   `?serviceIds=${encodeURIComponent(serviceIdsParam)}` +
    //   `&booking_date=${encodeURIComponent(bookingDate)}`;

const userTimeZone =
  Intl.DateTimeFormat().resolvedOptions().timeZone;

const url =
  `${API_BASE_URL}/bookings/available-slots-multi` +
  `?serviceIds=${encodeURIComponent(serviceIdsParam)}` +
  `&booking_date=${encodeURIComponent(bookingDate)}` +
  `&timeZone=${encodeURIComponent(userTimeZone)}`;



    console.log("Fetching slots with:", {
      serviceIdsParam,
      bookingDate
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





/**
 * Get total duration for a set of services
 * Calculates the sum of all service durations
 * @param {Array} services - Array of service objects with duration_minutes property
 * @returns {number} Total duration in minutes
 */
export function getServicesDuration(services) {
  return services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0);
}

/**
 * Validate if the total duration fits within working hours
 * @param {number} totalDuration - Total duration in minutes
 * @param {string} selectedTime - Selected start time (HH:MM format)
 * @param {Array} bookingServices - Array of booking service objects
 * @returns {Object} Validation result { isValid: boolean, message: string }
 */
export function validateBookingDuration(totalDuration, selectedTime, bookingServices) {
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

  const startMinutes = timeToMinutes(selectedTime);
  const endMinutes = startMinutes + totalDuration;
  
  // Default working hours: 9 AM to 6 PM (9:00 - 18:00)
  // This should ideally be fetched from backend working_hours table
  const workingHourStart = 9 * 60; // 9:00 AM
  const workingHourEnd = 18 * 60;  // 6:00 PM
  
  if (startMinutes < workingHourStart) {
    return {
      isValid: false,
      message: "Selected time is before working hours (9:00 AM)"
    };
  }
  
  if (endMinutes > workingHourEnd) {
    const endTime = new Date(new Date().setHours(0, 0, 0, 0));
    endTime.setMinutes(endMinutes);
    const formattedEndTime = endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    
    return {
      isValid: false,
      message: `Services end at ${formattedEndTime}, which is after working hours (6:00 PM). Total duration: ${totalDuration} minutes`
    };
  }
  
  return { isValid: true, message: "" };
}



/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 * @param {string} timeStr - Time in HH:MM format
 * @returns {string} Formatted time string
 */
// export function formatTimeForDisplay(timeStr) {
//   if (!timeStr) return "";
  
//   const [hours, minutes] = timeStr.split(":").map(Number);
//   const period = hours >= 12 ? "PM" : "AM";
//   const displayHours = hours % 12 || 12;
  
//   return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
// }


export const formatTimeForDisplay = (time) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = new Date(`1970-01-01T${time}`);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: userTimeZone,
  });
};


/**
 * Calculate end time based on start time and duration
 * @param {string} startTime - Start time in format "HH:MM" or "H:MM AM/PM"
 * @param {number} duration - Duration in minutes
 * @returns {string} End time in "H:MM AM/PM" format
 */
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

/**
 * Format date for backend (YYYY-MM-DD -> display format)
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
// export function formatDateForDisplay(dateStr) {
//   if (!dateStr) return "";
//   const date = new Date(dateStr + "T00:00:00");
//   return date.toLocaleDateString("en-US", {
//     weekday: "short",
//     month: "short",
//     day: "numeric"
//   });
// }

export const formatDateForDisplay = (dateString) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: userTimeZone,
  });
};


/**
 * Get timezone offset from UTC
 * @returns {string} Timezone offset in format "+HH:00" or "-HH:00"
 */
export function getTimezoneOffset() {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Create a booking on the backend
 * @param {Object} bookingData - Booking data object
 * @param {string} bookingData.name - Customer name
 * @param {string} bookingData.email - Customer email
 * @param {string} bookingData.phone - Customer phone
 * @param {Array<number>} bookingData.serviceIds - Array of service IDs
 * @param {string} bookingData.booking_date - Date in YYYY-MM-DD format
 * @param {string} bookingData.booking_time - Time in HH:MM format
 * @param {string} bookingData.note - Optional booking note
 * @returns {Promise<Object>} Created booking object
 */
export async function createBooking(bookingData) {
  try {
    // Convert booking date and time to UTC before sending
    const { utcDate, utcTime } = convertToUTC(
      bookingData.booking_date,
      bookingData.booking_time
    );

    console.log(
      `[createBooking] Converting booking: ${bookingData.booking_date} ${bookingData.booking_time} -> UTC: ${utcDate} ${utcTime}`
    );

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
        booking_date: utcDate,
        booking_time: utcTime,
        note: bookingData.note || "",
        timeZone: bookingData.timeZone
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Booking failed: ${response.statusText}`);
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
  getNowInBusinessTZ,
  filterPastSlots,
  convertToUTC
};
