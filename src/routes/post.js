const express = require("express");
const router = express.Router();

const { auth } = require("../../authentication/auth");

const PostController = require("../controllers/post");

// add post
router.post("/", auth, PostController.addPost);

// like dislike
router.put("/like-dislike/:id", auth, PostController.likeDislikePost);

// get all posts
router.get("/all-posts", auth, PostController.getAllPost);

// get post by id
router.get("/post/:id", auth, PostController.getPostByPostId);

// top 5 posts of logged in user
router.get("/top-5-posts", auth, PostController.getTop5PostforUser);

// all posts of logged in user
router.get("/my-posts", auth, PostController.getAllPostForUser);
router.get(
    "/user/:userId",
    auth,
    PostController.getPostsByUserId
  );

module.exports = router;