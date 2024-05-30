const router = require("express").Router();
const Theme = require("../models/Theme.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Obter todos os temas
router.post("/:themeId", isAuthenticated, async (req, res) => {
  const { themeId } = req.params;
  const { userId } = req.body;

  // search themes using theme id

  // create a new object with both the found theme and the user id

  // create an active theme in a new collection using the object above

  // try {
  //   const themes = await Theme.find();
  //   res.send(themes);
  // } catch (error) {
  //   res.status(500).send({ error: "Server error" });
  // }
});

module.exports = router;
