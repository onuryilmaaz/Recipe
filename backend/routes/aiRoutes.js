const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  generateRecipeFromIngredients,
  generateRecipeFromTitleAndTags,
} = require("../controllers/aiController");

router.post(
  "/generate-from-ingredients",
  protect,
  generateRecipeFromIngredients
);
router.post("/generate-from-title", protect, generateRecipeFromTitleAndTags);

module.exports = router;
