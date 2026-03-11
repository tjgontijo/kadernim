#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const baselinePath = resolve(rootDir, "docs/PRD/guardrails-baseline.json");

const args = new Set(process.argv.slice(2));
const checkMode = args.has("--check");
const writeMode = args.has("--write-baseline");
const jsonMode = args.has("--json");

function run(command) {
  try {
    return execSync(command, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function toLines(output) {
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readText(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function isClientFile(content) {
  const head = content.slice(0, 300);
  return /['"]use client['"]/.test(head);
}

function hasTanStackDataHook(content) {
  return /use(Query|InfiniteQuery|Mutation)\s*(?:<[^()]*>)?\s*\(/.test(content);
}

function buildMetrics() {
  const routeFiles = toLines(run("rg --files src/app/api -g 'route.ts'"));
  const tsFiles = toLines(run("rg --files src -g '*.{ts,tsx}'"));
  const apiFiles = toLines(run("rg --files src/app/api -g 'route.ts'"));

  const routeHandlers = routeFiles.length;
  const routesWithPrismaDirect = toLines(
    run("rg -l \"from '@/lib/db'|\\bprisma\\.\" src/app/api -g 'route.ts'")
  ).length;
  const routesWithInlineZod = toLines(
    run("rg -l \"\\bz\\.object\\(\" src/app/api -g 'route.ts'")
  ).length;

  let useEffectOccurrences = 0;
  let useEffectFiles = 0;
  let useEffectFetchFiles = 0;
  let setIntervalOccurrences = 0;
  let consoleLogOccurrences = 0;
  let useInfiniteQueryOccurrences = 0;
  let clientFetchWithoutTanStackFiles = 0;

  for (const filePath of tsFiles) {
    const content = readText(resolve(rootDir, filePath));
    if (!content) continue;

    const hasUseEffect = /\buseEffect\b|\buseLayoutEffect\b/.test(content);
    if (hasUseEffect) useEffectFiles += 1;
    useEffectOccurrences += countMatches(
      content,
      /\buseEffect\b|\buseLayoutEffect\b/g
    );

    if (/useEffect\s*\([\s\S]{0,1200}?fetch\s*\(/.test(content)) {
      useEffectFetchFiles += 1;
    }

    setIntervalOccurrences += countMatches(content, /\bsetInterval\s*\(/g);
    consoleLogOccurrences += countMatches(content, /console\.log\s*\(/g);
    useInfiniteQueryOccurrences += countMatches(
      content,
      /\buseInfiniteQuery\s*(?:<[^()]*>)?\s*\(/g
    );

    if (isClientFile(content) && /fetch\s*\(/.test(content) && !hasTanStackDataHook(content)) {
      clientFetchWithoutTanStackFiles += 1;
    }
  }

  let routesOver80Lines = 0;
  let largestRouteLines = 0;
  let largestRouteFile = "";
  for (const filePath of apiFiles) {
    const content = readText(resolve(rootDir, filePath));
    const lines = content ? content.split("\n").length : 0;
    if (lines > 80) routesOver80Lines += 1;
    if (lines > largestRouteLines) {
      largestRouteLines = lines;
      largestRouteFile = filePath;
    }
  }

  return {
    routeHandlers,
    routesWithPrismaDirect,
    routesWithInlineZod,
    useEffectOccurrences,
    useEffectFiles,
    useEffectFetchFiles,
    clientFetchWithoutTanStackFiles,
    setIntervalOccurrences,
    consoleLogOccurrences,
    useInfiniteQueryOccurrences,
    routesOver80Lines,
    largestRouteLines,
    largestRouteFile,
  };
}

function loadBaseline() {
  if (!existsSync(baselinePath)) return null;
  try {
    return JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch {
    return null;
  }
}

function printSummary(metrics) {
  const entries = Object.entries(metrics).map(([key, value]) => `${key}: ${value}`);
  console.log("Guardrails audit metrics");
  for (const entry of entries) {
    console.log(`- ${entry}`);
  }
}

function evaluateChecks(metrics, baseline) {
  const checks = baseline?.checks || {};
  const failures = [];

  for (const [metricName, rule] of Object.entries(checks)) {
    const currentValue = metrics[metricName];
    if (typeof currentValue !== "number") continue;

    if (rule?.type === "max" && currentValue > rule.value) {
      failures.push(
        `${metricName}: atual=${currentValue}, limite-max=${rule.value}`
      );
    }

    if (rule?.type === "min" && currentValue < rule.value) {
      failures.push(
        `${metricName}: atual=${currentValue}, limite-min=${rule.value}`
      );
    }
  }

  return failures;
}

function writeBaseline(metrics, previousBaseline) {
  const now = new Date().toISOString();
  const output = {
    snapshotDate: now,
    metrics,
    checks: previousBaseline?.checks || {},
  };

  writeFileSync(baselinePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

const metrics = buildMetrics();
const baseline = loadBaseline();

if (writeMode) {
  writeBaseline(metrics, baseline);
  console.log(`Baseline updated at ${baselinePath}`);
}

if (jsonMode) {
  console.log(JSON.stringify(metrics, null, 2));
} else {
  printSummary(metrics);
}

if (checkMode) {
  if (!baseline) {
    console.error("Baseline file not found. Run with --write-baseline first.");
    process.exit(1);
  }

  const failures = evaluateChecks(metrics, baseline);
  if (failures.length > 0) {
    console.error("\nGuardrails check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nGuardrails check passed.");
}
