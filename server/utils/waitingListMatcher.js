import { DateTime } from "luxon";

import {
  getMatchingWaitingList,
  getWaitingListTotalDuration
} from "../models/watinglist.js";

import {
  getBookingEmailDetails
} from "../models/booking.js";

import {
  createNotification
} from "../models/notification.js";


export async function checkWaitingListForCancelledBooking(
  bookingId
) {
const CLEANING_BUFFER_MINUTES =
  Number(process.env.CLEANING_BUFFER_MINUTES) || 15;

  const booking =
    await getBookingEmailDetails(
      bookingId
    );

  if (!booking) return;

const cancelledBookingDuration =
  booking.duration_minutes;

  const BUSINESS_TIME_ZONE =
    process.env.BUSINESS_TIME_ZONE ||
    "America/Montreal";

  const bookingDateTime =
    DateTime
      .fromJSDate(
        new Date(
          booking.booking_datetime
        )
      )
      .setZone(
        BUSINESS_TIME_ZONE
      );

  const requestedDate =
    bookingDateTime.toISODate();

  const hour =
    bookingDateTime.hour;

  const period =
    hour < 12
      ? "morning"
      : "evening";

  const waitingCustomers =
    await getMatchingWaitingList(
      requestedDate,
      period
    );

 const matchedCustomers = [];

for (const customer of waitingCustomers) {

  const waitingDuration =
    await getWaitingListTotalDuration(
      customer.id
    );

const waitingDurationWithBuffer =
  waitingDuration +
  CLEANING_BUFFER_MINUTES;

  if (
    waitingDurationWithBuffer <=
    cancelledBookingDuration
  ) {

    matchedCustomers.push(customer);

  }

}
if (matchedCustomers.length === 0) {
  return [];
}
  await createNotification({

    recipient_type: "admin",

    recipient_id: 1,

    booking_id: bookingId,

    type: "waiting_list_match",

    title:
      "Waiting List Match Found",

    message:
      `${matchedCustomers.length} waiting list customer(s) found for ${requestedDate} (${period})`

  });

  return matchedCustomers;
}