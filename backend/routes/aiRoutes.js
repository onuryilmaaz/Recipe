const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { createRecipe, autoFillSteps } = require("../controllers/aiController");

router.post("/create-recipe", protect, createRecipe);
router.post("/auto-fill-steps", protect, autoFillSteps);

module.exports = router;
