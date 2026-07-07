const app =require ("./app.js");
const connectDB = require("./config/db.js");
const dotenv =require ("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT} on ${HOST}`);
});