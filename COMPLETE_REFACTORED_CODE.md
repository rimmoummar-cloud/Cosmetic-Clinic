# Complete Refactored Code Reference

## 1. server/models/booking.js

```javascript
import db from "../config/db.js";
import { DateTime } from "luxon";

// ==========================
// Customer functions
// ==========================
export const findCustomerByPhone = async (client = null, phone) => {
  const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "SELECT * FROM customers WHERE phone = $1",
    [phone]
  );
  return res.rows[0] || null;
};

export const getallbookings = async () => {
  const res = await db.query("SELECT * FROM bookings");
  return res.rows;
};

export const createCustomer = async (client = null, name, email, phone) => {
  const queryExecutor = client || db;
  const res = await queryExecutor.query(
    "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phone]
  );
  return res.rows[0];
};

// ==========================
// Booking functions
// ==========================
export const createBookingMulti = async (
  client = null,
  customer_id,
  serviceIds = [],
  booking_datetime
) => {
  const queryExecutor = client || db;

  // Input validation
  if (!customer_id) {
    throw new Error("customer_id is required");
  }
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    throw new Error("serviceIds must be a non-empty array");
  }
  if (!booking_datetime) {
    throw new Error("booking_datetime is required");
  }

  // 1️⃣ Calculate total duration and total amount for all services
  let totalDuration = 0;
  let totalAmount = 0;
  const servicesData = [];

  for (let serviceId of serviceIds) {
    if (!serviceId || isNaN(serviceId)) {
      throw new Error(`Invalid service ID: ${serviceId}`);
    }

    const duration = await getServiceDuration(client, serviceId);
    if (!duration || duration <= 0) {
      throw new Error(`Invalid duration for service ${serviceId}`);
    }

    const priceRes = await queryExecutor.query(
      "SELECT price FROM services WHERE id=$1",
      [serviceId]
    );
    if (priceRes.rows.length === 0) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    const price = priceRes.rows[0]?.price || 0;
    totalDuration += Number(duration);
    totalAmount += Number(price);
    servicesData.push({ serviceId, duration, price });
  }

  if (totalDuration <= 0) {
    throw new Error("Total duration must be greater than 0");
  }

  // 2️⃣ Validate and convert booking datetime to UTC
  const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
    setZone: true,
  }).toUTC();

  if (!bookingDateTimeUTC.isValid) {
    throw new Error("Invalid booking_datetime: must be a valid ISO string");
  }

  // 3️⃣ Check for time overlaps using proper overlap detection
  // existing_start < new_end AND existing_end > new_start
  const newStart = bookingDateTimeUTC.toISO();
  const newEnd = bookingDateTimeUTC
    .plus({ minutes: totalDuration })
    .toISO();

  const conflictRes = await queryExecutor.query(
    `SELECT 1
     FROM bookings
     WHERE booking_datetime < $2
       AND (booking_datetime + (duration_minutes * interval '1 minute')) > $1
       AND status NOT IN ('cancelled')
     FOR UPDATE`,
    [newStart, newEnd]
  );

  if (conflictRes.rowCount > 0) {
    throw new Error("This time is already booked");
  }

  // 4️⃣ Create the main booking record
  const bookingRes = await queryExecutor.query(
    `INSERT INTO bookings (customer_id, booking_datetime, duration_minutes, total_amount, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [customer_id, newStart, totalDuration, totalAmount]
  );

  const booking = bookingRes.rows[0];

  // 5️⃣ Insert each service into booking_services table
  for (let s of servicesData) {
    await queryExecutor.query(
      `INSERT INTO booking_services (booking_id, service_id, duration_minutes, price)
       VALUES ($1, $2, $3, $4)`,
      [booking.id, s.serviceId, Number(s.duration), Number(s.price)]
    );
  }

  return booking;
};

// ==========================
// Service functions
// ==========================

export const getServiceDuration = async (client = null, service_id) => {
  const queryExecutor = client || db;

  const res = await queryExecutor.query(
    "SELECT duration_minutes FROM services WHERE id=$1",
    [service_id]
  );

  if (res.rows.length === 0) {
    throw new Error("Service not found");
  }

  return res.rows[0].duration_minutes;
};

export const getBookingsByDate = async (
  client = null,
  bookingDate,
  timeZone = "UTC"
) => {
  const queryExecutor = client || db;

  const dayStart = DateTime.fromISO(bookingDate, { zone: timeZone, setZone: true })
    .startOf("day")
    .toUTC();
  const dayEnd = dayStart.plus({ days: 1 });

  const res = await queryExecutor.query(
    `SELECT booking_datetime, duration_minutes
       FROM bookings
      WHERE booking_datetime >= $1
        AND booking_datetime < $2
        AND status IN ('confirmed', 'pending')`,
    [dayStart.toISO(), dayEnd.toISO()]
  );
  return res.rows;
};
```

---

## 2. server/controllers/bookingController.js

```javascript
import * as Booking from "../models/booking.js";
import db from "../config/db.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
import { DateTime } from "luxon";

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

