const express = require("express");
const router = express.Router();

const ChatController = require("./chat.controller");
const { isAuthenticatedUser } = require("core/middleware/Auth");

// POST /api/chat
router.post("/", isAuthenticatedUser, ChatController.chatHandler);

module.exports = router;
