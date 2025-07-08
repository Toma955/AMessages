import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../constants/success.json"), 'utf8'));

const clientDbPath = path.resolve(__dirname, "../database/data/client_info.db");

function initializeGroupDatabase(userId) {
    const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
    const userGroupsDir = path.dirname(userGroupsDbPath);
    
    if (!fs.existsSync(userGroupsDir)) {
        fs.mkdirSync(userGroupsDir, { recursive: true });
    }
    
    const db = new Database(userGroupsDbPath);
    db.prepare(`
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creator_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `).run();
    
    db.prepare(`
        CREATE TABLE IF NOT EXISTS group_participants (
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            joined_at TEXT NOT NULL,
            PRIMARY KEY (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES groups (id)
        )
    `).run();
    
    db.close();
}

function initializeGroupMessagesDatabase(groupId, participants) {
    for (const participant of participants) {
        const participantMessagesDbPath = path.resolve(__dirname, `../database/users/${participant.user_id}/group_messages/${groupId}/messages.db`);
        const participantMessagesDir = path.dirname(participantMessagesDbPath);
        
        if (!fs.existsSync(participantMessagesDir)) {
            fs.mkdirSync(participantMessagesDir, { recursive: true });
        }
        
        const db = new Database(participantMessagesDbPath);
        db.prepare(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                sender_name TEXT NOT NULL,
                message TEXT NOT NULL,
                sent_at TEXT NOT NULL,
                group_id INTEGER NOT NULL
            )
        `).run();
        db.close();
    }
}

function createGroupDatabaseForUser(userId, groupId, groupName, participants) {
    const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
    const db = new Database(userGroupsDbPath);
    
    const result = db.prepare(`
        INSERT INTO groups (name, creator_id, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(groupName, userId);
    
    const groupId = result.lastInsertRowid;
    
    for (const participant of participants) {
        db.prepare(`
            INSERT INTO group_participants (group_id, user_id, username, role, joined_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).run(groupId, participant.user_id, participant.username, participant.role || 'member');
    }
    
    db.close();
    return groupId;
}

function createGroupDatabaseForCreator(userId, groupId, groupName, participants) {
    const creatorGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
    const db = new Database(creatorGroupsDbPath);
    
    const result = db.prepare(`
        INSERT INTO groups (name, creator_id, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(groupName, userId);
    
    const groupId = result.lastInsertRowid;
    
    for (const participant of participants) {
        db.prepare(`
            INSERT INTO group_participants (group_id, user_id, username, role, joined_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).run(groupId, participant.user_id, participant.username, participant.role || 'member');
    }
    
    db.close();
    return groupId;
}

const handleCreateGroup = async (req, res) => {
    try {
        const { name, participants } = req.body;
        const userId = req.user.id;
        
        if (!name || !participants || !Array.isArray(participants)) {
            return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
        }
        
        const clientDb = new Database(clientDbPath);
        const participantsWithInfo = [];
        
        for (const participantId of participants) {
            const participant = clientDb.prepare("SELECT id, username FROM clients WHERE id = ?").get(participantId);
            if (participant) {
                participantsWithInfo.push({
                    user_id: participant.id,
                    username: participant.username,
                    role: participantId === userId ? 'admin' : 'member'
                });
            }
        }
        
        participantsWithInfo.push({
            user_id: userId,
            username: req.user.username,
            role: 'admin'
        });
        
        clientDb.close();
        
        for (const participant of participantsWithInfo) {
            initializeGroupDatabase(participant.user_id);
        }
        
        const groupId = createGroupDatabaseForUser(userId, null, name, participantsWithInfo);
        
        initializeGroupMessagesDatabase(groupId, participantsWithInfo);
        
        return res.status(201).json({
            success: true,
            message_code: success.GROUP_CREATED,
            groupId
        });
        
    } catch (error) {
        console.error("Create group error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleGetUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
        
        if (!fs.existsSync(userGroupsDbPath)) {
            return res.status(200).json({ success: true, groups: [] });
        }
        
        const db = new Database(userGroupsDbPath);
        const groups = db.prepare(`
            SELECT g.*, gp.role
            FROM groups g
            JOIN group_participants gp ON g.id = gp.group_id
            WHERE gp.user_id = ?
            ORDER BY g.updated_at DESC
        `).all(userId);
        
        db.close();
        
        return res.status(200).json({
            success: true,
            groups
        });
        
    } catch (error) {
        console.error("Get user groups error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleGetGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        
        const userGroupMessagesDbPath = path.resolve(__dirname, `../database/users/${userId}/group_messages/${groupId}/messages.db`);
        
        if (!fs.existsSync(userGroupMessagesDbPath)) {
            return res.status(200).json({ success: true, messages: [] });
        }
        
        const db = new Database(userGroupMessagesDbPath);
        const messages = db.prepare(`
            SELECT * FROM messages
            ORDER BY sent_at ASC
        `).all();
        
        db.close();
        
        return res.status(200).json({
            success: true,
            messages
        });
        
    } catch (error) {
        console.error("Get group messages error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleSendGroupMessage = async (req, res) => {
    try {
        const { groupId, message } = req.body;
        const userId = req.user.id;
        const username = req.user.username;
        
        if (!groupId || !message) {
            return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
        }
        
        const clientDb = new Database(clientDbPath);
        const sender = clientDb.prepare("SELECT username FROM clients WHERE id = ?").get(userId);
        clientDb.close();
        
        const messageData = {
            sender_id: userId,
            sender_name: sender?.username || username,
            message: message,
            sent_at: new Date().toISOString(),
            group_id: groupId
        };
        
        if (global.io) {
            global.io.to(`group_${groupId}`).emit('group_message', {
                groupId,
                message: messageData.message,
                sender: userId,
                senderName: messageData.sender_name,
                timestamp: messageData.sent_at
            });
        }
        
        const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
        const db = new Database(userGroupsDbPath);
        const participants = db.prepare(`
            SELECT user_id FROM group_participants WHERE group_id = ?
        `).all(groupId);
        db.close();
        
        for (const participant of participants) {
            if (participant.user_id !== userId) {
                const participantMessagesDbPath = path.resolve(__dirname, `../database/users/${participant.user_id}/group_messages/${groupId}/messages.db`);
                const participantMessagesDir = path.dirname(participantMessagesDbPath);
                
                if (!fs.existsSync(participantMessagesDir)) {
                    fs.mkdirSync(participantMessagesDir, { recursive: true });
                }
                
                const participantDb = new Database(participantMessagesDbPath);
                participantDb.prepare(`
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sender_id INTEGER NOT NULL,
                        sender_name TEXT NOT NULL,
                        message TEXT NOT NULL,
                        sent_at TEXT NOT NULL,
                        group_id INTEGER NOT NULL
                    )
                `).run();
                
                participantDb.prepare(`
                    INSERT INTO messages (sender_id, sender_name, message, sent_at, group_id)
                    VALUES (?, ?, ?, ?, ?)
                `).run(
                    messageData.sender_id,
                    messageData.sender_name,
                    messageData.message,
                    messageData.sent_at,
                    messageData.group_id
                );
                participantDb.close();
            }
        }
        
        return res.status(201).json({
            success: true,
            message_code: success.MESSAGE_SENT
        });
        
    } catch (error) {
        console.error("Send group message error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleAddParticipant = async (req, res) => {
    try {
        const { groupId, participantId } = req.body;
        const userId = req.user.id;
        
        if (!groupId || !participantId) {
            return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
        }
        
        const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
        const db = new Database(userGroupsDbPath);
        
        const isAdmin = db.prepare(`
            SELECT role FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin || isAdmin.role !== 'admin') {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.INSUFFICIENT_PERMISSIONS });
        }
        
        const clientDb = new Database(clientDbPath);
        const participant = clientDb.prepare("SELECT id, username FROM clients WHERE id = ?").get(participantId);
        clientDb.close();
        
        if (!participant) {
            db.close();
            return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
        }
        
        db.prepare(`
            INSERT INTO group_participants (group_id, user_id, username, role, joined_at)
            VALUES (?, ?, ?, 'member', datetime('now'))
        `).run(groupId, participant.id, participant.username);
        
        db.close();
        
        return res.status(200).json({
            success: true,
            message_code: success.PARTICIPANT_ADDED
        });
        
    } catch (error) {
        console.error("Add participant error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const handleRemoveParticipant = async (req, res) => {
    try {
        const { groupId, participantId } = req.body;
        const userId = req.user.id;
        
        if (!groupId || !participantId) {
            return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
        }
        
        const userGroupsDbPath = path.resolve(__dirname, `../database/users/${userId}/groups.db`);
        const db = new Database(userGroupsDbPath);
        
        const isAdmin = db.prepare(`
            SELECT role FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin || isAdmin.role !== 'admin') {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.INSUFFICIENT_PERMISSIONS });
        }
        
        db.prepare(`
            DELETE FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).run(groupId, participantId);
        
        db.close();
        
        return res.status(200).json({
            success: true,
            message_code: success.PARTICIPANT_REMOVED
        });
        
    } catch (error) {
        console.error("Remove participant error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { handleCreateGroup, handleGetUserGroups, handleGetGroupMessages, handleSendGroupMessage, handleAddParticipant, handleRemoveParticipant }; 