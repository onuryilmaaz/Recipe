const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ingredients: [{ name: String, amount: String }],
    dietType: { type: String },
    duration: { type: Number },
    steps: [{ type: String }],
    coverImageUrl: { type: String, default: null },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDraft: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    generatedByAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
