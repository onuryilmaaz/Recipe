const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const User = require("../models/User");

// Get pending content awaiting approval
const getPendingContent = async (req, res) => {
  try {
    // Get pending recipes
    const pendingRecipes = await Recipe.find({ status: "pending" })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    // Get pending comments (assuming we add approval system)
    const pendingComments = await Comment.find({ status: "pending" })
      .populate("author", "name email")
      .populate("recipe", "title slug")
      .sort({ createdAt: -1 });

    // Format items for frontend
    const items = [
      ...pendingRecipes.map((recipe) => ({
        _id: recipe._id,
        type: "recipe",
        title: recipe.title,
        content:
          recipe.description ||
          recipe.ingredients
            ?.slice(0, 3)
            .map((i) => i.name)
            .join(", "),
        author: recipe.author,
        createdAt: recipe.createdAt,
        status: recipe.status,
        flagCount: recipe.flags?.length || 0,
        slug: recipe.slug,
      })),
      ...pendingComments.map((comment) => ({
        _id: comment._id,
        type: "comment",
        content: comment.content,
        author: comment.author,
        recipe: comment.recipe,
        createdAt: comment.createdAt,
        status: comment.status || "pending",
        flagCount: comment.flags?.length || 0,
      })),
    ];

    res.status(200).json({
      success: true,
      items: items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    res.status(500).json({
      success: false,
      message: "Bekleyen içerik alınırken hata oluştu",
    });
  }
};

// Get reported/flagged content
const getReportedContent = async (req, res) => {
  try {
    // Get flagged recipes
    const flaggedRecipes = await Recipe.find({
      "flags.0": { $exists: true }, // Has at least one flag
    })
      .populate("author", "name email")
      .sort({ "flags.0.date": -1 });

    // Get flagged comments
    const flaggedComments = await Comment.find({
      "flags.0": { $exists: true },
    })
      .populate("author", "name email")
      .populate("recipe", "title slug")
      .sort({ "flags.0.date": -1 });

    // Format items for frontend
    const items = [
      ...flaggedRecipes.map((recipe) => ({
        _id: recipe._id,
        type: "recipe",
        title: recipe.title,
        content:
          recipe.description ||
          recipe.ingredients
            ?.slice(0, 3)
            .map((i) => i.name)
            .join(", "),
        author: recipe.author,
        createdAt: recipe.createdAt,
        status: recipe.status,
        flagCount: recipe.flags?.length || 0,
        flags: recipe.flags?.map((flag) => ({
          reason: flag.reason,
          reportedBy: flag.reportedBy,
          date: flag.date,
        })),
        slug: recipe.slug,
      })),
      ...flaggedComments.map((comment) => ({
        _id: comment._id,
        type: "comment",
        content: comment.content,
        author: comment.author,
        recipe: comment.recipe,
        createdAt: comment.createdAt,
        status: comment.status || "published",
        flagCount: comment.flags?.length || 0,
        flags: comment.flags?.map((flag) => ({
          reason: flag.reason,
          reportedBy: flag.reportedBy,
          date: flag.date,
        })),
      })),
    ];

    res.status(200).json({
      success: true,
      items: items.sort((a, b) => b.flagCount - a.flagCount),
    });
  } catch (error) {
    console.error("Error fetching reported content:", error);
    res.status(500).json({
      success: false,
      message: "Şikayetli içerik alınırken hata oluştu",
    });
  }
};

// Approve content
const approveContent = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (itemType === "recipe") {
      await Recipe.findByIdAndUpdate(itemId, {
        status: "published",
        $unset: { flags: 1 }, // Remove flags
      });
    } else if (itemType === "comment") {
      await Comment.findByIdAndUpdate(itemId, {
        status: "approved",
        $unset: { flags: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "İçerik onaylandı",
    });
  } catch (error) {
    console.error("Error approving content:", error);
    res.status(500).json({
      success: false,
      message: "İçerik onaylanırken hata oluştu",
    });
  }
};

// Reject/Remove content
const rejectContent = async (req, res) => {
  try {
    const { itemId, itemType, reason } = req.body;

    if (itemType === "recipe") {
      await Recipe.findByIdAndUpdate(itemId, {
        status: "rejected",
        rejectionReason: reason,
      });
    } else if (itemType === "comment") {
      await Comment.findByIdAndUpdate(itemId, {
        status: "rejected",
        rejectionReason: reason,
      });
    }

    res.status(200).json({
      success: true,
      message: "İçerik reddedildi",
    });
  } catch (error) {
    console.error("Error rejecting content:", error);
    res.status(500).json({
      success: false,
      message: "İçerik reddedilirken hata oluştu",
    });
  }
};

// Dismiss flags (mark as not problematic)
const dismissFlags = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (itemType === "recipe") {
      await Recipe.findByIdAndUpdate(itemId, {
        $unset: { flags: 1 },
      });
    } else if (itemType === "comment") {
      await Comment.findByIdAndUpdate(itemId, {
        $unset: { flags: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Şikayetler reddedildi",
    });
  } catch (error) {
    console.error("Error dismissing flags:", error);
    res.status(500).json({
      success: false,
      message: "Şikayetler reddedilirken hata oluştu",
    });
  }
};

// Get moderation statistics
const getModerationStats = async (req, res) => {
  try {
    const pendingRecipes = await Recipe.countDocuments({ status: "pending" });
    const pendingComments = await Comment.countDocuments({ status: "pending" });

    const reportedRecipes = await Recipe.countDocuments({
      "flags.0": { $exists: true },
    });
    const reportedComments = await Comment.countDocuments({
      "flags.0": { $exists: true },
    });

    // Total flags across all content
    const recipesWithFlags = await Recipe.find({
      "flags.0": { $exists: true },
    }).select("flags");
    const commentsWithFlags = await Comment.find({
      "flags.0": { $exists: true },
    }).select("flags");

    const totalFlags =
      recipesWithFlags.reduce(
        (sum, recipe) => sum + (recipe.flags?.length || 0),
        0
      ) +
      commentsWithFlags.reduce(
        (sum, comment) => sum + (comment.flags?.length || 0),
        0
      );

    res.status(200).json({
      success: true,
      stats: {
        pendingRecipes,
        pendingComments,
        reportedRecipes,
        reportedComments,
        totalFlags,
      },
    });
  } catch (error) {
    console.error("Error fetching moderation stats:", error);
    res.status(500).json({
      success: false,
      message: "Moderasyon istatistikleri alınırken hata oluştu",
    });
  }
};

// Report content (for users to flag inappropriate content)
const reportContent = async (req, res) => {
  try {
    const { itemId, itemType, reason } = req.body;
    const reportedBy = req.user.id;

    const flag = {
      reason,
      reportedBy,
      date: new Date(),
    };

    if (itemType === "recipe") {
      await Recipe.findByIdAndUpdate(itemId, {
        $push: { flags: flag },
      });
    } else if (itemType === "comment") {
      await Comment.findByIdAndUpdate(itemId, {
        $push: { flags: flag },
      });
    }

    res.status(200).json({
      success: true,
      message: "İçerik şikayet edildi",
    });
  } catch (error) {
    console.error("Error reporting content:", error);
    res.status(500).json({
      success: false,
      message: "İçerik şikayet edilirken hata oluştu",
    });
  }
};

module.exports = {
  getPendingContent,
  getReportedContent,
  approveContent,
  rejectContent,
  dismissFlags,
  getModerationStats,
  reportContent,
};
