import Recipe from "../models/Recipe.js";
import slugify from "slugify";

export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Fetch recipes failed." });
  }
};

export const getRecipeBySlug = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Fetch recipe failed." });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const {
      title,
      category,
      dietType,
      duration,
      ingredients,
      steps,
      imageUrl,
    } = req.body;
    const recipe = new Recipe({
      authorId: req.user._id,
      title,
      slug: slugify(title),
      category,
      dietType,
      duration,
      ingredients,
      steps,
      imageUrl,
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create recipe failed." });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    if (recipe.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized." });

    Object.assign(recipe, req.body);
    recipe.slug = slugify(recipe.title);
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update recipe failed." });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    if (recipe.authorId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized." });

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete recipe failed." });
  }
};
