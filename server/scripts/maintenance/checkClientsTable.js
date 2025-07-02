import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database/data/client_info.db');
const db = new Database(dbPath);

const pragma = db.prepare('PRAGMA table_info(clients)').all();
console.log('Shema tablice clients:');
console.table(pragma);
db.close(); 