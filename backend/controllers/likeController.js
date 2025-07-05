import Like from "../models/Like.js";
import Recipe from "../models/Recipe.js";

export const toggleLike = async (req, res) => {
  try {
    const existing = await Like.findOne({
      recipeId: req.params.recipeId,
      userId: req.user._id,
    });

    if (existing) {
      await existing.deleteOne();
      await Recipe.findByIdAndUpdate(req.params.recipeId, {
        $inc: { likesCount: -1 },
      });
      return res.json({ message: "Like removed." });
    } else {
      await new Like({
        recipeId: req.params.recipeId,
        userId: req.user._id,
      }).save();
      await Recipe.findByIdAndUpdate(req.params.recipeId, {
        $inc: { likesCount: 1 },
      });
      return res.json({ message: "Like added." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Toggle like failed." });
  }
};

export const getLikesCount = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    res.json({ likesCount: recipe.likesCount });
  } catch (err) {
    res.status(500).json({ message: "Fetch likes count failed." });
  }
};
