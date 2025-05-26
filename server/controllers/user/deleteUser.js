const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const usernamesDbPath = path.resolve(__dirname, "../../database/data/usernames.db");
const loginDbPath = path.resolve(__dirname, "../../database/data/login.db");

const handleDeleteUser = (req, res) => {
    const userId = req.params.id;

    try {
        const clientDb = new Database(clientDbPath);
        const authDb = new Database(authDbPath);
        const usernamesDb = new Database(usernamesDbPath);
        const loginDb = new Database(loginDbPath);

        const user = clientDb.prepare("SELECT username FROM clients WHERE id = ?").get(userId);
        if (!user) {
            clientDb.close();
            authDb.close();
            usernamesDb.close();
            loginDb.close();
            return res.status(404).json({ success: false, error_code: errors.USER_NOT_FOUND });
        }

        const username = user.username;

        clientDb.prepare("DELETE FROM clients WHERE id = ?").run(userId);
        try { clientDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'clients'").run(); } catch {}
        clientDb.close();

        authDb.prepare("DELETE FROM credentials WHERE username = ?").run(username);
        try { authDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'credentials'").run(); } catch {}
        authDb.close();

        usernamesDb.prepare("DELETE FROM registered_usernames WHERE username = ?").run(username);
        try { usernamesDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'registered_usernames'").run(); } catch {}
        usernamesDb.close();

        try {
            loginDb.prepare("DELETE FROM sessions WHERE username = ?").run(username);
            loginDb.prepare("DELETE FROM sqlite_sequence WHERE name = 'sessions'").run();
        } catch {}
        loginDb.close();

        const userFolder = path.resolve(__dirname, "../../database/users", userId.toString());
        if (fs.existsSync(userFolder)) {
            fs.rmSync(userFolder, { recursive: true, force: true });
        }

        return res.status(200).json({ success: true, message_code: success.USER_DELETED });
    } catch (err) {
        console.error("Greška u handleDeleteUser:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = handleDeleteUser;
