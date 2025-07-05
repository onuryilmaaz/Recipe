import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String },
    dietType: { type: String },
    duration: { type: Number }, // dakika
    imageUrl: { type: String },
    ingredients: [{ name: String, amount: String }],
    steps: [{ type: String }],
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
