const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const activeThemeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  theme: { type: Schema.Types.ObjectId, ref: "Theme", required: true },
  daysCompleted: [{ type: Number }],
});

const ActiveTheme = model("ActiveTheme", activeThemeSchema);
module.exports = ActiveTheme;
