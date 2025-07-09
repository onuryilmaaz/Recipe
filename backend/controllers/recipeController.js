const Recipe = require("../models/Recipe");
const slugify = require("slugify");

// @desc   Create a new recipe
// @route  POST /api/recipes
// @access Private (Admin Only)
const createRecipe = async (req, res) => {
  try {
    const {
      title,
      ingredients,
      steps,
      dietType,
      duration,
      coverImageUrl,
      tags,
      isDraft,
      generatedByAI,
    } = req.body;

    console.log("🔍 Backend'e gelen veriler:");
    console.log("📝 Steps:", steps);
    console.log("📦 Full body:", req.body);

    const newRecipe = new Recipe({
      title,
      slug: slugify(title, { lower: true }),
      ingredients,
      steps,
      dietType,
      duration,
      coverImageUrl,
      tags,
      author: req.user._id,
      isDraft,
      generatedByAI,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create recipe", error: error.message });
  }
};

// @desc   Update an existing recipe
// @route  PUT /api/recipes/:id
// @access Private (Author Only)
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Only the author can update their own recipe
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this recipe" });
    }
    const updatedData = req.body;
    if (updatedData.title) {
      updatedData.slug = slugify(updatedData.title, { lower: true });
    }

    console.log("🔄 Update işlemi - Backend'e gelen veriler:");
    console.log("📝 Steps:", updatedData.steps);
    console.log("📦 Full updatedData:", updatedData);

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Delete a recipe
// @route  DELETE /api/recipes/:id
// @access Private (Author Only)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Only the author can delete their own recipe
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this recipe" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get recipe by status (all,published or draft) and include counts
// @route  GET /api/recipes?status=published|draft|all&page=1&author=userId
// @access Public
const getAllRecipes = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const author = req.query.author; // Author filter for admin panel
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Determine filter for main recipes response
    let filter = {};
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Add author filter if provided (for admin panel)
    if (author) {
      filter.author = author;
    }

    // Fetch paginated recipes
    const recipes = await Recipe.find(filter)
      .populate("author", "name profileImageUrl")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count totals for pagination and tab counts
    // If author filter is applied, count only that author's recipes
    const baseCountFilter = author ? { author } : {};

    const [totalCount, allCount, publishedCount, draftCount] =
      await Promise.all([
        Recipe.countDocuments(filter),
        Recipe.countDocuments(baseCountFilter),
        Recipe.countDocuments({ ...baseCountFilter, isDraft: false }),
        Recipe.countDocuments({ ...baseCountFilter, isDraft: true }),
      ]);

    res.json({
      recipes,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get a single recipe by slug
// @route  GET /api/recipes/:slug
// @access Public
const getRecipeBySlug = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).populate(
      "author",
      "name profileImageUrl"
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get recipe by tag
// @route  GET /api/recipes/tag/:tag
// @access Public
const getRecipesByTags = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      tags: req.params.tag,
      isDraft: false,
    }).populate("author", "name profileImageUrl");
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Advanced search recipes with filters
// @route  GET /api/recipes/search?q=keyword&dietType=vegan&maxDuration=30&minRating=4&sortBy=rating&page=1
// @access Public
const searchRecipes = async (req, res) => {
  try {
    const {
      q = "",
      dietType,
      maxDuration,
      minDuration,
      minRating,
      tags,
      sortBy = "relevance",
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter object
    let filter = { isDraft: false };

    // Text search in title, ingredients, and steps
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { "ingredients.name": { $regex: q, $options: "i" } },
        { steps: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    // Diet type filter
    if (dietType) {
      filter.dietType = { $regex: dietType, $options: "i" };
    }

    // Duration filters
    if (maxDuration) {
      filter.duration = { ...filter.duration, $lte: parseInt(maxDuration) };
    }
    if (minDuration) {
      filter.duration = { ...filter.duration, $gte: parseInt(minDuration) };
    }

    // Rating filter
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Tags filter (can search multiple tags)
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "rating":
        sort = { averageRating: -1, ratingsCount: -1 };
        break;
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "duration-asc":
        sort = { duration: 1 };
        break;
      case "duration-desc":
        sort = { duration: -1 };
        break;
      case "popular":
        sort = { views: -1, likes: -1 };
        break;
      case "relevance":
      default:
        sort = { views: -1, averageRating: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [recipes, totalCount] = await Promise.all([
      Recipe.find(filter)
        .populate("author", "name profileImageUrl")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Recipe.countDocuments(filter),
    ]);

    // Get filter statistics for frontend
    const [dietTypes, tagStats, durationStats] = await Promise.all([
      Recipe.distinct("dietType", { isDraft: false }),
      Recipe.aggregate([
        { $match: { isDraft: false } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Recipe.aggregate([
        { $match: { isDraft: false, duration: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            minDuration: { $min: "$duration" },
            maxDuration: { $max: "$duration" },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]),
    ]);

    res.json({
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: totalCount > skip + parseInt(limit),
        hasPrev: parseInt(page) > 1,
      },
      filters: {
        dietTypes: dietTypes.filter((dt) => dt && dt.trim()),
        tags: tagStats.map((tag) => ({ name: tag._id, count: tag.count })),
        durationRange: durationStats[0] || {
          minDuration: 0,
          maxDuration: 120,
          avgDuration: 30,
        },
      },
      appliedFilters: {
        q,
        dietType,
        maxDuration,
        minDuration,
        minRating,
        tags,
        sortBy,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Increment recipe view count
// @route  PUT /api/recipes/:id/view
// @access Public
const incrementView = async (req, res) => {
  try {
    await Recipe.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: "View count increment" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// // @desc   Liek a recipe
// // @route  PUT /api/recipes/:id/like
// // @access Public
// const likeRecipe = async (req, res) => {
//   try {
//     await Recipe.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
//     res.json({ message: "Liked added" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// @desc   Toggle like on a recipe
// @route  POST /api/recipes/:id/like
// @access Private (Requires Login)
const toggleLike = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Tarif bulunamadı" });
    }

    // Kullanıcının ID'sini JWT'den alıyoruz (authMiddleware sayesinde req.user mevcut)
    const userId = req.user._id;

    // Kullanıcının bu tarifi daha önce beğenip beğenmediğini kontrol et
    const hasLiked = recipe.likes.includes(userId);

    if (hasLiked) {
      // Eğer zaten beğenmişse, beğeniyi geri al (pull)
      await Recipe.updateOne(
        { _id: req.params.id },
        { $pull: { likes: userId } }
      );
      res.json({ message: "Beğeni geri alındı.", liked: false });
    } else {
      // Eğer beğenmemişse, beğeniyi ekle (addToSet)
      await Recipe.updateOne(
        { _id: req.params.id },
        { $addToSet: { likes: userId } } // $addToSet, dizide aynı ID'nin tekrar eklenmesini engeller
      );
      res.json({ message: "Tarif beğenildi.", liked: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

// @desc   Get top trending recipes
// @route  GEt /api/recipes/trending
// @access Public
const getTopRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isDraft: false })
      .sort({
        views: -1,
        likes: -1,
      })
      .limit(5);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeBySlug,
  getRecipesByTags,
  searchRecipes,
  incrementView,
  toggleLike,
  getTopRecipes,
};
