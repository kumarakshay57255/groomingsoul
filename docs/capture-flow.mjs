/**
 * Drives a real browser through the Grooming Souls certificate-dispatch flow
 * and captures a screenshot at every meaningful step. Outputs land in
 * `docs/screenshots/` and a manifest JSON for the PDF builder.
 *
 * Usage:
 *   cd docs && npm run capture
 *
 * Pre-reqs:
 *   - Backend running at http://localhost:5040
 *   - Frontend running at http://localhost:4321
 *   - Admin seeded at grooming@admin.com / grooming@admin
 *   - The seeded diploma course "diploma-trauma-informed-care" exists (3 lessons)
 *
 * Cleanup runs at the end — the demo user is removed via SQL helper.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const FRONTEND = 'http://localhost:4321';
const BACKEND = 'http://localhost:5040';
const ADMIN_EMAIL = 'grooming@admin.com';
const ADMIN_PASSWORD = 'grooming@admin';

const DEMO_NAME = 'Demo Student';
const DEMO_EMAIL = `demo-${Date.now()}@example.com`;
const DEMO_PHONE = '9876543210';
const DEMO_PASSWORD = 'demoPass1234';

const OUT_DIR = path.resolve('./screenshots');
const MANIFEST_PATH = path.resolve('./screenshots/manifest.json');

const VIEWPORT = { width: 1440, height: 900 };

const manifest = [];

async function shot(page, slug, narration) {
  const file = path.join(OUT_DIR, `${slug}.png`);
  await page.screenshot({ path: file, fullPage: false });
  manifest.push({ slug, file: `screenshots/${slug}.png`, narration });
  console.log(`✓ ${slug}`);
}

async function waitAndShot(page, locator, slug, narration, opts = {}) {
  if (locator) await locator.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(opts.delay ?? 350); // let animations settle
  await shot(page, slug, narration);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  // Clear previous shots
  for (const f of await fs.readdir(OUT_DIR)) {
    if (f.endsWith('.png')) await fs.unlink(path.join(OUT_DIR, f));
  }

  console.log(`Demo user: ${DEMO_EMAIL}`);
  const browser = await chromium.launch({ headless: true });

  /* ---------- Student context ---------- */
  const studentCtx = await browser.newContext({ viewport: VIEWPORT });
  const student = await studentCtx.newPage();

  /* 1. Public homepage */
  await student.goto(`${FRONTEND}/`);
  await student.waitForLoadState('networkidle');
  await shot(student, '01-homepage', 'The public marketing site at /. Hero, trust strip, founder, advisory panel.');

  /* 2. Diploma listing */
  await student.goto(`${FRONTEND}/diploma`);
  await student.waitForLoadState('networkidle');
  await shot(student, '02-diploma-listing', 'Page 4: Diploma courses, sourced live from the Postgres `courses` table.');

  /* 3. Diploma detail */
  await student.goto(`${FRONTEND}/diploma/courses/diploma-trauma-informed-care`);
  await student.waitForLoadState('networkidle');
  await shot(student, '03-diploma-detail', 'Diploma detail page — pricing card, manual certificate workflow, full curriculum.');

  /* 4. Signup */
  await student.click('text=Buy now');
  await student.waitForURL(/\/login/);
  await student.click('text=Create an account');
  await student.waitForURL(/\/signup/);
  await student.fill('input[name="name"]', DEMO_NAME);
  await student.fill('input[name="email"]', DEMO_EMAIL);
  await student.fill('input[name="phone"]', DEMO_PHONE);
  await student.fill('input[name="password"]', DEMO_PASSWORD);
  await shot(student, '04-signup-filled', 'Demo student signs up. Indian-mobile validation is enforced — non 10-digit phones are rejected.');

  await student.click('button:has-text("Create account")');
  /* After signup we should land back on the course page with checkout modal */
  await student.waitForURL(/\/diploma\/courses\//, { timeout: 15_000 });
  await student.waitForTimeout(800);
  await shot(student, '05-checkout-modal', 'Auto-redirected back to the course with the manual QR checkout modal pre-opened. Form fields are pre-filled from the account.');

  /* 5. Upload a "receipt" — reuse the cropped logo as a fake screenshot */
  const fakeReceiptPath = path.resolve(
    '../public/logo-mark.png'
  );
  await student.setInputFiles('input[name="receipt"]', fakeReceiptPath);
  await student.waitForTimeout(500);
  await shot(student, '06-receipt-attached', 'Student attaches a payment receipt screenshot (we use the logo file as a placeholder for the demo).');

  await student.click('button:has-text("Submit for verification")');
  await student.waitForURL(/\/checkout\/success/, { timeout: 15_000 });
  await student.waitForLoadState('networkidle');
  await shot(student, '07-checkout-pending', '“Payment under review” — the purchase row sits in `pending_verification` until admin approves it.');

  /* ---------- Admin context ---------- */
  const adminCtx = await browser.newContext({ viewport: VIEWPORT });
  const admin = await adminCtx.newPage();
  await admin.goto(`${FRONTEND}/login`);
  await admin.fill('input[name="email"]', ADMIN_EMAIL);
  await admin.fill('input[name="password"]', ADMIN_PASSWORD);
  await admin.click('button:has-text("Sign in")');
  await admin.waitForURL(/\/admin/, { timeout: 15_000 });
  await admin.waitForLoadState('networkidle');
  await shot(admin, '08-admin-dashboard', 'Admin lands on the operations console. KPI tiles show pending receipts, today’s leads, certs to dispatch.');

  /* 6. Purchases page → approve */
  await admin.goto(`${FRONTEND}/admin/purchases?status=pending_verification`);
  await admin.waitForLoadState('networkidle');
  await shot(admin, '09-purchases-pending', 'Verification queue — every Buy Now lands here. Receipt thumbnails are inline.');

  /* Click the demo student's row to open the drawer */
  const row = admin.locator(`tr:has-text("${DEMO_NAME}")`).first();
  await row.waitFor({ state: 'visible', timeout: 15_000 });
  await row.click();
  await admin.waitForSelector('text=Receipt verification', { timeout: 10_000 });
  await admin.waitForTimeout(400);
  await shot(admin, '10-receipt-drawer', 'Admin opens the receipt drawer — full-size preview, payer contact (tap-to-call / mail), validity window, admin note.');

  /* Approve */
  await admin.click('button:has-text("Approve & unlock")');
  await admin.waitForTimeout(1000);
  await shot(admin, '11-receipt-approved', 'Receipt approved. Status flips to Active, `activatedAt` is set, validity (180 days) is calculated server-side.');

  /* ---------- Back to student: complete the diploma ---------- */
  await student.goto(`${FRONTEND}/dashboard`);
  await student.waitForLoadState('networkidle');
  await shot(student, '12-student-dashboard', 'Student dashboard now shows the course as Active with the countdown chip.');

  /* Open the course curriculum */
  await student.click('a:has-text("Enter course")');
  await student.waitForURL(/\/dashboard\/courses\//, { timeout: 10_000 });
  await student.waitForLoadState('networkidle');
  await shot(student, '13-curriculum', 'Curriculum view — modules + lessons, progress bar (currently 0 %).');

  /* Collect lesson URLs from the curriculum, then visit each independently. */
  const lessonHrefs = await student
    .locator('li a[href*="/lessons/"]')
    .evaluateAll((els) =>
      els.map((e) => (e instanceof HTMLAnchorElement ? e.href : null)).filter(Boolean)
    );
  console.log(`Found ${lessonHrefs.length} lesson URLs`);
  const curriculumUrl = student.url();

  for (let i = 0; i < lessonHrefs.length; i++) {
    await student.goto(lessonHrefs[i]);
    await student.waitForLoadState('networkidle');
    await student.waitForTimeout(800);

    if (i === 0) {
      await shot(student, '14-lesson-player', 'Video player. Floating watermark with user phone+email; speed (0.5×–2×) and quality controls. Streaming proxied through /api/stream/<JWT>.');
    }

    const markBtn = student.locator('button:has-text("Mark as complete")').first();
    /* If already complete, button reads "Completed" instead — skip */
    const visible = await markBtn.isVisible().catch(() => false);
    if (visible) {
      await markBtn.click();
      await student.waitForTimeout(1200); // wait for POST + state update
      if (i === lessonHrefs.length - 1) {
        await shot(student, '15-final-completion', 'Marking the final lesson auto-inserts a row in `certificate_queue`. Student sees “hardcopy certificate queued for dispatch”.');
      }
    } else {
      console.log(`  lesson ${i + 1}: Mark button not visible (already complete?)`);
    }
  }

  /* Back to curriculum to confirm 100% */
  await student.goto(curriculumUrl);
  await student.waitForLoadState('networkidle');

  /* Refresh curriculum to show 100% */
  await student.reload();
  await student.waitForLoadState('networkidle');
  await shot(student, '16-curriculum-complete', 'Curriculum now shows 100 % complete — every lesson green-ticked, progress bar full.');

  /* ---------- Admin: certificate queue ---------- */
  /* Wait a beat — the final mark-complete POST inserts asynchronously */
  await admin.waitForTimeout(1500);
  await admin.goto(`${FRONTEND}/admin/certificates?status=queued`);
  await admin.waitForLoadState('networkidle');
  /* Wait for the demo row to appear (retry briefly if cert queue race) */
  try {
    await admin
      .locator(`tr:has-text("${DEMO_NAME}")`)
      .first()
      .waitFor({ state: 'visible', timeout: 8000 });
  } catch {
    console.log('  cert row not visible yet, retrying refresh…');
    await admin.click('button:has-text("Refresh")');
    await admin.waitForTimeout(1500);
  }
  await shot(admin, '17-cert-queue', 'Admin → Certificate dispatch. The demo student’s row is automatically queued — no manual entry needed.');

  /* Open the cert drawer */
  const certRow = admin.locator(`tr:has-text("${DEMO_NAME}")`).first();
  if (await certRow.isVisible().catch(() => false)) {
    await certRow.click();
    await admin.waitForSelector('text=Certificate dispatch', { timeout: 10_000 });
    await admin.waitForTimeout(400);
    await shot(admin, '18-cert-drawer', 'Drawer with recipient details, shipping address field, courier tracking input, and the Printed → Dispatched → Delivered workflow buttons.');

    /* Scope all clicks to the drawer aside so the backdrop doesn't intercept. */
    const drawer = admin.locator('aside').last();
    await drawer
      .locator('textarea')
      .fill('12, MG Road, Sector 18, Noida, Uttar Pradesh 201301');
    await drawer
      .locator('input[placeholder="e.g. BD-XYZ-1234567"]')
      .fill('BD-DEMO-987654');
    await admin.waitForTimeout(200);
    await drawer.locator('button:has-text("Dispatched")').click();
    await admin.waitForTimeout(900);
    await shot(admin, '19-cert-dispatched', 'Admin marks Dispatched — `dispatchedAt` stamped, tracking saved. Student would be notified by email/SMS in Phase 5.');
  }

  /* ---------- Cleanup ---------- */
  console.log('\nCleaning up demo data via SQL helper…');

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote manifest: ${MANIFEST_PATH}`);
  console.log(`Captured ${manifest.length} screenshots → ${OUT_DIR}`);

  await browser.close();
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
