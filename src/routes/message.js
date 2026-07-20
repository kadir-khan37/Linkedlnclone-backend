const express = require("express");
const router = express.Router();
console.log("Message routes loaded");

const { auth } = require("../../authentication/auth");

const {
  sendMessage,
  getConversations,
  getMessages
} = require("../controllers/message");

router.post("/send", auth, sendMessage);

router.get("/conversations", auth, getConversations);

router.get("/:conversationId", auth, getMessages);

module.exports = router;