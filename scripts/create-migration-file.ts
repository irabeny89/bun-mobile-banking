import { createFilename } from "@/utils";

if (Bun.argv.length === 3) {
  const timestamp = Date.now();
  const suffix = Bun.argv[2];
  const filename = `${timestamp}-${createFilename(suffix)}.sql`;
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
