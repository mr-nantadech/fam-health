import type { DatabaseSync } from "node:sqlite";

export function migrateDatabase(db: DatabaseSync): string[];
