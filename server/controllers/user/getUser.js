const path = require("path");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");

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

module.exports = handleGetUser;
