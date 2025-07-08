import fs from "fs";
import path from "path";
import { startup } from "./logger.js";
import initAuthDb from "../models/InitAuthDB.js";
import initClientDb from "../models/InitClientInfoDb.js";
import initLoginDb from "../models/InitLoginDb.js";
import initSystemDb from "../models/InitSystemDb.js";
import initUsernamesDb from "../models/InitUsernamesDb.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, "database", "data");
const ENV_PATH = path.join(BASE_DIR, "..", ".env");

async function checkAndInitDatabase(filename, initFn) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) {
            startup.info(`Database ${filename} not found. Initializing...`);
            await initFn();
        }
    } catch (err) {
        startup.error(`Database ${filename} error: ${err.message}`);
        throw new Error(`Failed to handle ${filename}: ${err.message}`);
    }
}

function checkEnvFile() {
    if (!fs.existsSync(ENV_PATH)) {
        startup.info(`.env file not found, using system environment variables`);
    }
}

function checkJWTSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
        startup.info("JWT_SECRET not found, using default");
    }
}

async function startupChecks() {
    startup.info("Startup check initiated.");

    checkEnvFile();
    checkJWTSecret();

    await checkAndInitDatabase("auth.db", initAuthDb);
    await checkAndInitDatabase("client_info.db", initClientDb);
    await checkAndInitDatabase("login.db", initLoginDb);
    await checkAndInitDatabase("system.db", initSystemDb);
    await checkAndInitDatabase("usernames.db", initUsernamesDb);

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    startup.info(`[${now}] Startup checks passed. All critical files are present.`);
}
export default startupChecks;
