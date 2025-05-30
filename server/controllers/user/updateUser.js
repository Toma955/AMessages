const path = require("path");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");

const handleUpdateUser = (req, res) => {
    const userId = req.params.id;
    const { name, surname, gender, date_of_birth, theme, language } = req.body;

    const db = new Database(clientDbPath);
    const user = db.prepare("SELECT * FROM clients WHERE id = ?").get(userId);

    if (!user) {
        db.close();
        return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
    }

    db.prepare(`
        UPDATE clients SET
            name = COALESCE(?, name),
            surname = COALESCE(?, surname),
            gender = COALESCE(?, gender),
            date_of_birth = COALESCE(?, date_of_birth),
            theme = COALESCE(?, theme),
            language = COALESCE(?, language)
        WHERE id = ?
    `).run(name, surname, gender, date_of_birth, theme, language, userId);

    db.close();

    return res.status(200).json({ success: true, message_code: success.USER_UPDATED });
};

module.exports = handleUpdateUser;
