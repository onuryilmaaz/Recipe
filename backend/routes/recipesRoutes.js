const express = require("express");
const router = express.Router();
const {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeBySlug,
  getRecipesByTags,
  searchRecipes,
  incrementView,
  toggleLike,
  getTopRecipes,
} = require("../controllers/recipeController.js");
const { protect } = require("../middlewares/authMiddleware");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

router.post("/", protect, adminOnly, createRecipe);
router.get("/", getAllRecipes);
router.get("/slug/:slug", getRecipeBySlug);
router.put("/:id", protect, adminOnly, updateRecipe);
router.delete("/:id", protect, adminOnly, deleteRecipe);
router.get("/tag/:tag", getRecipesByTags);
router.get("/search", searchRecipes);
router.post("/:id/view", incrementView);
router.post("/:id/like", protect, toggleLike);
router.get("/trending", getTopRecipes);

module.exports = router;
