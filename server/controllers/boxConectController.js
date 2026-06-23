import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  deleteContactMessage,
} from "../models/boxContect.js";
import {
  createNotification
} from "../models/notification.js";
export const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const data = await createContactMessage({
      name,
      email,
      message,
    });

console.log("before notification");

await createNotification({
  recipient_type: "admin",
  recipient_id: 1,
  booking_id: null,
  type: "contact_message",
  title: "New Message",
  message: `${name} sent a new message`
});

console.log("after notification");


    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create message",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const data = await getAllContactMessages();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const data = await getContactMessageById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch message",
    });
  }
};

export const removeMessage = async (req, res) => {
  try {
    const data = await deleteContactMessage(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};


import { sendContactReplyEmail }
  from "../utils/sendEmail.js";

export const replyToMessage = async (
  req,
  res
) => {
  try {

    const {
      messageId,
      reply,
    } = req.body;

    const message =
      await getContactMessageById(
        messageId
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

 sendContactReplyEmail({    
      to: message.email,
      customerName: message.name,
      replyMessage: reply,
    });

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send reply",
    });

  }
};