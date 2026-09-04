import * as Note from "../models/notes.js";

export const getNotesByCustomerID = async (req, res) => {
  try {
    const { customerId } = req.params;

    const notes = await Note.getNotesByCustomerID(customerId);

    res.status(200).json(notes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customer notes",
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const newNote = await Note.createNote(customerId, {
      note: note.trim(),
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create note",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        message: "Note is required",
      });
    }

    const updatedNote = await Note.updateNote(id, {
      note: note.trim(),
    });

    if (!updatedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update note",
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.deleteNote(id);

    if (!deletedNote) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json({
      message: "Note deleted successfully",
      note: deletedNote,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete note",
    });
  }
};