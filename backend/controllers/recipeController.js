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
// @access Private (Author or Admin)
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (
      recipe.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
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
// @access Private (Author or Admin)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get recipe by status (all,published or draft) and include counts
// @route  GET /api/recipes?status=published|draft|all&page=1
// @access Public
const getAllRecipes = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Determine filter for main recipes response
    let filter = {};
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Fetch paginated recipes
    const recipes = await Recipe.find(filter)
      .populate("author", "name profileImageUrl")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count totals for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount] =
      await Promise.all([
        Recipe.countDocuments(filter),
        Recipe.countDocuments(),
        Recipe.countDocuments({ isDraft: false }),
        Recipe.countDocuments({ isDraft: true }),
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

// @desc   Search recipes by title or content
// @route  GET /api/recipes/search?q=keyword
// @access Public
const searchRecipes = async (req, res) => {
  try {
    const q = req.query.q;
    const recipes = await Recipe.find({
      isDraft: false,
      $or: [{ title: { $regex: q, $options: "i" } }],
    }).populate("author", "name profileImageUrl");
    res.json(recipes);
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
