// process.env.TZ = "UTC";
// // process.env.TZ = "Asia/Amman";
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import db from './config/db.js';
// import cookieParser from "cookie-parser"; // (مهم بالسيرفر)
// import bookingRoutes from "./routes/bookingRoutes.js";
// import serviceRoutes from "./routes/serviceRoutes.js";
// import categoriesRoutes from "./routes/categoriesRoutes.js";
// import workingHoursRoutes from "./routes/workingHoureRoutes.js";
// import boxConectRoute from "./routes/boxConectRoute.js";
// import pageRoutes from "./routes/pageRoutes.js";
// import sectionRoutes from "./routes/sectionRoutes.js";
// import sectionContentRoutes from "./routes/sectionContentRoutes.js";
// import customerRoutes from "./routes/customeRoutes.js";
// import houreByDateRoute from "./routes/houreByDateRoute.js";
// import BreakeHourRouter from "./routes/BreakeHourRouter.js";
// import authRoutes from "./routes/authRoutes.js";
// import csrf from "csurf";


// dotenv.config();

// const app = express();
// // const csrfProtection = csrf({
// //   cookie: true
// // });



// // app.use(cors());
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));

// app.use(cookieParser());
// app.use(express.json());
// // 1. أول شي: csrf protection
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);

// app.get("/api/csrf-token", (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });
// app.use("/api", authRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/categorie", categoriesRoutes);
// app.use("/api/workingHours", workingHoursRoutes);
// app.use("/api/boxConect", boxConectRoute);
// app.use("/api/customers", customerRoutes);
// app.use("/api/workingHoursByDate", houreByDateRoute);
// app.use("/api/BreakHours", BreakeHourRouter);
// // ====== CMS ROUTES ======
// // Pages: Create, read, update, delete pages
// app.use("/api/pages", pageRoutes);
// // Sections: Create, read, update, delete sections within pages
// app.use("/api/sections", sectionRoutes);
// // Section Content: Create, read, update, delete content with versioning
// app.use("/api/section-content", sectionContentRoutes);
// app.get("/test-db", async (req, res) => {
//   const result = await db.query("SELECT NOW()");
//   res.json(result.rows);

// });
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port  ${PORT}`);
 
//   // console.log(new Date());
//   // console.log(new Date().toLocaleString());
//   // console.log(new Date().toISOString());
// });
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

import { cleanupRefreshTokens } from "./models/cleanupRefreshTokens.js";
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
  console.log(`Server running on port ${PORT}`);
});