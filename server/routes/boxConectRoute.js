import express from "express";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getMassege,

  createMassege

} from "../controllers/boxConectController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
router.get("/", csrfProtection, authenticateAdmin, getMassege);

router.post("/", createMassege);


export default router;