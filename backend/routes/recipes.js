import express from "express";
import {
  getRecipes,
  getRecipeBySlug,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.get("/", getRecipes);
router.get("/:slug", getRecipeBySlug);
router.post("/", auth, createRecipe);
router.put("/:id", auth, updateRecipe);
router.delete("/:id", auth, deleteRecipe);

export default router;
