const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

// SIGN UP
router.post("/signup", async (req, res) => {
  const { password, email, name, lastName, dateOfBirth } = req.body;

  if (!password || !email || !name || !lastName || !dateOfBirth) {
    res.status(400).send({ error: "Please provide all required fields" });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).send({ error: "User already exists" });
    return;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    email,
    password: hashedPassword,
    name,
    lastName,
    dateOfBirth,
  };

  const createdUser = await User.create(newUser);

  // Formatar a data de nascimento
  const formattedUser = {
    ...createdUser.toObject(),
    dateOfBirth: createdUser.dateOfBirth.toISOString().split("T")[0],
  };

  res.status(201).send(formattedUser);
});

module.exports = router;
