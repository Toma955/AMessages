const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Inicijalizira spremište poruka za zadani conversationId
function initConversationStorage(conversationId) {
    // Definira putanju do direktorija za razgovor
    const folderPath = path.resolve(__dirname, `../database/conversations/${conversationId}`);

    // Kreira direktorij ako ne postoji
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(` Created folder: ${folderPath}`);
    }

    // SQL naredba za kreiranje tablice poruka
    const baseStructure = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      content TEXT NOT NULL
    );
  `;

    // Imena baza podataka koje treba inicijalizirati
    const dbs = ["messages_live.db", "messages_archive.db"];

    // Kreira bazu i tablicu za svaku od navedenih datoteka
    dbs.forEach((file) => {
        const dbPath = path.join(folderPath, file);
        const db = new Database(dbPath);
        db.prepare(baseStructure).run();
        db.close();
        console.log(`✅ Initialized ${file} for conversation ${conversationId}`);
    });
}

module.exports = initConversationStorage;
