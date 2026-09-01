import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "dist", "public");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, output, { recursive: true });
}

const nextStatic = path.join(root, ".next", "static");
if (fs.existsSync(nextStatic)) {
  fs.mkdirSync(path.join(output, "_next"), { recursive: true });
  fs.cpSync(nextStatic, path.join(output, "_next", "static"), { recursive: true });
}

fs.writeFileSync(path.join(output, "asset-manifest.txt"), "CoPlan Next.js deployment assets\n");
console.log(`Prepared ${output}`);
