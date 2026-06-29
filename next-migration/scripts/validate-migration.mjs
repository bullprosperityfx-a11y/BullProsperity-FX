import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const requiredFiles = [
  "app/page.tsx",
  "app/hub/page.tsx",
  "app/course/page.tsx",
  "app/lesson/[id]/page.tsx",
  "app/tools/page.tsx",
  "app/journal/page.tsx",
  "app/performance-lab/page.tsx",
  "app/status/page.tsx",
  "app/api/status/route.ts",
  "src/data/lessons.ts"
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));

if (missing.length) {
  console.error(`Missing migration files:\n${missing.join("\n")}`);
  process.exit(1);
}

const lessons = readFileSync(join(root, "src/data/lessons.ts"), "utf8");
const lessonCount = (lessons.match(/id: \d+/g) ?? []).length;

if (lessonCount < 30) {
  console.error(`Expected at least 30 lessons, found ${lessonCount}.`);
  process.exit(1);
}

for (const expected of ['videoId: "1184948123"', 'videoId: "1173678522"', "Risikoaufklärung"]) {
  if (!lessons.includes(expected)) {
    console.error(`Lesson data check failed: ${expected}`);
    process.exit(1);
  }
}

console.log(`Next migration validation passed with ${lessonCount} lessons.`);
