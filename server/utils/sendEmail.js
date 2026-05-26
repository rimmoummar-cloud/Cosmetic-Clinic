// import nodemailer from "nodemailer";
// console.log("SMTP_USER =", process.env.SMTP_USER);
// console.log("SMTP_PASS =", process.env.SMTP_PASS);
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export async function sendBookingEmail({
//   to,
//   customerName,
//   serviceName,
//   bookingDate,
//   bookingTime,
// }) {
//   try {
//     await transporter.sendMail({
//   from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
//       to,
//       subject: "Booking Confirmation 💖",
//       html: `
//         <h2>Hello ${customerName} 💖</h2>

//         <p>Your booking is confirmed successfully.</p>

//         <ul>
//           <li><b>Service:</b> ${serviceName}</li>
//           <li><b>Date:</b> ${bookingDate}</li>
//           <li><b>Time:</b> ${bookingTime}</li>
//         </ul>

//         <p>See you soon ✨</p>
//       `,
//     });

//     console.log("Email sent successfully ✔️");
//   } catch (error) {
//     console.log("EMAIL ERROR ❌", error.message);
//   }
// }
import nodemailer from "nodemailer";
import { DateTime } from "luxon";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // مهم لمعظم SMTP
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingEmail({
  to,
  customerName,
  serviceName,
  bookingDate,
  bookingTime,
  bookingId,
}) {
  try {
    // تحويل الوقت من UTC إلى business timezone
  // const dt = DateTime
  // .fromJSDate(new Date(bookingDate))
  // .setZone(BUSINESS_TIME_ZONE);
const dt = DateTime
  .fromISO(bookingDate, { zone: "utc" })
  .setZone(BUSINESS_TIME_ZONE);

    const formattedDate = dt.toFormat("yyyy-LL-dd");
    const formattedTime = dt.toFormat("HH:mm");

    const reviewLink =
      `${process.env.FRONTEND_URL}/AcceptForm/${bookingId}`;

    const hasDisclaimers = !!bookingId;

    await transporter.sendMail({
      from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: hasDisclaimers
        ? "Complete Your Booking Review ✨"
        : "Booking Request Received ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
          
          <h2>Hello ${customerName} 💖</h2>

          <p>Your booking request has been received successfully.</p>

          <div style="background:#f8f8f8;padding:16px;border-radius:12px;margin:20px 0;">
            <p><b>Services:</b> ${serviceName}</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <p><b>Time:</b> ${formattedTime}</p>
          </div>

          ${
            hasDisclaimers
              ? `
              <p>
                Before final confirmation, please review and accept the treatment disclaimers.
              </p>

              <a href="${reviewLink}"
                style="display:inline-block;margin-top:20px;padding:14px 24px;background:#7aa35a;color:white;text-decoration:none;border-radius:12px;font-weight:bold;">
                Review & Accept Form
              </a>
              `
              : ""
          }

          <p style="margin-top:30px;color:#777;">
            Shiny Skin Clinic ✨
          </p>

        </div>
      `,
    });

    console.log("Booking email sent ✔️");

  } catch (error) {
    console.log("EMAIL ERROR ❌", error.message);
  }
}




export async function sendBookingApprovedEmail({
  to,
  customerName,
  serviceName,
  bookingDate,
}) {
  try {

 const dt = DateTime
  .fromJSDate(new Date(bookingDate))
  .setZone(BUSINESS_TIME_ZONE);

  
    const formattedDate =
      dt.toFormat("yyyy-LL-dd");

    const formattedTime =
      dt.toFormat("HH:mm");

    await transporter.sendMail({
      from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,

      subject:
        "Your Booking Has Been Approved ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">

          <h2>
            Hello ${customerName} 💖
          </h2>

          <p>
            Your booking has been approved successfully.
          </p>

          <div style="
            background:#f8f8f8;
            padding:16px;
            border-radius:12px;
            margin:20px 0;
          ">
            <p>
              <b>Services:</b>
              ${serviceName}
            </p>

            <p>
              <b>Date:</b>
              ${formattedDate}
            </p>

            <p>
              <b>Time:</b>
              ${formattedTime}
            </p>
          </div>

          <p>
            We are looking forward to seeing you ✨
          </p>

          <p>
            You will also receive a reminder
            24 hours before your appointment.
          </p>

          <p style="
            margin-top:30px;
            color:#777;
          ">
            Shiny Skin Clinic ✨
          </p>

        </div>
      `,
    });

    console.log(
      "APPROVED EMAIL SENT ✔️"
    );

  } catch (error) {

    console.log(
      "APPROVED EMAIL ERROR ❌",
      error.message
    );

  }
}




export async function sendBookingCancelledEmail({
  to,
  customerName,
  serviceName,
  bookingDate,
}) {

  try {

    const dt = DateTime
      .fromISO(bookingDate, {
        zone: "utc"
      })
      .setZone(BUSINESS_TIME_ZONE);

    const formattedDate =
      dt.toFormat("yyyy-LL-dd");

    const formattedTime =
      dt.toFormat("HH:mm");

    await transporter.sendMail({

      from:
        `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,

      to,

      subject:
        "Booking Cancelled",

      html: `
        <div style="
          font-family:Arial;
          max-width:600px;
          margin:auto;
          padding:20px;
        ">

          <h2>
            Hello ${customerName}
          </h2>

          <p>
            Unfortunately, your booking has been cancelled.
          </p>

          <div style="
            background:#f8f8f8;
            padding:16px;
            border-radius:12px;
            margin:20px 0;
          ">

            <p>
              <b>Services:</b>
              ${serviceName}
            </p>

            <p>
              <b>Date:</b>
              ${formattedDate}
            </p>

            <p>
              <b>Time:</b>
              ${formattedTime}
            </p>

          </div>

          <p>
            If you would like to book another appointment,
            feel free to contact us anytime 💖
          </p>

          <p style="
            margin-top:30px;
            color:#777;
          ">
            Shiny Skin Clinic ✨
          </p>

        </div>
      `,
    });

    console.log(
      "Cancellation email sent ✔️"
    );

  } catch (error) {

    console.log(
      "CANCEL EMAIL ERROR ❌",
      error.message
    );

  }
}


export async function sendReminderEmail({
  to,
  customerName,
  bookingDate,
  serviceName,
  confirmUrl,
  cancelUrl,
}) {
  try {
console.log("RAW bookingDate 👉", bookingDate);
console.log("TYPE 👉", typeof bookingDate);
console.log("IS DATE? 👉", bookingDate instanceof Date);

  //  const dt = DateTime
  // .fromJSDate(new Date(bookingDate))
  // .setZone(BUSINESS_TIME_ZONE);
  const dt = DateTime
  .fromISO(bookingDate, { zone: "utc" })
  .setZone(BUSINESS_TIME_ZONE);
console.log("Luxon parse:", dt.toString());
console.log("Valid?", dt.isValid);
console.log("Date:", dt.toFormat("yyyy-LL-dd"));
console.log("Time:", dt.toFormat("HH:mm"));




    const formattedDate = dt.toFormat("yyyy-LL-dd");
    const formattedTime = dt.toFormat("HH:mm");

    await transporter.sendMail({
      from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: "Booking Reminder ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">

          <h2>Hello ${customerName} 💖</h2>

          <p>This is a reminder for your upcoming appointment.</p>

          <p><b>Services:</b> ${serviceName}</p>
          <p><b>Date:</b> ${formattedDate}</p>
          <p><b>Time:</b> ${formattedTime}</p>

          <div style="margin-top:30px;">

            <a href="${confirmUrl}"
              style="padding:12px 20px;background:#7aa35a;color:white;text-decoration:none;border-radius:10px;margin-right:10px;">
              Confirm
            </a>

            <a href="${cancelUrl}"
              style="padding:12px 20px;background:#d9534f;color:white;text-decoration:none;border-radius:10px;">
              Cancel
            </a>

          </div>

        </div>
      `,
    });

    console.log("Reminder email sent ✔️");

  } catch (error) {
    console.log("Reminder email error ❌", error.message);
  }
}

export default transporter;