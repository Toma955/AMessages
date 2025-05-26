const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const messageCache = require("../../utils/messageCache");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const sendMessage = (req, res) => {
  const senderId = req.user?.id;
  const { receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const timestamp = new Date().toISOString();

  const payload = {
    sender_id: senderId,
    receiver_id: receiverId,
    message,
    sent_at: timestamp,
    status: "sent",
    direction: "outgoing"
  };

  // RAM CACHE
  const cacheKey = `${senderId}_${receiverId}`;
  if (!messageCache.has(cacheKey)) {
    messageCache.set(cacheKey, []);
  }
  messageCache.get(cacheKey).push(payload);

  try {
    const paths = [
      getHotDbPath(senderId, receiverId),
      getHotDbPath(receiverId, senderId)
    ];

    for (const dbPath of paths) {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Missing hot.db for path: ${dbPath}`);
      }

      const db = new Database(dbPath);
      db.prepare(`
        INSERT INTO messages (sender_id, receiver_id, message, sent_at, status, direction)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        payload.sender_id,
        payload.receiver_id,
        payload.message,
        payload.sent_at,
        payload.status,
        payload.direction
      );
      db.close();
    }

    return res.status(201).json({
      success: true,
      message_code: success.MESSAGE_SENT
    });

  } catch (err) {
    console.error("SendMessage error:", err.message);
    return res.status(500).json({
      success: false,
      error_code: errors.CONVERSATION_NOT_INITIALIZED,
      message: "Hot storage missing or inaccessible"
    });
  }
};

module.exports = sendMessage;
