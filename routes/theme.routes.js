const router = require("express").Router();
const Theme = require("../models/Theme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Obter todos os temas
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const themes = await Theme.find();
    res.send(themes);
  } catch (error) {
    next(error);
  }
});

// Selecionar um tema
router.get("/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  try {
    const theme = await Theme.findById(id);
    if (!theme) {
      const error = new Error("Theme not found");
      error.status = 404;
      throw error;
    }
    res.send(theme);
  } catch (error) {
    next(error);
  }
});

// Marcar tarefa como concluída
router.post(
  "/:id/day/:day/complete",
  isAuthenticated,
  async (req, res, next) => {
    const { id, day } = req.params;
    try {
      const theme = await Theme.findById(id);
      if (!theme) {
        const error = new Error("Theme not found");
        error.status = 404;
        throw error;
      }

      const task = theme.days.find((task) => task.day === parseInt(day));
      if (!task) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }

      task.isCompleted = true;
      await theme.save();

      res.send(task);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
