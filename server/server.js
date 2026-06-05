
process.env.TZ = "UTC";
import helmet from "helmet";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from './config/db.js';
import { cleanupBlacklist } from "./utils/cleanupBlacklist.js";
import cookieParser from "cookie-parser";
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import workingHoursRoutes from "./routes/workingHoureRoutes.js";
import boxConectRoute from "./routes/boxConectRoute.js";
import pageRoutes from "./routes/pageRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import sectionContentRoutes from "./routes/sectionContentRoutes.js";
import customerRoutes from "./routes/customeRoutes.js";
import houreByDateRoute from "./routes/houreByDateRoute.js";
import BreakeHourRouter from "./routes/BreakeHourRouter.js";
import authRoutes from "./routes/authRoutes.js";
import disclaimerRoutes from "./routes/disclaimerRoutes.js";
import acceptanceRoutes from "./routes/acceptanceRoutes.js";
import { startCleanupJob } from "./jobs/cleanupJob.js";
import bookingReminderRoutes from "./routes/bookingReminderRoutes.js";
import { restoreReminderJobs }from "./jobs/restoreReminderJobs.js";
import { cleanupRefreshTokens } from "./models/cleanupRefreshTokens.js";
import waitingListRoutes from "./routes/watinglistRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import csrf from "csurf";

dotenv.config();
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET missing");
}
const app = express();
// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// ✅ auth routes أولاً (login, logout, me, csrf-token)
app.use("/api", authRoutes);

// ✅ CSRF للـ routes الباقية فقط
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);
app.use( "/api/disclaimers",disclaimerRoutes);
app.use("/api/acceptance",acceptanceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categorie", categoriesRoutes);
app.use("/api/workingHours", workingHoursRoutes);
app.use("/api/boxConect", boxConectRoute);
app.use("/api/customers", customerRoutes);
app.use("/api/workingHoursByDate", houreByDateRoute);
app.use("/api/BreakHours", BreakeHourRouter);
app.use("/api/pages", pageRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/section-content", sectionContentRoutes);
app.use("/api/booking-reminders", bookingReminderRoutes);
app.use("/api/waiting-list", waitingListRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/test-db", async (req, res) => {
  const result = await db.query("SELECT NOW()");
  res.json(result.rows);
});

setInterval(() => {

    cleanupBlacklist();


}, 1000 * 60 * 60);
setInterval(() => {

    cleanupRefreshTokens();


}, 1000 * 60 * 60);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

  startCleanupJob();

  restoreReminderJobs();

  console.log(
    `Server running on port ${PORT}`
  );
});