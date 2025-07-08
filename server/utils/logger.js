import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import pino from "pino";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logDir = path.resolve(__dirname, "../log");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const destinations = {
    error: path.join(logDir, "errors.log"),
    startup: path.join(logDir, "startup.log"),
    auth: path.join(logDir, "auth.log"),
    user: path.join(logDir, "user.log"),
    requests: path.join(logDir, "requests.log")
};

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

export const error = createLogger(destinations.error, "error");
export const startup = createLogger(destinations.startup, "info");
export const auth = createLogger(destinations.auth, "info");
export const user = createLogger(destinations.user, "info");
export const requests = createLogger(destinations.requests, "info");
