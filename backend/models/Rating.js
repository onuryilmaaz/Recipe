const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Ensure one rating per user per recipe
RatingSchema.index({ recipe: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", RatingSchema);
