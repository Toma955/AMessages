import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));

const dbPath = path.resolve(__dirname, "../../database/data");

const searchUsers = (req, res) => {
  const query = req.query.query;
  const currentUserId = req.user.id; // Dobiveno iz jwtMiddleware

  if (!query || query.length < 2) {
    return res.status(400).json({ success: false, message: "Upit prekratak." });
  }

  let usernamesDb, clientDb;
  try {
    // 1. Pretraga u usernames.db
    usernamesDb = new Database(path.join(dbPath, "usernames.db"));
    const matchingUsers = usernamesDb
      .prepare("SELECT id, username FROM registered_usernames WHERE username LIKE ? AND id != ? LIMIT 10")
      .all(`%${query}%`, currentUserId);

    if (matchingUsers.length === 0) {
      return res.status(200).json({ success: true, results: [], message_code: errors.USER_NOT_FOUND, message: "Nema korisnika koji odgovaraju upitu." });
    }

    const userIds = matchingUsers.map(user => user.id);
    const placeholders = userIds.map(() => '?').join(',');

    // 2. Dohvaćanje punih podataka iz client_info.db
    clientDb = new Database(path.join(dbPath, "client_info.db"));
    const results = clientDb
      .prepare(`SELECT id, username, gender FROM clients WHERE id IN (${placeholders})`)
      .all(...userIds);

    return res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, message: "Greška na serveru." });
  } finally {
    if (usernamesDb) usernamesDb.close();
    if (clientDb) clientDb.close();
  }
};

export default searchUsers;
