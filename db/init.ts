#!/usr/bin/env tsx
import { runMigrations } from './migrate.js';

console.log('🚀 Initializing database...\n');

try {
  runMigrations();
  console.log('\n✅ Database initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Failed to initialize database:', error);
  process.exit(1);
}
