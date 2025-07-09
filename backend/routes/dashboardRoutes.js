const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardContoller");

router.get("/", protect, adminOnly, getDashboardSummary);

module.exports = router;
