const express=require("express");
const { Signup, login } =require("../controllers/authController.js");
const { protect } =require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", login);


module.exports = router;