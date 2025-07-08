import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON files
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../constants/success.json"), 'utf8'));

// Database paths
const getGroupsDbPath = (userId) => {
    return path.resolve(__dirname, `../database/users/${userId}/groups.db`);
};

const getGroupMessagesDbPath = (userId, groupId) => {
    return path.resolve(__dirname, `../database/users/${userId}/chat/${groupId}/hot.db`);
};

// Initialize group database for user
const initGroupDb = (userId) => {
    const dbPath = getGroupsDbPath(userId);
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const db = new Database(dbPath);
    db.exec(`
        CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_by INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS group_participants (
            group_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            joined_at TEXT NOT NULL,
            PRIMARY KEY (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES groups(id)
        )
    `);
    
    db.close();
};

// Initialize group messages database
const initGroupMessagesDb = (userId, groupId) => {
    const dbPath = getGroupMessagesDbPath(userId, groupId);
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const db = new Database(dbPath);
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_at TEXT NOT NULL,
            status TEXT DEFAULT 'sent',
            direction TEXT DEFAULT 'outgoing'
        )
    `);
    
    db.close();
};

// Kreiraj bazu podataka za grupu za određenog korisnika
const createGroupDbForUser = (userId, groupId, groupName, createdBy) => {
    try {
        // Kreiraj groups.db za korisnika
        const groupsDbPath = getGroupsDbPath(userId);
        const groupsDbDir = path.dirname(groupsDbPath);
        
        if (!fs.existsSync(groupsDbDir)) {
            fs.mkdirSync(groupsDbDir, { recursive: true });
        }
        
        const groupsDb = new Database(groupsDbPath);
        
        // Kreiraj tabele ako ne postoje
        groupsDb.exec(`
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_by INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);
        
        groupsDb.exec(`
            CREATE TABLE IF NOT EXISTS group_participants (
                group_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT 0,
                joined_at TEXT NOT NULL,
                PRIMARY KEY (group_id, user_id),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )
        `);
        
        // Dodaj grupu u bazu korisnika
        const timestamp = new Date().toISOString();
        groupsDb.prepare(`
            INSERT OR IGNORE INTO groups (id, name, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(groupId, groupName, createdBy, timestamp, timestamp);
        
        // Dodaj korisnika kao učesnika
        const clientDb = new Database(path.resolve(__dirname, '../database/data/client_info.db'));
        const user = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(userId);
        clientDb.close();
        
        groupsDb.prepare(`
            INSERT OR IGNORE INTO group_participants (group_id, user_id, username, is_admin, joined_at)
            VALUES (?, ?, ?, 0, ?)
        `).run(groupId, userId, user?.username || 'Unknown', timestamp);
        
        groupsDb.close();
        
        // Kreiraj messages.db za grupu
        initGroupMessagesDb(userId, groupId);
        
        console.log(`✅ Kreirana baza za grupu ${groupId} za korisnika ${userId}`);
        
    } catch (error) {
        console.error(`❌ Greška pri kreiranju baze za grupu ${groupId} za korisnika ${userId}:`, error);
    }
};

// Create a new group
const createGroup = (req, res) => {
    const userId = req.user?.id;
    const { name, participants } = req.body;
    
    if (!userId || !name) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        initGroupDb(userId);
        const db = new Database(getGroupsDbPath(userId));
        
        const groupId = `group_${Date.now()}_${userId}`;
        const timestamp = new Date().toISOString();
        
        // Create group
        db.prepare(`
            INSERT INTO groups (id, name, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(groupId, name, userId, timestamp, timestamp);
        
        // Add creator as admin
        const clientDb = new Database(path.resolve(__dirname, '../database/data/client_info.db'));
        const creator = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(userId);
        clientDb.close();
        
        db.prepare(`
            INSERT INTO group_participants (group_id, user_id, username, is_admin, joined_at)
            VALUES (?, ?, ?, 1, ?)
        `).run(groupId, userId, creator?.username || 'Unknown', timestamp);
        
        // Add other participants
        if (participants && Array.isArray(participants)) {
            for (const participantId of participants) {
                const participant = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(participantId);
                if (participant) {
                    db.prepare(`
                        INSERT INTO group_participants (group_id, user_id, username, is_admin, joined_at)
                        VALUES (?, ?, ?, 0, ?)
                    `).run(groupId, participantId, participant.username, timestamp);
                    
                    // Kreiraj bazu podataka za svakog učesnika
                    createGroupDbForUser(participantId, groupId, name, userId);
                }
            }
        }
        
        db.close();
        
        // Kreiraj bazu podataka za kreatora grupe
        createGroupDbForUser(userId, groupId, name, userId);
        
        return res.status(201).json({
            success: true,
            group: {
                id: groupId,
                name,
                created_by: userId,
                created_at: timestamp
            }
        });
        
    } catch (err) {
        console.error("createGroup error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Get user's groups
const getGroups = (req, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const dbPath = getGroupsDbPath(userId);
        if (!fs.existsSync(dbPath)) {
            return res.status(200).json({ success: true, groups: [] });
        }
        
        const db = new Database(dbPath);
        const groups = db.prepare(`
            SELECT g.*, COUNT(gp.user_id) as participant_count
            FROM groups g
            LEFT JOIN group_participants gp ON g.id = gp.group_id
            WHERE g.id IN (
                SELECT group_id FROM group_participants WHERE user_id = ?
            )
            GROUP BY g.id
            ORDER BY g.updated_at DESC
        `).all(userId);
        
        db.close();
        
        return res.status(200).json({ success: true, groups });
        
    } catch (err) {
        console.error("getGroups error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Get group messages
const getGroupMessages = (req, res) => {
    const userId = req.user?.id;
    const { groupId } = req.params;
    
    if (!userId || !groupId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const dbPath = getGroupMessagesDbPath(userId, groupId);
        if (!fs.existsSync(dbPath)) {
            return res.status(200).json({ success: true, messages: [] });
        }
        
        const db = new Database(dbPath);
        const messages = db.prepare(`
            SELECT 
                id,
                sender_id,
                message,
                sent_at,
                status,
                direction
            FROM messages 
            ORDER BY sent_at ASC
        `).all();
        
        db.close();
        
        return res.status(200).json({ success: true, messages });
        
    } catch (err) {
        console.error("getGroupMessages error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Send group message
const sendGroupMessage = (req, res) => {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { message } = req.body;
    
    if (!userId || !groupId || !message) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const dbPath = getGroupMessagesDbPath(userId, groupId);
        initGroupMessagesDb(userId, groupId);
        
        const db = new Database(dbPath);
        const timestamp = new Date().toISOString();
        
        // Get sender info
        const clientDb = new Database(path.resolve(__dirname, '../database/data/client_info.db'));
        const sender = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(userId);
        clientDb.close();
        
        const messageData = {
            sender_id: userId,
            receiver_id: groupId, // Grupa kao receiver
            message,
            sent_at: timestamp,
            status: 'sent',
            direction: 'outgoing'
        };
        
        db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, message, sent_at, status, direction)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(messageData.sender_id, messageData.receiver_id, messageData.message, messageData.sent_at, messageData.status, messageData.direction);
        
        db.close();
        
        // Emit to all group participants via Socket.IO
        if (global.io) {
            const groupsDb = new Database(getGroupsDbPath(userId));
            const participants = groupsDb.prepare(`
                SELECT user_id FROM group_participants WHERE group_id = ?
            `).all(groupId);
            groupsDb.close();
            
            participants.forEach(participant => {
                if (global.connectedUsers.has(participant.user_id)) {
                    global.io.to(`user_${participant.user_id}`).emit('group_message', {
                        groupId,
                        ...messageData
                    });
                }
            });
        }
        
        // Spremi poruku u bazu svakog učesnika
        const participants = db.prepare(`
            SELECT user_id FROM group_participants WHERE group_id = ?
        `).all(groupId);
        
        participants.forEach(participant => {
            if (participant.user_id !== userId) { // Ne spremaj duplo za pošiljatelja
                try {
                    const participantDbPath = getGroupMessagesDbPath(participant.user_id, groupId);
                    if (fs.existsSync(participantDbPath)) {
                        const participantDb = new Database(participantDbPath);
                        participantDb.prepare(`
                            INSERT INTO messages (sender_id, receiver_id, message, sent_at, status, direction)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).run(messageData.sender_id, messageData.receiver_id, messageData.message, messageData.sent_at, 'received', 'incoming');
                        participantDb.close();
                    }
                } catch (error) {
                    console.error(`❌ Greška pri spremanju poruke za korisnika ${participant.user_id}:`, error);
                }
            }
        });
        
        return res.status(200).json({ success: true, message: messageData });
        
    } catch (err) {
        console.error("sendGroupMessage error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Add participant to group
const addGroupParticipant = (req, res) => {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { participantId } = req.body;
    
    if (!userId || !groupId || !participantId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const db = new Database(getGroupsDbPath(userId));
        
        // Check if user is admin
        const isAdmin = db.prepare(`
            SELECT is_admin FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin?.is_admin) {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.UNAUTHORIZED });
        }
        
        // Get participant info
        const clientDb = new Database(path.resolve(__dirname, '../database/data/client_info.db'));
        const participant = clientDb.prepare('SELECT username FROM clients WHERE id = ?').get(participantId);
        clientDb.close();
        
        if (!participant) {
            db.close();
            return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
        }
        
        const timestamp = new Date().toISOString();
        
        db.prepare(`
            INSERT OR IGNORE INTO group_participants (group_id, user_id, username, is_admin, joined_at)
            VALUES (?, ?, ?, 0, ?)
        `).run(groupId, participantId, participant.username, timestamp);
        
        db.close();
        
        return res.status(200).json({ success: true });
        
    } catch (err) {
        console.error("addGroupParticipant error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Remove participant from group
const removeGroupParticipant = (req, res) => {
    const userId = req.user?.id;
    const { groupId, participantId } = req.params;
    
    if (!userId || !groupId || !participantId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const db = new Database(getGroupsDbPath(userId));
        
        // Check if user is admin
        const isAdmin = db.prepare(`
            SELECT is_admin FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin?.is_admin) {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.UNAUTHORIZED });
        }
        
        db.prepare(`
            DELETE FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).run(groupId, participantId);
        
        db.close();
        
        return res.status(200).json({ success: true });
        
    } catch (err) {
        console.error("removeGroupParticipant error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Update group name
const updateGroupName = (req, res) => {
    const userId = req.user?.id;
    const { groupId } = req.params;
    const { name } = req.body;
    
    if (!userId || !groupId || !name) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const db = new Database(getGroupsDbPath(userId));
        
        // Check if user is admin
        const isAdmin = db.prepare(`
            SELECT is_admin FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin?.is_admin) {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.UNAUTHORIZED });
        }
        
        const timestamp = new Date().toISOString();
        
        db.prepare(`
            UPDATE groups SET name = ?, updated_at = ? WHERE id = ?
        `).run(name, timestamp, groupId);
        
        db.close();
        
        return res.status(200).json({ success: true });
        
    } catch (err) {
        console.error("updateGroupName error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

// Delete group
const deleteGroup = (req, res) => {
    const userId = req.user?.id;
    const { groupId } = req.params;
    
    if (!userId || !groupId) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }
    
    try {
        const db = new Database(getGroupsDbPath(userId));
        
        // Check if user is admin
        const isAdmin = db.prepare(`
            SELECT is_admin FROM group_participants 
            WHERE group_id = ? AND user_id = ?
        `).get(groupId, userId);
        
        if (!isAdmin?.is_admin) {
            db.close();
            return res.status(403).json({ success: false, error_code: errors.UNAUTHORIZED });
        }
        
        // Delete group and all participants
        db.prepare('DELETE FROM group_participants WHERE group_id = ?').run(groupId);
        db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);
        
        db.close();
        
        // Delete messages database
        const messagesDbPath = getGroupMessagesDbPath(userId, groupId);
        if (fs.existsSync(messagesDbPath)) {
            fs.unlinkSync(messagesDbPath);
        }
        
        return res.status(200).json({ success: true });
        
    } catch (err) {
        console.error("deleteGroup error:", err);
        return res.status(500).json({ success: false, error_code: errors.INTERNAL_ERROR });
    }
};

export {
    createGroup,
    getGroups,
    getGroupMessages,
    sendGroupMessage,
    addGroupParticipant,
    removeGroupParticipant,
    updateGroupName,
    deleteGroup
}; 