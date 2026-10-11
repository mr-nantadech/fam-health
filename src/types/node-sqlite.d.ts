type SqlValue = string | number | null;

declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    run(...params: SqlValue[]): unknown;
    all(...params: SqlValue[]): Record<string, unknown>[];
    get(...params: SqlValue[]): Record<string, unknown> | undefined;
  }
}
