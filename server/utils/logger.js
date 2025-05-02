const path = require("path");
const fs = require("fs");
const pino = require("pino");

// Folder za logove
const logDir = path.resolve(__dirname, "../log");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Log destinacije
const destinations = {
    error: path.join(logDir, "errors.log"),
    startup: path.join(logDir, "startup.log"),
    auth: path.join(logDir, "auth.log"),
    user: path.join(logDir, "user.log"),
    requests: path.join(logDir, "requests.log")
};

// 📦 Funkcija za kreiranje loggera
function createLogger(filePath, level = "info") {
    return pino({
        level,
        transport: {
            targets: [
                {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard",
                        ignore: "pid,hostname"
                    }
                },
                {
                    target: "pino/file",
                    level,
                    options: {
                        destination: filePath,
                        mkdir: true
                    }
                }
            ]
        }
    });
}

module.exports = {
    error: createLogger(destinations.error, "error"),
    startup: createLogger(destinations.startup, "info"),
    auth: createLogger(destinations.auth, "info"),
    user: createLogger(destinations.user, "info"),
    requests: createLogger(destinations.requests, "info")
};
