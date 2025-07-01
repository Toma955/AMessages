import path from "path";
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";
import errors from "../../constants/errors.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
