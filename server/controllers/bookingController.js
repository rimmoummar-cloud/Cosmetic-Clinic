import * as Booking from "../models/booking.js";
import db from "../config/db.js"; // نحتاج db لعمل transaction
import { timeToMinutes, minutesToTime } from "../utils/converttime.js";
import { getWorkingHoursByDay } from "../models/workingHoure.js";
// ==========================
// Create Booking
// ==========================
export const createBooking = async (req, res) => {

  // نأخذ connection من database
  const client = await db.connect();

  try {

    // نبدأ transaction
    await client.query("BEGIN");

    const { name, email, phone, service_id, booking_date, booking_time } = req.body;

    // ==========================
    // LOCK TABLE
    // ==========================
    // هذا يمنع أي request ثاني يعدل الجدول بنفس اللحظة
    // يعني إذا شخصين حجزوا بنفس الوقت واحد فقط سينجح
//    لا تسمح لطلب آخر بتعديل هذا الجدول الآن.
// حتى ينتهي هذا الطلب.
// هدفه:
// منع Double Booking.
   
    await client.query("LOCK TABLE bookings IN SHARE ROW EXCLUSIVE MODE");

    // ==========================
    // 1️⃣ Check time conflict
    // ==========================
    const isBooked = await Booking.checkTimeConflict(
      client,
      service_id,
      booking_date,
      booking_time
    );

    // إذا الوقت محجوز
    if (isBooked) {

      // نرجع database للحالة السابقة
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This time is already booked"
      });

    }

    // ==========================
    // 2️⃣ Find customer by phone
    // ==========================
    let customer = await Booking.findCustomerByPhone(client,phone);

    // ==========================
    // 3️⃣ Create customer if not exists
    // ==========================
    if (!customer) {

      // إذا الزبون غير موجود ننشئه
      customer = await Booking.createCustomer(
        client,
        name,
        email,
        phone
      );

    }

    // ==========================
    // 4️⃣ Create booking
    // ==========================
    const booking = await Booking.createBooking(
      client,
      customer.id,
      service_id,
      booking_date,
      booking_time
    );

    // ==========================
    // COMMIT
    // ==========================
    // تثبيت التغييرات في database
    await client.query("COMMIT");

    res.status(201).json(booking);

  } catch (error) {

    // إذا صار أي خطأ نرجع كل التغييرات
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  } finally {

    // نرجع connection للـ pool
    client.release();

  }

};


export async function getAvailableSlots(req, res) {

  try {

    const { service_id, booking_date } = req.query;

    // ==========================
    // 1️⃣ Get service duration
    // ==========================
    // نجيب مدة الخدمة بالدقائق
    const duration = await Booking.getServiceDuration(null ,service_id);

    // كل slot = 15 دقيقة
    const slotDuration = 15;

    // عدد slots التي تحتاجها الخدمة
    const slotsNeeded = Math.ceil(duration / slotDuration);


    // ==========================
    // 2️⃣ Get all bookings on this date
    // ==========================
    // نجيب كل الحجوزات في هذا اليوم
    const bookings = await Booking.getBookingsByDate( null ,booking_date);


    // ==========================
    // 3️⃣ Get working hours for the day
    // ==========================
    // نحسب اسم اليوم (Monday - Tuesday ...)
    const dayOfWeek = new Date(booking_date).toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

    // نجيب ساعات العمل لهذا اليوم
    const workingHours = await getWorkingHoursByDay(null ,dayOfWeek);

    // إذا لا يوجد دوام في هذا اليوم
    if (!workingHours)
      return res.json({ availableSlots: [] });


    // نحول بداية ونهاية الدوام لدقائق
    const startMinutes = timeToMinutes(workingHours.start_time);
    const endMinutes = timeToMinutes(workingHours.end_time);


    // ==========================
    // 4️⃣ Compute blocked slots
    // ==========================
    // نحسب كل الأوقات المحجوزة
    const blockedSlots = [];

    bookings.forEach(b => {

      const start = timeToMinutes(b.booking_time);

      const durationMinutes = b.duration_minutes;

      const slots = Math.ceil(durationMinutes / slotDuration);

      // نضيف كل slot محجوز
      for (let i = 0; i < slots; i++) {

        blockedSlots.push(
          minutesToTime(start + i * slotDuration)
        );

      }

    });


    // ==========================
    // 5️⃣ Generate all slots
    // ==========================
    // ننشئ كل الأوقات الممكنة ضمن ساعات العمل
    const allSlots = [];

    for (
      let m = startMinutes;
      m <= endMinutes - slotDuration;
      m += slotDuration
    ) {

      allSlots.push(minutesToTime(m));

    }


    // ==========================
    // 6️⃣ Filter available slots
    // ==========================
    // نحذف الأوقات المحجوزة
    const availableSlots = allSlots.filter(
      s => !blockedSlots.includes(s)
    );


    // ==========================
    // 7️⃣ Ensure service fits required slots
    // ==========================
    // نتأكد أن الخدمة تأخذ عدد slots المطلوب متتالية
    const finalSlots = [];

    availableSlots.forEach(slot => {

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


    // نرجع الأوقات المتاحة للـ frontend
    res.json({ availableSlots: finalSlots });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

}