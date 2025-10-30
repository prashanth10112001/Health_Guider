require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/userRoutes.js");
const nodeRoutes = require("./routes/nodeRoutes.js");
const outdoorDataRoutes = require("./routes/outdoorDataRoutes.js");
const roomRoutes = require("./routes/roomRoutes.js");
const recommendationRoutes = require("./routes/recommendationRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json()); // use express.json() instead of body-parser

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("[+][MongoDB] ✅ Connected successfully");

    // Import your scheduler after DB is ready
    require("./scheduler/nodeScheduler.js");
    require("./scheduler/outdoorScheduler.js"); 
  })
  .catch((err) => console.error("[-][MongoDB] ❌ Connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/node", nodeRoutes);
app.use("/api/outdoor", outdoorDataRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/chat", chatRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Indoor AI Backend Running");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[+][Server] 🚀 Running on port ${PORT}`);
});
