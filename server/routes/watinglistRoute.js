import express from "express";
import {
  createWaitingList,
  approveWaitingListController,
  getWaitingList
} from "../controllers/watinglistController.js";
import csrf from "csurf";
import { authenticateAdmin } from "../middleware/authMiddleware.js";



const router = express.Router();
const csrfProtection =csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});
router.get(
  "/",csrfProtection,
  authenticateAdmin,
  getWaitingList
);

router.patch(
  "/:id/approve",csrfProtection,
  authenticateAdmin,
  approveWaitingListController
);

router.post("/", createWaitingList);

export default router;