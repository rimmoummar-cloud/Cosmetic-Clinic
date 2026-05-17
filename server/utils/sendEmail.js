import nodemailer from "nodemailer";
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
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
}) {
  try {
    await transporter.sendMail({
  from: `"Shiny Skin Clinic" <shinyskinlms@gmail.com>`,
      to,
      subject: "Booking Confirmation 💖",
      html: `
        <h2>Hello ${customerName} 💖</h2>

        <p>Your booking is confirmed successfully.</p>

        <ul>
          <li><b>Service:</b> ${serviceName}</li>
          <li><b>Date:</b> ${bookingDate}</li>
          <li><b>Time:</b> ${bookingTime}</li>
        </ul>

        <p>See you soon ✨</p>
      `,
    });

    console.log("Email sent successfully ✔️");
  } catch (error) {
    console.log("EMAIL ERROR ❌", error.message);
  }
}