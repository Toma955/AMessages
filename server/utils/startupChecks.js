const fs = require("fs");
const path = require("path");
const logger = require("./logger").startup;


const initAuthDb = require("../models/InitAuthDB");
const initClientDb = require("../models/InitClientInfoDb");
const initLoginDb = require("../models/InitLoginDb");
const initSystemDb = require("../models/InitSystemDb");
const initUsernamesDb = require("../models/InitUsernamesDb");

const BASE_DIR = "D:\\AMessages\\server\\";
const DATA_DIR = path.join(BASE_DIR, "database", "data");
const ENV_PATH = path.join(BASE_DIR, ".env");

async function checkAndInitDatabase(filename, initFn) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.log(`DB check: ${filename} not found. Creating...`);
            logger.info(`Database ${filename} not found. Initializing...`);
            await initFn();  // Osiguraj da je inicijalizacija baze završena prije nego što nastaviš
        } else {
            console.log(`DB check: ${filename} exists.`);
            logger.info(`Database ${filename} exists.`);
        }
    } catch (err) {
        logger.error(`Database ${filename} error: ${err.message}`);
        throw new Error(`Failed to handle ${filename}: ${err.message}`);
    }
}

function checkEnvFile() {
    if (!fs.existsSync(ENV_PATH)) {
        logger.error(`.env file is missing at ${ENV_PATH}`);
        throw new Error(`Missing .env file at ${ENV_PATH}`);
    } else {
        console.log(".env file check: exists.");
        logger.info(".env file exists.");
    }
}

async function startupChecks() {
    console.log(" Starting pre-launch system checks...");
    logger.info("Startup check initiated.");

    checkEnvFile();

    
    await checkAndInitDatabase("auth.db", initAuthDb);
    await checkAndInitDatabase("client_info.db", initClientDb);
    await checkAndInitDatabase("login.db", initLoginDb);
    await checkAndInitDatabase("system.db", initSystemDb);
    await checkAndInitDatabase("usernames.db", initUsernamesDb);

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    logger.info(`[${now}] Startup checks passed. All critical files are present.`);

    console.log("All system checks passed.");
}
module.exports = startupChecks;
