/// Creates SQL migration file with name like: [timestamp]-[suffix]
/// Usage: bun scripts/create-migration-file.ts user-table
/// OR
/// Usage: bun mig8:new user-table

import { WORD_SEPARATOR } from "@/config";
import { renameFile } from "@/utils/migration-file";

if (Bun.argv.length === 3) {
  const timestamp = Date.now();
  const suffix = Bun.argv[2];
  const filename = `${timestamp}${WORD_SEPARATOR}${renameFile(suffix)}`;
  const folder = Bun.env.MIG_FOLDER ?? "src/migrations";
  const filePath = `${folder}/${filename}`;
  Bun.write(`${filePath}`, "");
  console.log(`file created: ${filePath}`);
} else
  import("node:path").then(({ basename }) => {
    const [bun, script] = Bun.argv;
    console.error(
      `Invalid command.
  Usage: bun ${basename(script)} [file-suffix]
  bun path: ${bun}
  script path: ${script}`
    );
  });
