const Post = require("../models/post");
const Notification = require("../models/notification");
const Comment = require("../models/comment");

const commentPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId, comment } = req.body;

    const post = await Post.findById(postId).populate(
      "user",
      "f_name profilePic"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = await Comment.create({
      user: userId,
      post: postId,
      comment,
    });

    await newComment.populate("user", "f_name profilePic");

    post.comments = post.comments + 1;
    await post.save();

    if (post.user._id.toString() !== userId.toString()) {
      await Notification.create({
        sender: userId,
        receiver: post.user._id,
        content: `${newComment.user.f_name} commented on your post`,
        type: "comment",
        postId: postId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to comment on post",
    });
  }
};

const getCommentByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
    })
      .populate("user", "f_name profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalComments: comments.length,
      comments,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get comments",
    });
  }
};

module.exports = {
  commentPost,
  getCommentByPostId,
};