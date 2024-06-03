const router = require("express").Router();
const Comment = require("../models/Comment.model");
const ActiveTheme = require("../models/ActiveTheme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Adicionar comentário
router.post("/:themeId/day/:dayId/add-comment", isAuthenticated, async (req, res, next) => {
  const { themeId, dayId } = req.params;
  const { commentContent } = req.body;
  const userId = req.user._id;

  if (!commentContent) {
    return res.status(400).json({ message: "No comment content provided" });
  }

  try {
    const activeTheme = await ActiveTheme.findOne({
      _id: themeId,
      userId: userId,
    }).populate("days.comments");

    if (!activeTheme) {
      const error = new Error("Active theme not found for user");
      error.status = 404;
      throw error;
    }

    const dayNum = parseInt(dayId);
    const task = activeTheme.days.find((task) => task.day === dayNum);
    if (!task) {
      const error = new Error("Day not found");
      error.status = 404;
      throw error;
    }

    const comment = await Comment.create({
      day: dayNum,
      content: commentContent,
      user: userId,
    });
    task.comments.push(comment._id);
    await activeTheme.save();
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

// Editar comentário
router.put("/comment/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

// Excluir comentário
router.delete("/comment/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }

    // Remove the comment reference from the task it belongs to
    await ActiveTheme.updateMany(
      { "days.comments": id },
      { $pull: { "days.$.comments": id } }
    );

    res.send({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
