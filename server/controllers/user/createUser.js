const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");
const CreateUser = require("../../models/CreateUser");

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const usernamesDbPath = path.resolve(__dirname, "../../database/data/usernames.db");

const handleCreateUser = (req, res) => {
    const {
        username,
        password,
        name,
        surname,
        gender,
        date_of_birth,
        theme = "light",
        language = "en"
    } = req.body;

    if (!username || !password || !name) {
        return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
    }

    try {
        const { userId } = CreateUser({
            username,
            password,
            name,
            surname,
            gender,
            date_of_birth,
            theme,
            language
        });
        return res.status(201).json({
            success: true,
            message_code: success.USER_CREATED,
            userId
        });
    } catch (err) {
        if (err.message === "Username already exists.") {
            return res.status(409).json({ success: false, error_code: errors.USERNAME_EXISTS });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = handleCreateUser;
