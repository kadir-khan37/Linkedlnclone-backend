const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // must match your user model name
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // must match your post model name
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", CommentSchema);