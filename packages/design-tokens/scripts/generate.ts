import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GENERATED_FILES } from "../src/generate";

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const file of GENERATED_FILES) {
  const target = path.join(pkgRoot, file.path);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, file.render(), "utf8");
  console.log(`wrote ${file.path}`);
}
