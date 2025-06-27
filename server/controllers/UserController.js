const handleCreateUser = require("./user/createUser");
const handleDeleteUser = require("./user/deleteUser");
const handleGetUser = require("./user/getUser");
const handleUpdateUser = require("./user/updateUser");
const handleGetAllUsers = require("./user/getAllUsers");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

const addUserToUserlist = (req, res) => {
    const userId = req.user && req.user.id;
    const { id, username } = req.body;
    if (!userId || !id || !username) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    try {
        const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
        const userlistDb = new Database(userlistDbPath);
        userlistDb.prepare(`
            INSERT OR IGNORE INTO userlist (id, username, unread_messages)
            VALUES (?, ?, 0)
        `).run(id, username);
        userlistDb.close();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Greška u addUserToUserlist:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

async function syncUserlistFromChats(userId) {
    const userChatDir = path.resolve(__dirname, `../database/users/${userId}/chat`);
    const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
    if (!fs.existsSync(userChatDir)) return;
    const userlistDb = new Database(userlistDbPath);
    const clientDbPath = path.resolve(__dirname, '../database/data/client_info.db');
    const clientDb = new Database(clientDbPath);
    const chatDirs = fs.readdirSync(userChatDir);
    for (const otherId of chatDirs) {
        const hotDbPath = path.join(userChatDir, otherId, 'hot.db');
        if (!fs.existsSync(hotDbPath)) continue;
        const hotDb = new Database(hotDbPath);
        // Zadnja poruka
        const lastMsg = hotDb.prepare('SELECT sent_at FROM messages ORDER BY sent_at DESC LIMIT 1').get();
        // Broj nepročitanih poruka
        const unread = hotDb.prepare("SELECT COUNT(*) as cnt FROM messages WHERE receiver_id = ? AND status != 'read'").get(userId)?.cnt || 0;
        // Username sugovornika
        const other = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(Number(otherId));
        // Upsert u userlist
        const existing = userlistDb.prepare('SELECT * FROM userlist WHERE id = ?').get(Number(otherId));
        if (existing) {
            userlistDb.prepare('UPDATE userlist SET unread_messages = ?, last_message_at = ? WHERE id = ?')
                .run(unread, lastMsg?.sent_at || null, Number(otherId));
        } else {
            userlistDb.prepare('INSERT INTO userlist (id, username, unread_messages, last_message_at) VALUES (?, ?, ?, ?)')
                .run(Number(otherId), other?.username || 'Unknown', unread, lastMsg?.sent_at || null);
        }
        hotDb.close();
    }
    clientDb.close();
    userlistDb.close();
}

const getUserlist = async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        await syncUserlistFromChats(userId);
        const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
        const userlistDb = new Database(userlistDbPath);
        const list = userlistDb.prepare('SELECT * FROM userlist ORDER BY last_message_at DESC').all();
        userlistDb.close();
        return res.status(200).json({ success: true, userlist: list });
    } catch (err) {
        console.error("Greška u getUserlist:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
  handleGetAllUsers,
  addUserToUserlist,
  getUserlist,
};
