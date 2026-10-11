import { promises as fs } from "fs";
import path from "path";
import { emptyStore, type Store } from "@/types/health";

const filePath = path.join(process.cwd(), "data", "store.json");

let chain: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readUnlocked(): Promise<Store> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = emptyStore();
    return {
      members: Array.isArray(parsed.members) ? parsed.members : base.members,
      conditions: Array.isArray(parsed.conditions)
        ? parsed.conditions
        : base.conditions,
      allergies: Array.isArray(parsed.allergies)
        ? parsed.allergies
        : base.allergies,
      medications: Array.isArray(parsed.medications)
        ? parsed.medications
        : base.medications,
      vaccines: Array.isArray(parsed.vaccines)
        ? parsed.vaccines
        : base.vaccines,
      visits: Array.isArray(parsed.visits) ? parsed.visits : base.visits,
      vitals: Array.isArray(parsed.vitals) ? parsed.vitals : base.vitals,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyStore();
    throw error;
  }
}

async function writeUnlocked(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await fs.copyFile(tempPath, filePath);
  await fs.rm(tempPath, { force: true });
}

export function loadStore(): Promise<Store> {
  return withLock(readUnlocked);
}

export function updateStore(mutator: (draft: Store) => void): Promise<Store> {
  return withLock(async () => {
    const store = await readUnlocked();
    mutator(store);
    await writeUnlocked(store);
    return store;
  });
}
