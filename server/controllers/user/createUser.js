import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import CreateUser from "../../models/CreateUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));

const clientDbPath = path.resolve(__dirname, "../../database/data/client_info.db");
const authDbPath = path.resolve(__dirname, "../../database/data/auth.db");
const usernamesDbPath = path.resolve(__dirname, "../../database/data/usernames.db");

const handleCreateUser = (req, res) => {
    console.log('[handleCreateUser] req.body:', req.body);
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

export default handleCreateUser;
