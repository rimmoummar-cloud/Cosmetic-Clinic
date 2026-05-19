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
    const dt = DateTime.fromISO(bookingDate, { zone: "utc" })
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