const router = require("express").Router();
const User = require("../models/User.model");
const Theme = require("../models/Theme.model");
const ActiveTheme = require("../models/ActiveTheme.model");
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Visualizar todos os temas disponíveis
router.get("/themes", isAuthenticated, async (req, res, next) => {
  try {
    const themes = await Theme.find();
    res.send(themes);
  } catch (error) {
    next(error);
  }
});

// Obter todos os temas ativos do usuário
router.get("/", isAuthenticated, async (req, res, next) => {
  const userId = req.user._id;

  try {
    const activeThemes = await ActiveTheme.find({ userId });
    res.send(activeThemes);
  } catch (error) {
    next(error);
  }
});

// Selecionar tema e iniciar desafio
router.post("/themes/:themeId", isAuthenticated, async (req, res, next) => {
  const { themeId } = req.params;
  const userId = req.user._id;

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      const error = new Error("Theme not found");
      error.status = 404;
      throw error;
    }

    // Verificar se o tema já está ativo para o usuário
    let activeTheme = await ActiveTheme.findOne({ userId, name: theme.name });
    if (activeTheme) {
      return res.status(200).send(activeTheme);
    }

    // Certificar-se de que o dia 1 está desbloqueado e não completado
    const days = theme.days.map((day) => ({
      day: day.day,
      goal: day.goal,
      description: day.description,
      isCompleted: day.day === 1 ? false : day.isCompleted,
      comments: day.comments,
    }));

    activeTheme = new ActiveTheme({
      userId,
      name: theme.name,
      image: theme.image,
      descriptionTheme: theme.descriptionTheme,
      days,
    });

    await activeTheme.save();

    // Adicionar activeTheme ao usuário
    await User.findByIdAndUpdate(userId, {
      $push: { activeThemes: { theme: activeTheme._id, daysCompleted: [] } },
      $set: { activeThemeId: activeTheme._id },
    });

    console.log(`Active Theme Created: ${activeTheme}`);

    res.status(201).send(activeTheme);
  } catch (error) {
    next(error);
  }
});

// Marcar tarefa como concluída e desbloquear o próximo dia
router.post(
  "/:activeThemeId/day/:day/complete",
  isAuthenticated,
  async (req, res, next) => {
    const { activeThemeId, day } = req.params;
    const { commentContent } = req.body;
    const userId = req.user._id;

    try {
      console.log(`User ID: ${userId}`);
      console.log(`Active Theme ID: ${activeThemeId}`);

      // Encontrar o ActiveTheme correspondente
      const activeTheme = await ActiveTheme.findOne({
        _id: activeThemeId,
        userId: userId,
      }).populate("days.comments");

      console.log(`Active Theme: ${activeTheme}`);

      if (!activeTheme) {
        const error = new Error("Active theme not found for user");
        error.status = 404;
        throw error;
      }

      const dayNum = parseInt(day);

      // Verificar se o dia anterior foi concluído
      if (dayNum > 1) {
        const previousTask = activeTheme.days.find(
          (task) => task.day === dayNum - 1
        );
        if (!previousTask || !previousTask.isCompleted) {
          const error = new Error("Previous day not completed");
          error.status = 400;
          throw error;
        }
      }

      // Marcar o dia como completo no tema
      const task = activeTheme.days.find((task) => task.day === dayNum);
      if (!task) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }

      // Adicionar comentário se fornecido
      if (commentContent) {
        const comment = await Comment.create({
          day: dayNum,
          content: commentContent,
          user: userId,
        });
        task.comments.push(comment._id);
      }

      // Desbloquear o próximo dia apenas se o dia atual ainda não estiver completo
      if (!task.isCompleted) {
        task.isCompleted = true; // Marcar o dia atual como completo
        const nextTask = activeTheme.days.find((task) => task.day === dayNum + 1);
        if (nextTask) {
          nextTask.isCompleted = false; // Desbloquear o próximo dia
        }
      }

      await activeTheme.save();

      res.send(activeTheme); // Enviar o tema atualizado
    } catch (error) {
      next(error);
    }
  }
);

// Obter status do tema ativo do usuário
router.get("/:activeThemeId", isAuthenticated, async (req, res, next) => {
  const { activeThemeId } = req.params;
  const userId = req.user._id;

  try {
    const activeTheme = await ActiveTheme.findOne({
      _id: activeThemeId,
      userId: userId,
    }).populate("days.comments");

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
