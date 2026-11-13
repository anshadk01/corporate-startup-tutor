import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import reflectionRoutes from "./routes/reflectionRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import promptLogRoutes from "./routes/promptLogRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import cycleRoutes from "./routes/cycleRoutes.js";
import { seedDatabase } from "./scripts/seed.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health & System Info
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    course: "Designing Corporate-Startup Synergies (ENT 3805)",
    institution: "BML Munjal University",
    timestamp: new Date().toISOString()
  });
});

// Demo Reset / Seed endpoint
app.post("/api/seed", async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: "Database reseeded successfully with ENT 3805 demo data." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/prompt-logs", promptLogRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/cycles", cycleRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;
