import express from "express";
import {
  getCommentsForRecipe,
  addComment,
  deleteComment,
} from "../controllers/commentController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.get("/:recipeId", getCommentsForRecipe);
router.post("/:recipeId", auth, addComment);
router.delete("/:commentId", auth, deleteComment);

export default router;