// ==========================
// Create Multi-Service Booking
// ==========================
export const createBooking = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { name, email, phone, serviceIds, booking_datetime } = req.body;

    // Input validation
    if (!name || !email || !phone || !serviceIds || !booking_datetime) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Missing required fields: name, email, phone, serviceIds, booking_datetime",
      });
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "serviceIds must be a non-empty array",
      });
    }

    // Lock bookings table for conflict detection
    await client.query("LOCK TABLE bookings IN SHARE ROW EXCLUSIVE MODE");

    // Find or create customer
    let customer = await Booking.findCustomerByPhone(client, phone);

    if (!customer) {
      customer = await Booking.createCustomer(client, name, email, phone);
    }

    // Create multi-service booking
    // This function includes overlap detection inside the same transaction
    const booking = await Booking.createBookingMulti(
      client,
      customer.id,
      serviceIds,
      booking_datetime
    );

    await client.query("COMMIT");

    res.status(201).json(booking);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Booking error:", error.message);

    // Return appropriate error response
    if (
      error.message.includes("already booked") ||
      error.message.includes("conflict")
    ) {
      return res.status(409).json({ message: error.message });
    }

    if (
      error.message.includes("Invalid") ||
      error.message.includes("required")
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ==========================
// Get Available Slots for Multiple Services
// ==========================
export async function getAvailableSlotsMulti(req, res) {
  try {
    let { serviceIds, booking_datetime, timeZone } = req.query;
    const userTimeZone = timeZone || "UTC";

    // Validate input
    if (!serviceIds || !booking_datetime) {
      return res.status(400).json({
        message: "Missing required fields: serviceIds, booking_datetime",
        availableSlots: [],
      });
    }

    // Convert serviceIds to array
    if (typeof serviceIds === "string") {
      serviceIds = serviceIds
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        message: "serviceIds must be a non-empty array of valid numbers",
        availableSlots: [],
      });
    }

    // Parse booking datetime in user's timezone
    const bookingDateTime = DateTime.fromISO(booking_datetime, {
      setZone: true,
    }).setZone(userTimeZone);

    if (!bookingDateTime.isValid) {
      return res.status(400).json({
        message: "Invalid booking_datetime format",
        availableSlots: [],
      });
    }

    const bookingDate = bookingDateTime.toISODate();

    // Calculate total duration for all services
    let totalMinutes = 0;
    for (let id of serviceIds) {
      const duration = await Booking.getServiceDuration(null, id);
      totalMinutes += duration;
    }

    if (totalMinutes <= 0) {
      return res.status(400).json({
        message: "Invalid total service duration",
        availableSlots: [],
      });
    }

    const slotDuration = 15;
    const slotsNeeded = Math.ceil(totalMinutes / slotDuration);

    // Get bookings for the selected date
    const bookings = await Booking.getBookingsByDate(
      null,
      bookingDate,
      userTimeZone
    );

    // Fetch working hours for the selected day
    const dayOfWeek = bookingDateTime.weekday % 7;
    const workingHours = await getWorkingHoursByDay(null, dayOfWeek);

    if (!workingHours) {
      return res.status(400).json({
        message: "No working hours configured for this day",
        availableSlots: [],
      });
    }

    // Parse working hours in user's timezone
    const startDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.start_time}`,
      { zone: userTimeZone }
    );
    const endDateTime = DateTime.fromISO(
      `${bookingDate}T${workingHours.end_time}`,
      { zone: userTimeZone }
    );

    if (!startDateTime.isValid || !endDateTime.isValid) {
      return res.status(500).json({
        message: "Invalid working hours format",
        availableSlots: [],
      });
    }

    const startMinutes =
      startDateTime.hour * 60 + startDateTime.minute;
    const endMinutes = endDateTime.hour * 60 + endDateTime.minute;

    // Build list of blocked slots
    const blockedSlots = new Set();
    const now = DateTime.now().setZone(userTimeZone);
    const currentDateStr = now.toISODate();
    const currentMinutes = now.hour * 60 + now.minute;

    bookings.forEach((b) => {
      const bookingStart = DateTime.fromJSDate(b.booking_datetime)
        .setZone(userTimeZone);
      const startTime = bookingStart.toFormat("HH:mm");
      const start = timeToMinutes(startTime);
      const slots = Math.ceil(b.duration_minutes / slotDuration);

      for (let i = 0; i < slots; i++) {
        const slotTime = start + i * slotDuration;

        // Skip past slots on today
        if (bookingDate === currentDateStr && slotTime < currentMinutes) {
          continue;
        }

        blockedSlots.add(minutesToTime(slotTime));
      }
    });

    // Generate all available slots
    const allSlots = [];
    for (let m = startMinutes; m <= endMinutes - slotDuration; m += slotDuration) {
      allSlots.push(minutesToTime(m));
    }

    // Filter slots: keep only those with enough consecutive free slots
    const finalSlots = [];
    allSlots.forEach((slot) => {
      const start = timeToMinutes(slot);
      let canFit = true;

      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlot = minutesToTime(start + i * slotDuration);
        if (blockedSlots.has(checkSlot)) {
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
    console.error("Available slots error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

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
```

---

## 3. Key Frontend Changes (dataBooking.js)

Updated `validateBookingDuration()` to accept dynamic working hours:

```javascript
export function validateBookingDuration(
  totalDuration,
  selectedTime,
  bookingServices,
  workingHourStart = 9,
  workingHourEnd = 18
) {
  // ... validation logic with dynamic workingHourStart and workingHourEnd
  const workingStartMinutes = workingHourStart * 60;
  const workingEndMinutes = workingHourEnd * 60;
  // ... rest of implementation
}
```

---

## Critical SQL Query - Overlap Detection

```sql
SELECT 1
FROM bookings
WHERE booking_datetime < $2
  AND (booking_datetime + (duration_minutes * interval '1 minute')) > $1
  AND status NOT IN ('cancelled')
FOR UPDATE;
```

**Parameters:**
- `$1`: New booking start time (UTC ISO format)
- `$2`: New booking end time (UTC ISO format)

**Returns:** 1 row if conflict exists, 0 rows if time slot is available

**Locking:** `FOR UPDATE` ensures row-level locking within the transaction
