const router = require("express").Router();
const User = require("../models/User.model");
const Theme = require("../models/Theme.model");
const ActiveTheme = require("../models/ActiveTheme.model"); // Verifique esta linha
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Selecionar tema e iniciar desafio
router.post("/start/:themeId", isAuthenticated, async (req, res) => {
  const { themeId } = req.params;
  const userId = req.user._id;

  try {
    const theme = await Theme.findById(themeId);
    if (!theme) {
      console.error("Theme not found");
      return res.status(404).send({ error: "Theme not found" });
    }

    const activeTheme = new ActiveTheme({
      user: userId,
      theme: theme._id,
      daysCompleted: [],
    });

    await activeTheme.save();
    console.log("Active theme saved successfully", activeTheme);
    res.status(201).send(activeTheme);
  } catch (error) {
    console.error("Error in starting theme:", error);
    res.status(500).send({ error: "Server error" });
  }
});

// Marcar tarefa como concluída e desbloquear o próximo dia
router.post(
  "/:themeId/day/:day/complete",
  isAuthenticated,
  async (req, res) => {
    const { themeId, day } = req.params;
    const userId = req.user._id;

    try {
      const activeTheme = await ActiveTheme.findOne({
        user: userId,
        theme: themeId,
      });
      if (!activeTheme) {
        return res
          .status(404)
          .send({ error: "Active theme not found for user" });
      }

      const dayNum = parseInt(day);
      if (activeTheme.daysCompleted.includes(dayNum)) {
        return res.status(400).send({ error: "Day already completed" });
      }

      activeTheme.daysCompleted.push(dayNum); // Unlock next day
      await activeTheme.save();

      res.send(activeTheme);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  }
);

// Obter status do tema ativo do usuário
router.get("/:themeId/status", isAuthenticated, async (req, res) => {
  const { themeId } = req.params;
  const userId = req.user._id;

  try {
    const activeTheme = await ActiveTheme.findOne({
      user: userId,
      theme: themeId,
    }).populate("theme");
    if (!activeTheme) {
      return res.status(404).send({ error: "Active theme not found for user" });
    }

    res.send(activeTheme);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
