import { dirname } from "path";
import { fileURLToPath } from "url";
import Database from 'better-sqlite3';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

class User {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/client_info.db');
    }

   
    async initTable() {
        const db = new Database(this.dbPath);
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                googleId TEXT UNIQUE,
                avatar TEXT,
                provider TEXT DEFAULT 'local',
                isOnline BOOLEAN DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.close();
    }

 
    async create(userData) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const { username, email, password, googleId, avatar, provider = 'local' } = userData;
        
        const stmt = db.prepare(`
            INSERT INTO users (username, email, password, googleId, avatar, provider)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(username, email, password, googleId, avatar, provider);
        db.close();
        
        return {
            id: result.lastInsertRowid,
            username,
            email,
            googleId,
            avatar,
            provider,
            isOnline: false
        };
    }

    // Find user by Google ID
    async findByGoogleId(googleId) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('SELECT * FROM users WHERE googleId = ?');
        const row = stmt.get(googleId);
        db.close();
        return row;
    }

    
    async findById(id) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const row = stmt.get(id);
        db.close();
        return row;
    }

  
    async findByEmail(email) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const row = stmt.get(email);
        db.close();
        return row;
    }

   
    async findByUsername(username) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const row = stmt.get(username);
        db.close();
        return row;
    }

   
    async findAll() {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
        const rows = stmt.all();
        db.close();
        return rows;
    }

    
    async update(id, updateData) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        const stmt = db.prepare(`UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
        const result = stmt.run(...values);
        db.close();
        
        return { changes: result.changes };
    }

    
    async delete(id) {
        await this.initTable();
        const db = new Database(this.dbPath);
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        db.close();
        
        return { changes: result.changes };
    }
}

const userInstance = new User();
export default userInstance;
