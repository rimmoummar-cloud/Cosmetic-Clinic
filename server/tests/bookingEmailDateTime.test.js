import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import SibApiV3Sdk from "sib-api-v3-sdk";

process.env.TZ = "Asia/Beirut";
process.env.BUSINESS_TIME_ZONE = "America/Montreal";
process.env.BREVO_API_KEY = "test-key";
process.env.BOOKING_NOTIFICATION_EMAIL = "admin@example.test";

const {
  sendBookingEmail,
  sendBookingApprovedEmail,
  sendBookingCancelledEmail,
  sendNewBookingNotificationEmail,
  sendReminderEmail,
} = await import("../utils/sendEmail.js");

const booking = {
  bookingId: 42,
  to: "customer@example.test",
  customerName: "Test Customer",
  customerEmail: "customer@example.test",
  customerPhone: "555-0100",
  serviceName: "Free Consultation",
  confirmUrl: "https://example.test/confirm",
  reminderType: "24_hours_before",
};

const dateCases = [
  [pg.types.getTypeParser(1184)("2030-02-16 02:30:00+00"), "2030-02-15", "21:30"],
  [new Date("2030-07-15T14:30:00Z"), "2030-07-15", "10:30"],
  ["2030-02-15T12:30:00-05:00", "2030-02-15", "12:30"],
  ["2030-02-15T17:30:00", "2030-02-15", "12:30"],
  ["2030-03-10T06:59:00Z", "2030-03-10", "01:59"],
  ["2030-03-10T07:00:00Z", "2030-03-10", "03:00"],
  ["2030-11-03T05:59:00Z", "2030-11-03", "01:59"],
  ["2030-11-03T06:00:00Z", "2030-11-03", "01:00"],
];

const emailFlows = [
  ["Booking Request Received ✨", sendBookingEmail, {}, true],
  ["Complete Your Booking Review ✨", sendBookingEmail, { acceptanceToken: "test-token" }, true],
  ["Appointment Confirmed | Rendez-vous confirmé", sendBookingApprovedEmail, {}, true],
  ["Booking Cancelled", sendBookingCancelledEmail, {}, true],
  ["New Booking Received ✨", sendNewBookingNotificationEmail, {}, false],
  ["Booking Reminder ✨", sendReminderEmail, {}, true],
];

function mockBrevo(t) {
  const messages = [];
  t.mock.method(console, "log", () => {});
  t.mock.method(SibApiV3Sdk.ApiClient.instance, "callApi", async (...args) => {
    assert.deepEqual(args.slice(0, 2), ["/smtp/email", "POST"]);
    messages.push(args[7]);
    return { data: { messageId: "mock-message-id" } };
  });
  return messages;
}

for (const [subject, send, options, bilingual] of emailFlows) {
  test(`${subject} renders appointment timestamps in Montreal`, async (t) => {
    const messages = mockBrevo(t);

    for (const [bookingDate, expectedDate, expectedTime] of dateCases) {
      await send({ ...booking, ...options, bookingDate });
      const message = messages.at(-1);
      assert.equal(message.subject, subject);
      assert.match(message.htmlContent, new RegExp(`<b>Date:</b>\\s*${expectedDate}\\s*</p>`));
      assert.match(message.htmlContent, new RegExp(`<b>Time(?: / Heure)?:</b>\\s*${expectedTime}\\s*</p>`));
      assert.doesNotMatch(message.htmlContent, /Invalid DateTime/);
      if (bilingual) assert.match(message.htmlContent, /lang="fr"/);
      if (message.textContent) {
        assert.ok(message.textContent.includes(`Date: ${expectedDate}\nTime / Heure: ${expectedTime}`));
      }
    }

    assert.equal(messages.length, dateCases.length);
  });
}

test("invalid or incomplete timestamps log a safe error and never reach Brevo", async (t) => {
  const messages = mockBrevo(t);
  const errors = [];
  t.mock.method(console, "error", (...args) => errors.push(args.join(" ")));
  const invalidDates = [undefined, null, "", "malformed-private-value", "2030-02-15",
    "08:00", "2030-02-30T08:00:00Z", new Date(NaN), 0];

  for (const [, send, options] of emailFlows) {
    for (const bookingDate of invalidDates) {
      await send({ ...booking, ...options, bookingDate });
    }
  }

  assert.equal(messages.length, 0);
  assert.equal(errors.length, emailFlows.length * invalidDates.length);
  for (const error of errors) {
    assert.match(error, /appointment timestamp/i);
    assert.doesNotMatch(error, /malformed-private-value|customer@example.test|Test Customer/);
  }
});

