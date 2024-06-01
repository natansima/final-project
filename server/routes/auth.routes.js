const jwt = require("jsonwebtoken");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

// SIGN UP
router.post("/signup", async (req, res, next) => {
  try {
    const { password, email, name, lastName } = req.body;

    if (!password || !email || !name || !lastName) {
      const error = new Error("Please provide all required fields");
      error.status = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.status = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email,
      password: hashedPassword,
      name,
      lastName,
    };

    const createdUser = await User.create(newUser);
    res.status(201).send(createdUser);
  } catch (error) {
    next(error);
  }
});

// LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Please provide a username and a password");
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      const error = new Error("Password incorrect");
      error.status = 401;
      throw error;
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.SECRET_TOKEN, {
      expiresIn: "6h",
    });

    res.send({ authToken: token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
