const router = require("express").Router();
const Comment = require("../models/Comment.model");
const Theme = require("../models/Theme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Adicionar comentário a uma tarefa em um tema específico
router.post(
  "/theme/:themeId/day/:day/comment",
  isAuthenticated,
  async (req, res) => {
    const { themeId, day } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        return res.status(404).send({ error: "Theme not found" });
      }

      const task = theme.days.find((task) => task.day === parseInt(day));
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }

      const comment = await Comment.create({ day, content, user: userId });
      task.comments.push(comment._id);
      await theme.save();

      res.status(201).send(comment);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  }
);

// Editar comentário
router.put("/comment/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }
    res.send(comment);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Excluir comentário
router.delete("/comment/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    // Remove the comment reference from the task it belongs to
    await Theme.updateMany(
      { "days.comments": id },
      { $pull: { "days.$.comments": id } }
    );

    res.send({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
