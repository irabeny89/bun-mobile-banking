import { ascendSort } from "@/utils/migration-file";
import { sql } from "bun";

const MIGRATION_TABLE = "mig8";
const log = (message: unknown) => {
  console.log(`${MIGRATION_TABLE}|INFO:: ${message}`);
};

// create mig8 migration tracking table
log("creating mig8 migration tracking table if not existing");
await sql.unsafe(`
  CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  sql TEXT NOT NULL,
  statement_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`);
log("mig8 migration tracking table created");

// eg bun sql-mig8.ts --dir ./migrations
if (Bun.argv.length > 2 && Bun.argv[2] === "--dir") {
  // folder containing sql script files for migrations
  const folder = Bun.argv[3];
  log(`running all SQL files in folder: ${folder}`);
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(folder);
  // sort files by their prefixed number eg 1-create-user-table.sql
  files.sort(ascendSort);
  // execute each file
  let count = 0;
  for (const filename of files) {
    count++;
    log(`running ${count}/${files.length}: SQL file: ${filename}`);
    // handle ending slash '/' e.g migrations[/]
    const filepath = folder.endsWith("/")
      ? `${folder}${filename}`
      : `${folder}/${filename}`;
    await sql.file(filepath);
  }
  log(`ran ${count} of ${files.length} SQL files`);
} else {
  /** e.g `bun sql-mig8.ts [migrations/1-create-user-table.up.sql]` */
  const filepath = Bun.argv[2];
  const filename = filepath.split("/").pop();
  if (!filename) throw new Error("Filename not found");
  await sql.file(filepath);
  log(`ran SQL file: ${filename}`);
}
