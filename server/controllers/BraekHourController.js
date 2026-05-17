import * as model from "../models/BrakeHoure.js";
import { getBookingsByDate } from "../models/booking.js";
import { DateTime } from "luxon";
import { getWorkingHoursByDay } from "../models/workingHoure.js";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";
export const getAllWorkingHours = async (req, res) => {
  try {
    const data = await model.getAllWorkingHours();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching working hours:", error);

    res.status(500).json({
      message: "Failed to fetch working hours",
    });
  }
};

export const createWorkingHour = async (req, res) => {
  try {
    const {
      work_date,
      start_time,
      end_time,
    } = req.body;

    if (
      work_date === undefined ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message:
          "End time must be after start time",
      });
    }

    const result =
      await model.createWorkingHour(
        work_date,
        start_time,
        end_time
      );

    res.status(201).json(result);
  } catch (error) {
    console.error(
      "Error creating working hour:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create working hour",
    });
  }
};

export const updateWorkingHour = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      work_date,
      start_time,
      end_time,
    } = req.body;

    if (
      work_date === undefined ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        message:
          "End time must be after start time",
      });
    }

    const result =
      await model.updateWorkingHour(
        id,
        work_date,
        start_time,
        end_time
      );

    if (!result) {
      return res.status(404).json({
        message:
          "Working hour not found",
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error updating working hour:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update working hour",
    });
  }
};

export const deleteWorkingHour = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await model.deleteWorkingHour(id);

    if (!result) {
      return res.status(404).json({
        message:
          "Working hour not found",
      });
    }

    res.status(200).json({
      message:
        "Working hour deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting working hour:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete working hour",
    });
  }
};


// ==========================
// Get Available Slots for Multiple Services
// ==========================

// ==========================
// Get Available Slots for Admin (No Services)
// ==========================

// export async function getAvailableSlotsAdmin(req, res) {
//   try {
//     console.log(">>> getAvailableSlotsAdmin HIT");

//     let { booking_datetime } = req.query;

//     if (!booking_datetime) {
//       return res.status(400).json({
//         message: "Missing required field: booking_datetime",
//         availableSlots: [],
//       });
//     }

//     const bookingDateTime = DateTime.fromISO(booking_datetime, {
//       setZone: true,
//     }).setZone(BUSINESS_TIME_ZONE);

//     if (!bookingDateTime.isValid) {
//       return res.status(400).json({
//         message: "Invalid booking_datetime format",
//         availableSlots: [],
//       });
//     }

//     const bookingDate = bookingDateTime.toISODate();
//     const slotDuration = Number(process.env.SLOT_DURATION) || 15;

//     // ✅ جلب working hours أولاً قبل أي استخدام
//     const dayOfWeek = bookingDateTime.weekday % 7;
//     const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

//     if (!workingHours) {
//       return res.status(400).json({
//         message: "No working hours configured for this day",
//         availableSlots: [],
//       });
//     }

//     // ✅ جلب الحجوزات بعدها
//     const bookings = await getBookingsByDate(null, bookingDate);

//     console.log("bookingDate:", bookingDate);
//     console.log("dayOfWeek:", dayOfWeek);
//     console.log("workingHours:", workingHours);
//     console.log("bookings count:", bookings.length);

//     const startDateTime = DateTime.fromISO(
//       `${bookingDate}T${workingHours.start_time}`,
//       { zone: BUSINESS_TIME_ZONE }
//     );

//     const endDateTime = DateTime.fromISO(
//       `${bookingDate}T${workingHours.end_time}`,
//       { zone: BUSINESS_TIME_ZONE }
//     );

//     if (!startDateTime.isValid || !endDateTime.isValid) {
//       return res.status(500).json({
//         message: "Invalid working hours format",
//         availableSlots: [],
//       });
//     }

//     const startMinutes = startDateTime.hour * 60 + startDateTime.minute;
//     const endMinutes = endDateTime.hour * 60 + endDateTime.minute;

//     const blockedSlots = new Set();
//     const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
//     const currentDateStr = now.toISODate();
//     const currentMinutes = now.hour * 60 + now.minute;

//     bookings.forEach((b) => {
//       if (!["pending", "approved"].includes(b.status)) return;

//       // ✅ handle both JS Date object and ISO string
//       const bookingStart =
//         b.booking_datetime instanceof Date
//           ? DateTime.fromJSDate(b.booking_datetime).setZone(BUSINESS_TIME_ZONE)
//           : DateTime.fromISO(b.booking_datetime).setZone(BUSINESS_TIME_ZONE);

//       const start = bookingStart.hour * 60 + bookingStart.minute;
//       const slots = Math.ceil(b.duration_minutes / slotDuration);

//       for (let i = 0; i < slots; i++) {
//         const slotTime = start + i * slotDuration;

//         if (bookingDate === currentDateStr && slotTime < currentMinutes) {
//           continue;
//         }

