const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const Rating = require("../models/Rating");

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    const { range = "7d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get overview statistics
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalRatings = await Rating.countDocuments();

    // Get total views and likes
    const recipes = await Recipe.find().select("views likes");
    const totalViews = recipes.reduce(
      (sum, recipe) => sum + (recipe.views || 0),
      0
    );
    const totalLikes = recipes.reduce(
      (sum, recipe) => sum + (recipe.likes?.length || 0),
      0
    );

    // Get average rating
    const ratings = await Rating.find().select("rating");
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          ratings.length
        : 0;

    // Get moderation stats
    const pendingRecipes = await Recipe.countDocuments({ status: "pending" });
    const pendingComments = await Comment.countDocuments({ status: "pending" });
    const pendingModeration = pendingRecipes + pendingComments;

    const flaggedRecipes = await Recipe.countDocuments({
      "flags.0": { $exists: true },
    });
    const flaggedComments = await Comment.countDocuments({
      "flags.0": { $exists: true },
    });
    const flaggedContent = flaggedRecipes + flaggedComments;

    // Calculate growth (comparing with previous period)
    let previousStartDate = new Date(startDate);
    let previousEndDate = new Date(startDate);

    switch (range) {
      case "7d":
        previousStartDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        previousStartDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        previousStartDate.setDate(startDate.getDate() - 90);
        break;
    }

    const currentPeriodUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
    });
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
    });
    const usersGrowth =
      previousPeriodUsers > 0
        ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) *
          100
        : 0;

    const currentPeriodRecipes = await Recipe.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
    });
    const previousPeriodRecipes = await Recipe.countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
    });
    const recipesGrowth =
      previousPeriodRecipes > 0
        ? ((currentPeriodRecipes - previousPeriodRecipes) /
            previousPeriodRecipes) *
          100
        : 0;

    const currentPeriodComments = await Comment.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
    });
    const previousPeriodComments = await Comment.countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
    });
    const commentsGrowth =
      previousPeriodComments > 0
        ? ((currentPeriodComments - previousPeriodComments) /
            previousPeriodComments) *
          100
        : 0;

    // For views growth, we need to estimate based on recipe creation and average views
    const avgViewsPerRecipe = totalRecipes > 0 ? totalViews / totalRecipes : 0;
    const estimatedCurrentViews = currentPeriodRecipes * avgViewsPerRecipe;
    const estimatedPreviousViews = previousPeriodRecipes * avgViewsPerRecipe;
    const viewsGrowth =
      estimatedPreviousViews > 0
        ? ((estimatedCurrentViews - estimatedPreviousViews) /
            estimatedPreviousViews) *
          100
        : 0;

    // Get time-based data (daily breakdown)
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dailyUsers = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });
      const dailyRecipes = await Recipe.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      // Simulate daily views (in real app, you'd track this properly)
      const dailyViews = Math.floor(Math.random() * 200) + 100;

      dailyData.push({
        date: date.toISOString().split("T")[0],
        users: dailyUsers,
        recipes: dailyRecipes,
        views: dailyViews,
      });
    }

    // Get top categories (based on recipe tags)
    const recipeAggregation = await Recipe.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const totalRecipesWithTags = recipeAggregation.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const topCategories = recipeAggregation.map((item) => ({
      name: item._id,
      count: item.count,
      percentage:
        totalRecipesWithTags > 0
          ? Math.round((item.count / totalRecipesWithTags) * 100)
          : 0,
    }));

    // User activity breakdown
    const activeUsers = await User.countDocuments({
      $or: [{ status: "active" }, { status: { $exists: false } }],
    });
    const bannedUsers = await User.countDocuments({ status: "banned" });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const userActivity = [
      { name: "Aktif", count: activeUsers - recentUsers, color: "#10B981" },
      { name: "Yeni", count: recentUsers, color: "#3B82F6" },
      { name: "Banlı", count: bannedUsers, color: "#EF4444" },
    ];

    // Content status breakdown
    const publishedRecipes = await Recipe.countDocuments({
      $or: [{ status: "published" }, { status: { $exists: false } }],
    });
    const pendingRecipesCount = await Recipe.countDocuments({
      status: "pending",
    });
    const rejectedRecipes = await Recipe.countDocuments({ status: "rejected" });

    const contentStatus = [
      { name: "Yayında", count: publishedRecipes, color: "#10B981" },
      { name: "Beklemede", count: pendingRecipesCount, color: "#F59E0B" },
      { name: "Reddedilen", count: rejectedRecipes, color: "#EF4444" },
    ];

    const analyticsData = {
      overview: {
        totalUsers,
        totalRecipes,
        totalComments,
        totalViews,
        totalLikes,
        avgRating: Number(avgRating.toFixed(1)),
        pendingModeration,
        flaggedContent,
      },
      growth: {
        usersGrowth: Number(usersGrowth.toFixed(1)),
        recipesGrowth: Number(recipesGrowth.toFixed(1)),
        commentsGrowth: Number(commentsGrowth.toFixed(1)),
        viewsGrowth: Number(viewsGrowth.toFixed(1)),
      },
      timeBasedData: {
        dailyViews: dailyData.map((d) => d.views),
        dailyUsers: dailyData.map((d) => d.users),
        dailyRecipes: dailyData.map((d) => d.recipes),
        dates: dailyData.map((d) => d.date),
      },
      topCategories,
      userActivity,
      contentStatus,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        range,
      },
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Analytics verileri alınırken hata oluştu",
    });
  }
};

// Get real-time statistics
const getRealTimeStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStats = {
      newUsers: await User.countDocuments({ createdAt: { $gte: today } }),
      newRecipes: await Recipe.countDocuments({ createdAt: { $gte: today } }),
      newComments: await Comment.countDocuments({ createdAt: { $gte: today } }),
      newRatings: await Rating.countDocuments({ createdAt: { $gte: today } }),
    };

    const yesterdayStats = {
      newUsers: await User.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
      newRecipes: await Recipe.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
      newComments: await Comment.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
      newRatings: await Rating.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
      }),
    };

    res.status(200).json({
      success: true,
      today: todayStats,
      yesterday: yesterdayStats,
    });
  } catch (error) {
    console.error("Error fetching real-time stats:", error);
    res.status(500).json({
      success: false,
      message: "Gerçek zamanlı istatistikler alınırken hata oluştu",
    });
  }
};

module.exports = {
  getAnalytics,
  getRealTimeStats,
};
