const jwt = require("jsonwebtoken");
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
// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ error: "Please provide a username and a password" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).send({ error: "User not found" });
    return;
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    res.status(401).send({ error: "Password incorrect" });
    return;
  }

  const payload = {
    _id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.SECRET_TOKEN, {
    expiresIn: "6h",
  });

  res.send({ authToken: token });
});

module.exports = router;
module.exports = router;
