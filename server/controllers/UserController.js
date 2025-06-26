const handleCreateUser = require("./user/createUser");
const handleDeleteUser = require("./user/deleteUser");
const handleGetUser = require("./user/getUser");
const handleUpdateUser = require("./user/updateUser");
const handleGetAllUsers = require("./user/getAllUsers");
const path = require("path");
const Database = require("better-sqlite3");

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

const getUserlist = (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing user id." });
    }
    try {
        const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
        const userlistDb = new Database(userlistDbPath);
        const users = userlistDb.prepare('SELECT id, username, unread_messages FROM userlist').all();
        userlistDb.close();
        return res.status(200).json({ success: true, users });
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
