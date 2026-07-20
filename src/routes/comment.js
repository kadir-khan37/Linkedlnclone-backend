const express = require("express");
const router = express.Router();

const { commentPost } = require("../controllers/comment");
const {auth} = require("../../authentication/auth");
const {getCommentByPostId} = require("../controllers/comment");


// Add comment on post
router.post("/add-comment", auth, commentPost);
router.get("/postcomments/:postId",auth,getCommentByPostId);

module.exports = router;