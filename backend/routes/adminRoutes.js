const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserById,
  createUser,
  getUserStats,
} = require("../controllers/userController");

const {
  getPendingContent,
  getReportedContent,
  approveContent,
  rejectContent,
  dismissFlags,
  getModerationStats,
  reportContent,
} = require("../controllers/moderationController");

const {
  getAnalytics,
  getRealTimeStats,
} = require("../controllers/analyticsController");

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminOnly);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/:userId", getUserById);
router.post("/users", createUser);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Moderation routes
router.get("/moderation/pending", getPendingContent);
router.get("/moderation/reported", getReportedContent);
router.get("/moderation/stats", getModerationStats);
router.patch("/moderation/approve", approveContent);
router.patch("/moderation/reject", rejectContent);
router.patch("/moderation/dismiss-flag", dismissFlags);

// Analytics routes
router.get("/analytics", getAnalytics);
router.get("/analytics/realtime", getRealTimeStats);

module.exports = router;
