const express=require("express");
const { Signup, login,getMe,logout,googleLogin,forgotPassword, resetPassword  } =require("../controllers/authController.js");
const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/signup", Signup);
router.post("/google", googleLogin);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout",  logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;