import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const email = `alex+${Date.now()}@test.com`;
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

try {
  // 1. Sign up
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "Alex");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  log("signup ok, landed on dashboard:", page.url());

  // 2. Create household
  await page.getByText("Create your household").waitFor({ timeout: 10000 });
  await page.fill('input[name="name"]', "The Test Family");
  await page.click('button:has-text("Create household")');
  await page.getByText("This week").waitFor({ timeout: 10000 });
  log("household created, week view visible");

  // 3. Add Maya
  await page.fill('input[placeholder="Add a family member"]', "Maya");
  await page.click('button:has-text("Add")');
  await page.getByText("Family (2)").waitFor({ timeout: 10000 });
  log("added Maya (Family now 2)");

  // helper to add an event involving Maya
  async function addEvent(title, start, end) {
    await page.fill('input[placeholder^="Event title"]', title);
    await page.fill('input[name="start"]', start);
    await page.fill('input[name="end"]', end);
    // check Maya's checkbox via her label
    await page
      .locator("label", { hasText: "Maya" })
      .locator('input[type="checkbox"]')
      .check();
    await page.click('button:has-text("Add event")');
    await page.getByText(title, { exact: false }).first().waitFor({ timeout: 10000 });
    log(`added event: ${title} ${start}-${end}`);
  }

  // 4. Two overlapping events for Maya (date defaults to today)
  await addEvent("Soccer", "16:00", "17:00");
  await addEvent("Piano", "16:30", "17:30");

  // 5. Verify both events + conflict badges
  await page.waitForLoadState("networkidle");
  const soccer = await page.getByText("Soccer").count();
  const piano = await page.getByText("Piano").count();
  const conflictBadges = await page.getByText("⚠ conflict").count();
  log(`week view: Soccer x${soccer}, Piano x${piano}, conflict badges x${conflictBadges}`);

  await page.screenshot({ path: "/tmp/plan-it-verify.png", fullPage: true });
  log("screenshot -> /tmp/plan-it-verify.png");

  const pass = soccer >= 1 && piano >= 1 && conflictBadges >= 2;
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exit(pass ? 0 : 1);
} catch (err) {
  console.log("RESULT: ERROR", err.message);
  await page.screenshot({ path: "/tmp/plan-it-verify-error.png", fullPage: true }).catch(() => {});
  process.exit(2);
} finally {
  await browser.close();
}
