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
            console.log(`DB check: ${filename} not found. Creating...`);
            startup.info(`Database ${filename} not found. Initializing...`);
            await initFn();  // Osiguraj da je inicijalizacija baze završena prije nego što nastaviš
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
        console.log(`.env file not found at ${ENV_PATH}, using system environment variables`);
        startup.info(`.env file not found, using system environment variables`);
    } else {
        console.log(".env file check: exists.");
        startup.info(".env file exists.");
    }
}

function checkJWTSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
        console.log("JWT_SECRET not found in environment, using default");
        startup.info("JWT_SECRET not found, using default");
    } else {
        console.log("JWT_SECRET check: configured.");
        startup.info("JWT_SECRET is properly configured.");
    }
}

async function startupChecks() {
    console.log(" Starting pre-launch system checks...");
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

    console.log("All system checks passed.");
}
export default startupChecks;
