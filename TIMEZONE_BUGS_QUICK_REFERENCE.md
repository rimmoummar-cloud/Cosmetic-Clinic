# Timezone Bugs - Quick Reference

## 🔴 CRITICAL BUGS

---

### BUG #1: Inconsistent Timezone Constants
**Problem:** Three different timezones used

| File | Line | Value |
|------|------|-------|
| `server/utils/timezone.js` | 3 | `"America/Toronto"` |
| `server/controllers/bookingController.js` | 5 | `"America/Edmonton"` |
| `client/src/app/feutures/booking/BookingForm.jsx` | 50, 159 | `"America/Edmonton"` |

**Why:** Toronto (UTC-5) vs Edmonton (UTC-7) = 2-hour slot shifts

**Fix:** Pick ONE, use everywhere:
```javascript
const BUSINESS_TIMEZONE = "America/Toronto"; // decide!
```

---

### BUG #2: Invalid Luxon Option
**File:** `server/models/booking.js` **Line:** 50
**Code:**
```javascript
DateTime.fromISO(booking_datetime, { setZone: true }).toUTC();
```
**Why:** `setZone: true` doesn't exist in Luxon. Silently treats input as UTC.

**Fix:**
```javascript
const BUSINESS_TIMEZONE = "America/Toronto";
DateTime.fromISO(booking_datetime, { zone: BUSINESS_TIMEZONE }).toUTC();
```

---

### BUG #3: Same Invalid Option in getBookingsByDate
**File:** `server/models/booking.js` **Line:** 186-187
**Code:**
```javascript
DateTime.fromISO(bookingDate, { zone: BUSINESS_TIME_ZONE, setZone: true })
```
**Why:** Same as BUG #2, plus date parsing needs time component

**Fix:**
```javascript
DateTime.fromISO(`${bookingDate}T00:00:00`, { zone: BUSINESS_TIMEZONE })
```

---

### BUG #4: Frontend JavaScript Date -> UTC Conversion (CRITICAL FOR DATE SHIFTS)
**File:** `client/src/app/feutures/booking/BookingForm.jsx` **Line:** 343-344
**Code:**
```javascript
const localDateTime = new Date(`${selectedDate}T${selectedTime}`);
const booking_datetime = localDateTime.toISOString();
```

**Why:** Creates date in browser's local timezone, converts to UTC without specifying original timezone. If user is in UTC+8 and selects 14:00, JavaScript interprets as 14:00 in browser timezone, adds timezone offset, sends wrong UTC time.

**Example:** 
- User UTC+8 selects "14:00" → JavaScript creates as UTC+8 timezone
- `.toISOString()` converts → adds +8 hours offset → date might be different day
- **Result: April 12 selected → April 13 booked (date shifts!)**

**Fix:**
```javascript
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bookingDT = DateTime.fromISO(`${selectedDate}T${selectedTime}`, {
  zone: userTimeZone
});
const booking_datetime = bookingDT.toUTC().toISO();
```

---

### BUG #5: `weekday % 7` Day-of-Week Calculation
**File:** `server/controllers/bookingController.js` **Line:** 164
**Code:**
```javascript
const dayOfWeek = bookingDateTime.weekday % 7;
```

**Why:** 
- Luxon `weekday` returns: 1=Monday, 2=Tuesday, ..., 7=Sunday
- `7 % 7 = 0` (Sunday becomes 0, works by accident)
- Frontend uses JavaScript `getDay()`: 0=Sunday, 1=Monday, ..., 6=Saturday
- Mixing breaks if you expect 1-indexed days

**Fix:**
```javascript
// Convert Luxon to 0-indexed (0=Sunday)
const dayOfWeek = bookingDateTime.weekday === 7 ? 0 : bookingDateTime.weekday;

// OR use JavaScript scale everywhere:
const dayOfWeek = bookingDateTime.toJSDate().getDay(); // Returns 0-6
```

