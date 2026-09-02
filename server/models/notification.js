

import db from "../config/db.js";
// إنشاء notification
export async function createNotification({
  recipient_type,
  recipient_id,
  booking_id,
  type,
  title,
  message
}) {
  const result = await db.query(
    `
    INSERT INTO notifications
    (recipient_type, recipient_id, booking_id, type, title, message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [recipient_type, recipient_id, booking_id, type, title, message]
  );

  return result.rows[0];
}

// جلب notifications لشخص (user أو admin)
export async function getNotifications(recipient_type, recipient_id) {
  const result = await db.query(
    `
    SELECT * FROM notifications
    WHERE recipient_type = $1 AND recipient_id = $2
    ORDER BY created_at DESC
    `,
    [recipient_type, recipient_id]
  );

  return result.rows;
}

// mark as read
export async function markAsRead(id) {
  const result = await db.query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
}


// حذف جميع notifications من الجدول
export async function deleteAllNotifications() {
  await db.query(`
    DELETE FROM notifications
  `);
}