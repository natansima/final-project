const router = require("express").Router();
const User = require("../models/User.model");
const Theme = require("../models/Theme.model");
const ActiveTheme = require("../models/ActiveTheme.model");
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Selecionar tema e iniciar desafio
router.post("/start/:themeId", isAuthenticated, async (req, res, next) => {
  const { themeId } = req.params;
  const userId = req.user._id;

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      const error = new Error("Theme not found");
      error.status = 404;
      throw error;
    }

    const activeTheme = new ActiveTheme({
      user: userId,
      theme: theme._id,
      daysCompleted: [],
    });

    await activeTheme.save();
    res.status(201).send(activeTheme);
  } catch (error) {
    next(error);
  }
});

// Marcar tarefa como concluída e desbloquear o próximo dia
router.post(
  "/:themeId/day/:day/complete",
  isAuthenticated,
  async (req, res, next) => {
    const { themeId, day } = req.params;
    const { commentContent } = req.body;
    const userId = req.user._id;

    try {
      const activeTheme = await ActiveTheme.findOne({
        user: userId,
        theme: themeId,
      });
      if (!activeTheme) {
        const error = new Error("Active theme not found for user");
        error.status = 404;
        throw error;
      }

      const dayNum = parseInt(day);
      if (activeTheme.daysCompleted.includes(dayNum)) {
        const error = new Error("Day already completed");
        error.status = 400;
        throw error;
      }

      // Verificar se o dia anterior foi concluído
      if (dayNum > 1 && !activeTheme.daysCompleted.includes(dayNum - 1)) {
        const error = new Error("Previous day not completed");
        error.status = 400;
        throw error;
      }

      activeTheme.daysCompleted.push(dayNum);
      await activeTheme.save();

      // Adicionar comentário se fornecido
      if (commentContent) {
        const comment = await Comment.create({
          day: dayNum,
          content: commentContent,
          user: userId,
        });
        const theme = await Theme.findById(themeId);
        const task = theme.days.find((task) => task.day === dayNum);
        task.comments.push(comment._id);
        await theme.save();
      }

      res.send(activeTheme);
    } catch (error) {
      next(error);
    }
  }
);

// Obter status do tema ativo do usuário
router.get("/:themeId/status", isAuthenticated, async (req, res, next) => {
  const { themeId } = req.params;
  const userId = req.user._id;

  try {
    const activeTheme = await ActiveTheme.findOne({
      user: userId,
      theme: themeId,
    }).populate("theme");
    if (!activeTheme) {
      const error = new Error("Active theme not found for user");
      error.status = 404;
      throw error;
    }

    res.send(activeTheme);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
