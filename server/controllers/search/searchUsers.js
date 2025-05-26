const path = require("path");
const Database = require("better-sqlite3");

const usernamesDbPath = path.resolve(__dirname, "../../database/data/usernames.db");

const searchUsers = (req, res) => {
  const query = req.query.query;
  if (!query || query.length < 2) {
    return res.status(400).json({ success: false, message: "Upit prekratak." });
  }

  const db = new Database(usernamesDbPath);

  const results = db
    .prepare("SELECT id, username FROM registered_usernames WHERE username LIKE ? LIMIT 10")
    .all(`%${query}%`);

  db.close();

  return res.status(200).json({
    success: true,
    results
  });
};

module.exports = searchUsers;
