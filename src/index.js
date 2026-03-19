const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");

// Route imports
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const categoryRoutes = require("./routes/categories");
const mediaRoutes = require("./routes/media");
const userRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    exposedHeaders: ["x-total-count"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`🚀 ContentHub API running on http://localhost:${config.port}`);
});
