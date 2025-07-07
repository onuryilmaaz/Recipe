const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");

// @desc   Dashboard Summary
// @route  POST /api/dashboard-summary
// @access Private (Admin Only)
const getDashboardSummary = async (req, res) => {
  try {
    const [totalRecipes, drafts, published, totalComments, aiGenerated] =
      await Promise.all([
        Recipe.countDocuments(),
        Recipe.countDocuments({ isDraft: true }),
        Recipe.countDocuments({ isDraft: false }),
        Comment.countDocuments(),
        Recipe.countDocuments({ generatedByAI: true }),
      ]);

    const totalViewsAgg = await Recipe.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikesAgg = await Recipe.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);
    const totalViews = totalViewsAgg[0]?.total || 0;
    const totalLikes = totalLikesAgg[0]?.total || 0;

    const topRecipes = await Recipe.find({ isDraft: false })
      .select("title coverImageUrl views likes")
      .sort({ views: -1, likes: -1 })
      .limit(5);

    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name profileImageUrl")
      .populate("recipe", "title coverImageUrl");

    const tagUsage = await Recipe.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
