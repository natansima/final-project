const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const commentSchema = new Schema({
  day: { type: Number, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Comment = model("Comment", commentSchema);
module.exports = Comment;
