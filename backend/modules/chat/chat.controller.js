const ChatService = require('./chat.service');

exports.chatHandler = async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const parsed = await ChatService.generateReply(userMessage);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Gemini Chat Error:", error);

    if (error.status === 429) {
      return res.status(429).json({
        intent: "normal_reply",
        message:
          "Oops! You've hit the daily limit for AI requests. Please try again later or upgrade your plan.",
      });
    }

    return res.status(500).json({
      intent: "normal_reply",
      message: "Sorry! I couldn't process that right now.",
    });
  }
};
