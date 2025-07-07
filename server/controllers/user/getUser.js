import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");

const handleGetUser = (req, res) => {
  const userId = req.params.id;

  const db = new Database(clientDbPath);
  const user = db
    .prepare("SELECT id, username, name, surname, gender, date_of_birth FROM clients WHERE id = ?")
    .get(userId);
  db.close();

  if (!user) {
    return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
  }

  res.status(200).json({ success: true, user });
};

export default handleGetUser;
