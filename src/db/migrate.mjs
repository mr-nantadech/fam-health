import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const migrationsDir = path.join(process.cwd(), "src", "db", "migrations");

export function migrateDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    db
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row) => row.version),
  );
  const files = readdirSync(migrationsDir)
    .filter((name) => /^\d+.+\.sql$/.test(name))
    .sort();
  const seen = new Set();
  const ran = [];

  for (const file of files) {
    const version = Number(
      file.slice(
        0,
        file.indexOf("_") > 0 ? file.indexOf("_") : file.indexOf("."),
      ),
    );
    if (!Number.isInteger(version)) {
      throw new Error(`ชื่อไฟล์ migration ไม่ถูกต้อง: ${file}`);
    }
    if (seen.has(version)) {
      throw new Error(`เลข migration ซ้ำ: ${version}`);
    }
    seen.add(version);
    if (applied.has(version)) continue;

    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
      ).run(version, file, new Date().toISOString());
      db.exec("COMMIT");
      ran.push(file);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return ran;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(entry) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const db = new DatabaseSync(path.join(process.cwd(), "fam-health.db"));
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  const ran = migrateDatabase(db);
  if (ran.length === 0) {
    console.log("ไม่มี migration ค้าง");
  } else {
    for (const name of ran) console.log(`applied ${name}`);
  }
}
