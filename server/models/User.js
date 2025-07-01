import { dirname } from "path";
import { fileURLToPath } from "url";
import sqlite3 from 'sqlite3';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

class User {
    constructor() {
        this.dbPath = path.join(__dirname, '../database/client_info.db');
    }

   
    async initTable() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.run(`
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
            `, (err) => {
                if (err) reject(err);
                else resolve();
                db.close();
            });
        });
    }

 
    async create(userData) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            const { username, email, password, googleId, avatar, provider = 'local' } = userData;
            
            db.run(`
                INSERT INTO users (username, email, password, googleId, avatar, provider)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [username, email, password, googleId, avatar, provider], function(err) {
                if (err) reject(err);
                else {
                    resolve({
                        id: this.lastID,
                        username,
                        email,
                        googleId,
                        avatar,
                        provider,
                        isOnline: false
                    });
                }
                db.close();
            });
        });
    }

    // Find user by Google ID
    async findByGoogleId(googleId) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.get('SELECT * FROM users WHERE googleId = ?', [googleId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
                db.close();
            });
        });
    }

    
    async findById(id) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
                db.close();
            });
        });
    }

  
    async findByEmail(email) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
                db.close();
            });
        });
    }

   
    async findByUsername(username) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
                db.close();
            });
        });
    }

   
    async findAll() {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.all('SELECT * FROM users ORDER BY createdAt DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
                db.close();
            });
        });
    }

    
    async update(id, updateData) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);
            values.push(id);
            
            db.run(`UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values, function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
                db.close();
            });
        });
    }

    
    async delete(id) {
        await this.initTable();
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
                db.close();
            });
        });
    }
}

const userInstance = new User();
export default userInstance;
