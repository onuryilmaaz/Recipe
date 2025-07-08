const express = require("express");
const router = express.Router();
const {
  addComment,
  getAllComments,
  getCommentsByRecipe,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/:recipeId", protect, addComment);
router.get("/:recipeId", getCommentsByRecipe);
router.get("/", getAllComments);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
