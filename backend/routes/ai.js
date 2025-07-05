import express from "express";
import {
  suggestRecipe,
  autoFillSteps,
  generateCompleteRecipe,
} from "../controllers/aiController.js";
const router = express.Router();

router.post("/suggest-recipe", suggestRecipe);
router.post("/auto-fill-steps", autoFillSteps);
router.post("/generate-complete-recipe", generateCompleteRecipe);

export default router;
