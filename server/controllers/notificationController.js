import {
  createNotification,
  getNotifications,
  markAsRead,
    deleteAllNotifications
} from "../models/notification.js";

// جلب notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { recipient_type, recipient_id } = req.params;

    const data = await getNotifications(recipient_type, recipient_id);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// إنشاء notification (internal use)
export const addNotification = async (req, res) => {
  try {
    const notification = await createNotification(req.body);

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error creating notification" });
  }
};

// mark as read
export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await markAsRead(id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

// حذف جميع notifications
export const deleteAllNotification = async (req, res) => {
  try {
    await deleteAllNotifications();

    res.json({
      message: "All notifications deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting all notifications:", err);

    res.status(500).json({
      message: "Error deleting all notifications"
    });
  }
};