test("reminder WhatsApp text and displayed appointment share the same Montreal date and time", async (t) => {
  const messages = mockBrevo(t);
  const bookingDate = new Date("2030-02-16T02:30:00Z");
  await sendReminderEmail({ ...booking, bookingDate });
  const message = messages[0];
  const cancelUrl = new URL(message.textContent.split("\nCancel: ")[1]);
  assert.equal(cancelUrl.hostname, "wa.me");
  assert.equal(cancelUrl.pathname, "/15149990827");
  assert.equal(cancelUrl.searchParams.get("text"),
    "Hello, I would like to cancel my booking.\n\n" +
    "Booking ID: #42\nService: Free Consultation\nDate: February 15, 2030\nTime: 9:30 PM");
  assert.ok(message.htmlContent.includes(cancelUrl.href));
  assert.match(message.htmlContent, /Politique d’annulation/);

  const suppliedUrl = "https://example.test/legacy-cancel";
  await sendReminderEmail({ ...booking, bookingDate, cancelUrl: suppliedUrl });
  assert.ok(messages[1].htmlContent.includes(suppliedUrl));
  assert.ok(messages[1].textContent.includes(suppliedUrl));
});

test("confirmation and reminder show booked prices with bilingual labels, including zero", async (t) => {
  const messages = mockBrevo(t);
  const bookingDate = new Date("2030-02-16T02:30:00Z");
  const services = [
    { name: "Facial", price: "125.50" },
    { name: "Free Consultation", price: 0 },
    { name: "Service without a price", price: null },
  ];

  await sendBookingApprovedEmail({ ...booking, bookingDate, services });
  await sendReminderEmail({ ...booking, bookingDate, services });

  assert.equal(messages.length, 2);
  assert.match(messages[0].htmlContent, /<h1[^>]*>Appointment Confirmed<\/h1>/);
  assert.match(messages[0].htmlContent, /lang="fr"[^>]*>Rendez-vous confirmé<\/p>/);
  for (const message of messages) {
    assert.match(message.htmlContent, /<b>Price \/ Prix:<\/b> Facial — \$125\.50 \+ taxes/);
    assert.match(message.htmlContent, /<b>Price \/ Prix:<\/b> Free Consultation — \$0\.00 \+ taxes/);
    assert.doesNotMatch(message.htmlContent, /Prix:<\/b> Service without a price/);
    assert.match(message.htmlContent, /<b>Services:<\/b>[\s\S]*<b>Price \/ Prix:<\/b>[\s\S]*<b>Date:<\/b>[\s\S]*<b>Time \/ Heure:<\/b>/);
  }
  assert.match(messages[1].textContent, /Price \/ Prix: Facial — \$125\.50 \+ taxes/);
  assert.match(messages[1].textContent, /Price \/ Prix: Free Consultation — \$0\.00 \+ taxes/);
});

test("the reminder worker leaves invalid email dates scheduled and processes the next reminder", async (t) => {
  const messages = mockBrevo(t);
  t.mock.method(console, "error", () => {});
  const { default: db } = await import("../config/db.js");
  const { processReminderEmails } = await import("../jobs/processReminderEmails.js");
  const baseReminder = {
    booking_id: booking.bookingId,
    customer_email: booking.to,
    customer_name: booking.customerName,
    services: [{ name: booking.serviceName, price: 0 }],
    reminder_type: booking.reminderType,
  };
  const reminders = [
    { ...baseReminder, reminder_id: 1, booking_datetime: null },
    { ...baseReminder, reminder_id: 2, booking_datetime: new Date("2099-02-16T02:30:00Z") },
  ];
  const markedSent = [];
  t.mock.method(db, "connect", async () => ({
    async query(sql, params) {
      if (sql.includes("pg_try_advisory_lock")) return { rows: [{ locked: true }] };
      if (sql.includes("FROM booking_reminders br")) return { rows: reminders };
      if (sql.includes("SELECT status")) return { rows: [{ status: "approved" }] };
      if (sql.includes("status = 'sent'")) {
        markedSent.push(params[0]);
        return;
      }
      assert.match(sql, /pg_advisory_unlock/);
    },
    release() {},
  }));

  await processReminderEmails();

  assert.equal(messages.length, 1);
  assert.match(messages[0].textContent, /Date: 2099-02-15\nTime \/ Heure: 21:30/);
  assert.match(messages[0].textContent, /Price \/ Prix: \$0\.00 \+ taxes/);
  assert.deepEqual(markedSent, [2]);
});
