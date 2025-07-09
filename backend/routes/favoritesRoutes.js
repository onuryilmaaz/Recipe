const express = require("express");
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  checkFavorite,
} = require("../controllers/favoritesController");
const { protect } = require("../middlewares/authMiddleware");

// All routes are protected
router.use(protect);

// @route   GET /api/favorites
// @desc    Get user's favorite recipes
router.get("/", getFavorites);

// @route   POST /api/favorites/toggle/:recipeId
// @desc    Add/Remove recipe from favorites
router.post("/toggle/:recipeId", toggleFavorite);

// @route   GET /api/favorites/check/:recipeId
// @desc    Check if recipe is in user's favorites
router.get("/check/:recipeId", checkFavorite);

module.exports = router;
