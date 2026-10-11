import { promises as fs } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { migrateDatabase } from "@/db/migrate.mjs";
import { emptyStore, type DmHtEntry, type Store } from "@/types/health";

const databasePath = path.join(process.cwd(), "fam-health.db");
const legacyJsonPath = path.join(process.cwd(), "data", "store.json");

let chain: Promise<void> = Promise.resolve();
let database: DatabaseSync | null = null;

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function text(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function numberOrNull(
  row: Record<string, unknown>,
  key: string,
): number | null {
  const value = row[key];
  return typeof value === "number" ? value : null;
}

function flag(row: Record<string, unknown>, key: string): boolean {
  return row[key] === 1;
}

function bit(value: boolean): number {
  return value ? 1 : 0;
}

function openDatabase(): DatabaseSync {
  if (database) return database;
  const next = new DatabaseSync(databasePath);
  next.exec("PRAGMA foreign_keys = ON");
  next.exec("PRAGMA busy_timeout = 5000");
  next.exec("PRAGMA journal_mode = WAL");
  migrateDatabase(next);
  database = next;
  return next;
}

async function importLegacyJson(db: DatabaseSync): Promise<void> {
  const imported = db
    .prepare("SELECT value FROM meta WHERE key = ?")
    .get("legacy_json_imported");
  if (imported) return;

  let legacy = emptyStore();
  try {
    const raw = await fs.readFile(legacyJsonPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    legacy = {
      ...emptyStore(),
      ...parsed,
      members: Array.isArray(parsed.members) ? parsed.members : [],
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      vaccines: Array.isArray(parsed.vaccines) ? parsed.vaccines : [],
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      vitals: Array.isArray(parsed.vitals) ? parsed.vitals : [],
      dmHtEntries: Array.isArray(parsed.dmHtEntries) ? parsed.dmHtEntries : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const hasRows = db.prepare("SELECT id FROM members LIMIT 1").get();
  if (!hasRows && legacy.members.length > 0) replaceStore(db, legacy);
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run(
    "legacy_json_imported",
    "1",
  );
}

function replaceStore(db: DatabaseSync, store: Store): void {
  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM members");
    const insertMember = db.prepare(
      `INSERT INTO members (
        id, name, nickname, relationship, gender, birth_date, blood_type, phone, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const member of store.members) {
      insertMember.run(
        member.id,
        member.name,
        member.nickname,
        member.relationship,
        member.gender,
        member.birthDate,
        member.bloodType,
        member.phone,
        member.note,
        member.createdAt,
        member.updatedAt,
      );
    }

    const insertCondition = db.prepare(
      `INSERT INTO conditions (id, member_id, name, diagnosed_on, status, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.conditions) {
      insertCondition.run(
        item.id,
        item.memberId,
        item.name,
        item.diagnosedOn,
        item.status,
        item.note,
      );
    }

    const insertAllergy = db.prepare(
      `INSERT INTO allergies (id, member_id, substance, kind, severity, reaction)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.allergies) {
      insertAllergy.run(
        item.id,
        item.memberId,
        item.substance,
        item.kind,
        item.severity,
        item.reaction,
      );
    }

    const insertMedication = db.prepare(
      `INSERT INTO medications (
        id, member_id, name, dose, frequency, start_date, end_date, active, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.medications) {
      insertMedication.run(
        item.id,
        item.memberId,
        item.name,
        item.dose,
        item.frequency,
        item.startDate,
        item.endDate,
        bit(item.active),
        item.note,
      );
    }

    const insertVaccine = db.prepare(
      `INSERT INTO vaccines (id, member_id, name, date, dose_label, place, next_due)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.vaccines) {
      insertVaccine.run(
        item.id,
        item.memberId,
        item.name,
        item.date,
        item.doseLabel,
        item.place,
        item.nextDue,
      );
    }

    const insertVisit = db.prepare(
      `INSERT INTO visits (id, member_id, date, place, reason, diagnosis, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.visits) {
      insertVisit.run(
        item.id,
        item.memberId,
        item.date,
        item.place,
        item.reason,
        item.diagnosis,
        item.note,
      );
    }

    const insertVital = db.prepare(
      `INSERT INTO vitals (
        id, member_id, date, weight_kg, height_cm, systolic, diastolic, heart_rate, temperature_c, glucose_mg_dl, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.vitals) {
      insertVital.run(
        item.id,
        item.memberId,
        item.date,
        item.weightKg,
        item.heightCm,
        item.systolic,
        item.diastolic,
        item.heartRate,
        item.temperatureC,
        item.glucoseMgDl,
        item.note,
      );
    }

    const insertDmHt = db.prepare(
      `INSERT INTO dm_ht_entries (
        id, member_id, date, weight_kg, height_cm, systolic, diastolic, pulse, waist_cm, fbs,
        depress_2q, depress_8q, depress_9q, smoking, alcohol,
        zone_dark_green, zone_yellow, zone_orange, zone_red, zone_black,
        medications, next_visit, examiner
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const item of store.dmHtEntries) {
      insertDmHt.run(
        item.id,
        item.memberId,
        item.date,
        item.weightKg,
        item.heightCm,
        item.systolic,
        item.diastolic,
        item.pulse,
        item.waistCm,
        item.fbs,
        item.depress2q,
        item.depress8q,
        item.depress9q,
        item.smoking,
        item.alcohol,
        bit(item.zoneDarkGreen),
        bit(item.zoneYellow),
        bit(item.zoneOrange),
        bit(item.zoneRed),
        bit(item.zoneBlack),
        item.medications,
        item.nextVisit,
        item.examiner,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readStore(db: DatabaseSync): Store {
  const members = db
    .prepare("SELECT * FROM members")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      name: text(row, "name"),
      nickname: text(row, "nickname"),
      relationship: text(row, "relationship"),
      gender: text(row, "gender") as Store["members"][number]["gender"],
      birthDate: text(row, "birth_date"),
      bloodType: text(row, "blood_type"),
      phone: text(row, "phone"),
      note: text(row, "note"),
      createdAt: text(row, "created_at"),
      updatedAt: text(row, "updated_at"),
    }));

  const conditions = db
    .prepare("SELECT * FROM conditions")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      name: text(row, "name"),
      diagnosedOn: text(row, "diagnosed_on"),
      status: text(row, "status") as Store["conditions"][number]["status"],
      note: text(row, "note"),
    }));

  const allergies = db
    .prepare("SELECT * FROM allergies")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      substance: text(row, "substance"),
      kind: text(row, "kind") as Store["allergies"][number]["kind"],
      severity: text(row, "severity") as Store["allergies"][number]["severity"],
      reaction: text(row, "reaction"),
    }));

  const medications = db
    .prepare("SELECT * FROM medications")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      name: text(row, "name"),
      dose: text(row, "dose"),
      frequency: text(row, "frequency"),
      startDate: text(row, "start_date"),
      endDate: text(row, "end_date"),
      active: flag(row, "active"),
      note: text(row, "note"),
    }));

  const vaccines = db
    .prepare("SELECT * FROM vaccines")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      name: text(row, "name"),
      date: text(row, "date"),
      doseLabel: text(row, "dose_label"),
      place: text(row, "place"),
      nextDue: text(row, "next_due"),
    }));

  const visits = db
    .prepare("SELECT * FROM visits")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      date: text(row, "date"),
      place: text(row, "place"),
      reason: text(row, "reason"),
      diagnosis: text(row, "diagnosis"),
      note: text(row, "note"),
    }));

  const vitals = db
    .prepare("SELECT * FROM vitals")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      date: text(row, "date"),
      weightKg: numberOrNull(row, "weight_kg"),
      heightCm: numberOrNull(row, "height_cm"),
      systolic: numberOrNull(row, "systolic"),
      diastolic: numberOrNull(row, "diastolic"),
      heartRate: numberOrNull(row, "heart_rate"),
      temperatureC: numberOrNull(row, "temperature_c"),
      glucoseMgDl: numberOrNull(row, "glucose_mg_dl"),
      note: text(row, "note"),
    }));

  const dmHtEntries: DmHtEntry[] = db
    .prepare("SELECT * FROM dm_ht_entries")
    .all()
    .map((row) => ({
      id: text(row, "id"),
      memberId: text(row, "member_id"),
      date: text(row, "date"),
      weightKg: numberOrNull(row, "weight_kg"),
      heightCm: numberOrNull(row, "height_cm"),
      systolic: numberOrNull(row, "systolic"),
      diastolic: numberOrNull(row, "diastolic"),
      pulse: numberOrNull(row, "pulse"),
      waistCm: numberOrNull(row, "waist_cm"),
      fbs: numberOrNull(row, "fbs"),
      depress2q: numberOrNull(row, "depress_2q"),
      depress8q: numberOrNull(row, "depress_8q"),
      depress9q: numberOrNull(row, "depress_9q"),
      smoking: text(row, "smoking"),
      alcohol: text(row, "alcohol"),
      zoneDarkGreen: flag(row, "zone_dark_green"),
      zoneYellow: flag(row, "zone_yellow"),
      zoneOrange: flag(row, "zone_orange"),
      zoneRed: flag(row, "zone_red"),
      zoneBlack: flag(row, "zone_black"),
      medications: text(row, "medications"),
      nextVisit: text(row, "next_visit"),
      examiner: text(row, "examiner"),
    }));

  return {
    members,
    conditions,
    allergies,
    medications,
    vaccines,
    visits,
    vitals,
    dmHtEntries,
  };
}

async function readyDatabase(): Promise<DatabaseSync> {
  const db = openDatabase();
  await importLegacyJson(db);
  return db;
}

export function loadStore(): Promise<Store> {
  return withLock(async () => readStore(await readyDatabase()));
}

export function updateStore(mutator: (draft: Store) => void): Promise<Store> {
  return withLock(async () => {
    const db = await readyDatabase();
    const store = readStore(db);
    mutator(store);
    replaceStore(db, store);
    return store;
  });
}
