import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".next", "node_modules", "next-migration"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes:true }).flatMap(entry => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const files = walk(root);
const htmlFiles = files.filter(file => file.endsWith(".html"));
const errors = [];

function relative(file) {
  return path.relative(root, file);
}

function localTarget(sourceFile, rawValue) {
  const clean = rawValue.split("#")[0].split("?")[0];
  if (!clean || clean.includes("${") || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(clean)) return null;
  if (clean.startsWith("/api/")) return null;
  if (clean === "/") return path.join(root, "index.html");
  const base = clean.startsWith("/") ? root : path.dirname(sourceFile);
  const target = path.resolve(base, clean.replace(/^\//, ""));
  if (path.extname(target)) return target;
  return fs.existsSync(target) && fs.statSync(target).isFile() ? target : `${target}.html`;
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  duplicates.forEach(id => errors.push(`${relative(file)}: doppelte ID "${id}"`));

  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1] || "";
    if (/\bsrc\s*=/i.test(attributes) || /type=["'](?:application\/ld\+json|application\/json)["']/i.test(attributes)) continue;
    const code = match[2].trim();
    if (!code) continue;
    try { new vm.Script(code, { filename:relative(file) }); }
    catch (error) { errors.push(`${relative(file)}: Inline-JavaScript: ${error.message.split("\n")[0]}`); }
  }

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)) {
    const target = localTarget(file, match[1]);
    if (target && !fs.existsSync(target)) errors.push(`${relative(file)}: fehlendes Ziel ${match[1]}`);
  }
}

if (errors.length) {
  console.error(`Launch-Prüfung fehlgeschlagen (${errors.length}):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Launch-Prüfung bestanden: ${htmlFiles.length} HTML-Seiten, Inline-Skripte, Links, Assets und IDs.`);
