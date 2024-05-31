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

    // Criar uma cópia do tema
    const activeThemeData = {
      user: userId,
      theme: {
        _id: theme._id,
        name: theme.name,
        days: theme.days.map((day) => ({
          day: day.day,
          goal: day.goal,
          description: day.description,
          isCompleted: false,
          comments: [],
        })),
      },
    };

    const activeTheme = new ActiveTheme(activeThemeData);
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
        "theme._id": themeId,
      });
      if (!activeTheme) {
        const error = new Error("Active theme not found for user");
        error.status = 404;
        throw error;
      }

      const dayNum = parseInt(day);

      // Verificar se o dia anterior foi concluído
      if (dayNum > 1) {
        const previousTask = activeTheme.theme.days.find(
          (task) => task.day === dayNum - 1
        );
        if (!previousTask || !previousTask.isCompleted) {
          const error = new Error("Previous day not completed");
          error.status = 400;
          throw error;
        }
      }

      // Marcar o dia como completo no tema ativo
      const task = activeTheme.theme.days.find((task) => task.day === dayNum);
      if (!task) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }

      if (task.isCompleted) {
        const error = new Error("Day already completed");
        error.status = 400;
        throw error;
      }

      task.isCompleted = true; // Marcar o dia atual como completo

      // Adicionar comentário se fornecido
      if (commentContent) {
        const comment = await Comment.create({
          day: dayNum,
          content: commentContent,
          user: userId,
        });
        task.comments.push(comment._id);
      }

      // Desbloquear o próximo dia
      const nextTask = activeTheme.theme.days.find(
        (task) => task.day === dayNum + 1
      );
      if (nextTask) {
        nextTask.isCompleted = false; // Desbloquear o próximo dia
      }

      await activeTheme.save();

      res.send(activeTheme); // Enviar o tema ativo atualizado
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
      "theme._id": themeId,
    });
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
