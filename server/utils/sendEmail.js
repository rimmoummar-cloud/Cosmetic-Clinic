
import nodemailer from "nodemailer";
import { DateTime } from "luxon";

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
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
  acceptanceToken, // ✅ FIX
}) {
  try {
    const dt = DateTime
      .fromISO(bookingDate, { zone: "utc" })
      .setZone(BUSINESS_TIME_ZONE);

    const formattedDate = dt.toFormat("yyyy-LL-dd");
    const formattedTime = dt.toFormat("HH:mm");

    const reviewLink = `${process.env.FRONTEND_URL}/AcceptForm?token=${acceptanceToken}`;

    const hasDisclaimers = !!acceptanceToken;

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






export async function sendWaitingListApprovedEmail({
  to,
  customerName,
}) {
  try {
    const bookingLink =
      `${process.env.FRONTEND_URL}`;

    await transporter.sendMail({
      from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,

      subject: "A Slot Is Now Available ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">

          <h2>Hello ${customerName} 💖</h2>

          <p>
            Good news!
          </p>

          <p>
            A slot matching your waiting list request is now available.
          </p>

          <p>
            Click below to complete your booking.
          </p>

          <a
            href="${bookingLink}"
            style="
              display:inline-block;
              margin-top:20px;
              padding:14px 24px;
              background:#7aa35a;
              color:white;
              text-decoration:none;
              border-radius:12px;
              font-weight:bold;
            "
          >
            Book Appointment
          </a>

          <p style="margin-top:30px;color:#777;">
            Shiny Skin Clinic ✨
          </p>

        </div>
      `,
    });

    console.log(
      "WAITING LIST APPROVED EMAIL SENT ✔️"
    );

  } catch (error) {

    console.log(
      "WAITING LIST EMAIL ERROR ❌",
      error.message
    );

  }
}


export async function sendContactReplyEmail({
  to,
  customerName,
  replyMessage,
}) {
  try {
    await transporter.sendMail({
      from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: "Reply To Your Message ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">

          <h2>Hello ${customerName} 💖</h2>

          <p>Thank you for contacting us.</p>

          <div style="
            background:#f8f8f8;
            padding:16px;
            border-radius:12px;
            margin:20px 0;
          ">
            ${replyMessage}
          </div>

          <p style="margin-top:30px;color:#777;">
            Shiny Skin Clinic ✨
          </p>

        </div>
      `,
    });

    console.log("CONTACT REPLY EMAIL SENT ✔️");
  } catch (error) {
    console.log(
      "CONTACT REPLY EMAIL ERROR ❌",
      error.message
    );
  }
}