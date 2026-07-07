/**
 * Captures every PUBLIC + STUDENT screen of the Grooming Souls platform.
 * Output:  docs/screenshots-public/<slug>.png  +  manifest.json
 *
 *   cd docs && node capture-public.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const FRONTEND = 'http://localhost:4321';
const OUT_DIR = path.resolve('./screenshots-public');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

const DEMO = {
  name: 'Demo Student',
  email: `demo-pub-${Date.now()}@example.com`,
  phone: '9876543210',
  password: 'demoPass1234',
};

const VIEWPORT = { width: 1440, height: 900 };
const ADMIN_EMAIL = 'grooming@admin.com';
const ADMIN_PASSWORD = 'grooming@admin';

const manifest = [];
function record(slug, narration) {
  manifest.push({ slug, file: `screenshots-public/${slug}.png`, ...narration });
}
async function shot(page, slug, narration) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT_DIR, `${slug}.png`), fullPage: false });
  record(slug, narration);
  console.log('  ✓ ' + slug);
}

async function loginAs(page, email, password) {
  await page.goto(FRONTEND + '/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign in")');
}

async function ensureCleanDemo() {
  /* Wipe any leftover demo-pub users so signup doesn't conflict. */
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const f of await fs.readdir(OUT_DIR)) {
    if (f.endsWith('.png')) await fs.unlink(path.join(OUT_DIR, f));
  }
}

