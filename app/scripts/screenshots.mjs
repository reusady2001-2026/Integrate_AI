#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outDir = join(root, "..", "dist", "screenshots");
const url = process.env.APP_URL || "http://localhost:3001";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "he-IL",
});
const page = await ctx.newPage();

async function shot(name) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: false });
  console.log(`  -> ${name}.png`);
}

console.log("1. empty state (editorial)");
await page.goto(url, { waitUntil: "networkidle" });
await shot("01-empty-editorial");

console.log("2. load sample (editorial)");
await page.getByRole("button", { name: "טען דוגמה" }).click();
await shot("02-sample-editorial");

console.log("3. switch to elegant");
await page.getByLabel("design system").selectOption("elegant");
await shot("03-sample-elegant");

console.log("4. switch to kami");
await page.getByLabel("design system").selectOption("kami");
await shot("04-sample-kami");

console.log("5. switch to paper");
await page.getByLabel("design system").selectOption("paper");
await shot("05-sample-paper");

console.log("6. switch to warm-editorial");
await page.getByLabel("design system").selectOption("warm-editorial");
await shot("06-sample-warm-editorial");

await browser.close();
console.log(`done -> ${outDir}`);
