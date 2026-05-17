import { DateTime } from "luxon";

const CLINIC_TIMEZONE = "America/Montreal";

export function toUTC(date, time) {
  return DateTime
    .fromISO(`${date}T${time}`, {
      zone: CLINIC_TIMEZONE
    })
    .toUTC()
    .toISO();
}

export function fromUTC(utcDateTime) {
  return DateTime
    .fromISO(utcDateTime, {
      zone: "utc"
    })
    .setZone(CLINIC_TIMEZONE)
    .toFormat("HH:mm");
}