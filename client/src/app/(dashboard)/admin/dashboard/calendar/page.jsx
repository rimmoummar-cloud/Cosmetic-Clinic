"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../../../../lib/api";

const formatDateForApi = (date) => {
  const safeDate = date instanceof Date ? date : new Date(date);
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const STATUS_COLORS = {
  approved: { background: "#16a34a", border: "#15803d", text: "#ffffff" },
  cancelled: { background: "#dc2626", border: "#b91c1c", text: "#ffffff" },
  pending: { background: "#9ca3af", border: "#6b7280", text: "#ffffff" },
  done: { background: "#14532d", border: "#166534", text: "#ffffff" },
};

const mapBookingToEvent = (booking) => {
  const startValue = booking.start || booking.booking_datetime;

  if (!startValue) {
    return null;
  }

  const startDate = new Date(startValue);

  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const durationMinutes = Number(booking.duration || booking.service_duration || 0);
  const endValue =
    booking.end ||
    (durationMinutes > 0
      ? formatDateTime(new Date(startDate.getTime() + durationMinutes * 60 * 1000))
      : formatDateTime(startDate));

  const status = typeof booking.status === "string" ? booking.status.toLowerCase() : "";

  return {
    id: booking.id,
    title: booking.title || `${booking.customer_name || "Booking"} - ${booking.service_name || "Service"}`,
    start: startValue,
    end: endValue,
    allDay: false,
    extendedProps: {
      customerName: booking.customer_name,
      serviceName: booking.service_name,
      status,
    },
  };
};

export default function AdminCalendarPage() {
  const calendarRef = useRef(null);
  const isInitialCalendarLoadRef = useRef(true);
  const lastRequestedKeyRef = useRef("");
  const activeRequestIdRef = useRef(0);
  const [view, setView] = useState("month");
  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const filteredEvents =
    statusFilter === "all"
      ? events
      : events.filter((event) => (event.extendedProps?.status ?? "") === statusFilter);

  const fetchBookings = async (nextView, requestDate, showLoading = false) => {
    const requestKey = `${nextView}-${formatDateForApi(requestDate)}`;

    if (lastRequestedKeyRef.current === requestKey) {
      return;
    }

    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;
    lastRequestedKeyRef.current = requestKey;

    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await api.get(`/booking-calendar/calendar`, {
        params: {
          view: nextView,
          date: formatDateForApi(requestDate),
        },
      });

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      const mappedEvents = (response.data || [])
        .map(mapBookingToEvent)
        .filter(Boolean);

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch calendar bookings", error);
      if (requestId === activeRequestIdRef.current) {
        setEvents([]);
      }
    } finally {
      if (requestId === activeRequestIdRef.current && showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings("month", new Date(), true);
  }, []);

  const syncCalendarToDate = (nextView, nextDate) => {
    const normalizedDate = nextDate instanceof Date ? nextDate : new Date(nextDate);
    const nextKey = `${nextView}-${formatDateForApi(normalizedDate)}`;

    if (lastRequestedKeyRef.current === nextKey) {
      return;
    }

    setView(nextView);
    setVisibleDate(normalizedDate);

    if (nextView === "day") {
      setSelectedDate(normalizedDate);
    }

    fetchBookings(nextView, normalizedDate);
  };

  // const handleDatesSet = (info) => {
  //   const nextView = info.view.type === "timeGridDay" ? "day" : info.view.type === "timeGridWeek" ? "week" : "month";
  //   const nextDate = info.start ? new Date(info.start) : new Date();
  //   syncCalendarToDate(nextView, nextDate);
  // };
// const handleDatesSet = (info) => {
//   const nextView =
//     info.view.type === "timeGridDay"
//       ? "day"
//       : info.view.type === "timeGridWeek"
//       ? "week"
//       : "month";

//   if (isInitialCalendarLoadRef.current) {
//     isInitialCalendarLoadRef.current = false;

//     setView(nextView);
//     setVisibleDate(new Date());

//     return;
//   }

//   const nextDate = info.view.currentStart
//     ? new Date(info.view.currentStart)
//     : new Date();

//   syncCalendarToDate(nextView, nextDate);
// };
const handleDatesSet = (info) => {
  // const nextView =
  //   info.view.type === "timeGridDay"
  //     ? "day"
  //     : info.view.type === "timeGridWeek"
  //     ? "week"
  //     : "month";
const nextView =
  info.view.type === "timeGridDay"
    ? "day"
    : "month";
  // Do not refetch on the initial FullCalendar render.
  // The initial month data is already fetched by useEffect.
  if (isInitialCalendarLoadRef.current) {
    isInitialCalendarLoadRef.current = false;
    return;
  }

  const nextDate = new Date(info.view.currentStart);

  syncCalendarToDate(nextView, nextDate);
};

  const handleDayPickerChange = (event) => {
    const nextDate = new Date(`${event.target.value}T12:00:00`);
    setSelectedDate(nextDate);
    setVisibleDate(nextDate);
    setView("day");

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("timeGridDay");
      calendarApi.gotoDate(nextDate);
    }

    fetchBookings("day", nextDate);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-heading)]">Calendar</h1>
          <p className="text-gray-500 mt-1">View bookings across month and day perspectives.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
            <span className="font-medium">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:outline-none"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          {view === "day" && (
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
              <span className="font-medium">Date</span>
              <input
                type="date"
                value={formatDateForApi(selectedDate)}
                onChange={handleDayPickerChange}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:outline-none"
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-full min-h-[500px] items-center justify-center text-gray-500">Loading calendar...</div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            // plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            // plugins={[dayGridPlugin, interactionPlugin]}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              // right: "dayGridMonth,timeGridWeek,timeGridDay",
             right: "dayGridMonth,timeGridDay",
            }}
            editable={false}
            selectable={false}
            events={filteredEvents}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            eventDisplay="block"
            dayMaxEventRows={4}
            height="100%"
            datesSet={handleDatesSet}
            eventDidMount={(eventInfo) => {
              const status = (eventInfo.event.extendedProps?.status ?? "").toLowerCase();
              const palette = STATUS_COLORS[status];

              if (!palette) {
                return;
              }

              eventInfo.el.style.backgroundColor = palette.background;
              eventInfo.el.style.borderColor = palette.border;
              eventInfo.el.style.color = palette.text;
            }}
            eventContent={(eventInfo) => (
              <div className="px-1 py-0.5 text-[11px] leading-tight">
                <div className="font-semibold">{eventInfo.event.title}</div>
                <div className="opacity-90">{eventInfo.timeText}</div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
