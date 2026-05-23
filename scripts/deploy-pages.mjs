import { cpSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, ".deploy");

const excludeDirs = new Set([
  ".git",
  ".deploy",
  ".wrangler",
  ".screenshots",
  "node_modules",
  "scripts"
]);

const excludeFiles = new Set(["package-lock.json"]);

const shouldSkip = (relativePath) => {
  const parts = relativePath.split(/[/\\]/);
  if (parts.some((part) => excludeDirs.has(part))) return true;
  if (relativePath.endsWith(".psd")) return true;
  if (excludeFiles.has(path.basename(relativePath))) return true;
  return false;
};

const copyFiltered = (source, target, relative = "") => {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    if (shouldSkip(rel)) continue;

    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyFiltered(from, to, rel);
      continue;
    }

    mkdirSync(path.dirname(to), { recursive: true });
    cpSync(from, to);
  }
};

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
copyFiltered(root, outDir);
cpSync(path.join(root, "wrangler.toml"), path.join(outDir, "wrangler.toml"));

const commit = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();

execSync(
  `npx wrangler pages deploy "${outDir}" --project-name=pagina-tatoo-dra-vanessa --branch=main --commit-hash=${commit} --commit-dirty=true`,
  { cwd: root, stdio: "inherit" }
);

console.log(`Deployed commit ${commit} from ${outDir}`);
