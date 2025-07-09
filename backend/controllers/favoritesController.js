const User = require("../models/User");
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");

// @desc   Add/Remove recipe from favorites
// @route  POST /api/favorites/toggle/:recipeId
// @access Private
const toggleFavorite = async (req, res) => {
  try {
    console.log("Toggle favorite request received:", {
      userId: req.user?._id,
      recipeId: req.params.recipeId,
      userObject: req.user ? "exists" : "missing",
    });

    if (!req.user) {
      console.log("No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user._id;
    const { recipeId } = req.params;

    if (!recipeId) {
      console.log("No recipeId provided");
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      console.log("Invalid recipeId format:", recipeId);
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      console.log("Recipe not found:", recipeId);
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log("Recipe found:", recipe.title);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "User found:",
      user.name,
      "Current favorites count:",
      user.favorites.length
    );

    // Check if recipe is already in favorites
    const isAlreadyFavorite = user.favorites.includes(recipeId);
    console.log("Is already favorite:", isAlreadyFavorite);

    if (isAlreadyFavorite) {
      // Remove from favorites
      console.log("Removing from favorites...");
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== recipeId
      );

      try {
        await user.save();
        console.log("Successfully removed from favorites");
        res.json({
          message: "Recipe removed from favorites",
          isFavorite: false,
        });
      } catch (saveError) {
        console.error("Error saving user after removing favorite:", saveError);
        throw saveError;
      }
    } else {
      // Add to favorites
      console.log("Adding to favorites...");
      user.favorites.push(recipeId);

      try {
        await user.save();
        console.log("Successfully added to favorites");
        res.json({ message: "Recipe added to favorites", isFavorite: true });
      } catch (saveError) {
        console.error("Error saving user after adding favorite:", saveError);
        throw saveError;
      }
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc   Get user's favorite recipes
// @route  GET /api/favorites
// @access Private
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: {
        path: "author",
        select: "name profileImageUrl",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      favorites: user.favorites,
      count: user.favorites.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Check if recipe is in user's favorites
// @route  GET /api/favorites/check/:recipeId
// @access Private
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites.includes(recipeId);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  checkFavorite,
};
