const express = require("express");
const router = express.Router();
const { chatHandler } = require("../controllers/chatController.js");
const { isAuthenticatedUser } = require('../middleware/Auth');

// POST /api/chat
router.post("/",isAuthenticatedUser,chatHandler);

module.exports = router;
