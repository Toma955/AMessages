import path from "path";
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");

const handleGetAllUsers = (req, res) => {
  const db = new Database(clientDbPath);
  const users = db.prepare("SELECT id, username, name, surname, gender, date_of_birth, theme, language, created_at FROM clients").all();
  db.close();
  res.status(200).json({ success: true, users });
};

export default handleGetAllUsers; 