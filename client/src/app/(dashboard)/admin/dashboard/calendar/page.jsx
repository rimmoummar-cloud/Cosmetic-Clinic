"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
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

const normalizeStatus = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "cancel") {
    return "cancelled";
  }

  if (normalized === "done") {
    return "completed";
  }

  return normalized;
};

const getPeriodText = (value) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    const nestedValue = value.period ?? value.value ?? value.label ?? value.name;
    if (typeof nestedValue === "string") {
      return nestedValue.trim();
    }
  }

  return "";
};

const normalizePeriod = (value) => {
  const normalized = getPeriodText(value).toLowerCase();

  if (normalized === "morning" || normalized === "afternoon" || normalized === "evening") {
    return normalized;
  }

  return "";
};

const formatPeriodLabel = (value) => {
  const normalized = normalizePeriod(value);

  if (!normalized) {
    return "—";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const STATUS_COLORS = {
  approved: { background: "#16a34a", border: "#15803d", text: "#ffffff" },
  accepted: { background: "#16a34a", border: "#15803d", text: "#ffffff" },
  cancelled: { background: "#dc2626", border: "#b91c1c", text: "#ffffff" },
  pending: { background: "#9ca3af", border: "#6b7280", text: "#ffffff" },
  completed: { background: "#2563eb", border: "#1d4ed8", text: "#ffffff" },
};

const BOOKING_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const WAITING_LIST_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Approved" },
];

const getStatusPalette = (status) => STATUS_COLORS[normalizeStatus(status)] || {
  background: "#6b7280",
  border: "#4b5563",
  text: "#ffffff",
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

  const status = normalizeStatus(booking.status);

  return {
    id: `booking-${booking.id}`,
    title: booking.title || `${booking.customer_name || "Booking"} - ${booking.service_name || "Service"}`,
    start: startValue,
    end: endValue,
    allDay: false,
    extendedProps: {
      type: "booking",
      status,
      customerName: booking.customer_name,
      serviceName: booking.service_name,
    },
  };
};

const mapWaitingListToEvent = (entry) => {
  const requestedDate = entry?.requested_date || entry?.requestedDate;

  if (!requestedDate) {
    return null;
  }

  const serviceNames = Array.isArray(entry?.services)
    ? entry.services
        .map((service) => (typeof service === "string" ? service : service?.name))
        .filter(Boolean)
    : [];

  const status = normalizeStatus(entry?.status);
  const period = normalizePeriod(entry?.period);

  return {
    id: `waiting-list-${entry.id}`,
    title: entry?.customer_name || "Waiting list customer",
    start: requestedDate,
    end: requestedDate,
    allDay: true,
    extendedProps: {
      type: "waiting-list",
      status,
      period,
      record: entry,
      customerName: entry?.customer_name,
      serviceName: serviceNames.join(", ") || "Waiting list",
      serviceNames,
    },
  };
};

export default function AdminCalendarPage() {
  const calendarRef = useRef(null);
  const isInitialCalendarLoadRef = useRef(true);
  const lastRequestedKeyRef = useRef("");
  const activeRequestIdRef = useRef(0);
  const [view, setView] = useState("month");
  const [calendarMode, setCalendarMode] = useState("bookings");
  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [waitingListEvents, setWaitingListEvents] = useState([]);
  const [allBookingsData, setAllBookingsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [waitingListLoading, setWaitingListLoading] = useState(false);
  const [approvingWaitingListId, setApprovingWaitingListId] = useState(null);
  const [bookingActionLoadingId, setBookingActionLoadingId] = useState(null);
  const [selectedWaitingList, setSelectedWaitingList] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const statusOptions = calendarMode === "waiting-list" ? WAITING_LIST_STATUS_FILTERS : BOOKING_STATUS_FILTERS;

  const currentEvents = calendarMode === "waiting-list" ? waitingListEvents : events;
  const getEventStatus = (event) =>
    normalizeStatus(
      event?.extendedProps?.status ??
        event?.extendedProps?.record?.status ??
        event?.status ??
        ""
    );

  const filteredEvents =
    statusFilter === "all"
      ? currentEvents
      : currentEvents.filter((event) => getEventStatus(event) === normalizeStatus(statusFilter));

  const formatDateForComparison = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value.includes("T") ? value.slice(0, 10) : value;
    }

    return formatDateForApi(new Date(value));
  };

  const selectedDayWaitingListEntries =
    calendarMode === "waiting-list" && view === "day"
      ? waitingListEvents.filter((event) => {
          const record = event?.extendedProps?.record;
          const matchesDate = formatDateForComparison(record?.requested_date) === formatDateForComparison(selectedDate);
          const matchesStatus =
            statusFilter === "all" || normalizeStatus(record?.status) === normalizeStatus(statusFilter);

          return matchesDate && matchesStatus;
        })
      : [];

  const morningWaitingListEntries = selectedDayWaitingListEntries.filter((event) => {
    const record = event?.extendedProps?.record ?? event?.record ?? {};
    const period = normalizePeriod(event?.extendedProps?.period ?? record?.period ?? event?.period);
    return period === "morning";
  });

  const eveningWaitingListEntries = selectedDayWaitingListEntries.filter((event) => {
    const record = event?.extendedProps?.record ?? event?.record ?? {};
    const period = normalizePeriod(event?.extendedProps?.period ?? record?.period ?? event?.period);
    return period === "evening";
  });

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

  const fetchWaitingList = async (showLoading = false) => {
    if (showLoading) {
      setWaitingListLoading(true);
    }

    try {
      const response = await api.get("/waiting-list");
      const mappedWaitingListEvents = (response.data || [])
        .map(mapWaitingListToEvent)
        .filter(Boolean);

      setWaitingListEvents(mappedWaitingListEvents);
    } catch (error) {
      console.error("Failed to fetch waiting list calendar entries", error);
      setWaitingListEvents([]);
    } finally {
      if (showLoading) {
        setWaitingListLoading(false);
      }
    }
  };

  const fetchAllBookingDetails = async () => {
    try {
      const response = await api.get("/bookings/all/full-details");
      setAllBookingsData(response.data || []);
    } catch (error) {
      console.error("Failed to fetch full booking details", error);
      setAllBookingsData([]);
    }
  };

  useEffect(() => {
    fetchBookings("month", new Date(), true);
    fetchWaitingList(true);
    fetchAllBookingDetails();
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

    if (calendarMode === "bookings") {
      fetchBookings(nextView, normalizedDate);
    }
  };

  const handleDatesSet = (info) => {
    const nextView = info.view.type === "timeGridDay" ? "day" : "month";

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

    if (calendarMode === "bookings") {
      fetchBookings("day", nextDate);
    }
  };

  const handleModeChange = (nextMode) => {
    setCalendarMode(nextMode);
    setStatusFilter("all");

    if (nextMode === "waiting-list" && waitingListEvents.length === 0) {
      fetchWaitingList(true);
    }
  };

  const getBookingDetailsFromEvent = (event) => {
    const bookingId = event?.extendedProps?.bookingId ?? event?.id?.replace(/^booking-/, "");
    const foundBooking = allBookingsData.find((booking) => String(booking.id) === String(bookingId));

    return foundBooking || event?.extendedProps?.bookingData || null;
  };

  const updateBookingStatusInCalendar = (bookingId, nextStatus) => {
    const normalizedBookingId = String(bookingId);

    setAllBookingsData((currentBookings) =>
      currentBookings.map((booking) =>
        String(booking.id) === normalizedBookingId
          ? { ...booking, status: nextStatus }
          : booking
      )
    );

    setEvents((currentEventsList) =>
      currentEventsList.map((event) => {
        if (String(event.id) !== `booking-${normalizedBookingId}`) {
          return event;
        }

        const updatedBookingData = {
          ...(event.extendedProps?.bookingData || {}),
          status: nextStatus,
        };

        return {
          ...event,
          extendedProps: {
            ...event.extendedProps,
            status: nextStatus,
            bookingData: updatedBookingData,
          },
        };
      })
    );

    setSelectedBooking((currentBooking) =>
      currentBooking && String(currentBooking.id) === normalizedBookingId
        ? { ...currentBooking, status: nextStatus }
        : currentBooking
    );
  };

  const handleBookingStatusUpdate = async (bookingId, nextStatus) => {
    try {
      setBookingActionLoadingId(`${bookingId}-${nextStatus}`);
      await api.put(`/bookings/${bookingId}/status`, { status: nextStatus });
      updateBookingStatusInCalendar(bookingId, nextStatus);
    } catch (error) {
      console.error("Failed to update booking status", error);
    } finally {
      setBookingActionLoadingId(null);
    }
  };

  const handleBackToMonthView = () => {
    setView("month");

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView("dayGridMonth");
      calendarApi.gotoDate(selectedDate);
    }
  };

  const handleApproveWaitingList = async (waitingListId) => {
    try {
      setApprovingWaitingListId(waitingListId);
      await api.patch(`/waiting-list/${waitingListId}/approve`);

      const updatedWaitingListEvents = waitingListEvents.map((entry) => {
        if (entry.id !== `waiting-list-${waitingListId}`) {
          return entry;
        }

        const updatedRecord = {
          ...entry.extendedProps.record,
          status: "accepted",
        };

        return {
          ...entry,
          extendedProps: {
            ...entry.extendedProps,
            status: "accepted",
            record: updatedRecord,
          },
        };
      });

      setWaitingListEvents(updatedWaitingListEvents);
      setSelectedWaitingList((currentSelection) =>
        currentSelection && currentSelection.id === waitingListId
          ? { ...currentSelection, status: "accepted" }
          : currentSelection
      );
    } catch (error) {
      console.error("Failed to approve waiting list entry", error);
    } finally {
      setApprovingWaitingListId(null);
    }
  };

  const isCalendarLoading = calendarMode === "waiting-list" ? waitingListLoading : loading;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-heading)]">Calendar</h1>
          <p className="text-gray-500 mt-1">
            {calendarMode === "waiting-list"
              ? "View waiting list requests across month and day perspectives."
              : "View bookings across month and day perspectives."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleModeChange("bookings")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                calendarMode === "bookings"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Bookings
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("waiting-list")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                calendarMode === "waiting-list"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Waiting List
            </button>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
            <span className="font-medium">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

      <div
        className={`flex-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm ${
          calendarMode === "waiting-list" ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        {isCalendarLoading ? (
          <div className="flex h-full min-h-[500px] items-center justify-center text-gray-500">Loading calendar...</div>
        ) : calendarMode === "waiting-list" && view === "day" ? (
          <div className="space-y-4">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleBackToMonthView}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                ← Month
              </button>
            </div>

            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-800">Morning</h3>
              </div>
              <div className="waiting-list-period-scroll min-h-0 space-y-3 p-3">
                {morningWaitingListEntries.length > 0 ? (
                  morningWaitingListEntries.map((entry) => {
                    const record = entry?.extendedProps?.record;
                    const status = normalizeStatus(record?.status);
                    const palette = getStatusPalette(status);

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedWaitingList(record || null)}
                        className="w-full min-w-0 break-words rounded-2xl border p-3 text-left shadow-sm transition hover:bg-gray-50"
                        style={{
                          backgroundColor: palette.background,
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold">{record?.customer_name || "Waiting list customer"}</div>
                            <div className="mt-1 text-xs opacity-90">{record?.services?.[0]?.name || record?.services?.[0] || "Waiting list"}</div>
                          </div>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {status || "pending"}
                          </span>
                        </div>
                        <div className="mt-2 text-xs opacity-90">{formatPeriodLabel(record?.period)}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
                    No Morning requests
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-800">Evening</h3>
              </div>
              <div className="waiting-list-period-scroll min-h-0 space-y-3 p-3">
                {eveningWaitingListEntries.length > 0 ? (
                  eveningWaitingListEntries.map((entry) => {
                    const record = entry?.extendedProps?.record;
                    const status = normalizeStatus(record?.status);
                    const palette = getStatusPalette(status);

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedWaitingList(record || null)}
                        className="w-full min-w-0 break-words rounded-2xl border p-3 text-left shadow-sm transition hover:bg-gray-50"
                        style={{
                          backgroundColor: palette.background,
                          borderColor: palette.border,
                          color: palette.text,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold">{record?.customer_name || "Waiting list customer"}</div>
                            <div className="mt-1 text-xs opacity-90">{record?.services?.[0]?.name || record?.services?.[0] || "Waiting list"}</div>
                          </div>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {status || "pending"}
                          </span>
                        </div>
                        <div className="mt-2 text-xs opacity-90">{formatPeriodLabel(record?.period)}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
                    No Evening requests
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
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
            eventClick={(info) => {
              if (calendarMode === "waiting-list") {
                setSelectedWaitingList(info.event.extendedProps.record || null);
                return;
              }

              const bookingFromEvent = getBookingDetailsFromEvent(info.event);
              setSelectedBooking(bookingFromEvent || info.event.extendedProps?.bookingData || null);
            }}
            eventDidMount={(eventInfo) => {
              const palette = getStatusPalette(eventInfo.event.extendedProps?.status);

              eventInfo.el.style.backgroundColor = palette.background;
              eventInfo.el.style.borderColor = palette.border;
              eventInfo.el.style.color = palette.text;
            }}
            eventContent={(eventInfo) => {
              const record = eventInfo.event.extendedProps?.record ?? {};
              const waitingListPeriod = formatPeriodLabel(
                eventInfo.event.extendedProps?.period ?? record?.period ?? eventInfo.event.extendedProps?.record?.period
              );

              return (
                <div className="px-1 py-0.5 text-[11px] leading-tight">
                  <div className="font-semibold">{eventInfo.event.title}</div>
                  {calendarMode === "waiting-list" && eventInfo.event.extendedProps?.serviceName && (
                    <div className="opacity-90 truncate">{eventInfo.event.extendedProps.serviceName}</div>
                  )}
                  <div className="opacity-90">{calendarMode === "waiting-list" ? waitingListPeriod : eventInfo.timeText || "All day"}</div>
                </div>
              );
            }}
          />
        )}
      </div>

          {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booking details</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">{selectedBooking.customer_name || "Customer"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booking</p>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">ID:</span> {selectedBooking.id || "—"}</p>
                  <p><span className="font-medium text-gray-900">Date:</span> {selectedBooking.booking_datetime ? new Date(selectedBooking.booking_datetime).toLocaleString("en-US", { timeZone: "America/Montreal", dateStyle: "medium", timeStyle: "short" }) : "—"}</p>
                  <p><span className="font-medium text-gray-900">Status:</span> {selectedBooking.status || "—"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</p>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Name:</span> {selectedBooking.customer_name || "—"}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {selectedBooking.customer_email || "—"}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {selectedBooking.customer_phone || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.isArray(selectedBooking.services) && selectedBooking.services.length > 0 ? (
                  selectedBooking.services.map((service, index) => (
                    <span
                      key={`${service?.id || index}-${service?.name || index}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      {typeof service === "string" ? service : service?.name || "Service"}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No services listed</span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reminders</p>
              <div className="mt-3 space-y-3">
                {Array.isArray(selectedBooking.reminders) && selectedBooking.reminders.length > 0 ? (
                  selectedBooking.reminders.map((reminder, index) => (
                    <div key={`${reminder?.id || index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium capitalize">{reminder?.type?.replace(/_/g, " ") || "Reminder"}</span>
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                          {reminder?.status || "pending"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        {reminder?.scheduled_at ? new Date(reminder.scheduled_at + "Z").toLocaleString("en-US", { timeZone: "America/Montreal", dateStyle: "medium", timeStyle: "short" }) : "—"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No reminders found</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {normalizeStatus(selectedBooking.status) === "pending" && (
                <button
                  type="button"
                  onClick={() => handleBookingStatusUpdate(selectedBooking.id, "approved")}
                  disabled={bookingActionLoadingId === `${selectedBooking.id}-approved`}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingActionLoadingId === `${selectedBooking.id}-approved` ? "Approving..." : "Approve"}
                </button>
              )}

              {normalizeStatus(selectedBooking.status) !== "cancelled" && normalizeStatus(selectedBooking.status) !== "completed" && (
                <button
                  type="button"
                  onClick={() => handleBookingStatusUpdate(selectedBooking.id, "cancelled")}
                  disabled={bookingActionLoadingId === `${selectedBooking.id}-cancelled`}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingActionLoadingId === `${selectedBooking.id}-cancelled` ? "Cancelling..." : "Cancel"}
                </button>
              )}

              {normalizeStatus(selectedBooking.status) === "approved" && (
                <button
                  type="button"
                  onClick={() => handleBookingStatusUpdate(selectedBooking.id, "completed")}
                  disabled={bookingActionLoadingId === `${selectedBooking.id}-completed`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingActionLoadingId === `${selectedBooking.id}-completed` ? "Marking done..." : "Done"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedWaitingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Waiting list request</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">{selectedWaitingList.customer_name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWaitingList(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                style={{
                  backgroundColor: getStatusPalette(selectedWaitingList.status).background,
                  border: `1px solid ${getStatusPalette(selectedWaitingList.status).border}`,
                  color: getStatusPalette(selectedWaitingList.status).text,
                }}
              >
                {selectedWaitingList.status || "pending"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{selectedWaitingList.customer_name || "—"}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedWaitingList.customer_email || "—"}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedWaitingList.customer_phone || "—"}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Requested date</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{selectedWaitingList.requested_date || "—"}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedWaitingList.period || "—"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.isArray(selectedWaitingList.services) && selectedWaitingList.services.length > 0 ? (
                  selectedWaitingList.services.map((service, index) => (
                    <span
                      key={`${service?.id || index}-${service?.name || index}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      {typeof service === "string" ? service : service?.name || "Service"}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No services listed</span>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</p>
                <p className="mt-2 text-sm text-gray-700">{selectedWaitingList.created_at || "—"}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</p>
                <p className="mt-2 text-sm text-gray-700">{selectedWaitingList.notes || "No notes provided"}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {normalizeStatus(selectedWaitingList.status) !== "accepted" && (
                <button
                  type="button"
                  onClick={() => handleApproveWaitingList(selectedWaitingList.id)}
                  disabled={approvingWaitingListId === selectedWaitingList.id}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {approvingWaitingListId === selectedWaitingList.id ? "Approving..." : "Approve entry"}
                </button>
              )}
{/* 
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
                title="No waiting-list cancel endpoint exists in the backend API."
              >
                Cancel unavailable
              </button> */}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .waiting-list-period-scroll {
          height: min(55vh, 520px);
          max-height: min(55vh, 520px);
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          scrollbar-gutter: stable;
        }

        .fc-more-popover {
          width: min(92vw, 420px) !important;
          max-width: calc(100vw - 16px) !important;
          max-height: min(72vh, 440px) !important;
          overflow: hidden !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18) !important;
          touch-action: pan-y !important;
        }

        .fc-more-popover .fc-popover-body {
          height: min(68vh, 420px) !important;
          max-height: min(68vh, 420px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 0.75rem !important;
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
        }

        .fc-more-popover .fc-popover-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 1 !important;
        }

        .fc-more-popover .fc-popover-body .fc-event {
          max-width: 100% !important;
          width: 100% !important;
        }

        .fc-more-popover .fc-event-main,
        .fc-more-popover .fc-event-title,
        .fc-more-popover .fc-event-time {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: normal !important;
          word-break: break-word !important;
        }

        @media (max-width: 640px) {
          .fc-more-popover {
            left: 8px !important;
            right: 8px !important;
            width: calc(100vw - 16px) !important;
            max-width: calc(100vw - 16px) !important;
            max-height: min(76vh, 520px) !important;
          }

          .fc-more-popover .fc-popover-body {
            height: min(72vh, 480px) !important;
            max-height: min(72vh, 480px) !important;
            padding: 0.5rem !important;
          }

          .waiting-list-period-scroll {
            height: min(52vh, 420px);
            max-height: min(52vh, 420px);
          }
        }
      `}</style>
    </div>
  );
}
