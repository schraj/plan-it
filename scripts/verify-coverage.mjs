// End-to-end check for the Phase 3 coverage-conflict feature ("who can drive?").
// Server must be up: `npm run dev`, then `node scripts/verify-coverage.mjs`.
//
// Scenario: the household creator is the only caregiver. Two kids (Maya, Sam) each
// have an overlapping, unaccompanied event -> demand 2 > supply 1 -> "no driver free"
// on both. Adding a second caregiver lifts supply to 2 -> the warning clears.
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const email = `cover+${Date.now()}@test.com`;
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

async function addPerson(name, { canDrive = false } = {}) {
  await page.fill('input[placeholder="Add a family member"]', name);
  const box = page.locator('input[name="canDrive"]');
  if (canDrive) await box.check();
  else await box.uncheck().catch(() => {});
  await page.click('button:has-text("Add")');
  await page.getByText(name, { exact: false }).first().waitFor({ timeout: 10000 });
  log(`added ${name}${canDrive ? " (caregiver)" : " (dependent)"}`);
}

async function addEvent(title, start, end, attendee) {
  await page.fill('input[placeholder^="Event title"]', title);
  await page.fill('input[name="start"]', start);
  await page.fill('input[name="end"]', end);
  await page
    .locator("label", { hasText: attendee })
    .locator('input[type="checkbox"]')
    .check();
  await page.click('button:has-text("Add event")');
  await page.getByText(title, { exact: false }).first().waitFor({ timeout: 10000 });
  log(`added event: ${title} ${start}-${end} for ${attendee}`);
}

try {
  // 1. Sign up — the creator becomes the household's first (and only) caregiver.
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "Pat");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });

  // 2. Create household
  await page.getByText("Create your household").waitFor({ timeout: 10000 });
  await page.fill('input[name="name"]', "Coverage Family");
  await page.click('button:has-text("Create household")');
  await page.getByText("This week").waitFor({ timeout: 10000 });
  log("household created (Pat = sole caregiver)");

  // 3. Two dependents (no login, can't drive)
  await addPerson("Maya");
  await addPerson("Sam");

  // 4. Two overlapping, unaccompanied kid events
  await addEvent("Soccer", "16:00", "17:00", "Maya");
  await addEvent("Piano", "16:15", "17:15", "Sam");

  // 5. Expect a coverage conflict on BOTH (demand 2 > supply 1)
  await page.waitForLoadState("networkidle");
  const noDriver = await page.getByText("⚠ no driver free").count();
  const redConflicts = await page.getByText("⚠ conflict").count();
  log(`"no driver free" badges x${noDriver}; red double-booking badges x${redConflicts}`);
  await page.screenshot({ path: "/tmp/plan-it-coverage.png", fullPage: true });
  log("screenshot -> /tmp/plan-it-coverage.png");

  // Soccer (Maya) and Piano (Sam) share no person, so the red same-person rule must
  // NOT fire — this is purely a coverage conflict.
  const shortageDetected = noDriver >= 2 && redConflicts === 0;

  // 6. Add a second caregiver -> supply 2, demand 2 -> warning clears.
  await addPerson("Jordan", { canDrive: true });
  await page.waitForLoadState("networkidle");
  const noDriverAfter = await page.getByText("⚠ no driver free").count();
  log(`after adding a 2nd caregiver: "no driver free" badges x${noDriverAfter}`);
  await page.screenshot({ path: "/tmp/plan-it-coverage-resolved.png", fullPage: true });
  log("screenshot -> /tmp/plan-it-coverage-resolved.png");

  const resolved = noDriverAfter === 0;

  const pass = shortageDetected && resolved;
  console.log(
    pass ? "RESULT: PASS" : `RESULT: FAIL (shortage=${shortageDetected}, resolved=${resolved})`,
  );
  process.exit(pass ? 0 : 1);
} catch (err) {
  console.log("RESULT: ERROR", err.message);
  await page
    .screenshot({ path: "/tmp/plan-it-coverage-error.png", fullPage: true })
    .catch(() => {});
  process.exit(2);
} finally {
  await browser.close();
}
