const express =require ("express");
const cors = require("cors");
const  cookieParser= require("cookie-parser");
const authRoutes = require("./routes/authRoutes.js");
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GigCraft AI backend is running",
  });
});
app.use("/api/auth", authRoutes);

module.exports = app;