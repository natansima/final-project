const router = require("express").Router();
const Comment = require("../models/Comment.model");
const Theme = require("../models/Theme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

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
    await Theme.updateMany(
      { "days.comments": id },
      { $pull: { "days.$.comments": id } }
    );

    res.send({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
