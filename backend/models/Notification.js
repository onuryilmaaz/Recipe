const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "recipe_like",
        "recipe_comment",
        "comment_reply",
        "recipe_favorite",
        "collection_follow",
        "user_follow",
        "recipe_published",
        "recipe_featured",
        "comment_like",
        "system_announcement",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
      commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
      collectionId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      // Additional metadata can be stored here
      metadata: {
        type: Object,
        default: {},
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Notification delivery preferences
    delivery: {
      inApp: {
        type: Boolean,
        default: true,
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: {
          type: Date,
          default: null,
        },
      },
      email: {
        type: Boolean,
        default: false,
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: {
          type: Date,
          default: null,
        },
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Default expiry: 30 days from creation
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for generating notification URL
NotificationSchema.virtual("actionUrl").get(function () {
  switch (this.type) {
    case "recipe_like":
    case "recipe_comment":
    case "recipe_favorite":
      return this.data.recipeId ? `/recipes/${this.data.recipeId}` : "#";
    case "comment_reply":
    case "comment_like":
      return this.data.recipeId
        ? `/recipes/${this.data.recipeId}#comment-${this.data.commentId}`
        : "#";
    case "user_follow":
      return `/user/${this.sender}`;
    case "collection_follow":
      return this.data.collectionId
        ? `/collections/${this.data.collectionId}`
        : "#";
    default:
      return "#";
  }
});

// Static method to create notification
NotificationSchema.statics.createNotification = async function (
  notificationData
) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

module.exports = mongoose.model("Notification", NotificationSchema);
