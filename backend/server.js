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
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

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
