const Collection = require("../models/Collection");
const Recipe = require("../models/Recipe");
const slugify = require("slugify");

// @desc   Create a new collection
// @route  POST /api/collections
// @access Private
const createCollection = async (req, res) => {
  try {
    const { name, description, isPublic, tags, color } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists for this user
    while (await Collection.findOne({ author: userId, slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const collection = new Collection({
      name: name.trim(),
      description: description?.trim() || "",
      slug,
      author: userId,
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tags || [],
      color: color || "#f97316",
    });

    await collection.save();

    const populatedCollection = await Collection.findById(collection._id)
      .populate("author", "name profileImageUrl")
      .populate("recipes", "title slug coverImageUrl duration averageRating");

    res.status(201).json(populatedCollection);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get user's collections
// @route  GET /api/collections/my
// @access Private
const getUserCollections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [collections, totalCount] = await Promise.all([
      Collection.find({ author: userId })
        .populate("author", "name profileImageUrl")
        .populate({
          path: "recipes",
          select: "title slug coverImageUrl duration averageRating",
          options: { limit: 4 }, // Show only first 4 recipes as preview
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Collection.countDocuments({ author: userId }),
    ]);

    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get public collections
// @route  GET /api/collections/public
// @access Public
const getPublicCollections = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [collections, totalCount] = await Promise.all([
      Collection.find({ isPublic: true })
        .populate("author", "name profileImageUrl")
        .populate({
          path: "recipes",
          select: "title slug coverImageUrl duration averageRating",
          options: { limit: 4 }, // Show only first 4 recipes as preview
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Collection.countDocuments({ isPublic: true }),
    ]);

    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get collection by slug
// @route  GET /api/collections/:slug
// @access Public (if public) / Private (if own collection)
const getCollectionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?._id;

    // Find collection
    let query = { slug };

    // If user is not authenticated, only show public collections
    if (!userId) {
      query.isPublic = true;
    }

    const collection = await Collection.findOne(query)
      .populate("author", "name profileImageUrl")
      .populate({
        path: "recipes",
        populate: {
          path: "author",
          select: "name profileImageUrl",
        },
      });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Check access permissions
    if (
      !collection.isPublic &&
      (!userId || collection.author._id.toString() !== userId.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Update collection
// @route  PUT /api/collections/:id
// @access Private (Owner only)
const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, tags, color } = req.body;
    const userId = req.user._id;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Check ownership
    if (collection.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update fields
    if (name && name.trim()) {
      collection.name = name.trim();
      // Update slug if name changed
      collection.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) collection.description = description.trim();
    if (isPublic !== undefined) collection.isPublic = isPublic;
    if (tags) collection.tags = tags;
    if (color) collection.color = color;

    await collection.save();

    const updatedCollection = await Collection.findById(id)
      .populate("author", "name profileImageUrl")
      .populate("recipes", "title slug coverImageUrl duration averageRating");

    res.json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Delete collection
// @route  DELETE /api/collections/:id
// @access Private (Owner only)
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Check ownership
    if (collection.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Collection.findByIdAndDelete(id);
    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Add recipe to collection
// @route  POST /api/collections/:id/recipes/:recipeId
// @access Private (Owner only)
const addRecipeToCollection = async (req, res) => {
  try {
    const { id, recipeId } = req.params;
    const userId = req.user._id;

    // Check if collection exists and user owns it
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if recipe is already in collection
    if (collection.recipes.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in collection" });
    }

    // Add recipe to collection
    collection.recipes.push(recipeId);
    await collection.save();

    res.json({ message: "Recipe added to collection successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Remove recipe from collection
// @route  DELETE /api/collections/:id/recipes/:recipeId
// @access Private (Owner only)
const removeRecipeFromCollection = async (req, res) => {
  try {
    const { id, recipeId } = req.params;
    const userId = req.user._id;

    // Check if collection exists and user owns it
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove recipe from collection
    collection.recipes = collection.recipes.filter(
      (recipe) => recipe.toString() !== recipeId
    );

    await collection.save();

    res.json({ message: "Recipe removed from collection successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createCollection,
  getUserCollections,
  getPublicCollections,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  addRecipeToCollection,
  removeRecipeFromCollection,
};
