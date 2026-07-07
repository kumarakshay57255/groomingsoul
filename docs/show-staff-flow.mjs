/**
 * Drives a VISIBLE Chromium browser through the tester@gmail.com / intern
 * sign-in flow so you can watch each step in real time. Uses Playwright with
 * `headless: false` + slowMo so every action is observable.
 *
 *   cd docs && node show-staff-flow.mjs
 */
import { chromium } from 'playwright';

const FRONTEND = 'http://localhost:4321';
const EMAIL = 'tester@gmail.com';
const PASSWORD = 'dbQANp4u';

function tag(s) {
  return `\n\x1b[1m▶ ${s}\x1b[0m`;
}

async function main() {
  console.log(tag('Launching visible Chromium…'));
  const browser = await chromium.launch({
    headless: false,
    slowMo: 350, // ms between actions — slow enough to watch
    args: ['--window-size=1440,900'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  console.log(tag('1.  Opening login page…'));
  await page.goto(FRONTEND + '/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  console.log(tag(`2.  Typing email: ${EMAIL}`));
  await page.fill('input[name="email"]', EMAIL);
  await page.waitForTimeout(500);

  console.log(tag('3.  Typing password (the temp password issued at invite)'));
  await page.fill('input[name="password"]', PASSWORD);
  await page.waitForTimeout(800);

  console.log(tag('4.  Clicking Sign in'));
  await page.click('button:has-text("Sign in")');

  /* Interns now land on /admin/leads — their first allowed page */
  await page.waitForURL(/\/admin\/leads/, { timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  console.log(tag('5.  Logged in. Landed on /admin/leads (intern-scoped console).'));
  await page.waitForTimeout(2500);

  console.log(tag('6.  Trying to open /admin (KPIs — admin only)…'));
  await page.goto(FRONTEND + '/admin');
  await page.waitForURL(/\/admin\/leads/, { timeout: 10_000 });
  await page.waitForTimeout(1800);
  console.log(tag('7.  Auto-redirected back to /admin/leads (intern cannot view KPIs).'));

  console.log(tag('8.  Trying to open /admin/courses (admin only)…'));
  await page.goto(FRONTEND + '/admin/courses');
  await page.waitForURL(/\/admin\/leads/, { timeout: 10_000 });
  await page.waitForTimeout(1500);
  console.log(tag('9.  Auto-redirected again — interns can only see Leads + Test submissions.'));

  console.log(tag('10. Opening /admin/tests — intern IS allowed.'));
  await page.goto(FRONTEND + '/admin/tests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2200);

  console.log(tag('11. Signing out from the top-right'));
  await page.click('button:has-text("Sign out")');
  await page.waitForTimeout(1500);

  console.log(tag('Done. Closing browser in 3 seconds…'));
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✓ Flow complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
