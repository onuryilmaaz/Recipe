const Notification = require("../models/Notification");
const User = require("../models/User");
const { systemNotifications } = require("../utils/notificationService");

// @desc   Get user notifications with pagination
// @route  GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const isRead = req.query.isRead;

    const skip = (page - 1) * limit;

    // Build query
    let query = { recipient: userId };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name profileImageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler alınamadı",
    });
  }
};

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
// @access Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Okunmamış bildirim sayısı alınamadı",
    });
  }
};

// @desc   Mark notification as read
// @route  PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Bildirim bulunamadı",
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: "Bildirim okundu olarak işaretlendi",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim güncellenemedi",
    });
  }
};

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/mark-all-read
// @access Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "Tüm bildirimler okundu olarak işaretlendi",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler güncellenemedi",
    });
  }
};

// @desc   Delete notification
// @route  DELETE /api/notifications/:id
// @access Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Bildirim bulunamadı",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Bildirim silindi",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim silinemedi",
    });
  }
};

// @desc   Delete all notifications for user
// @route  DELETE /api/notifications/all
// @access Private
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({
      recipient: userId,
    });

    res.status(200).json({
      success: true,
      message: "Tüm bildirimler silindi",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler silinemedi",
    });
  }
};

// @desc   Get notification preferences (placeholder for future implementation)
// @route  GET /api/notifications/preferences
// @access Private
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // For now, return default preferences
    // In future, this could be stored in user model or separate preferences model
    const preferences = {
      email: {
        recipe_comment: true,
        comment_reply: true,
        recipe_like: false,
        recipe_favorite: false,
        user_follow: true,
        collection_follow: false,
        recipe_featured: true,
        system_announcement: true,
      },
      inApp: {
        recipe_comment: true,
        comment_reply: true,
        recipe_like: true,
        recipe_favorite: true,
        user_follow: true,
        collection_follow: true,
        recipe_published: true,
        recipe_featured: true,
        comment_like: true,
        system_announcement: true,
      },
    };

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim tercihleri alınamadı",
    });
  }
};

// @desc   Update notification preferences (placeholder for future implementation)
// @route  PUT /api/notifications/preferences
// @access Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    // For now, just return success
    // In future, save to user model or preferences model

    res.status(200).json({
      success: true,
      message: "Bildirim tercihleri güncellendi",
      preferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim tercihleri güncellenemedi",
    });
  }
};

// Admin only endpoints

// @desc   Send system announcement to all users
// @route  POST /api/notifications/admin/announcement
// @access Private (Admin only)
const sendSystemAnnouncement = async (req, res) => {
  try {
    const { title, message, priority = "medium", sendEmail = false } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Başlık ve mesaj gerekli",
      });
    }

    // Get all active user IDs
    const users = await User.find({ status: "active" }).select("_id");
    const recipientIds = users.map((user) => user._id);

    // Send announcement
    const notifications = await systemNotifications.sendAnnouncement(
      title,
      message,
      recipientIds,
      priority
    );

    res.status(200).json({
      success: true,
      message: `Sistem bildirimi ${recipientIds.length} kullanıcıya gönderildi`,
      sentCount: notifications.length,
    });
  } catch (error) {
    console.error("Error sending system announcement:", error);
    res.status(500).json({
      success: false,
      message: "Sistem bildirimi gönderilemedi",
    });
  }
};

// @desc   Get notification statistics (Admin only)
// @route  GET /api/notifications/admin/stats
// @access Private (Admin only)
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalNotifications = await Notification.countDocuments();
    const totalUnread = await Notification.countDocuments({ isRead: false });

    // Get recent notifications
    const recentNotifications = await Notification.find()
      .populate("sender", "name")
      .populate("recipient", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        total: totalNotifications,
        unread: totalUnread,
        byType: stats,
        recent: recentNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim istatistikleri alınamadı",
    });
  }
};

module.exports = {
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
};
