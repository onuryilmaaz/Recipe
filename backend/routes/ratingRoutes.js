const express = require("express");
const router = express.Router();
const {
  addOrUpdateRating,
  getUserRating,
  getRecipeRatings,
  deleteRating,
} = require("../controllers/ratingController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/ratings/:recipeId
// @desc    Get all ratings for a recipe
router.get("/:recipeId", getRecipeRatings);

// @route   POST /api/ratings/:recipeId
// @desc    Add or update rating for a recipe
router.post("/:recipeId", protect, addOrUpdateRating);

// @route   GET /api/ratings/:recipeId/user
// @desc    Get user's rating for a specific recipe
router.get("/:recipeId/user", protect, getUserRating);

// @route   DELETE /api/ratings/:recipeId
// @desc    Delete user's rating for a recipe
router.delete("/:recipeId", protect, deleteRating);

module.exports = router;
