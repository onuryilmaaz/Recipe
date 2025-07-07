const express = require("express");
const router = express.Router();
const {
  addComment,
  getAllComments,
  getCommentsByRecipe,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/:postId", protect, addComment);
router.get("/:postId", getCommentsByRecipe);
router.get("/", getAllComments);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;
