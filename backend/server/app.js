const express =require ("express");
const cors = require("cors");
const  cookieParser= require("cookie-parser");
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
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

module.exports = app;