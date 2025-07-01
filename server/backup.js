import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "database/data/client_info.db");
const backupDir = path.resolve(__dirname, "backups");

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}


cron.schedule("0 0 * * *", () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `backup_${timestamp}.db`;
    const destPath = path.join(backupDir, backupName);

    fs.copyFile(dbPath, destPath, (err) => {
        if (err) {
            console.error("Backup failed:", err.message);
        } else {
            console.log("Backup created:", destPath);
        }
    });
});
