const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessTokenHash: { type: String, index: true },
  accessExpiresAt: { type: Date },
  refreshTokenHash: { type: String, index: true },
  refreshExpiresAt: { type: Date },
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", sessionSchema);
