process.env.TZ = "UTC";
// process.env.TZ = "Asia/Amman";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from './config/db.js';
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import workingHoursRoutes from "./routes/workingHoureRoutes.js";
import boxConectRoute from "./routes/boxConectRoute.js";
import pageRoutes from "./routes/pageRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import sectionContentRoutes from "./routes/sectionContentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categorie", categoriesRoutes);
app.use("/api/workingHours", workingHoursRoutes);
app.use("/api/boxConect", boxConectRoute);

// ====== CMS ROUTES ======
// Pages: Create, read, update, delete pages
app.use("/api/pages", pageRoutes);
// Sections: Create, read, update, delete sections within pages
app.use("/api/sections", sectionRoutes);
// Section Content: Create, read, update, delete content with versioning
app.use("/api/section-content", sectionContentRoutes);
app.get("/test-db", async (req, res) => {
  const result = await db.query("SELECT NOW()");
  res.json(result.rows);

});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port  ${PORT}`);
 
  // console.log(new Date());
  // console.log(new Date().toLocaleString());
  // console.log(new Date().toISOString());
});