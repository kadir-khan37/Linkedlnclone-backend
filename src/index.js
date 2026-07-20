const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db.js');
require('dotenv').config({ path: "./config.env" });
const messageRoutes = require("../src/routes/message");
const app = express();
const PORT = process.env.PORT || 400
// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
// connected to databse 
connectDB();

const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const NotificationRoutes = require('./routes/notification');
const CommentRoutes = require('./routes/comment');

app.use("/api/auth", UserRoutes);
app.use("/api/post", PostRoutes);
app.use("/api/notification",NotificationRoutes);
app.use("/api/comment",CommentRoutes);
app.use("/api/message", messageRoutes);
console.log("Message route registered");

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});