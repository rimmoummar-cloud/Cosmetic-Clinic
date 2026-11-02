import api from "./api";

export const fetchCalendarDayNotes = async (startDate, endDate) => {
  const response = await api.get("/calendar-day-notes", {
    params: { startDate, endDate },
  });
  return response.data;
};

export const createCalendarDayNote = async (note) => {
  const response = await api.post("/calendar-day-notes", note);
  return response.data;
};

export const updateCalendarDayNote = async (id, note) => {
  const response = await api.put(`/calendar-day-notes/${id}`, note);
  return response.data;
};

export const deleteCalendarDayNote = async (id) => {
  const response = await api.delete(`/calendar-day-notes/${id}`);
  return response.data;
};
