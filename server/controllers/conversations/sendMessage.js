import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";
import messageCache from "../../utils/messageCache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const sendMessage = (req, res) => {
  const senderId = req.user?.id;
  const { receiverId, message } = req.body;

  console.log("📤 DEBUG sendMessage:", { senderId, receiverId, message });

  if (!senderId || !receiverId || !message) {
    console.log("❌ Missing required fields:", { senderId, receiverId, message });
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

  console.log("📦 Payload:", payload);

  // RAM CACHE
  const cacheKey = `${senderId}_${receiverId}`;
  if (!messageCache.has(cacheKey)) {
    messageCache.set(cacheKey, []);
  }
  messageCache.get(cacheKey).push(payload);
  console.log("📦 Added to cache:", cacheKey);

  try {
    const paths = [
      getHotDbPath(senderId, receiverId),
      getHotDbPath(receiverId, senderId)
    ];

    console.log("🗄️ Database paths:", paths);

    for (const dbPath of paths) {
      console.log("🗄️ Processing database:", dbPath);
      
      if (!fs.existsSync(dbPath)) {
        console.log("🗄️ Creating database:", dbPath);
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
        console.log("✅ Created database and table");
      }

      const db = new Database(dbPath);
      const result = db.prepare(`
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
      console.log("✅ Inserted message into database:", result);
      db.close();

      // Ažuriraj Userlist.db za primatelja (samo ako je ovo baza primatelja)
      if (dbPath.includes(`/users/${receiverId}/`)) {
        console.log("📋 Updating userlist for receiver:", receiverId);
        const userlistDbPath = path.resolve(__dirname, `../../database/users/${receiverId}/Userlist.db`);
        const userlistDb = new Database(userlistDbPath);
        // Provjeri postoji li već pošiljatelj
        const existing = userlistDb.prepare('SELECT * FROM userlist WHERE id = ?').get(senderId);
        if (existing) {
          userlistDb.prepare('UPDATE userlist SET unread_messages = unread_messages + 1, last_message_at = ? WHERE id = ?')
            .run(payload.sent_at, senderId);
          console.log("✅ Updated existing user in userlist");
        } else {
          // Dohvati username pošiljatelja (iz baze podataka)
          const clientDbPath = path.resolve(__dirname, '../../database/data/client_info.db');
          const clientDb = new Database(clientDbPath);
          const sender = clientDb.prepare('SELECT username FROM users WHERE id = ?').get(senderId);
          clientDb.close();
          userlistDb.prepare('INSERT INTO userlist (id, username, unread_messages, last_message_at) VALUES (?, ?, 1, ?)')
            .run(senderId, sender?.username || 'Unknown', payload.sent_at);
          console.log("✅ Added new user to userlist");
        }
        userlistDb.close();
      }
    }

    // Emit real-time message to receiver
    if (global.io) {
      const messageData = {
        id: Date.now(), // Temporary ID, will be replaced with actual DB ID
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        sent_at: timestamp,
        status: "sent",
        direction: "incoming"
      };
      
      // Pošalji real-time poruku bez provjere connectedUsers - ako korisnik nije povezan, event se jednostavno neće primiti
      global.io.to(`user_${receiverId}`).emit('new_message', messageData);
      console.log(`🔌 Real-time message sent to user ${receiverId}`);
    }

    // Emit message sent confirmation to sender
    if (global.io) {
      const messageData = {
        id: Date.now(), // Temporary ID, will be replaced with actual DB ID
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        sent_at: timestamp,
        status: "sent",
        direction: "outgoing"
      };
      
      // Pošalji potvrdu bez provjere connectedUsers - ako korisnik nije povezan, event se jednostavno neće primiti
      global.io.to(`user_${senderId}`).emit('message_sent', messageData);
      console.log(`🔌 Message sent confirmation to user ${senderId}`);
    }

    console.log("✅ Message sent successfully");
    return res.status(201).json({
      success: true,
      message_code: success.MESSAGE_SENT
    });

  } catch (err) {
    console.error("❌ SendMessage error:", err.message);
    return res.status(500).json({
      success: false,
      error_code: errors.CONVERSATION_NOT_INITIALIZED,
      message: "Hot storage missing or inaccessible"
    });
  }
};

export default sendMessage;
