const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const errors = require("../constants/errors.json");
const success = require("../constants/success.json");
const logger = require("../utils/logger");

const authDbPath = path.resolve(__dirname, "../database/data/auth.db");
const clientDbPath = path.resolve(__dirname, "../database/data/client_info.db");
const loginLogDbPath = path.resolve(__dirname, "../database/data/login.db");

const ipAttempts = new Map();

const handleLoginUser = async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get("User-Agent") || "unknown";

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000);

  if (!username || !password) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const currentAttempts = ipAttempts.get(ip) || 0;
  if (currentAttempts >= 3) {
    return res.status(429).json({ success: false, error_code: errors.TOO_MANY_ATTEMPTS });
  }

  const authDb = new Database(authDbPath);
  const credentials = authDb
    .prepare("SELECT * FROM credentials WHERE username = ?")
    .get(username);

  if (!credentials) {
    ipAttempts.set(ip, currentAttempts + 1);
    authDb.close();
    return res.status(401).json({ success: false, error_code: errors.INVALID_CREDENTIALS });
  }

  if (credentials.attempts >= 9) {
    authDb.close();
    ipAttempts.set(ip, currentAttempts + 1);
    return res.status(403).json({ success: false, error_code: errors.TOO_MANY_ATTEMPTS });
  }

  const isValid = bcrypt.compareSync(password, credentials.password_hash);

  if (!isValid) {
    authDb
      .prepare("UPDATE credentials SET attempts = attempts + 1 WHERE username = ?")
      .run(username);
    ipAttempts.set(ip, currentAttempts + 1);
    authDb.close();
    return res.status(401).json({ success: false, error_code: errors.INVALID_CREDENTIALS });
  }

  authDb.prepare("UPDATE credentials SET attempts = 0 WHERE username = ?").run(username);
  authDb.close();
  ipAttempts.delete(ip);

  const clientDb = new Database(clientDbPath);
  const userInfo = clientDb.prepare("SELECT id FROM clients WHERE username = ?").get(username);
  clientDb.close();

  if (!userInfo) {
    return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
  }

  const userId = userInfo.id;

  const loginLogDb = new Database(loginLogDbPath);
  loginLogDb
    .prepare(`
      INSERT INTO sessions (user_id, username, ip_address, login_time, status)
      VALUES (?, ?, ?, datetime('now'), 'active');
    `)
    .run(userId, username, ip);
  loginLogDb.close();

  const token = jwt.sign({ id: userId, username, ip }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });

  logger.auth.info(`User "${username}" (ID: ${userId}) successfully logged in from IP ${ip} with agent "${userAgent}"`);

  res.status(200).json({
    success: true,
    message_code: success.LOGIN_SUCCESS,
    token,
    userId
  });
};

const handleLogoutUser = (req, res) => {
  const { userId } = req.body;
  const ip = req.ip;
  const userAgent = req.get("User-Agent") || "unknown";

  if (!userId) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const loginDb = new Database(loginLogDbPath);

  const activeSession = loginDb.prepare(`
    SELECT id, username FROM sessions
    WHERE user_id = ? AND ip_address = ? AND status = 'active'
    ORDER BY login_time DESC
    LIMIT 1
  `).get(userId, ip);

  if (!activeSession) {
    loginDb.close();
    return res.status(404).json({ success: false, error_code: errors.SESSION_NOT_FOUND });
  }

  loginDb.prepare(`
    UPDATE sessions
    SET logout_time = datetime('now'), status = 'closed'
    WHERE id = ?
  `).run(activeSession.id);

  loginDb.close();

  logger.auth.info(`User "${activeSession.username}" (ID: ${userId}) logged out from IP ${ip} with agent "${userAgent}"`);

  return res.status(200).json({ success: true, message_code: success.LOGOUT_SUCCESS });
};

module.exports = {
  handleLoginUser,
  handleLogoutUser
};
