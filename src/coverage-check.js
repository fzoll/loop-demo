import { execSync } from "node:child_process";

const THRESHOLD = parseFloat(process.argv[2] || "95");

const output = execSync("node --test --experimental-test-coverage src/**/*.test.js 2>&1", {
  encoding: "utf-8",
  cwd: new URL("..", import.meta.url).pathname,
});

const allFilesMatch = output.match(/# all files\s+\|\s+([\d.]+)/);
if (!allFilesMatch) {
  console.error("❌ Could not parse coverage output");
  process.exit(1);
}

const lineCoverage = parseFloat(allFilesMatch[1]);

const fileLines = [...output.matchAll(/# {1,2}(\S+\.js)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|(.*)/g)];
const files = fileLines
  .filter((m) => !m[1].includes(".test."))
  .map((m) => ({
    file: m[1],
    line: parseFloat(m[2]),
    branch: parseFloat(m[3]),
    funcs: parseFloat(m[4]),
    uncovered: m[5].trim(),
  }));

console.log("═══════════════════════════════════════════════════");
console.log("  COVERAGE REPORT");
console.log("═══════════════════════════════════════════════════");
for (const f of files) {
  const status = f.line >= THRESHOLD ? "✅" : "❌";
  console.log(`  ${status} ${f.file}: ${f.line}% lines, ${f.branch}% branches, ${f.funcs}% funcs`);
  if (f.uncovered) console.log(`     uncovered: ${f.uncovered}`);
}
console.log("═══════════════════════════════════════════════════");
console.log(`  Overall: ${lineCoverage}% | Threshold: ${THRESHOLD}%`);
const passed = lineCoverage >= THRESHOLD;
console.log(`  ${passed ? "✅ PASS" : "❌ FAIL — need more tests"}`);
console.log("═══════════════════════════════════════════════════");
console.log(`\n__COVERAGE_JSON__${JSON.stringify({ lineCoverage, threshold: THRESHOLD, passed, files })}__END_COVERAGE__`);
process.exit(passed ? 0 : 1);
