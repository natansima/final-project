const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  activeThemes: [
    {
      theme: { type: Schema.Types.ObjectId, ref: "ActiveTheme" },
      daysCompleted: [{ type: Number }],
    },
  ],
});

const User = model("User", userSchema);
module.exports = User;
