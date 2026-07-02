const app =require ("./app.js");
const connectDB = require("./config/db.js");
const dotenv =require ("dotenv");

dotenv.config();

const PORT = process.env.PORT;

connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});