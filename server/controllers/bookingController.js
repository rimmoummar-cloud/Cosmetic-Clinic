import * as Booking from "../models/booking.js";
import db from "../config/db.js"; // نحتاج db لعمل transaction
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import { DateTime } from "luxon";
import { check } from "zod";
// ==========================
// Get All Bookings
// ==========================

export const getallbookingss = async (req, res) => {
  try {
    const bookings = await Booking.getallbookings();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------- craet mult booking ---------------

export const createBooking = async (req, res) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const { name, email, phone, serviceIds, booking_date, booking_time } = req.body;
const formattedDate = DateTime.fromISO(booking_date).toISODate();
        await client.query("LOCK TABLE bookings IN SHARE ROW EXCLUSIVE MODE");

        // 1️⃣ Check conflict (يمكنك تعديل checkTimeConflict ليأخذ array من services)
        const isBooked = await Booking.checkTimeConflictMulti(
            client,
            serviceIds,
            booking_date,
            booking_time
        );

        if (isBooked) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "This time is already booked" });
        }

        // 2️⃣ Find customer
        let customer = await Booking.findCustomerByPhone(client, phone);

        if (!customer) {
            customer = await Booking.createCustomer(client, name, email, phone);
        }

        // 3️⃣ Create multi-service booking
        const booking = await Booking.createBookingMulti(
            client,
            customer.id,
            serviceIds,
            formattedDate,
            booking_time
        );

        await client.query("COMMIT");

        res.status(201).json(booking);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};


// export async function getAvailableSlots(req, res) {
//   try {
//     let { service_ids, booking_date } = req.query;

//     // تأكد أن service_ids مصفوفة من الأرقام
//     if (typeof service_ids === "string") {
//       service_ids = service_ids.split(",").map(Number);
//     }

//     // ==========================
//     // 1️⃣ Get total service duration
//     // ==========================
//     let totalDuration = 0;
//     for (let id of service_ids) {
//       totalDuration += await Booking.getServiceDuration(null, id);
//     }

//     const slotDuration = 15;
//     const slotsNeeded = Math.ceil(totalDuration / slotDuration);

//     // ==========================
//     // 2️⃣ Get all bookings on this date
//     // ==========================
//     const bookings = await Booking.getBookingsByDate(null, booking_date);

//     // ==========================
//     // 3️⃣ Get working hours for the day
//     // ==========================
//     const dayOfWeek = new Date(booking_date).toLocaleDateString(
//       "en-US",
//       { weekday: "long" }
//     );

//     const workingHours = await getWorkingHoursByDay(null, dayOfWeek);
//     if (!workingHours) return res.json({ availableSlots: [] });

//     const startMinutes = timeToMinutes(workingHours.start_time);
//     const endMinutes = timeToMinutes(workingHours.end_time);

//     // ==========================
//     // 4️⃣ Compute blocked slots
//     // ==========================
//     const blockedSlots = [];
//     bookings.forEach(b => {
//       const start = timeToMinutes(b.booking_time);
//       const slots = Math.ceil(b.duration_minutes / slotDuration);
//       for (let i = 0; i < slots; i++) {
//         blockedSlots.push(minutesToTime(start + i * slotDuration));
//       }
//     });

//     // ==========================
//     // 5️⃣ Generate all slots
//     // ==========================
//     const allSlots = [];
//     for (let m = startMinutes; m <= endMinutes - slotDuration; m += slotDuration) {
//       allSlots.push(minutesToTime(m));
//     }

//     // ==========================
//     // 6️⃣ Filter available slots
//     // ==========================
//     const availableSlots = allSlots.filter(s => !blockedSlots.includes(s));

//     // ==========================
//     // 7️⃣ Ensure total service fits required slots
//     // ==========================
//     const finalSlots = [];
//     availableSlots.forEach(slot => {
//       const start = timeToMinutes(slot);
//       let canFit = true;
//       for (let i = 0; i < slotsNeeded; i++) {
//         const checkSlot = minutesToTime(start + i * slotDuration);
//         if (blockedSlots.includes(checkSlot)) {
//           canFit = false;
//           break;
//         }
//       }
//       if (canFit) finalSlots.push(slot);
//     });

//     res.json({ availableSlots: finalSlots });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// }


export async function getAvailableSlotsMulti(req, res) {
    try {
        let { serviceIds, booking_date } = req.query;

        // =========================
        // FIX 1 — Convert to array
        // =========================
        if (!serviceIds) {
            return res.json({ availableSlots: [] });
        }

        if (typeof serviceIds === "string") {
            serviceIds = serviceIds
                .split(",")
                .map(id => parseInt(id))
                .filter(id => !isNaN(id));
        }

        // safety
        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.json({ availableSlots: [] });
        }

        // =========================
        // حساب مجموع المدة
        // =========================
        let totalMinutes = 0;
        for (let id of serviceIds) {
            const duration = await Booking.getServiceDuration(null, id);
            totalMinutes += duration;
        }

        const slotDuration = 15;
        const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

        const bookings = await Booking.getBookingsByDate(null, booking_date);

        // =========================
        // working hours
        // =========================
        // const dayOfWeek = new Date(booking_date)
        //     .toLocaleDateString("en-US", { weekday: "long" });

// const dayOfWeek = new Date(booking_date + "T00:00:00")
//   .toLocaleDateString("en-US", { weekday: "long" });


//   const dayOfWeek = DateTime
//   .fromISO(booking_date)
//   .toFormat("cccc");
const dayOfWeek = DateTime
  .fromISO(booking_date)
  .weekday % 7;
        const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

        if (!workingHours) {
            return res.json({ availableSlots: [] });
        }

        const startMinutes = timeToMinutes(workingHours.start_time);
        const endMinutes = timeToMinutes(workingHours.end_time);

        // =========================
        // blocked slots with same-day filtering
        // =========================
        const blockedSlots = [];
        // const now = new Date();
        const now = DateTime.now();
        // const currentDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        // const currentDateStr = now.toLocaleDateString("en-CA");
        // const currentMinutes = now.getHours() * 60 + now.getMinutes();

const currentDateStr = now.toISODate(); // YYYY-MM-DD
const currentMinutes = now.hour * 60 + now.minute;

        bookings.forEach(b => {
            const start = timeToMinutes(b.booking_time);
            const slots = Math.ceil(b.duration_minutes / slotDuration);

            for (let i = 0; i < slots; i++) {
                const slotTime = start + i * slotDuration;

                // =========================
                // same-day past filtering
                // =========================
                if (booking_date === currentDateStr && slotTime < currentMinutes) {
                    continue; // تجاهل أي وقت مضى اليوم
                }

                blockedSlots.push(minutesToTime(slotTime));
            }
        });

        // =========================
        // generate all slots
        // =========================
        const allSlots = [];
        for (let m = startMinutes; m <= endMinutes - slotDuration; m += slotDuration) {
            allSlots.push(minutesToTime(m));
        }

        // =========================
        // filter consecutive slots
        // =========================
        const finalSlots = [];
        allSlots.forEach(slot => {
            const start = timeToMinutes(slot);
            let canFit = true;

            for (let i = 0; i < slotsNeeded; i++) {
                const checkSlot = minutesToTime(start + i * slotDuration);
                if (blockedSlots.includes(checkSlot)) {
                    canFit = false;
                    break;
                }
            }

            if (canFit) {
                finalSlots.push(slot);
            }
        });

        res.json({ availableSlots: finalSlots });

    } catch (error) {
        console.error("Slots error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
