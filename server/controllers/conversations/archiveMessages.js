const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const messageCache = require("../../utils/messageCache");

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const archiveMessages = (userId, otherId) => {
  const cacheKey = `${userId}_${otherId}`;
  const messages = messageCache.get(cacheKey);
  if (!messages || messages.length === 0) return;

  const dbPath = getHotDbPath(userId, otherId);
  if (!fs.existsSync(dbPath)) {
    console.warn(`Cannot archive: hot.db missing for user ${userId} → ${otherId}`);
    return;
  }

  const db = new Database(dbPath);
  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, receiver_id, message, sent_at, status, direction)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const msg of messages) {
      stmt.run(
        msg.sender_id,
        msg.receiver_id,
        msg.message,
        msg.sent_at,
        msg.status,
        msg.direction
      );
    }
  })();

  db.close();
  messageCache.delete(cacheKey);
  console.log(`Archived ${messages.length} messages from RAM → hot.db`);
};

module.exports = archiveMessages;
