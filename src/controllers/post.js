const Post = require("../models/post");
const Notification = require("../models/notification");

// ==========================
// Add Post
// ==========================
const addPost = async (req, res) => {
  try {
    const { desc, image } = req.body;

    const post = await Post.create({
      user: req.user._id,
      desc,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Like / Unlike Post
// ==========================
const likeDislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);

      if (post.user._id.toString() !== userId.toString()) {
        await Notification.create({
          sender: userId,
          receiver: post.user._id,
          content: `${req.user.f_name} liked your post`,
          type: "like",
          postId: post._id,
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Feed Posts
// ==========================
const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "f_name profilePic headline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Single Post
// ==========================
const getPostByPostId = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "f_name profilePic headline"
    );

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Top 3 Posts of Logged-in User
// ==========================
const getTop5PostforUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "f_name profilePic headline")
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// All Posts of Logged-in User
// ==========================
const getAllPostForUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "f_name profilePic headline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// All Posts of Any User
// ==========================
const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
    })
      .populate("user", "f_name profilePic headline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Exports
// ==========================
module.exports = {
  addPost,
  likeDislikePost,
  getAllPost,
  getPostByPostId,
  getTop5PostforUser,
  getAllPostForUser,
  getPostsByUserId,
};