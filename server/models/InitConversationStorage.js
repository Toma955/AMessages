import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));


function initConversationStorage(conversationId) {
    
    const folderPath = path.resolve(__dirname, `../database/conversations/${conversationId}`);

   
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(` Created folder: ${folderPath}`);
    }


    const baseStructure = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      content TEXT NOT NULL
    );
  `;

  
    const dbs = ["messages_live.db", "messages_archive.db"];

   
    dbs.forEach((file) => {
        const dbPath = path.join(folderPath, file);
        const db = new Database(dbPath);
        db.prepare(baseStructure).run();
        db.close();
        console.log(`✅ Initialized ${file} for conversation ${conversationId}`);
    });
}

export default initConversationStorage;
