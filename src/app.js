require("dotenv").config();
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
const driverRoutes = require("./routes/drivers");
const vehicleRoutes = require("./routes/vehicles");
const supervisorRoutes = require("./routes/supervisors");
const supervisorAssignmentRoutes = require("./routes/supervisorAssignments");
const vehicleTypeRoutes = require("./routes/vehicleTypes");
const loadRoutes = require("./routes/loads");
const loadHistoryRoutes = require("./routes/loadHistory");
const reportsRoutes = require("./routes/reports");
const websiteContentRoutes = require("./routes/websiteContent");
const pagesRoutes = require("./routes/pages");

const app = express();

// Middleware
const allowedOrigins = [
  config.clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/supervisors", supervisorRoutes);
app.use("/api/supervisor-assignments", supervisorAssignmentRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/loads", loadRoutes);
app.use("/api/load-history", loadHistoryRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/website-content", websiteContentRoutes);
app.use("/api", pagesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
