import { getDatabase } from './database.js';
import * as migration001 from './migrations/001_initial_schema.js';
import * as migration002 from './migrations/002_seed_data.js';

interface Migration {
  version: number;
  name: string;
  up: (db: any) => void;
  down: (db: any) => void;
}

const migrations: Migration[] = [
  { version: 1, name: 'initial_schema', ...migration001 },
  { version: 2, name: 'seed_data', ...migration002 },
];

const createMigrationsTable = (db: any): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const getAppliedMigrations = (db: any): number[] => {
  const stmt = db.prepare('SELECT version FROM migrations ORDER BY version');
  const rows = stmt.all();
  return rows.map((row: any) => row.version);
};

const recordMigration = (db: any, version: number, name: string): void => {
  const stmt = db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)');
  stmt.run(version, name);
};

const removeMigration = (db: any, version: number): void => {
  const stmt = db.prepare('DELETE FROM migrations WHERE version = ?');
  stmt.run(version);
};

export const runMigrations = (): void => {
  const db = getDatabase();

  try {
    createMigrationsTable(db);

    const appliedVersions = getAppliedMigrations(db);
    const pendingMigrations = migrations.filter(
      (m) => !appliedVersions.includes(m.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`🔄 Running ${pendingMigrations.length} migration(s)...`);

    for (const migration of pendingMigrations) {
      console.log(`  - Applying migration ${migration.version}: ${migration.name}`);

      db.transaction(() => {
        migration.up(db);
        recordMigration(db, migration.version, migration.name);
      })();

      console.log(`  ✅ Migration ${migration.version} applied`);
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

export const rollbackMigration = (): void => {
  const db = getDatabase();

  try {
    const appliedVersions = getAppliedMigrations(db);

    if (appliedVersions.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }

    const latestVersion = Math.max(...appliedVersions);
    const migration = migrations.find((m) => m.version === latestVersion);

    if (!migration) {
      throw new Error(`Migration version ${latestVersion} not found`);
    }

    console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`);

    db.transaction(() => {
      migration.down(db);
      removeMigration(db, migration.version);
    })();

    console.log(`✅ Migration ${migration.version} rolled back`);
  } catch (error) {
    console.error('❌ Rollback error:', error);
    throw error;
  }
};

// Run migrations if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === 'rollback') {
    rollbackMigration();
  } else {
    runMigrations();
  }
}
