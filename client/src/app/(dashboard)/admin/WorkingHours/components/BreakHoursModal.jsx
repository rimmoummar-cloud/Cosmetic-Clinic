"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

/**
 * Convert individual 15-minute slots into continuous time ranges
 * Example: [09:00, 09:15, 09:30, 10:00, 10:15] → [{start: 09:00, end: 09:45}, {start: 10:00, end: 10:30}]
 */
function slotsToRanges(slots) {
  if (!slots || slots.length === 0) return [];

  const sorted = [...slots].sort();
  const ranges = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const currentSlot = sorted[i];
    const prevSlot = sorted[i - 1];

    // Check if current slot is 15 minutes after previous slot
    const prevMinutes = timeToMinutes(prevSlot);
    const currentMinutes = timeToMinutes(currentSlot);

    if (currentMinutes === prevMinutes + 15) {
      // Continue the range
      rangeEnd = currentSlot;
    } else {
      // Gap found, end current range and start new one
      ranges.push({ start: rangeStart, end: rangeEnd });
      rangeStart = currentSlot;
      rangeEnd = currentSlot;
    }
  }

  // Add the last range
  ranges.push({ start: rangeStart, end: rangeEnd });

  return ranges;
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to time string (HH:mm)
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function BreakHoursModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  loading: parentLoading,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableRanges, setAvailableRanges] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setSelectedDate(initialData.work_date?.split("T")[0] || "");
        setStartTime(initialData.start_time || "");
        setEndTime(initialData.end_time || "");
      } else {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        setStartTime("");
        setEndTime("");
      }
      setAvailableSlots([]);
      setAvailableRanges([]);
      setSlotsError("");
      setValidationError("");
    }
  }, [isOpen, mode, initialData]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, isOpen]);

  // Convert slots to ranges when available slots change
  useEffect(() => {
    if (availableSlots.length > 0) {
      const ranges = slotsToRanges(availableSlots);
      setAvailableRanges(ranges);
      
      // If in edit mode and times are already set, keep them
      // Otherwise, reset
      if (mode === "add" || (!startTime && !endTime)) {
        setStartTime("");
        setEndTime("");
      }
    } else {
      setAvailableRanges([]);
    }
  }, [availableSlots]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    setFetchingSlots(true);
    setSlotsError("");

    try {
      const isoDateTime = `${selectedDate}T12:00:00`;

      const res = await fetch(
        `${API_BASE_URL}/BreakHours/available-slots-break?booking_datetime=${encodeURIComponent(
          isoDateTime
        )}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const data = await res.json();
      const slots = data.availableSlots || [];
      setAvailableSlots(slots);

      if (slots.length === 0) {
        setSlotsError("No available time ranges for this date.");
      }
    } catch (error) {
      setSlotsError(
        error instanceof Error ? error.message : "Failed to fetch available slots"
      );
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  /**
   * Get all valid start times based on available ranges
   */
  const getValidStartTimes = () => {
    if (availableRanges.length === 0) return [];

    const times = new Set();
    availableRanges.forEach((range) => {
      const rangeStart = timeToMinutes(range.start);
      const rangeEnd = timeToMinutes(range.end);

      for (let m = rangeStart; m <= rangeEnd; m += 15) {
        times.add(minutesToTime(m));
      }
    });

    return Array.from(times).sort();
  };

  /**
   * Get all valid end times based on selected start time
   */
  const getValidEndTimes = () => {
    if (!startTime || availableRanges.length === 0) return [];

    const startMinutes = timeToMinutes(startTime);
    const times = new Set();

    // Find which range the start time belongs to
    for (const range of availableRanges) {
      const rangeStart = timeToMinutes(range.start);
      const rangeEnd = timeToMinutes(range.end);

      // If start time is within this range, get all times from start onwards in this range
      if (startMinutes >= rangeStart && startMinutes <= rangeEnd) {
        for (let m = startMinutes + 15; m <= rangeEnd; m += 15) {
          times.add(minutesToTime(m));
        }
        break; // Only use the first range that contains the start time
      }
    }

    return Array.from(times).sort();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!selectedDate) {
      setValidationError("Please select a date.");
      return;
    }

    if (!startTime || !endTime) {
      setValidationError("Please select both start and end times.");
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      setValidationError("End time must be after start time.");
      return;
    }

    onSubmit({
      work_date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      mode: mode,
      id: mode === "edit" ? initialData?.id : undefined,
    });
  };

  const getDurationMinutes = () => {
    if (!startTime || !endTime) return 0;
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    return end - start;
  };

  if (!isOpen) return null;

  const validStartTimes = getValidStartTimes();
  const validEndTimes = getValidEndTimes();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "add" ? "Add Break Hour" : "Edit Break Hour"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errors */}
          {validationError && (
            <div className="px-4 py-3 text-sm rounded-lg border bg-red-50 text-red-700 border-red-100">
              {validationError}
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Available Ranges Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Available Time Ranges
              </label>
              {fetchingSlots && (
                <span className="text-xs text-gray-500">Loading...</span>
              )}
            </div>

            {fetchingSlots ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block animate-spin">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.1 8.1l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.1-8.1l2.83-2.83"
                    />
                  </svg>
                </div>
              </div>
            ) : slotsError ? (
              <div className="px-4 py-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                {slotsError}
              </div>
            ) : availableRanges.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                No available time ranges for this date.
              </div>
            ) : (
              <div className="space-y-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                {availableRanges.map((range, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-white rounded border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {range.start} → {range.end}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(timeToMinutes(range.end) - timeToMinutes(range.start)) / 60 * 15} min
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Selection */}
          {availableRanges.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      // Reset end time if it's no longer valid
                      if (endTime) {
                        const newValidEndTimes = getValidEndTimes();
                        if (!newValidEndTimes.includes(endTime)) {
                          setEndTime("");
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Select start time --</option>
                    {validStartTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!startTime}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">-- Select end time --</option>
                    {validEndTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration Summary */}
              {startTime && endTime && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Break Duration: {getDurationMinutes()} minutes
                  </p>
                  <p className="text-xs text-blue-700">
                    {startTime} → {endTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Message */}
          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border border-gray-200">
            ℹ️ Unavailable times are already booked. Only select times within the available ranges above.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              disabled={parentLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary-dark rounded-lg hover:shadow-md transition-all disabled:opacity-60"
              disabled={parentLoading || !startTime || !endTime}
            >
              {parentLoading ? "Saving..." : mode === "add" ? "Add Break Hour" : "Update Break Hour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
