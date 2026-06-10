import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = new URL(".", import.meta.url).pathname;
const issues = [];

for (const file of readdirSync(SRC_DIR)) {
  if (!file.endsWith(".js") || file === "lint-check.js") continue;
  const content = readFileSync(join(SRC_DIR, file), "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    const num = i + 1;
    if (line.includes("console.log") && !file.includes("server")) {
      issues.push({ file, line: num, rule: "no-console", msg: "Avoid console.log in library code" });
    }
    if (line.length > 120) {
      issues.push({ file, line: num, rule: "max-line-length", msg: `Line too long (${line.length} > 120)` });
    }
    if (line.includes("TODO")) {
      issues.push({ file, line: num, rule: "no-todo", msg: "Unresolved TODO found" });
    }
    if (line.includes("var ")) {
      issues.push({ file, line: num, rule: "no-var", msg: "Use const/let instead of var" });
    }
  });
}

if (issues.length === 0) {
  console.log("✅ No lint issues found");
  process.exit(0);
} else {
  console.log(`❌ Found ${issues.length} issue(s):\n`);
  for (const issue of issues) {
    console.log(`  ${issue.file}:${issue.line} [${issue.rule}] ${issue.msg}`);
  }
  process.exit(1);
}
