// import express from "express";
// import { authenticateAdmin } from "../middleware/authMiddleware.js";

// import {
//     login,
//     me,
//     // register
//     logout
// } from "../controllers/authController.js";

// const router = express.Router();
// router.post("/logout", logout);
// router.post("/login", login);
// router.get("/me", authenticateAdmin, me);
// // router.post("/register", register);

// export default router;
import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import { login, me, logout } from "../controllers/authController.js";
import {
    refresh,
    updateProfile,
    verifyPassword
}
from "../controllers/authController.js";






import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
});
const loginLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 10,

  message: {
    message: "Too many login attempts, try again later"
  },

  standardHeaders: true,

  legacyHeaders: false

});
// بدون CSRF
router.post("/login", loginLimiter, login);
router.post(
  "/logout",
   authenticateAdmin,
  csrfProtection,
  logout
);

// GET للـ csrf token - بدون حماية (هو اللي بيعطي التوكن)
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ /me بدون csrfProtection - GET requests ما تحتاج CSRF
router.get("/me", authenticateAdmin, me);
router.post(
  "/refresh",
  csrfProtection,
  refresh
);


router.put(
  "/profile",
  authenticateAdmin,
  csrfProtection,
  updateProfile
);

router.post(
  "/verify-password",
  authenticateAdmin,
    csrfProtection,
  verifyPassword
);



export default router;