---

### BUG #6: Past Slot Filter Uses Wrong Timezone
**File:** `server/controllers/bookingController.js` **Line:** 207-222
**Code:**
```javascript
const now = DateTime.now().setZone(BUSINESS_TIME_ZONE);
const currentDateStr = now.toISODate();  // April 10 in Edmonton

// But:
const bookingStart = DateTime.fromJSDate(b.booking_datetime)
  .setZone(userTimeZone);  // Different timezone!

// Then comparing:
if (bookingDate === currentDateStr && slotTime < currentMinutes)
```

**Why:** 
- `currentDateStr` is in BUSINESS_TIME_ZONE (e.g., "2026-04-10" in Edmonton UTC-7)
- `bookingDate` from frontend is in USER_TIME_ZONE (e.g., "2026-04-10" in UTC+8)
- Same date string but represents different UTC moments!
- When user is ahead of business (UTC+8 vs UTC-7), filtering breaks

**Example:**
- When it's April 11 midnight in UTC+8, it's still April 10 in UTC-7
- Past slots from April 10 don't get filtered (date strings mismatch)

**Fix:**
```javascript
// Use consistent timezone for comparison
const userTimeZone = req.query.timeZone || "UTC";
const now = DateTime.now().setZone(userTimeZone);  // Same as bookingDate origin
const currentDateStr = now.toISODate();
```

---

## 🟡 HIGH PRIORITY BUGS

---

### BUG #7: Invalid Timezone Parse in Available Slots
**File:** `server/controllers/bookingController.js` **Line:** 106-109
**Code:**
```javascript
const bookingDateTime = DateTime.fromISO(booking_datetime, {
  setZone: true,  // Invalid!
}).setZone(userTimeZone);
```
**Fix:**
```javascript
const bookingDateTime = DateTime.fromISO(booking_datetime, {
  zone: "UTC"  // Frontend sends UTC ISO
}).setZone(userTimeZone);
```

---

### BUG #9: Frontend Noon Placeholder With Bad Conversion
**File:** `client/src/app/feutures/booking/dataBooking.js` **Line:** 210-214
**Code:**
```javascript
const bookingDateTime = new Date(`${bookingDate}T12:00:00`);
const booking_datetime = bookingDateTime.toISOString();
```
**Same issue as BUG #4** - wrong timezone-to-UTC conversion

**Fix:**
```javascript
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const bookingDateTime = DateTime.fromISO(`${bookingDate}T12:00:00`, {
  zone: userTimeZone
});
const booking_datetime = bookingDateTime.toUTC().toISO();
```

---

## 🟡 MEDIUM PRIORITY

---

### BUG #10: Day-of-Week Numbering Ambiguity
**File:** `client/src/app/feutures/booking/dataBooking.js` **Line:** 101

**Code:**
```javascript
const dayNumber = new Date(dateStr + "T00:00:00").getDay();  // Returns 0-6
```

**Concern:** No validation that backend working_hours table uses same 0-6 scale

**Recommendation:** Document this. Use JavaScript `getDay()` scale (0=Sunday) **everywhere**.

---

## Impact Summary

| Bug | Impact | Severity |
|-----|--------|----------|
| #1 | 1-2 hour slot shifts | CRITICAL |
| #2 | Silent timezone parsing failure | CRITICAL |
| #3 | Wrong day's bookings returned | CRITICAL |
| #4 | **Dates shift (12→13) and times are wrong** | CRITICAL |
| #5 | Day-of-week mismatches | CRITICAL |
| #6 | Past slots not filtered | CRITICAL |
| #7 | Slots from wrong time of day | HIGH |
| #9 | Day shifts in slot queries | HIGH |
| #10 | Works by luck, fragile | MEDIUM |

---

## Root Cause

**Frontend and backend use different timezones and don't preserve timezone context through conversions. Luxon API misuse causes silent failures.**
