import fs from "fs";
import path from "path";
import { startup } from "../../utils/logger.js";
import initAuthDb from "../../models/InitAuthDB.js";
import initClientDb from "../../models/InitClientInfoDb.js";
import initLoginDb from "../../models/InitLoginDb.js";
import initSystemDb from "../../models/InitSystemDb.js";
import initUsernamesDb from "../../models/InitUsernamesDb.js";

const BASE_DIR = "D:\\AMessages\\server\\";
const DATA_DIR = path.join(BASE_DIR, "database", "data");
const ENV_PATH = path.join(BASE_DIR, ".env");

async function checkAndInitDatabase(filename, initFn) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.log(`DB check: ${filename} not found. Creating...`);
            startup.info(`Database ${filename} not found. Initializing...`);
            await initFn();
        } else {
            console.log(`DB check: ${filename} exists.`);
            startup.info(`Database ${filename} exists.`);
        }
    } catch (err) {
        startup.error(`Database ${filename} error: ${err.message}`);
        throw new Error(`Failed to handle ${filename}: ${err.message}`);
    }
}

function checkEnvFile() {
    if (!fs.existsSync(ENV_PATH)) {
        startup.error(`.env file is missing at ${ENV_PATH}`);
        throw new Error(`Missing .env file at ${ENV_PATH}`);
    } else {
        console.log(".env file check: exists.");
        startup.info(".env file exists.");
    }
}

function checkJWTSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
        startup.error('JWT_SECRET is not properly configured');
        throw new Error('JWT_SECRET must be set to a secure value in .env file');
    } else {
        console.log("JWT_SECRET check: configured.");
        startup.info("JWT_SECRET is properly configured.");
    }
}

async function main() {
    console.log(" Starting database and file checks...");
    startup.info("Database/file check initiated.");

    checkEnvFile();
    checkJWTSecret();

    await checkAndInitDatabase("auth.db", initAuthDb);
    await checkAndInitDatabase("client_info.db", initClientDb);
    await checkAndInitDatabase("login.db", initLoginDb);
    await checkAndInitDatabase("system.db", initSystemDb);
    await checkAndInitDatabase("usernames.db", initUsernamesDb);

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    startup.info(`[${now}] All critical files and databases are present.`);
    console.log("All database/file checks passed.");
}

main().catch(err => {
    console.error("Error during database/file checks:", err);
    process.exit(1);
});
