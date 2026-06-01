import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage();
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "טען דוגמה" }).click();

for (const ds of ["editorial", "kami", "paper", "warm-editorial", "elegant"]) {
  await page.getByLabel("design system").selectOption(ds);
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => {
    const surface = document.querySelector("[data-ds]");
    const cs = surface ? getComputedStyle(surface) : null;
    return surface
      ? {
          dataDs: surface.getAttribute("data-ds"),
          accent: cs.getPropertyValue("--accent").trim(),
          bg: cs.getPropertyValue("--bg").trim(),
          surface: cs.getPropertyValue("--surface").trim(),
          fontDisplay: cs.getPropertyValue("--font-display").trim().slice(0, 60),
        }
      : { error: "no surface" };
  });
  console.log(`[${ds}]`, JSON.stringify(result));
}

await browser.close();
