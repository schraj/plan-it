import { chromium } from "playwright";

// Probe: two events that OVERLAP IN TIME but share NO attendee must NOT conflict.
const BASE = "http://localhost:3000";
const email = `probe+${Date.now()}@test.com`;
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

try {
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "Alex");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });

  await page.fill('input[name="name"]', "Probe Family");
  await page.click('button:has-text("Create household")');
  await page.getByText("This week").waitFor({ timeout: 10000 });

  await page.fill('input[placeholder="Add a family member"]', "Maya");
  await page.click('button:has-text("Add")');
  await page.getByText("Family (2)").waitFor({ timeout: 10000 });

  async function addEvent(title, start, end, who) {
    await page.fill('input[placeholder^="Event title"]', title);
    await page.fill('input[name="start"]', start);
    await page.fill('input[name="end"]', end);
    await page
      .locator("label", { hasText: who })
      .locator('input[type="checkbox"]')
      .check();
    await page.click('button:has-text("Add event")');
    await page.getByText(title, { exact: false }).first().waitFor({ timeout: 10000 });
    log(`added ${title} ${start}-${end} for ${who}`);
  }

  // Overlapping in time, but Alex vs Maya — no shared attendee.
  await addEvent("Alex meeting", "16:00", "17:00", "Alex");
  await addEvent("Maya dance", "16:30", "17:30", "Maya");

  await page.waitForLoadState("networkidle");
  const conflictBadges = await page.getByText("⚠ conflict").count();
  log(`conflict badges (expect 0): ${conflictBadges}`);

  await page.screenshot({ path: "/tmp/plan-it-probe.png", fullPage: true });
  console.log(conflictBadges === 0 ? "RESULT: PASS (no false conflict)" : "RESULT: FAIL (false conflict)");
  process.exit(conflictBadges === 0 ? 0 : 1);
} catch (err) {
  console.log("RESULT: ERROR", err.message);
  process.exit(2);
} finally {
  await browser.close();
}
