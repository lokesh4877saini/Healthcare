const crypto = require("crypto");
const mongoose = require("mongoose");
const Session = require("./session.model");

const genToken = (size = 48) => crypto.randomBytes(size).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const accessMinutes = Number(process.env.SESSION_ACCESS_EXPIRE_MINUTES || 15);
const refreshDays = Number(process.env.SESSION_REFRESH_EXPIRE_DAYS || 30);

class SessionService {
  static async createSession(userId, req = {}) {
    if (!userId) {
      throw new Error("SessionService.createSession: userId is required");
    }

    const accessToken = genToken();
    const refreshToken = genToken();
    const now = Date.now();

    const session = await Session.create({
      user: userId,
      accessTokenHash: hashToken(accessToken),
      accessExpiresAt: new Date(now + accessMinutes * 60 * 1000),
      refreshTokenHash: hashToken(refreshToken),
      refreshExpiresAt: new Date(now + refreshDays * 24 * 60 * 60 * 1000),
      userAgent: req.headers?.["user-agent"],
      ip: req.ip || req.connection?.remoteAddress,
    });

    return {
      sessionId: session._id,
      accessToken,
      refreshToken,
      accessExpiresAt: session.accessExpiresAt,
      refreshExpiresAt: session.refreshExpiresAt,
    };
  }

  // Validate access token: return user id if valid
  static async validateAccessToken(accessToken) {
    if (!accessToken) return null;
    const accessHash = hashToken(accessToken);
    const session = await Session.findOne({
      accessTokenHash: accessHash,
      accessExpiresAt: { $gt: new Date() }
    }).populate("user");
    if (!session) return null;
    return session; // includes session.user
  }

  // Rotate access token using session id (or by finding on refresh token)
  static async rotateAccessToken(refreshToken, req = {}) {
    if (!refreshToken) return null;
    const refreshHash = hashToken(refreshToken);
    const session = await Session.findOne({
      refreshTokenHash: refreshHash,
      refreshExpiresAt: { $gt: new Date() }
    });

    if (!session) return null;

    // Optionally: check IP/userAgent similarity and reject if suspicious
    // if (session.ip !== (req.ip || req.connection?.remoteAddress)) return null;

    // Generate new access token (and optionally new refresh token)
    const newAccess = genToken();
    session.accessTokenHash = hashToken(newAccess);
    session.accessExpiresAt = new Date(Date.now() + accessMinutes * 60 * 1000);

    // OPTIONAL: rotate refresh token on each refresh (helps detect replay)
    // const newRefresh = genToken();
    // session.refreshTokenHash = hashToken(newRefresh);
    // session.refreshExpiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await session.save();

    return {
      session,
      accessToken: newAccess,
      // refreshToken: newRefresh // if rotated
    };
  }

  // Invalidate session by refresh token or session id
  static async deleteSessionByRefreshToken(refreshToken) {
    if (!refreshToken) return;
    const refreshHash = hashToken(refreshToken);
    await Session.deleteOne({ refreshTokenHash: refreshHash });
  }

  static async deleteSessionById(sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  // Revoke all sessions for a user (e.g. password change)
  static async revokeAllSessionsForUser(userId) {
    await Session.deleteMany({ user: userId });
  }

  // Optionally: limit concurrent sessions
  static async enforceMaxSessions(userId, max = Number(process.env.MAX_CONCURRENT_SESSIONS || 5)) {
    const sessions = await Session.find({ user: userId }).sort({ createdAt: 1 }); // oldest first
    if (sessions.length < max) return;
    const toRemove = sessions.slice(0, sessions.length - max);
    const ids = toRemove.map(s => s._id);
    await Session.deleteMany({ _id: { $in: ids } });
  }
}

module.exports = SessionService;
