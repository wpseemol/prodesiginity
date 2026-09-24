/**
 * Rewrite relative imports to ESM .js extensions (NodeNext).
 * Run from backend/: node scripts/add-js-extensions.mjs
 */
import fs from "node:fs";
import path from "node:path";

const roots = ["src", "prisma", "scripts"].map((d) =>
  path.resolve(process.cwd(), d),
);

const importRe =
  /(from\s+|import\s*\(\s*)(["'])(\.\.?\/[^"'?\n]+?)(["'])/g;

function shouldRewrite(specifier) {
  if (!specifier.startsWith(".")) return false;
  if (/\.(js|mjs|cjs|json|node)(\?|$)/.test(specifier)) return false;
  return true;
}

function rewriteFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const next = original.replace(importRe, (full, prefix, q1, spec, q2) => {
    if (!shouldRewrite(spec)) return full;
    changed = true;
    return `${prefix}${q1}${spec}.js${q2}`;
  });
  if (changed) {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("updated", path.relative(process.cwd(), filePath));
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|mts|cts)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      rewriteFile(full);
    }
  }
}

for (const root of roots) walk(root);
console.log("done");
