import processReminderEmails from "../jobs/processReminderEmails.js";

export const processReminders = async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Cron secret is not configured",
      });
    }

    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("🔔 Reminder worker triggered by GitHub Actions");

    await processReminderEmails();

    return res.status(200).json({
      success: true,
      message: "Reminder processing completed",
    });
  } catch (error) {
    console.error("❌ Reminder processing failed:", error);

    return res.status(500).json({
      success: false,
      message: "Reminder processing failed",
    });
  }
};