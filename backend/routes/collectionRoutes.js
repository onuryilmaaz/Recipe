const express = require("express");
const router = express.Router();
const {
  createCollection,
  getUserCollections,
  getPublicCollections,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  addRecipeToCollection,
  removeRecipeFromCollection,
} = require("../controllers/collectionController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/collections/public
// @desc    Get public collections
router.get("/public", getPublicCollections);

// @route   GET /api/collections/my
// @desc    Get user's collections
router.get("/my", protect, getUserCollections);

// @route   POST /api/collections
// @desc    Create new collection
router.post("/", protect, createCollection);

// @route   GET /api/collections/:slug
// @desc    Get collection by slug
router.get("/:slug", getCollectionBySlug);

// @route   PUT /api/collections/:id
// @desc    Update collection
router.put("/:id", protect, updateCollection);

// @route   DELETE /api/collections/:id
// @desc    Delete collection
router.delete("/:id", protect, deleteCollection);

// @route   POST /api/collections/:id/recipes/:recipeId
// @desc    Add recipe to collection
router.post("/:id/recipes/:recipeId", protect, addRecipeToCollection);

// @route   DELETE /api/collections/:id/recipes/:recipeId
// @desc    Remove recipe from collection
router.delete("/:id/recipes/:recipeId", protect, removeRecipeFromCollection);

module.exports = router;
