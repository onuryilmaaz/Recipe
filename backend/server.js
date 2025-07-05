import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import recipeRoutes from "./routes/recipes.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Fallback: always attach CORS headers (useful for errors)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/ai", aiRoutes);

// Swagger docs
const swaggerDocument = JSON.parse(fs.readFileSync("./docs/swagger.json"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Simple health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
