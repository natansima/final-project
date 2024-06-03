const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const themeSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Adicionado
  descriptionTheme: { type: String, required: true }, // Adicionado
  days: [
    {
      day: { type: Number, required: true },
      goal: { type: String, required: true },
      description: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
      comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    },
  ],
});

const Theme = model("Theme", themeSchema);
module.exports = Theme;
