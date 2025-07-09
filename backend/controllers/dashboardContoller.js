const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const User = require("../models/User");

// @desc   Dashboard Summary
// @route  POST /api/dashboard-summary
// @access Private (Admin Only)
const getDashboardSummary = async (req, res) => {
  try {
    // Basic counts
    const [
      totalRecipes,
      drafts,
      published,
      totalComments,
      aiGenerated,
      totalUsers,
    ] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ isDraft: true }),
      Recipe.countDocuments({ isDraft: false }),
      Comment.countDocuments(),
      Recipe.countDocuments({ generatedByAI: true }),
      User.countDocuments(),
    ]);

    // Aggregate calculations
    const totalViewsAgg = await Recipe.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikesAgg = await Recipe.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } },
    ]);
    // Try to get average rating from Recipe.averageRating field
    const avgRatingFromRecipesAgg = await Recipe.aggregate([
      { $match: { averageRating: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$averageRating" } } },
    ]);

    // If no ratings in recipes, get from Rating collection
    let avgRating = avgRatingFromRecipesAgg[0]?.avg || 0;
    if (avgRating === 0) {
      const Rating = require("../models/Rating");
      const avgRatingFromRatingsAgg = await Rating.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]);
      avgRating = avgRatingFromRatingsAgg[0]?.avg || 0;
    }

    const totalViews = totalViewsAgg[0]?.total || 0;
    const totalLikes = totalLikesAgg[0]?.total || 0;

    // Top recipes
    const topRecipes = await Recipe.find({ isDraft: false })
      .select("title coverImageUrl views likes")
      .sort({ views: -1 })
      .limit(5);

    // Recent comments
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name profileImageUrl")
      .populate({
        path: "recipe",
        select: "title coverImageUrl",
        options: { virtuals: true },
      });

    // Tag usage
    const tagUsage = await Recipe.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Top categories for analytics
    const topCategories = tagUsage.map((tag, index) => ({
      name: tag.tag,
      count: tag.count,
      percentage: Math.round((tag.count / totalRecipes) * 100),
    }));

    // Calculate real growth data by comparing with previous 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [
      currentWeekUsers,
      previousWeekUsers,
      currentWeekRecipes,
      previousWeekRecipes,
      currentWeekComments,
      previousWeekComments,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      Recipe.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Recipe.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Comment.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
    ]);

    // Calculate percentage growth
    const usersGrowth =
      previousWeekUsers > 0
        ? Math.round(
            ((currentWeekUsers - previousWeekUsers) / previousWeekUsers) *
              100 *
              10
          ) / 10
        : currentWeekUsers > 0
        ? 100
        : 0;

    const recipesGrowth =
      previousWeekRecipes > 0
        ? Math.round(
            ((currentWeekRecipes - previousWeekRecipes) / previousWeekRecipes) *
              100 *
              10
          ) / 10
        : currentWeekRecipes > 0
        ? 100
        : 0;

    const commentsGrowth =
      previousWeekComments > 0
        ? Math.round(
            ((currentWeekComments - previousWeekComments) /
              previousWeekComments) *
              100 *
              10
          ) / 10
        : currentWeekComments > 0
        ? 100
        : 0;

    // Get views growth from recent recipes
    const currentWeekViewsAgg = await Recipe.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const previousWeekViewsAgg = await Recipe.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const currentWeekViews = currentWeekViewsAgg[0]?.total || 0;
    const previousWeekViews = previousWeekViewsAgg[0]?.total || 0;
    const viewsGrowth =
      previousWeekViews > 0
        ? Math.round(
            ((currentWeekViews - previousWeekViews) / previousWeekViews) *
              100 *
              10
          ) / 10
        : currentWeekViews > 0
        ? 100
        : 0;

    const growth = {
      usersGrowth,
      recipesGrowth,
      commentsGrowth,
      viewsGrowth,
    };

    // Get real daily data for last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const [dayUsers, dayRecipes, dayComments] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        Recipe.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
        Comment.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
      ]);

      // Get views for recipes created on this day
      // Note: In a real app, you'd track daily view increments per recipe
      // For now, we'll use total views of recipes created on each day
      const dayViewsAgg = await Recipe.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]);
      const dayViews = dayViewsAgg[0]?.total || 0;

      dailyData.push({
        users: dayUsers,
        recipes: dayRecipes,
        views: dayViews,
        comments: dayComments,
      });
    }

    const timeBasedData = {
      dailyViews: dailyData.map((d) => d.views),
      dailyUsers: dailyData.map((d) => d.users),
      dailyRecipes: dailyData.map((d) => d.recipes),
      dailyComments: dailyData.map((d) => d.comments),
    };

    // Real user activity distribution
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Users who created recipes or comments in last 30 days = active
    const activeUsersIds = await Promise.all([
      Recipe.distinct("author", { createdAt: { $gte: thirtyDaysAgo } }),
      Comment.distinct("author", { createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const uniqueActiveUsers = new Set([
      ...activeUsersIds[0],
      ...activeUsersIds[1],
    ]);
    const activeUsersCount = uniqueActiveUsers.size;

    // Users created in last 7 days = new users
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Rest are passive users
    const passiveUsersCount = totalUsers - activeUsersCount - newUsersCount;

    const userActivity = [
      { name: "Aktif", count: activeUsersCount, color: "#10B981" },
      {
        name: "Pasif",
        count: Math.max(0, passiveUsersCount),
        color: "#6B7280",
      },
      { name: "Yeni", count: newUsersCount, color: "#3B82F6" },
    ];

    // Real content status distribution
    const [pendingRecipes, rejectedRecipes] = await Promise.all([
      Recipe.countDocuments({ status: "pending" }),
      Recipe.countDocuments({ status: "rejected" }),
    ]);

    const contentStatus = [
      { name: "Yayında", count: published, color: "#10B981" },
      { name: "Taslak", count: drafts, color: "#F59E0B" },
      { name: "AI Üretimi", count: aiGenerated, color: "#8B5CF6" },
      { name: "Beklemede", count: pendingRecipes, color: "#EAB308" },
      { name: "Reddedilen", count: rejectedRecipes, color: "#EF4444" },
    ];

    // Return both dashboard data and analytics data
    res.json({
      // Legacy dashboard format
      stats: {
        totalRecipes,
        drafts,
        published,
        totalViews,
        totalLikes,
        totalComments,
        aiGenerated,
      },
      topRecipes,
      recentComments,
      tagUsage,

      // Analytics format
      overview: {
        totalUsers,
        totalRecipes,
        totalComments,
        totalViews,
        totalLikes,
        avgRating: Math.round(avgRating * 10) / 10,
        pendingModeration: drafts,
        flaggedContent: 0, // Would need a flagged content system
      },
      growth,
      timeBasedData,
      topCategories,
      userActivity,
      contentStatus,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
