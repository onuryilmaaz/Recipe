import express from "express";
import { toggleLike, getLikesCount } from "../controllers/likeController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/:recipeId", auth, toggleLike);
router.get("/:recipeId", getLikesCount);

export default router;
