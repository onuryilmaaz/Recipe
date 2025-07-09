const express = require("express");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendSystemAnnouncement,
  getNotificationStats,
} = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// User notification routes (require authentication)
router.use(protect);

// Get user notifications with pagination and filtering
router.get("/", getNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Mark specific notification as read
router.put("/:id/read", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Delete specific notification
router.delete("/:id", deleteNotification);

// Delete all notifications for user
router.delete("/all", deleteAllNotifications);

// Get notification preferences
router.get("/preferences", getNotificationPreferences);

// Update notification preferences
router.put("/preferences", updateNotificationPreferences);

// Admin only routes
router.use(adminOnly);

// Send system announcement to all users
router.post("/admin/announcement", sendSystemAnnouncement);

// Get notification statistics
router.get("/admin/stats", getNotificationStats);

module.exports = router;
