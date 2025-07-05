import Comment from "../models/Comment.js";

export const getCommentsForRecipe = async (req, res) => {
  try {
    const comments = await Comment.find({
      recipeId: req.params.recipeId,
    }).populate("userId", "username");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Fetch comments failed." });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      recipeId: req.params.recipeId,
      userId: req.user._id,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Add comment failed." });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found." });
    if (comment.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized." });

    await comment.deleteOne();
    res.json({ message: "Comment deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete comment failed." });
  }
};
