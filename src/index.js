const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

const UserRoutes = require("./routes/user");
const PostRoutes = require("./routes/post");
const NotificationRoutes = require("./routes/notification");
const CommentRoutes = require("./routes/comment");
const messageRoutes = require("./routes/message");

const app = express();

const PORT = process.env.PORT || 4000;

// Connect Database
connectDB();

// Middlewares
app.use(cors({
  origin: "https://linkedlnclone-blue.vercel.app",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", UserRoutes);
app.use("/api/post", PostRoutes);
app.use("/api/notification", NotificationRoutes);
app.use("/api/comment", CommentRoutes);
app.use("/api/message", messageRoutes);

console.log("Message route registered");

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});