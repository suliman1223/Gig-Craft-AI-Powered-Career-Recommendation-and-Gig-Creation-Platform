const express =require ("express");
const cors = require("cors");
const  cookieParser= require("cookie-parser");
const authRoutes = require("./routes/authRoutes.js");
const resumeRoutes = require("./routes/uploadRoutes.js");
const path = require("path");
const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GigCraft AI backend is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

module.exports = app;