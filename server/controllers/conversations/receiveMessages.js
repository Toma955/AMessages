import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import messageCache from "../../utils/messageCache.js";
import errors from "../../constants/errors.json" assert { type: "json" };

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const receiveMessages = (req, res) => {
  const userId = req.user?.id;
  const otherId = parseInt(req.params.userId);

  console.log("🔍 DEBUG receiveMessages: START");
  console.log("🔍 DEBUG receiveMessages: req.user =", req.user);
  console.log("🔍 DEBUG receiveMessages: req.params =", req.params);
  console.log("🔍 DEBUG receiveMessages: userId =", userId, "type:", typeof userId);
  console.log("🔍 DEBUG receiveMessages: otherId =", otherId, "type:", typeof otherId);

  if (!userId || !otherId) {
    console.log("❌ Missing required fields:", { userId, otherId });
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const cacheKey = `${userId}_${otherId}`;
  const messages = [];

  console.log("🔍 Checking cache for key:", cacheKey);
  if (messageCache.has(cacheKey)) {
    const cachedMessages = messageCache.get(cacheKey);
    console.log("📦 Found cached messages:", cachedMessages.length);
    messages.push(...cachedMessages);
  } else {
    console.log("📦 No cached messages found");
  }

  try {
    const dbPath = getHotDbPath(userId, otherId);
    console.log("🗄️ Database path:", dbPath);
    console.log("🗄️ Database exists:", fs.existsSync(dbPath));
    
    if (fs.existsSync(dbPath)) {
      const db = new Database(dbPath);
      const storedMessages = db.prepare("SELECT * FROM messages ORDER BY sent_at ASC").all();
      console.log("🗄️ Found stored messages:", storedMessages.length);
      console.log("🗄️ Stored messages:", storedMessages);
      messages.push(...storedMessages);
      db.close();
    } else {
      console.log("❌ Database file does not exist");
    }

    console.log("📤 Total messages to return:", messages.length);
    console.log("📤 Messages array:", messages);
    
    return res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    console.error("❌ receiveMessages error:", err.message);
    return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
  }
};

export default receiveMessages;