async function main() {
  await ensureCleanDemo();
  console.log(`Demo user: ${DEMO.email}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  /* ========== MARKETING ========== */
  await page.goto(FRONTEND + '/');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-01-homepage-hero', {
    title: 'Homepage',
    summary:
      'The first impression. Hero banner, tagline, primary CTAs ("Book a free session" and "Take a free test"), trust strip below.',
    youSee: [
      'The official Grooming Souls logo and tagline',
      'Two prominent buttons that take visitors into therapy or psychometric tests',
      'A "Section 8 Mental Health NGO" chip at the top, signalling legitimacy',
    ],
    youCan: [
      'Click Therapy / Academy / Diploma in the top nav',
      'Sign in or jump straight to "Book a free session"',
    ],
  });

  /* Scroll to founder section */
  await page.locator('#founder').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await shot(page, 'public-02-founder-section', {
    title: "Founder's Corner",
    summary:
      "The Founder, her message, and the Vision + Mission tiles. All editable from the admin → Core Team & Founder page.",
    youSee: [
      "The Founder's photograph + designation",
      "Multi-paragraph personal message",
      "Side-by-side Vision and Mission tiles",
    ],
    youCan: ['Read about the foundation', "Continue scrolling to meet the team"],
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 1.5));
  await page.waitForTimeout(700);
  await shot(page, 'public-03-advisory-panel', {
    title: 'Advisory Panel',
    summary:
      "A dark-brown 'wall of trust' showing senior psychologists and doctors who supervise the foundation. Managed from admin → Advisory Panel.",
    youSee: ["Up to six advisor cards with photo, name, and qualification"],
    youCan: ['Build credibility for visitors at a glance'],
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await shot(page, 'public-04-footer', {
    title: 'Footer',
    summary:
      'Contact details, social links, services, foundation pages, and legal links. Present on every public page.',
    youSee: [
      'Phone, email, address',
      'Instagram / LinkedIn / YouTube buttons',
      'Three column link list: Services, Foundation, Legal',
    ],
    youCan: ['Reach the support team', 'Open any policy page directly'],
  });

  /* ========== THERAPY ========== */
  await page.goto(FRONTEND + '/therapy');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-05-therapy-landing', {
    title: 'Therapy & Counselling',
    summary:
      'Page 2 of the spec. Verified therapist directory with filter chips by specialisation. Every card has a Book session CTA.',
    youSee: [
      'Hero with two CTAs',
      'Filter chips (Anxiety, Depression, Relationships, etc.)',
      'Grid of therapist cards (photo, designation, specialisation tags)',
    ],
    youCan: [
      'Click any specialisation chip to filter the grid',
      'Click Book a free session on a therapist to open the lead-capture modal',
    ],
  });

  /* Open the booking modal */
  const bookBtn = page.locator('button:has-text("Book a free session")').first();
  await bookBtn.click();
  await page.waitForSelector('text=Free initial session', { timeout: 10_000 });
  await page.waitForTimeout(400);
  await shot(page, 'public-06-booking-modal', {
    title: 'Therapy Booking Modal',
    summary:
      "Zero-price lead capture. Submitting creates a lead in the admin's CRM with status 'new' — no payment gateway involved.",
    youSee: [
      'A modal asking for Name, Age, Phone, Email, and Preferred slot',
      'A reassurance line: "We never share your details"',
    ],
    youCan: [
      'Submit the form — student gets a thank-you screen',
      'Admin sees the new lead under Therapy leads',
    ],
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  /* ========== PSYCHOMETRIC TESTS ========== */
  await page.goto(FRONTEND + '/therapy/tests');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-07-tests-portal', {
    title: 'Psychometric Tests Portal',
    summary:
      'Free standardised assessments. Each tile shows the test name, item count, time estimate, and a Begin button.',
    youSee: [
      'Five test cards — Big Five (OCEAN), Cognitive Aptitude, Sentence Completion, Perceived Stress (PSS-14), Emotional Intelligence (WLEIS)',
      'Each card indicates how long it takes and how many items',
    ],
    youCan: [
      'Choose any test to begin',
      'See clearly that all tests are free and confidential',
    ],
  });

  /* Identity gate of one test */
  await page.goto(FRONTEND + '/therapy/tests/ocean-big-five');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-08-test-intro', {
    title: 'Test Intake — OCEAN (Big Five) Identity Gate',
    summary:
      'Before starting any test the student gives their name, email, and phone so the team can return personal results.',
    youSee: [
      "Instructions and 'Roughly 10 min · 44 items' chip",
      'A small form for Name + Email + Phone',
      'Confidentiality note',
    ],
    youCan: ['Click Start to enter the live test grid'],
  });

  /* ========== ACADEMY ========== */
  await page.goto(FRONTEND + '/academy');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-09-academy-listing', {
    title: 'Psych Academy Catalogue',
    summary:
      'Page 3 of the spec. Course catalogue split by four academic segments. Every course card shows category, price, validity window, and a hover affordance to the detail page.',
    youSee: [
      'Category tabs: 11–12 / CUET-UG / CUET-PG / NET-JRF',
      'A grid of course cards with cover-colour bands',
      'Each card shows access window and price',
    ],
    youCan: [
      'Filter by sub-category',
      'Click a course to read the syllabus and buy it',
    ],
  });

  await page.goto(FRONTEND + '/academy/courses/cuet-ug-psychology-master');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-10-academy-detail', {
    title: 'Academy Course Detail',
    summary:
      'Per-course landing page. Left: full description + curriculum tree. Right: pricing card with Buy now CTA.',
    youSee: [
      'Course title, instructor, hours of content',
      'Pricing card with the validity badge ("1 month / 3 months access")',
      'Expandable module and lesson list',
    ],
    youCan: [
      'Read the full syllabus before buying',
      'Click Buy now to open the manual QR-checkout modal',
    ],
  });

  /* Checkout modal */
  await page.click('button:has-text("Buy now")');
  await page.waitForURL(/\/login/);
  /* Sign up so we can authenticate and see the post-auth modal */
  await page.click('text=Create an account');
  await page.waitForURL(/\/signup/);
  await page.fill('input[name="name"]', DEMO.name);
  await page.fill('input[name="email"]', DEMO.email);
  await page.fill('input[name="phone"]', DEMO.phone);
  await page.fill('input[name="password"]', DEMO.password);
  await shot(page, 'public-11-signup', {
    title: 'Sign-up Page',
    summary:
      'A polished sign-up screen with strict 10-digit Indian-mobile validation. The phone is later embedded in the video watermark so we capture it cleanly.',
    youSee: [
      'Form for Name, Email, Contact number, Password',
      'A note about the phone appearing in video watermarks',
      'Link to existing-account sign-in',
    ],
    youCan: ['Sign up and continue straight to the original Buy-now flow'],
  });
  await page.click('button:has-text("Create account")');
  await page.waitForURL(/\/academy\/courses\//, { timeout: 15_000 });
  await page.waitForTimeout(800);
  await shot(page, 'public-12-checkout-modal', {
    title: 'Manual QR Checkout Modal',
    summary:
      'Pops up automatically after sign-in if the user came from a Buy-now click. No payment gateway — just the Grooming Souls QR + a receipt upload form.',
    youSee: [
      "Left: the foundation's UPI QR (placeholder for now)",
      'Right: payer details pre-filled from the account + receipt file picker',
      'Validity reminder ("3 months from approval")',
    ],
    youCan: [
      "Scan the QR with any UPI app and pay directly to the foundation",
      'Upload the screenshot and submit for verification',
    ],
  });

  /* Upload receipt + submit */
  const receipt = path.resolve('../public/logo-mark.png');
  await page.setInputFiles('input[name="receipt"]', receipt);
  await page.waitForTimeout(400);
  await page.click('button:has-text("Submit for verification")');
  await page.waitForURL(/\/checkout\/success/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-13-checkout-success', {
    title: 'Payment Under Review Page',
    summary:
      'Confirmation that the receipt was received and is queued for admin verification (typically within 12 hours).',
    youSee: [
      "A reassurance message",
      "Buttons to view the dashboard or chat with support",
    ],
    youCan: ['Wait for admin verification', 'Go straight to the dashboard'],
  });

  /* ========== DIPLOMA ========== */
  await page.goto(FRONTEND + '/diploma');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-14-diploma-listing', {
    title: 'Diploma Catalogue',
    summary:
      'Page 4. Specialised psychology diplomas, each ending in a physically couriered certificate. The dark "Manual Certificate Workflow" strip below explains the four-step printing process.',
    youSee: ['A grid of diploma course cards', 'A 4-step Manual Certificate Workflow strip'],
    youCan: ['Buy a diploma the same way as academy courses'],
  });

  await page.goto(FRONTEND + '/diploma/courses/diploma-cbt-foundations');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-15-diploma-detail', {
    title: 'Diploma Course Detail',
    summary:
      'Same layout as academy course detail, plus a coral "Hardcopy certificate couriered to your door" highlight box.',
    youSee: [
      'Pricing card with the longer validity window (typically 6 months)',
      'A clear notice that no PDF is auto-generated — admin prints and ships the certificate manually',
    ],
    youCan: ['Buy the diploma', 'Read the curriculum'],
  });

  /* ========== STUDENT DASHBOARD ========== */
  /* Need an active purchase to show the dashboard fully. Approve via admin then come back. */
  const adminCtx = await browser.newContext({ viewport: VIEWPORT });
  const admin = await adminCtx.newPage();
  await admin.goto(FRONTEND + '/login');
  await admin.fill('input[name="email"]', ADMIN_EMAIL);
  await admin.fill('input[name="password"]', ADMIN_PASSWORD);
  await admin.click('button:has-text("Sign in")');
  await admin.waitForURL(/\/admin/, { timeout: 15_000 });
  await admin.goto(FRONTEND + '/admin/purchases?status=pending_verification');
  await admin.waitForLoadState('networkidle');
  const row = admin.locator(`tr:has-text("${DEMO.name}")`).first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await admin.waitForSelector('button:has-text("Approve & unlock")', { timeout: 10_000 });
    await admin.click('button:has-text("Approve & unlock")');
    await admin.waitForTimeout(800);
  }

  await page.goto(FRONTEND + '/dashboard');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-16-student-dashboard', {
    title: 'Student Dashboard',
    summary:
      'Each active enrolment shows as a card with the days-remaining countdown. Pending purchases show a "Locked while we verify" pill.',
    youSee: [
      "Greeting with the student's name",
      "Stat tiles (Active / Pending / Total)",
      "Active course cards with Enter course CTA",
    ],
    youCan: [
      'Click Enter course to open the curriculum',
      "See which courses are pending verification or expired",
    ],
  });

  await page.click('a:has-text("Enter course")');
  await page.waitForURL(/\/dashboard\/courses\//, { timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-17-curriculum', {
    title: 'Course Curriculum (Student view)',
    summary:
      'Inside the course. Modules → lessons tree. Each lesson is clickable. Top-right shows days remaining and a live progress bar.',
    youSee: [
      'Days remaining + progress percentage',
      'A list of modules each containing lessons',
      'A green tick next to lessons the student has completed',
    ],
    youCan: ['Click any lesson to open the video player'],
  });

  const lessonLink = page.locator('li a[href*="/lessons/"]').first();
  if (await lessonLink.isVisible().catch(() => false)) {
    await lessonLink.click();
    await page.waitForURL(/\/lessons\//, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await shot(page, 'public-18-lesson-player', {
      title: 'Secure Video Player',
      summary:
        "Where the actual learning happens. Videos stream through a signed JWT proxy — the source URL never reaches the browser. The student's phone + email drift across the screen as a watermark every ~6.5 seconds.",
      youSee: [
        'HTML5 video with native controls, right-click disabled',
        'Floating watermark with the user\'s phone + email at low opacity',
        'Speed control (0.5×–2×) and quality selector below',
      ],
      youCan: [
        'Watch the lesson',
        'Mark as complete to update progress',
        'Use Prev / Next buttons to navigate the course',
      ],
    });
  }

  /* ========== AUTH PAGES ========== */
  await ctx.clearCookies();
  await page.goto(FRONTEND + '/login');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-19-login', {
    title: 'Sign-in Page',
    summary:
      'Standard email + password sign-in. The Forgot password? link is visible directly under the password field.',
    youSee: ['Email + password fields', 'Forgot password? link', 'Create an account link'],
    youCan: ['Sign in', 'Reset a forgotten password'],
  });

  await page.goto(FRONTEND + '/forgot-password');
  await page.waitForLoadState('networkidle');
  await shot(page, 'public-20-forgot-password', {
    title: 'Forgot Password Page',
    summary:
      'The student enters their email and a one-time reset link is generated. Phase 5 will deliver it via Resend email; right now a dev link is shown on the next screen.',
    youSee: ['Single email field', 'Note that the link arrives by email within minutes'],
    youCan: ['Request a reset link'],
  });

  /* Legal pages */
  for (const [slug, title] of [
    ['about', 'About Page'],
    ['contact', 'Contact Page'],
    ['privacy', 'Privacy Policy'],
    ['terms', 'Terms & Conditions'],
    ['refund', 'Refund & Cancellation'],
  ]) {
    await page.goto(FRONTEND + '/' + slug);
    await page.waitForLoadState('networkidle');
    await shot(page, `public-21-${slug}`, {
      title,
      summary:
        slug === 'contact'
          ? 'Phone / WhatsApp / Email tiles + registered office card and a Google Maps placeholder.'
          : `Foundation ${title}. Currently a working-draft template; the final legally vetted copy lands at launch.`,
      youSee: [
        'Hero with eyebrow + headline',
        slug === 'contact' ? 'Three contact tiles' : 'Numbered policy sections',
        'A Phone + Email contact strip at the bottom',
      ],
      youCan: [
        slug === 'contact'
          ? 'Reach the team via any channel'
          : 'Read the relevant policy section by section',
      ],
    });
  }

  /* Cleanup demo user */
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifest.length} public screens to ${OUT_DIR}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