//         blockedSlots.add(minutesToTime(slotTime));
//       }
//     });

//     console.log("blockedSlots:", [...blockedSlots]);

//     // Generate all slots within working hours
//     const allSlots = [];
//     for (let m = startMinutes; m < endMinutes; m += slotDuration) {
//       allSlots.push(minutesToTime(m));
//     }

//     // Remove blocked slots
//     const finalSlots = allSlots.filter((slot) => !blockedSlots.has(slot));

//     // Convert back to HH:mm in business timezone
//     const convertedSlots = finalSlots.map((slot) => {
//       return DateTime.fromISO(`${bookingDate}T${slot}`, {
//         zone: BUSINESS_TIME_ZONE,
//       }).toFormat("HH:mm");
//     });

//     res.json({ availableSlots: convertedSlots });
//   } catch (error) {
//     console.error("Available slots error:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// }
// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function getAvailableSlotsAdmin(req, res) {

  try {

    console.log(">>> getAvailableSlotsAdmin HIT");

    let { booking_datetime } = req.query;
    // const userTimeZone = timeZone || "UTC";
console.log("Received booking_datetime:", booking_datetime);
    // Validate input
    if (!booking_datetime) {
      return res.status(400).json({
        message: "Missing required field: booking_datetime",
        availableSlots: [],
      });
    }

    const bookingDateTime = DateTime.fromISO(
      booking_datetime,
      { setZone: true }
    ).setZone(BUSINESS_TIME_ZONE);

    if (!bookingDateTime.isValid) {
      return res.status(400).json({
        message: "Invalid booking_datetime format",
        availableSlots: [],
      });
    }

    const bookingDate = bookingDateTime
      .setZone(BUSINESS_TIME_ZONE)
      .toISODate();

    const slotDuration =
      Number(process.env.SLOT_DURATION) || 15;

    // Get bookings for the selected date
    const bookings = await getBookingsByDate(
      null,
      bookingDate,
    
    );
console.log("bookingDate:", bookings);


    // Fetch working hours
    const dayOfWeek =
      bookingDateTime.weekday % 7;

    const workingHours =
      await getWorkingHoursByDay(
        null,
        dayOfWeek
      );

    if (!workingHours) {
      return res.status(400).json({
        message:
          "No working hours configured for this day",
        availableSlots: [],
      });
    }

    const startDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.start_time}`,
      { zone: BUSINESS_TIME_ZONE }
    );

    const endDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.end_time}`,
      { zone: BUSINESS_TIME_ZONE }
    );

    if (
      !startDateTime.isValid ||
      !endDateTime.isValid
    ) {
      return res.status(500).json({
        message:
          "Invalid working hours format",
        availableSlots: [],
      });
    }

    const startMinutes =
      startDateTime.hour * 60 +
      startDateTime.minute;

    const endMinutes =
      endDateTime.hour * 60 +
      endDateTime.minute;

    // Build blocked slots
    const blockedSlots = new Set();

    const now = DateTime.now()
      .setZone(BUSINESS_TIME_ZONE);

    const currentDateStr =
      now.toISODate();

    const currentMinutes =
      now.hour * 60 +
      now.minute;

    bookings.forEach((b) => {

      if (
        !["pending", "approved"]
          .includes(b.status)
      ) {
        return;
      }

      const bookingStart =
        DateTime
          .fromJSDate(
            b.booking_datetime
          )
          .setZone(
            BUSINESS_TIME_ZONE
          );

      const startTime =
        bookingStart.toFormat(
          "HH:mm"
        );

      const start =
        timeToMinutes(startTime);

      const slots = Math.ceil(
        b.duration_minutes /
        slotDuration
      );

      for (
        let i = 0;
        i < slots;
        i++
      ) {

        const slotTime =
          start +
          i * slotDuration;

        if (
          bookingDate ===
            currentDateStr &&
          slotTime <
            currentMinutes
        ) {
          continue;
        }

        blockedSlots.add(
          minutesToTime(
            slotTime
          )
        );
      }
    });

    // Generate all slots
    const allSlots = [];

    for (
      let m = startMinutes;
      m < endMinutes;
      m += slotDuration
    ) {
      allSlots.push(
        minutesToTime(m)
      );
    }

    // Remove blocked slots
    const finalSlots =
      allSlots.filter(
        (slot) =>
          !blockedSlots.has(
            slot
          )
      );

    const convertedSlots =
      finalSlots.map(
        (slot) => {

          const dt =
            DateTime.fromISO(
              `${bookingDate}T${slot}`,
              {
                zone:
                  BUSINESS_TIME_ZONE,
              }
            );

          return dt.toFormat(
            "HH:mm"
          );
        }
      );

    res.json({
      availableSlots:
        convertedSlots,
    });

  } catch (error) {

    console.error(
      "Available slots error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });

  }

}