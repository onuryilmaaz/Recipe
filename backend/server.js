require("dotenv").config();
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipesRoutes");
const commentsRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

//Middleware to handle CORS
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative dev port
  "https://your-app-name.vercel.app", // Replace with your Vercel URL
  "https://*.vercel.app", // Allow all Vercel subdomains
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      // Allow localhost in development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }

      // Allow Vercel domains
      if (origin.includes(".vercel.app")) {
        return callback(null, true);
      }

      // Check against allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/dashboard-summary", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Server Uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Swagger docs
const swaggerDocument = JSON.parse(fs.readFileSync("./docs/swagger.json"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
