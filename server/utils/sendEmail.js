
// import nodemailer from "nodemailer";
import { DateTime } from "luxon";

import SibApiV3Sdk from "sib-api-v3-sdk";
const defaultClient =
  SibApiV3Sdk.ApiClient.instance;

const apiKey =
  defaultClient.authentications["api-key"];

apiKey.apiKey =
  process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

// async function safeSendMail({
//   to,
//   subject,
//   html,
// }) {
//   try {
//     await apiInstance.sendTransacEmail({
//       sender: {
//         name: "Shiny Skin Clinic",
//         email: "shinyskinlms@gmail.com",
//       },

//       to: [
//         {
//           email: to,
//         },
//       ],

//       subject,
//       htmlContent: html,
//     });

//     console.log("EMAIL SENT ✔️");
//   } catch (err) {
//     console.error("EMAIL ERROR ❌", err);
//     throw err;
//   }
// }
async function safeSendMail({
  to,
  subject,
  html,
}) {
  try {
    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Shiny Skin Clinic",
      email: "shinyskinlms@gmail.com",
    };

    sendSmtpEmail.to = [
      {
        email: to,
      },
    ];

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    await apiInstance.sendTransacEmail(
      sendSmtpEmail
    );

    console.log("EMAIL SENT ✔️");
  } catch (err) {
    console.error(
      "EMAIL ERROR ❌",
      err
    );
    throw err;
  }
}
// async function safeSendMail(options) {
//   try {
//     return await Promise.race([
//       transporter.sendMail(options),
//       new Promise((_, reject) =>
//         setTimeout(
//           () => reject(new Error("Email timeout")),
//           10000
//         )
//       ),
//     ]);
//   } catch (err) {
//     console.error("EMAIL ERROR:", err);
//     throw err;
//   }
// }



const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "America/Montreal";

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   requireTLS: true,
//   family: 4,

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },

//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 10000,

//   tls: {
//     family: 4,
//     rejectUnauthorized: false,
//   },
// });

// transporter.verify()
//   .then(() => {
//     console.log("SMTP Ready ✔️");
//   })
//   .catch((err) => {
//     console.error("SMTP ERROR ❌", err);
//   });
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

  await safeSendMail({
      // from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: hasDisclaimers
        ? "Complete Your Booking Review ✨"
        : "Booking Request Received ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
        <div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
         <h2>Booking Confirmation</h2>

<p>Dear ${customerName},</p>

<p>
This is a confirmation that we have received your booking request at Shiny Skin Clinic.
Our team will review it and notify you once it is confirmed.
</p>

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

   await safeSendMail({
      // from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,

      subject:
        "Your Booking Has Been Approved ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
<div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
         <h2>Booking Approved</h2>

<p>Dear ${customerName},</p>

<p>
We are pleased to inform you that your booking has been approved.
Please find your appointment details below.
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
          You may receive one or more reminders before your appointment.
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

    await safeSendMail({

      // from:
      //   `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,

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
<div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
        <h2>Booking Cancelled</h2>

<p>Dear ${customerName},</p>

<p>
We would like to inform you that your booking has been cancelled.
Please review the details below.
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

  await safeSendMail({
      // from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: "Booking Reminder ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
<div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
        <h2>Appointment Reminder</h2>

<p>Dear ${customerName},</p>

<p>
This is a reminder of your upcoming appointment at Shiny Skin Clinic.
Please find your appointment details below.
</p>

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

// export default transporter;






export async function sendWaitingListApprovedEmail({
  to,
  customerName,
}) {
  try {
    const bookingLink =
      `${process.env.FRONTEND_URL}`;

   await safeSendMail({
      // from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,

      subject: "A Slot Is Now Available ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
<div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
      <h2>Appointment Availability Update</h2>

<p>Dear ${customerName},</p>

<p>
A time slot matching your waiting list request has become available at Shiny Skin Clinic.
</p>

<p>
You may proceed with your booking using the link below.
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
   
   await safeSendMail({
      // from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: "Reply To Your Message ✨",

      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
<div style="text-align:center;margin-bottom:20px;">
  <h1 style="margin:0;">Shiny Skin Clinic</h1>
  <p style="color:#777;font-size:12px;">Official Appointment System</p>
</div>
         <h2>Response to Your Inquiry</h2>

<p>Dear ${customerName},</p>

<p>
Thank you for contacting Shiny Skin Clinic.
Please find our response below.
</p>

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