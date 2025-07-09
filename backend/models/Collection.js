const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    coverImage: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    color: {
      type: String,
      default: "#f97316", // Orange color
    },
  },
  { timestamps: true }
);

// Create index for better performance
CollectionSchema.index({ author: 1, slug: 1 });
CollectionSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model("Collection", CollectionSchema);
