# Timezone System Bug Analysis & Fixes

## CRITICAL BUGS FOUND

---

### 🔴 BUG #1: Inconsistent Business Timezone Constant
**Files affected:** Multiple files have different timezone values

| File | Timezone | Line |
|------|----------|------|
| `server/utils/timezone.js` | `"America/Toronto"` | Line 3 |
| `server/controllers/bookingController.js` | `"America/Edmonton"` | Line 5 |
| `client/src/app/feutures/booking/dataBooking.js` | `"America/Edmonton"` | Line 101 (getWorkingHoursByDay) |
| `client/src/app/feutures/booking/BookingForm.jsx` | `"America/Edmonton"` | Line 50 & 159 |

**Why it's a problem:**
- Toronto is UTC-5 (EDT) / UTC-4 (EST)
- Edmonton is UTC-7 (MDT) / UTC-6 (MST)
- A 14:00 slot in Toronto is 13:00 in Edmonton
- When the backend and frontend use different timezones, dates/times shift by 1-2 hours

**Fix:**
Pick ONE timezone and use it everywhere. Create a config file:
```javascript
// server/config/timezone.js
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Toronto";
```
Then import it in all files instead of hardcoding.

---

### 🔴 BUG #2: Invalid Luxon `setZone: true` Option
**File:** [server/models/booking.js](server/models/booking.js#L50)
**Line:** 50

```javascript
// ❌ WRONG - setZone: true is not a valid Luxon option
const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
  setZone: true,
}).toUTC();
```

**Why it's a problem:**
- Luxon doesn't have a `setZone: true` option
- This silently fails and treats the ISO string as UTC
- If frontend sends local time without timezone context, it gets misinterpreted
- Example: Frontend sends "2026-04-09T14:00:00" thinking it's 14:00 in user's timezone (EST -5)
- But the backend reads it as UTC → when converted back to business timezone, date/time is wrong

**Fix:**
```javascript
// ✅ CORRECT
const bookingDateTimeUTC = DateTime.fromISO(booking_datetime, {
  zone: BUSINESS_TIMEZONE  // Specify the timezone the string came from
}).toUTC();
```

---

### 🔴 BUG #3: Invalid Luxon Option in `getBookingsByDate`
**File:** [server/models/booking.js](server/models/booking.js#L186)
**Line:** 186-187

```javascript
// ❌ WRONG - setZone: true is invalid
const dayStart = DateTime.fromISO(bookingDate, { 
  zone: BUSINESS_TIME_ZONE, 
  setZone: true  // Invalid option!
})
  .startOf("day")
  .toUTC();
```

**Why it's a problem:**
- If `bookingDate` is just "2026-04-09" (no time), `fromISO` needs explicit time or should be `fromISO` treated differently
- The invalid option is silently ignored, using UTC interpretation

**Fix:**
```javascript
// ✅ CORRECT
const dayStart = DateTime.fromISO(`${bookingDate}T00:00:00`, {
  zone: BUSINESS_TIMEZONE
})
  .startOf("day")
  .toUTC();
```

---

### 🔴 BUG #4: Frontend DateTime-to-UTC Conversion Without Timezone
**File:** [client/src/app/feutures/booking/BookingForm.jsx](client/src/app/feutures/booking/BookingForm.jsx#L343-L344)
**Line:** 343-344

```javascript
// ❌ WRONG - Creates date in browser timezone, converts to UTC without context
const localDateTime = new Date(`${selectedDate}T${selectedTime}`);
const booking_datetime = localDateTime.toISOString();
```

**Example of the bug:**
- User selects: `selectedDate = "2026-04-09"`, `selectedTime = "14:00"`
- Browser is in EST (UTC-5)
- `new Date("2026-04-09T14:00")` → Creates April 9, 2026 at 14:00 EST
- `.toISOString()` → Converts to UTC → `"2026-04-09T19:00:00Z"` (adds 5 hours)
- But the slot calculation was done in BUSINESS_TIMEZONE (Edmonton, UTC-7)
- When backend receives "2026-04-09T19:00:00Z", it converts to Edmonton time → `2026-04-09T12:00 MDT`
- **Result: 14:00 selected becomes 12:00 booked (2 hours earlier!)**

**Fix:**
Use Luxon to convert from user's timezone to UTC explicitly:
```javascript
// ✅ CORRECT
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bookingDT = DateTime.fromISO(`${selectedDate}T${selectedTime}`, {
  zone: userTimeZone
});
const booking_datetime = bookingDT.toUTC().toISO();
```

---

### 🔴 BUG #5: Dangerous `weekday % 7` Day-of-Week Calculation
**File:** [server/controllers/bookingController.js](server/controllers/bookingController.js#L164)
**Line:** 164

```javascript
// ❌ WRONG - weekday uses 1-7 scale (Mon-Sun), % 7 breaks Sunday
const dayOfWeek = bookingDateTime.weekday % 7;
```

**Why it's a problem:**
- Luxon's `weekday`: 1=Monday, 2=Tuesday, ..., 7=Sunday
- `7 % 7 = 0`, so Sunday becomes 0... but database expects 0=Sunday (correct by accident!)
- JavaScript's `getDay()` used elsewhere: 0=Sunday, 1=Monday, ..., 6=Saturday
- **Mixing these causes day shifts**

**Frontend uses getDay():**
```javascript
const dayNumber = new Date(dateStr + "T00:00:00").getDay();  // Returns 0-6
```

**Backend (sometimes) expects:**
```javascript
dayOfWeek: 1 // Monday, 2 Tuesday, etc. (Luxon scale)
```

**Fix:**
Standardize to JavaScript's getDay() everywhere (0=Sunday):
```javascript
// ✅ CORRECT
const dayOfWeek = bookingDateTime.weekday === 7 ? 0 : bookingDateTime.weekday;
// Or convert to JS Date:
const dayOfWeek = bookingDateTime.toJSDate().getDay();
```

---

### 🔴 BUG #6: Timezone Mismatch in Past Slot Filtering
**File:** [server/controllers/bookingController.js](server/controllers/bookingController.js#L207-222)
**Lines:** 207-222

```javascript
// ❌ PROBLEM: Comparing dates from different timezones
const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
const currentDateStr = now.toISODate();
const currentMinutes = now.hour * 60 + now.minute;

bookings.forEach((b) => {
  // But b.booking_datetime is in UTC from database
  const bookingStart = DateTime.fromJSDate(b.booking_datetime)
    .setZone(userTimeZone);  // Converting to DIFFERENT timezone!
  const startTime = bookingStart.toFormat("HH:mm");
  const start = timeToMinutes(startTime);
  // ...
  if (bookingDate === currentDateStr && slotTime < currentMinutes) {
    // Comparing dateStr from BUSINESS_TIME_ZONE with dateStr from USER_TIME_ZONE!
```

**Why it's a problem:**
- `now.toISODate()` is in BUSINESS_TIME_ZONE
- But `bookingDate` parameter came from frontend in USER_TIMEZONE
- If user is in UTC+8 and business is in UTC-7, "today" differs by 15 hours!
- Example: When it's April 10 in UTC+8 at midnight, it's still April 9 in UTC-7
- Past slots from April 9 won't be filtered because dates don't match

**Fix:**
```javascript
// ✅ CORRECT - Use consistent timezone
const userTimeZone = req.query.timeZone || "UTC";
const now = DateTime.now().setZone(userTimeZone);
const currentDateStr = now.toISODate();
const currentMinutes = now.hour * 60 + now.minute;

bookings.forEach((b) => {
  const bookingStart = DateTime.fromISO(b.booking_datetime, { zone: "UTC" })
    .setZone(userTimeZone);  // Same timezone!
  // ... rest of logic
```

---

### 🟡 BUG #7: Invalid Timezone Parsing in Available Slots
**File:** [server/controllers/bookingController.js](server/controllers/bookingController.js#L106-109)
**Lines:** 106-109

```javascript
// ❌ WRONG - setZone: true is not a valid option
const bookingDateTime = DateTime.fromISO(booking_datetime, {
  setZone: true,
}).setZone(userTimeZone);
```

**Why it's a problem:**
- First argument has invalid `setZone: true`
- Luxon will interpret the ISO string as UTC (silent failure)
- If frontend sends local time, timezone is lost

**Fix:**
```javascript
// ✅ CORRECT
const bookingDateTime = DateTime.fromISO(booking_datetime, {
  zone: "UTC"  // Frontend sends UTC, so parse as UTC
}).setZone(userTimeZone);
```

---

### 🟡 BUG #8: Luxon Time Parsing Without Date Context
**File:** [server/controllers/bookingController.js](server/controllers/bookingController.js#L226-234)
**Lines:** 226-234

```javascript
// ⚠️ ISSUE: Creating DateTime for working hours times
const startDateTime = DateTime.fromISO(
  `${bookingDate}T${workingHours.start_time}`,
  { zone: BUSINESS_TIME_ZONE }
);
```

**Why it's a concern:**
- If `bookingDate` is "2026-04-09" but working hours TZ is different from bookingDate's TZ origin, results could be off
- Usually fine, but needs documentation

**Better approach:**
```javascript
// ✅ More explicit
const startDateTime = DateTime.fromISO(
  `${bookingDate}T${workingHours.start_time}:00`,  // Ensure seconds
  { zone: BUSINESS_TIMEZONE }
);
```

---

### 🟡 BUG #9: Frontend Slot Query Uses Noon Placeholder
**File:** [client/src/app/feutures/booking/dataBooking.js](client/src/app/feutures/booking/dataBooking.js#L210-214)
**Lines:** 210-214

```javascript
// ⚠️ Using noon as placeholder, then converting wrong
const bookingDateTime = new Date(`${bookingDate}T12:00:00`);
const booking_datetime = bookingDateTime.toISOString();
```

**Why it's a concern:**
- Noon is used as a placeholder just to get the date's working hours
- But this triggers the same BUG #4 (incorrect timezone-to-UTC conversion)
- The result: slot query is done for wrong UTC time, potentially returning slots from adjacent day

**Fix:**
```javascript
// ✅ Use Luxon consistently
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bookingDateTime = DateTime.fromISO(`${bookingDate}T12:00:00`, {
  zone: userTimeZone
});
const booking_datetime = bookingDateTime.toUTC().toISO();
```

---

### 🟡 BUG #10: Frontend Day-of-Week Calculation Ambiguity
**File:** [client/src/app/feutures/booking/dataBooking.js](client/src/app/feutures/booking/dataBooking.js#L101)
**Line:** 101

```javascript
// ⚠️ Using JavaScript getDay() which may not match backend expectation
const dayNumber = new Date(dateStr + "T00:00:00").getDay();
const response = await fetch(`${API_BASE_URL}/workingHours/day/${dayNumber}`);
```

**Why it's a concern:**
- Returns 0-6 (Sunday=0)
- Backend model `workingHoure.js` doesn't show what format it expects
- If database stores working hours with different day numbering (1-7), mismatch occurs

**Recommendation:**
Document working hours table structure, ensure ALL uses of dayOfWeek use JavaScript convention (0=Sunday):
```javascript
const dayNumber = new Date(dateStr + "T00:00:00").getDay();  // Returns 0-6 consistently
```

---

## Summary Table

| # | Severity | File | Line(s) | Issue | Impact |
|---|----------|------|---------|-------|--------|
| 1 | 🔴 CRITICAL | Multiple | ~3-5 | Inconsistent timezone constants | ±1-2 hour slot shifts |
| 2 | 🔴 CRITICAL | booking.js | 50 | Invalid `setZone: true` | Silent timezone parsing failure |
| 3 | 🔴 CRITICAL | booking.js | 186 | Invalid `setZone: true` | Date queries return wrong day's bookings |
| 4 | 🔴 CRITICAL | BookingForm.jsx | 343-344 | Wrong timezone-to-UTC conversion | Booked time differs from selected by hours |
| 5 | 🔴 CRITICAL | bookingController.js | 164 | Dangerous `weekday % 7` calc | Potential day-of-week mismatch |
| 6 | 🔴 CRITICAL | bookingController.js | 207-222 | Past slot filter uses wrong timeline | Past slots not filtered correctly |
| 7 | 🟡 HIGH | bookingController.js | 106-109 | Invalid timezone parsing | Slots calculated for wrong UTC time |
| 8 | 🟡 MEDIUM | bookingController.js | 226-234 | Date/timezone boundary handling | Mostly OK, needs documentation |
| 9 | 🟡 MEDIUM | dataBooking.js | 210-214 | Timezone-to-UTC conversion error | Day shifts in slot queries |
| 10 | 🟡 MEDIUM | dataBooking.js | 101 | Day numbering ambiguity | Could mismatch database expectations |

---

## Root Cause Analysis

**Primary Issue:** Frontend and backend use **different timezones** and handle conversions inconsistently.

**Secondary Issue:** Invalid Luxon API usage (`setZone: true` doesn't exist) causes silent failures.

**Tertiary Issue:** Date/time conversions don't preserve timezone context through the pipeline.

---

## Why Dates Shift (e.g., 12 becomes 13)

### Example: User in UTC+8, Business in UTC-7

**Step 1: User selects time in their browser**
- Date: April 12, 2026
- Time: 14:00 (2:00 PM in their timezone, UTC+8)
- Actual UTC: April 12, 06:00 UTC

**Step 2: Frontend converts to ISO (BUG #4)**
```javascript
const localDateTime = new Date("2026-04-12T14:00");  // Interpreted as browser TZ (UTC+8)
// → April 12, 14:00 UTC+8
const booking_datetime = localDateTime.toISOString();
// → "2026-04-12T06:00:00Z" ✅ Correct
```

**Step 3: Backend receives UTC and converts to business TZ**
```javascript
const bookingDateTimeUTC = DateTime.fromISO("2026-04-12T06:00:00Z");
// → April 12, 06:00 UTC
const business = bookingDateTimeUTC.setZone("America/Toronto");
// → April 11, 23:00 EDT (previous day!)
```

**Result:** April 12 selected → April 11 booked (dates have shifted!)

BUT: If BUG #4 is fixed with Luxon, the conversion is correct and no shift occurs.

---

## Recommendations

1. **Immediate:** Fix BUG #2, #3, #4, #5, #6 (CRITICAL)
2. **Then:** Fix BUG #7, #9 (HIGH)
3. **Finally:** Fix BUG #10, #8 (MEDIUM/DOCUMENTATION)
4. **Long-term:** Create a centralized timezone config and utility file
