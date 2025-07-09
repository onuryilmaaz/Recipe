const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { reportContent } = require("../controllers/moderationController");

// Report content (requires authentication)
router.post("/", authMiddleware, reportContent);

module.exports = router;
