import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Robust CORS allowing requests from any origin with credentials enabled
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (Postman, curl, browser frontends)
      return callback(null, true);
    },
    credentials: true,
  })
);

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    // Allow root / health endpoints to respond even if DB is down, to help diagnosis
    if (req.path === "/" || req.path === "/health") {
      return next();
    }
    return res.status(500).json({
      status: "error",
      message: "Database connection failed. Please ensure MONGODB_URL is set in Vercel environment variables and 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.",
      error: error.message,
    });
  }
});

// Root route for health & verification
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "InterviewIQ API Backend is running successfully!",
    time: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "InterviewIQ API running smoothly",
    time: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl || req.url} not found` });
});

// Unhandled error handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start local server if not in a serverless environment like Vercel
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to database on startup:", error.message);
    });
}

export default app;