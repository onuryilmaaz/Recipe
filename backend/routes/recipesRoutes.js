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
const { protect, adminOnly } = require("../middlewares/authMiddleware");

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
