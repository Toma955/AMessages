import handleCreateUser from "./user/createUser.js";
import handleDeleteUser from "./user/deleteUser.js";
import handleGetUser from "./user/getUser.js";
import handleUpdateUser from "./user/updateUser.js";
import handleGetAllUsers from "./user/getAllUsers.js";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const handleGetProfilePicture = (req, res) => {
    const { id } = req.params;
    const userMediaDir = path.resolve(__dirname, `../database/users/${id}/media`);

    if (fs.existsSync(userMediaDir)) {
        const files = fs.readdirSync(userMediaDir);
        const imageFile = files.find(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        if (imageFile) {
            const imagePath = path.join(userMediaDir, imageFile);
            return res.sendFile(imagePath);
        }
    }
    
    // If no custom picture, send 404, client will use default
    return res.status(404).json({ success: false, message: "No profile picture found." });
};

async function syncUserlistFromChats(userId) {
    console.log('🔄 syncUserlistFromChats: Starting sync for user:', userId);
    
    const userChatDir = path.resolve(__dirname, `../database/users/${userId}/chat`);
    const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
    
    console.log('🗂️ syncUserlistFromChats: Chat directory:', userChatDir);
    console.log('🗂️ syncUserlistFromChats: Chat directory exists:', fs.existsSync(userChatDir));
    
    if (!fs.existsSync(userChatDir)) {
        console.log('❌ syncUserlistFromChats: Chat directory does not exist');
        return;
    }
    
    const userlistDb = new Database(userlistDbPath);
    const clientDbPath = path.resolve(__dirname, '../database/data/client_info.db');
    const clientDb = new Database(clientDbPath);
    
    const chatDirs = fs.readdirSync(userChatDir);
    console.log('📁 syncUserlistFromChats: Found chat directories:', chatDirs);
    
    for (const otherId of chatDirs) {
        console.log('🔄 syncUserlistFromChats: Processing chat with user:', otherId);
        
        const hotDbPath = path.join(userChatDir, otherId, 'hot.db');
        console.log('🗄️ syncUserlistFromChats: Hot database path:', hotDbPath);
        console.log('🗄️ syncUserlistFromChats: Hot database exists:', fs.existsSync(hotDbPath));
        
        if (!fs.existsSync(hotDbPath)) {
            console.log('❌ syncUserlistFromChats: Hot database does not exist, skipping');
            continue;
        }
        
        const hotDb = new Database(hotDbPath);
        // Zadnja poruka
        const lastMsg = hotDb.prepare('SELECT sent_at FROM messages ORDER BY sent_at DESC LIMIT 1').get();
        console.log('📝 syncUserlistFromChats: Last message:', lastMsg);
        
        // Broj nepročitanih poruka
        const unread = hotDb.prepare("SELECT COUNT(*) as cnt FROM messages WHERE receiver_id = ? AND status != 'read'").get(userId)?.cnt || 0;
        console.log('📊 syncUserlistFromChats: Unread messages count:', unread);
        
        // Username sugovornika
        const other = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(Number(otherId));
        console.log('👤 syncUserlistFromChats: Other user info:', other);
        
        // Upsert u userlist
        const existing = userlistDb.prepare('SELECT * FROM userlist WHERE id = ?').get(Number(otherId));
        console.log('🔍 syncUserlistFromChats: Existing user in userlist:', existing);
        
        if (existing) {
            userlistDb.prepare('UPDATE userlist SET unread_messages = ?, last_message_at = ? WHERE id = ?')
                .run(unread, lastMsg?.sent_at || null, Number(otherId));
            console.log('✅ syncUserlistFromChats: Updated existing user in userlist');
        } else {
            userlistDb.prepare('INSERT INTO userlist (id, username, unread_messages, last_message_at) VALUES (?, ?, ?, ?)')
                .run(Number(otherId), other?.username || 'Unknown', unread, lastMsg?.sent_at || null);
            console.log('✅ syncUserlistFromChats: Added new user to userlist');
        }
        hotDb.close();
    }
    clientDb.close();
    userlistDb.close();
    console.log('✅ syncUserlistFromChats: Sync completed');
}

const getUserlist = async (req, res) => {
    const userId = req.user && req.user.id;
    console.log('🔍 getUserlist: userId:', userId);
    
    if (!userId) {
        console.log('❌ getUserlist: Unauthorized - no userId');
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        console.log('🔄 getUserlist: Syncing userlist from chats for user:', userId);
        await syncUserlistFromChats(userId);
        
        const userlistDbPath = path.resolve(__dirname, `../database/users/${userId}/Userlist.db`);
        console.log('🗄️ getUserlist: Userlist database path:', userlistDbPath);
        
        const userlistDb = new Database(userlistDbPath);
        const list = userlistDb.prepare('SELECT * FROM userlist ORDER BY last_message_at DESC').all();
        console.log('📋 getUserlist: Found users in userlist:', list);
        
        userlistDb.close();
        return res.status(200).json({ success: true, userlist: list });
    } catch (err) {
        console.error("❌ Greška u getUserlist:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export {
  handleCreateUser,
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
  handleGetAllUsers,
  addUserToUserlist,
  getUserlist,
  handleGetProfilePicture
};
