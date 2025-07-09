const Rating = require("../models/Rating");
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");

// @desc   Add or update rating for a recipe
// @route  POST /api/ratings/:recipeId
// @access Private
const addOrUpdateRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already rated this recipe
    let existingRating = await Rating.findOne({
      recipe: recipeId,
      user: userId,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || "";
      await existingRating.save();
    } else {
      // Create new rating
      existingRating = new Rating({
        recipe: recipeId,
        user: userId,
        rating,
        review: review || "",
      });
      await existingRating.save();
    }

    // Update recipe's average rating
    await updateRecipeRating(recipeId);

    res.json({
      message: "Rating saved successfully",
      rating: existingRating,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get user's rating for a specific recipe
// @route  GET /api/ratings/:recipeId/user
// @access Private
const getUserRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({
      recipe: recipeId,
      user: userId,
    });

    if (!rating) {
      return res.json({ userRating: null });
    }

    res.json({ userRating: rating });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get all ratings for a recipe
// @route  GET /api/ratings/:recipeId
// @access Public
const getRecipeRatings = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ recipe: recipeId })
      .populate("user", "name profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRatings = await Rating.countDocuments({ recipe: recipeId });

    // Get rating distribution
    const ratingStats = await Rating.aggregate([
      { $match: { recipe: mongoose.Types.ObjectId(recipeId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      ratings,
      totalRatings,
      currentPage: page,
      totalPages: Math.ceil(totalRatings / limit),
      ratingStats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Delete rating
// @route  DELETE /api/ratings/:recipeId
// @access Private
const deleteRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOneAndDelete({
      recipe: recipeId,
      user: userId,
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Update recipe's average rating
    await updateRecipeRating(recipeId);

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Helper function to update recipe's average rating
const updateRecipeRating = async (recipeId) => {
  try {
    const ratings = await Rating.find({ recipe: recipeId });

    if (ratings.length === 0) {
      await Recipe.findByIdAndUpdate(recipeId, {
        averageRating: 0,
        ratingsCount: 0,
      });
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingsCount: ratings.length,
    });
  } catch (error) {
    console.error("Error updating recipe rating:", error);
  }
};

module.exports = {
  addOrUpdateRating,
  getUserRating,
  getRecipeRatings,
  deleteRating,
};
