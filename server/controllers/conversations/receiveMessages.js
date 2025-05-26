const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const messageCache = require("../../utils/messageCache");
const errors = require("../../constants/errors.json");

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const receiveMessages = (req, res) => {
  const userId = req.user?.id;
  const otherId = parseInt(req.params.userId);

  if (!userId || !otherId) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const cacheKey = `${userId}_${otherId}`;
  const messages = [];

  if (messageCache.has(cacheKey)) {
    messages.push(...messageCache.get(cacheKey));
  }


  try {
    const dbPath = getHotDbPath(userId, otherId);
    if (fs.existsSync(dbPath)) {
      const db = new Database(dbPath);
      const storedMessages = db.prepare("SELECT * FROM messages ORDER BY sent_at ASC").all();
      messages.push(...storedMessages);
      db.close();
    }

    return res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    console.error("receiveMessages error:", err.message);
    return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
  }
};

module.exports = receiveMessages;
