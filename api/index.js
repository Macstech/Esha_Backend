require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("../src/config");

// Route imports
const authRoutes = require("../src/routes/auth");
const postRoutes = require("../src/routes/posts");
const categoryRoutes = require("../src/routes/categories");
const mediaRoutes = require("../src/routes/media");
const userRoutes = require("../src/routes/users");
const dashboardRoutes = require("../src/routes/dashboard");
const driverRoutes = require("../src/routes/drivers");
const vehicleRoutes = require("../src/routes/vehicles");
const supervisorRoutes = require("../src/routes/supervisors");
const supervisorAssignmentRoutes = require("../src/routes/supervisorAssignments");
const vehicleTypeRoutes = require("../src/routes/vehicleTypes");
const loadRoutes = require("../src/routes/loads");
const loadHistoryRoutes = require("../src/routes/loadHistory");
const reportsRoutes = require("../src/routes/reports");
const websiteContentRoutes = require("../src/routes/websiteContent");
const pagesRoutes = require("../src/routes/pages");

const app = express();

const allowedOrigins = [
  config.clientUrl,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
