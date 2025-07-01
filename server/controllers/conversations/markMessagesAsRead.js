import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

function getHotDbPath(userId, otherId) {
  return path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}/hot.db`);
}

const markMessagesAsRead = (req, res) => {
  const userId = req.user?.id;
  const { otherId, messageIds } = req.body;

  if (!userId || !otherId || !Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const dbPath = getHotDbPath(userId, otherId);
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ success: false, message: "hot.db not found." });
  }

  try {
    const db = new Database(dbPath);
    const stmt = db.prepare("UPDATE messages SET status = 'read' WHERE id = ?");
    const transaction = db.transaction((ids) => {
      for (const id of ids) {
        stmt.run(id);
      }
    });
    transaction(messageIds);
    db.close();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("markMessagesAsRead error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export default markMessagesAsRead; 