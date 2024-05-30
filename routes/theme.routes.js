const router = require("express").Router();
const Theme = require("../models/Theme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Obter todos os temas
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const themes = await Theme.find();
    res.send(themes);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Selecionar um tema
router.get("/theme/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).send({ error: "Theme not found" });
    }
    res.send(theme);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

// Marcar tarefa como concluída
router.post(
  "/theme/:id/day/:day/complete",
  isAuthenticated,
  async (req, res) => {
    const { id, day } = req.params;
    try {
      const theme = await Theme.findById(id);
      if (!theme) {
        return res.status(404).send({ error: "Theme not found" });
      }

      const task = theme.days.find((task) => task.day === parseInt(day));
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }

      task.isCompleted = true;
      await theme.save();

      res.send(task);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  }
);

module.exports = router;
