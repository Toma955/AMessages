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
        // Ako baza ne postoji, kreiraj je i tablicu 'messages'
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        const db = new Database(dbPath);
        db.prepare(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_at TEXT NOT NULL,
            status TEXT NOT NULL,
            direction TEXT NOT NULL
          );
        `).run();
        db.close();
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

      // Ažuriraj Userlist.db za primatelja (samo ako je ovo baza primatelja)
      if (dbPath.includes(`/users/${receiverId}/`)) {
        const userlistDbPath = path.resolve(__dirname, `../../database/users/${receiverId}/Userlist.db`);
        const userlistDb = new Database(userlistDbPath);
        // Provjeri postoji li već pošiljatelj
        const existing = userlistDb.prepare('SELECT * FROM userlist WHERE id = ?').get(senderId);
        if (existing) {
          userlistDb.prepare('UPDATE userlist SET unread_messages = unread_messages + 1, last_message_at = ? WHERE id = ?')
            .run(payload.sent_at, senderId);
        } else {
          // Dohvati username pošiljatelja (iz baze podataka)
          const clientDbPath = path.resolve(__dirname, '../../database/data/client_info.db');
          const clientDb = new Database(clientDbPath);
          const sender = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(senderId);
          clientDb.close();
          userlistDb.prepare('INSERT INTO userlist (id, username, unread_messages, last_message_at) VALUES (?, ?, 1, ?)')
            .run(senderId, sender?.username || 'Unknown', payload.sent_at);
        }
        userlistDb.close();
      }
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
