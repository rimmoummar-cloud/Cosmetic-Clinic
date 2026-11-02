import CalendarDayNote from "../models/calendarDayNote.js";

const parseId = (value) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const parseDate = (value, label = "note_date") => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: `${label} must be a valid YYYY-MM-DD date.` };
  }

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return { error: `${label} must be a valid YYYY-MM-DD date.` };
  }
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];
  if (day > daysInMonth) {
    return { error: `${label} must be a valid YYYY-MM-DD date.` };
  }

  return { value };
};

const parseNoteFields = (body) => {
  const fields =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const parsedDate = parseDate(fields.note_date);
  if (parsedDate.error) return parsedDate;

  if (typeof fields.title !== "string" || !fields.title.trim()) {
    return { error: "Title is required." };
  }
  const title = fields.title.trim();
  if (title.length > 200) {
    return { error: "Title must be 200 characters or fewer." };
  }

  if (typeof fields.description !== "string" || !fields.description.trim()) {
    return { error: "Description is required." };
  }

  return {
    values: {
      note_date: parsedDate.value,
      title,
      description: fields.description.trim(),
    },
  };
};

export const getCalendarDayNotes = async (req, res) => {
  const { date, startDate, endDate } = req.query;

  if (date !== undefined) {
    const parsedDate = parseDate(date, "date");
    if (parsedDate.error) return res.status(400).json({ message: parsedDate.error });
    if (startDate !== undefined || endDate !== undefined) {
      return res.status(400).json({ message: "Use date or a startDate/endDate range, not both." });
    }

    try {
      return res.status(200).json(await CalendarDayNote.getByDate(parsedDate.value));
    } catch (error) {
      console.error("Failed to load calendar day notes:", error);
      return res.status(500).json({ message: "Unable to load calendar day notes." });
    }
  }

  if (startDate === undefined || endDate === undefined) {
    return res.status(400).json({ message: "startDate and endDate are required." });
  }

  const parsedStart = parseDate(startDate, "startDate");
  if (parsedStart.error) return res.status(400).json({ message: parsedStart.error });
  const parsedEnd = parseDate(endDate, "endDate");
  if (parsedEnd.error) return res.status(400).json({ message: parsedEnd.error });
  if (parsedStart.value > parsedEnd.value) {
    return res.status(400).json({ message: "startDate must be on or before endDate." });
  }

  try {
    return res.status(200).json(
      await CalendarDayNote.getByDateRange(parsedStart.value, parsedEnd.value)
    );
  } catch (error) {
    console.error("Failed to load calendar day notes:", error);
    return res.status(500).json({ message: "Unable to load calendar day notes." });
  }
};

export const createCalendarDayNote = async (req, res) => {
  const parsed = parseNoteFields(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });

  try {
    return res.status(201).json(await CalendarDayNote.create(parsed.values));
  } catch (error) {
    console.error("Failed to create calendar day note:", error);
    return res.status(500).json({ message: "Unable to create calendar day note." });
  }
};

export const updateCalendarDayNote = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid calendar day note ID." });

  const parsed = parseNoteFields(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });

  try {
    const updated = await CalendarDayNote.update(id, parsed.values);
    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ message: "Calendar day note not found." });
  } catch (error) {
    console.error("Failed to update calendar day note:", error);
    return res.status(500).json({ message: "Unable to update calendar day note." });
  }
};

export const deleteCalendarDayNote = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid calendar day note ID." });

  try {
    const deleted = await CalendarDayNote.delete(id);
    return deleted
      ? res.status(200).json({ message: "Calendar day note deleted successfully." })
      : res.status(404).json({ message: "Calendar day note not found." });
  } catch (error) {
    console.error("Failed to delete calendar day note:", error);
    return res.status(500).json({ message: "Unable to delete calendar day note." });
  }
};
