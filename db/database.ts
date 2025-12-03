import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = path.join(__dirname, 'varejosmart.db');

// Create database connection
let db: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (!db) {
    db = new Database(DB_PATH, { verbose: console.log });

    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Set timeout for busy database
    db.pragma('busy_timeout = 5000');
  }

  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};

// Graceful shutdown
process.on('exit', () => closeDatabase());
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
