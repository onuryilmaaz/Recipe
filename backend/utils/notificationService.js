const Notification = require("../models/Notification");
const { sendNotificationEmail } = require("./emailService");

// Notification templates for different types
const notificationTemplates = {
  recipe_like: (senderName, recipeName) => ({
    title: "Tarifin Beğenildi! ❤️",
    message: `${senderName} tarifin "${recipeName}" beğendi.`,
  }),

  recipe_comment: (senderName, recipeName) => ({
    title: "Yeni Yorum! 💬",
    message: `${senderName} tarifin "${recipeName}" yorum yaptı.`,
  }),

  comment_reply: (senderName, recipeName) => ({
    title: "Yorumuna Yanıt! 💭",
    message: `${senderName} "${recipeName}" tarifindeki yorumuna yanıt verdi.`,
  }),

  recipe_favorite: (senderName, recipeName) => ({
    title: "Tarif Favorilere Eklendi! ⭐",
    message: `${senderName} tarifin "${recipeName}" favorilerine ekledi.`,
  }),

  user_follow: (senderName) => ({
    title: "Yeni Takipçi! 👥",
    message: `${senderName} seni takip etmeye başladı.`,
  }),

  collection_follow: (senderName, collectionName) => ({
    title: "Koleksiyon Takip Edildi! 📚",
    message: `${senderName} "${collectionName}" koleksiyonunu takip etmeye başladı.`,
  }),

  recipe_published: (recipeName) => ({
    title: "Tarif Yayınlandı! 🎉",
    message: `"${recipeName}" tarifin başarıyla yayınlandı ve diğer kullanıcılar tarafından görülebilir.`,
  }),

  recipe_featured: (recipeName) => ({
    title: "Tarif Öne Çıkarıldı! ⭐",
    message: `Tebrikler! "${recipeName}" tarifin öne çıkarılan tarifler arasında yer aldı.`,
  }),

  comment_like: (senderName, recipeName) => ({
    title: "Yorumun Beğenildi! 👍",
    message: `${senderName} "${recipeName}" tarifindeki yorumunu beğendi.`,
  }),

  system_announcement: (title, message) => ({
    title: title || "Sistem Bildirimi 📢",
    message: message || "Sistemden yeni bir bildirim var.",
  }),
};

/**
 * Create and send a notification
 * @param {Object} options - Notification options
 * @param {string} options.type - Notification type
 * @param {string} options.recipientId - User ID who will receive the notification
 * @param {string} options.senderId - User ID who triggered the notification
 * @param {Object} options.data - Additional data (recipeId, commentId, etc.)
 * @param {Object} options.templateData - Data for notification template
 * @param {boolean} options.sendEmail - Whether to send email notification
 * @param {string} options.priority - Notification priority (low, medium, high, urgent)
 */
const createNotification = async (options) => {
  try {
    const {
      type,
      recipientId,
      senderId,
      data = {},
      templateData = {},
      sendEmail = false,
      priority = "medium",
    } = options;

    // Don't send notification to self
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    // Get notification template
    const template = notificationTemplates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    // Generate title and message from template
    const { title, message } = template(...Object.values(templateData));

    // Create notification data
    const notificationData = {
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data,
      priority,
      delivery: {
        inApp: {
          sent: true,
          sentAt: new Date(),
        },
        email: {
          sent: false,
          sentAt: null,
        },
      },
    };

    // Create notification
    const notification = await Notification.createNotification(
      notificationData
    );

    // Send email notification if requested
    if (sendEmail) {
      try {
        await sendNotificationEmail(notification);
        notification.delivery.email.sent = true;
        notification.delivery.email.sentAt = new Date();
        await notification.save();
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Create multiple notifications for a list of recipients
 */
const createBulkNotifications = async (options) => {
  const {
    type,
    recipientIds,
    senderId,
    data = {},
    templateData = {},
    sendEmail = false,
    priority = "medium",
  } = options;

  const notifications = [];

  for (const recipientId of recipientIds) {
    try {
      const notification = await createNotification({
        type,
        recipientId,
        senderId,
        data,
        templateData,
        sendEmail,
        priority,
      });

      if (notification) {
        notifications.push(notification);
      }
    } catch (error) {
      console.error(
        `Failed to create notification for user ${recipientId}:`,
        error
      );
    }
  }

  return notifications;
};

/**
 * Recipe-related notification helpers
 */
const recipeNotifications = {
  // When someone likes a recipe
  recipeLiked: async (
    recipientId,
    senderId,
    recipeId,
    recipeName,
    senderName
  ) => {
    return await createNotification({
      type: "recipe_like",
      recipientId,
      senderId,
      data: { recipeId },
      templateData: [senderName, recipeName],
      sendEmail: false,
    });
  },

  // When someone comments on a recipe
  recipeCommented: async (
    recipientId,
    senderId,
    recipeId,
    commentId,
    recipeName,
    senderName
  ) => {
    return await createNotification({
      type: "recipe_comment",
      recipientId,
      senderId,
      data: { recipeId, commentId },
      templateData: [senderName, recipeName],
      sendEmail: true,
    });
  },

  // When someone replies to a comment
  commentReplied: async (
    recipientId,
    senderId,
    recipeId,
    commentId,
    recipeName,
    senderName
  ) => {
    return await createNotification({
      type: "comment_reply",
      recipientId,
      senderId,
      data: { recipeId, commentId },
      templateData: [senderName, recipeName],
      sendEmail: true,
    });
  },

  // When someone favorites a recipe
  recipeFavorited: async (
    recipientId,
    senderId,
    recipeId,
    recipeName,
    senderName
  ) => {
    return await createNotification({
      type: "recipe_favorite",
      recipientId,
      senderId,
      data: { recipeId },
      templateData: [senderName, recipeName],
      sendEmail: false,
    });
  },

  // When a recipe is published
  recipePublished: async (recipientId, recipeId, recipeName) => {
    return await createNotification({
      type: "recipe_published",
      recipientId,
      senderId: recipientId, // Self notification
      data: { recipeId },
      templateData: [recipeName],
      sendEmail: false,
      priority: "high",
    });
  },

  // When a recipe is featured
  recipeFeatured: async (recipientId, recipeId, recipeName) => {
    return await createNotification({
      type: "recipe_featured",
      recipientId,
      senderId: recipientId, // System notification (self)
      data: { recipeId },
      templateData: [recipeName],
      sendEmail: true,
      priority: "high",
    });
  },
};

/**
 * User-related notification helpers
 */
const userNotifications = {
  // When someone follows a user
  userFollowed: async (recipientId, senderId, senderName) => {
    return await createNotification({
      type: "user_follow",
      recipientId,
      senderId,
      data: {},
      templateData: [senderName],
      sendEmail: false,
    });
  },

  // When someone follows a collection
  collectionFollowed: async (
    recipientId,
    senderId,
    collectionId,
    collectionName,
    senderName
  ) => {
    return await createNotification({
      type: "collection_follow",
      recipientId,
      senderId,
      data: { collectionId },
      templateData: [senderName, collectionName],
      sendEmail: false,
    });
  },
};

/**
 * System notification helpers
 */
const systemNotifications = {
  // System announcement to all users
  sendAnnouncement: async (
    title,
    message,
    recipientIds,
    priority = "medium"
  ) => {
    return await createBulkNotifications({
      type: "system_announcement",
      recipientIds,
      senderId: null, // System notification
      templateData: [title, message],
      sendEmail: true,
      priority,
    });
  },
};

module.exports = {
  createNotification,
  createBulkNotifications,
  recipeNotifications,
  userNotifications,
  systemNotifications,
};
