import { request } from "node:http";

const BASE = `http://localhost:${process.env.PORT || 3456}`;
const SEED_COUNT = 200;
const WARMUP_ROUNDS = 50;
const BENCH_ROUNDS = 500;

function httpReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = { method, hostname: url.hostname, port: url.port, path: url.pathname + url.search };
    if (body) opts.headers = { "Content-Type": "application/json" };
    const req = request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function seed() {
  for (let i = 0; i < SEED_COUNT; i++) {
    await httpReq("POST", "/tasks", {
      title: `Benchmark task #${i}`,
      priority: ["low", "medium", "high"][i % 3],
    });
  }
}

async function runBench(label, fn, rounds) {
  const times = [];
  for (let i = 0; i < rounds; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  return { label, avg, p50, p95, p99, rounds };
}

async function main() {
  // Check server is running
  try {
    await httpReq("GET", "/health");
  } catch {
    console.error("❌ Server not running on " + BASE);
    console.error("   Start it first: npm start");
    process.exit(1);
  }

  console.log(`Seeding ${SEED_COUNT} tasks...`);
  await seed();

  console.log(`Warming up (${WARMUP_ROUNDS} rounds)...`);
  for (let i = 0; i < WARMUP_ROUNDS; i++) await httpReq("GET", "/tasks");

  console.log(`Benchmarking (${BENCH_ROUNDS} rounds per endpoint)...\n`);

  const results = [];

  results.push(await runBench("GET /tasks (all)", () => httpReq("GET", "/tasks"), BENCH_ROUNDS));
  results.push(await runBench("GET /tasks?done=false", () => httpReq("GET", "/tasks?done=false"), BENCH_ROUNDS));
  results.push(await runBench("GET /tasks/1", () => httpReq("GET", "/tasks/1"), BENCH_ROUNDS));
  results.push(await runBench("POST + DELETE", async () => {
    const res = await httpReq("POST", "/tasks", { title: "temp" });
    const id = JSON.parse(res.data).id;
    await httpReq("DELETE", `/tasks/${id}`);
  }, Math.floor(BENCH_ROUNDS / 2)));
  results.push(await runBench("PATCH toggle", () => httpReq("PATCH", "/tasks/1/toggle"), BENCH_ROUNDS));

  // Summary
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  BENCHMARK RESULTS");
  console.log("═══════════════════════════════════════════════════════════════");
  for (const r of results) {
    console.log(`  ${r.label}`);
    console.log(`    avg: ${r.avg.toFixed(2)}ms | p50: ${r.p50.toFixed(2)}ms | p95: ${r.p95.toFixed(2)}ms | p99: ${r.p99.toFixed(2)}ms`);
  }
  console.log("═══════════════════════════════════════════════════════════════");

  // Composite score (lower is better)
  const compositeAvg = results.reduce((s, r) => s + r.avg, 0) / results.length;
  const compositeP95 = results.reduce((s, r) => s + r.p95, 0) / results.length;
  console.log(`\n  COMPOSITE SCORE (lower = better)`);
  console.log(`    avg: ${compositeAvg.toFixed(2)}ms`);
  console.log(`    p95: ${compositeP95.toFixed(2)}ms`);
  console.log("═══════════════════════════════════════════════════════════════");

  // Machine-readable output for the loop
  const score = { compositeAvg, compositeP95, results };
  console.log("\n__SCORE_JSON__" + JSON.stringify(score) + "__END_SCORE__");
}

main().catch(console.error);
