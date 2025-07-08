const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");

// @desc   Add comment to a recipe
// @route  POST /api/comments/:recipeId
// @access Private
const addComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content, parentComment } = req.body;

    // Ensure recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const comment = await Comment.create({
      recipe: recipeId,
      author: req.user._id,
      content,
      parentComment: parentComment || null,
    });

    await comment.populate("author", "name profileImageUrl");
    res.status(201).json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc   Get all comments
// @route  GET /api/comments
// @access Public
const getAllComments = async (req, res) => {
  try {
    // Fetch all comments with author populated
    const comments = await Comment.find()
      .populate("author", "name profileImageUrl")
      .populate("recipe", "title coverImageUrl")
      .sort({ createdAt: 1 });

    const commentMap = {};
    comments.forEach((comment) => {
      comment = comment.toObject();
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });
    res.json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch all comment", error: error.message });
  }
};

// @desc   Get all comments for a specific recipe
// @route  GET /api/comments/:recipeId
// @access Public
const getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await Comment.find({ recipe: recipeId })
      .populate("author", "name profileImageUrl")
      .populate("recipe", "title coverImageUrl")
      .sort({ createdAt: 1 });

    const commentMap = {};
    comments.forEach((comment) => {
      comment = comment.toObject();
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    const nestedComments = [];
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });

    res.json(nestedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch comment", error: error.message });
  }
};

// @desc   Update a comment (author only)
// @route  PUT /api/comments/:commentId
// @access Private
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this comment" });
    }

    comment.content = content;
    const updatedComment = await comment.save();

    await updatedComment.populate("author", "name profileImageUrl");

    res.json(updatedComment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update comment", error: error.message });
  }
};

// @desc   Delete a comment and its replies (author or admin only)
// @route  DELETE /api/comments/:commentId
// @access Public
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await Comment.deleteOne({ _id: commentId });

    await Comment.deleteMany({ parentComment: commentId });

    res.json({ message: "Comment and any replies deleted succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};
module.exports = {
  addComment,
  getAllComments,
  getCommentsByRecipe,
  updateComment,
  deleteComment,
};
