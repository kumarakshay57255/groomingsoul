/**
 * Captures every ADMIN screen + modal + drawer of the Grooming Souls platform.
 *   cd docs && node capture-admin.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const FRONTEND = 'http://localhost:4321';
const OUT_DIR = path.resolve('./screenshots-admin');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

const ADMIN_EMAIL = 'grooming@admin.com';
const ADMIN_PASSWORD = 'grooming@admin';

const VIEWPORT = { width: 1440, height: 900 };

const manifest = [];
function record(slug, narration) {
  manifest.push({ slug, file: `screenshots-admin/${slug}.png`, ...narration });
}
async function shot(page, slug, narration) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT_DIR, `${slug}.png`), fullPage: false });
  record(slug, narration);
  console.log('  ✓ ' + slug);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const f of await fs.readdir(OUT_DIR)) {
    if (f.endsWith('.png')) await fs.unlink(path.join(OUT_DIR, f));
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  /* Sign in */
  await page.goto(FRONTEND + '/login');
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');

  /* ========== Dashboard ========== */
  await shot(page, 'admin-01-dashboard', {
    title: 'Admin Dashboard (KPIs)',
    summary:
      'Realtime overview the moment an admin signs in. Three blocks: urgent action queue, foundation health, catalogue. Recent leads + purchases at the bottom.',
    youSee: [
      'Receipts to verify · New therapy leads today · Tests pending review · Certificates to dispatch',
      'Active enrolments, expiring soon, total students, revenue last 30 days',
      'Published courses count, diplomas count, quick-action shortcuts',
      'Two recent-activity panels (latest leads + latest purchases)',
    ],
    youCan: [
      'Click any KPI tile to drill into the filtered manager',
      'Refresh stats',
    ],
  });

  /* ========== Therapists ========== */
  await page.goto(FRONTEND + '/admin/therapists');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-02-therapists-list', {
    title: 'Therapists Directory',
    summary:
      'Live data behind the public /therapy page. Add, edit, archive, restore therapists. Photo upload + specialisation chips supported.',
    youSee: [
      'Search bar and "Show archived" toggle',
      'Table: photo, name, designation, experience, specialisation chips, status (Accepting / Waitlist / Archived)',
      'Action icons: View on site, Edit, Archive/Restore',
    ],
    youCan: [
      'Click New therapist to add a member with photo + bio + chips',
      "Toggle 'Accepting new clients' to flip a card to Waitlist on the public site",
      'Archive removes from public listings without losing data',
    ],
  });

  /* Open editor modal */
  await page.click('button:has-text("New therapist")');
  await page.waitForSelector('text=Add to the directory', { timeout: 5000 });
  await page.waitForTimeout(400);
  await shot(page, 'admin-03-therapist-editor', {
    title: 'Therapist Editor Modal',
    summary: 'Full editor for a therapist row. Same form for creating + editing.',
    youSee: [
      'Square photo uploader on the left with live preview',
      'Name, designation, years of experience, languages (CSV), specialisation chips (multi-select)',
      'Bio textarea, Position number (for grid order), Accepting toggle',
    ],
    youCan: [
      'Upload a JPG/PNG/WebP photo (server stores it and unlinks on replace)',
      'Toggle specialisation chips on/off',
      'Set Accepting new clients to false to show Waitlist badge publicly',
    ],
  });
  await page.keyboard.press('Escape');

  /* ========== Team ========== */
  await page.goto(FRONTEND + '/admin/team');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-04-team-list', {
    title: 'Core Team & Founder',
    summary:
      'Two sections in one screen: a top editorial card to edit Founder message + Vision + Mission, and a list of team members below.',
    youSee: [
      'Foundation editorial card (Founder message, signature, Vision, Mission)',
      'Search, Show archived, New member',
      'Table with crown icon for the Founder row, role, position, status',
    ],
    youCan: [
      "Edit the Founder's published message and vision/mission inline (Save content)",
      'Add team members; mark exactly one as Founder',
      'Founder row is delete-protected (lock icon instead of trash)',
    ],
  });

  /* Open team viewer + editor — open the first row */
  const teamRow = page.locator('tbody tr').first();
  await teamRow.locator('button[aria-label="View"]').click();
  await page.waitForSelector('text=Edit member', { timeout: 5000 });
  await page.waitForTimeout(400);
  await shot(page, 'admin-05-team-viewer', {
    title: 'Team Member Viewer Modal',
    summary:
      'Read-only preview of a team member exactly as the homepage will render them. Includes timestamps, photo path, and an Edit shortcut.',
    youSee: [
      "Photo banner + name + role",
      "Bio, position, created and updated timestamps",
      "Edit + Close buttons",
    ],
    youCan: ['Open the editor from here', 'Verify data before publishing'],
  });
  await page.keyboard.press('Escape');

  /* ========== Advisory ========== */
  await page.goto(FRONTEND + '/admin/advisory');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-06-advisory-list', {
    title: 'Advisory Panel',
    summary:
      "Senior psychologists and doctors backing the foundation. Drives the dark 'wall of trust' section on the homepage.",
    youSee: ['Table of advisors (name, qualification, position, status)', 'View / Edit / Delete icons per row'],
    youCan: ['Add an advisor with their photo + qualification', 'Archive to hide from public site'],
  });

  /* ========== Courses ========== */
  await page.goto(FRONTEND + '/admin/courses');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-07-courses-list', {
    title: 'Courses & Lessons — Catalogue',
    summary:
      'Both Academy and Diploma courses in one table. Filter by type or category; bulk edit not needed because per-course editing is fast.',
    youSee: [
      'Filters: type (all / Academy / Diploma) and category',
      'Table with cover-colour swatch, slug, category badge, price, validity, publish state',
      'View / Edit / Delete actions per row',
    ],
    youCan: [
      'Filter to a category before working',
      'Click New course to create a fresh row',
      'Delete a course — blocked with helpful message if it has active purchases',
    ],
  });

  /* Course editor */
  const editRow = page.locator('button[aria-label="Edit course + lessons"]').first();
  if (await editRow.isVisible().catch(() => false)) {
    await editRow.click();
    await page.waitForURL(/\/admin\/courses\//);
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-08-course-editor', {
      title: 'Course Editor — Metadata + Curriculum',
      summary:
        'A single page handles metadata (top card) and the full module + lesson curriculum (bottom). Lesson rows show whether the video file is present.',
      youSee: [
        'Form: title, slug, instructor, category, price, validity, hours, cover colour, description, publish toggle',
        "Curriculum section with 'New module' button",
        'Per-module list of lessons with green check (has video) or sun pill (no video yet)',
      ],
      youCan: [
        "Edit any metadata field and click Save changes",
        'Add / rename / delete modules',
        'Add / edit / delete lessons (opens lesson modal with drag-drop upload)',
      ],
    });

    /* Open lesson editor modal */
    const lessonAdd = page.locator('button:has-text("Lesson")').first();
    if (await lessonAdd.isVisible().catch(() => false)) {
      await lessonAdd.click();
      await page.waitForSelector('text=Add a lesson', { timeout: 5000 });
      await page.waitForTimeout(400);
      await shot(page, 'admin-09-lesson-modal', {
        title: 'Lesson Editor — Drag-Drop Video Upload',
        summary:
          'The single most used admin form. Title + description + duration + position, plus a drag-drop video uploader with live progress bar.',
        youSee: [
          'Title, Description, Duration (seconds), Position fields',
          "Large 'Drag & drop or click to upload' zone (MP4 / WebM / MOV, 1 GB cap)",
          'Progress bar appears once a file starts uploading',
        ],
        youCan: [
          'Drop an MP4 from Finder/Explorer straight into the zone',
          'Replace an existing video or remove it entirely',
          'Save without a video (lesson is added but locked until video uploaded)',
        ],
      });
      await page.keyboard.press('Escape');
    }
  }

  /* ========== Therapy Leads ========== */
  await page.goto(FRONTEND + '/admin/leads');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-10-leads-list', {
    title: 'Therapy Leads CRM',
    summary:
      "Every booking from the /therapy page lands here. Sorted by newest first. Status pills filter the view (New / Contacted / Scheduled / Closed).",
    youSee: [
      'Status pills with live counts',
      'Search across name, email, phone, therapist',
      'Table: client + age, contact, therapist, slot, status, received time',
    ],
    youCan: ['Click any row to open the side drawer with full details', 'Filter by status / search'],
  });

  /* Open lead drawer */
  const leadRow = page.locator('tbody tr').first();
  if (await leadRow.isVisible().catch(() => false)) {
    await leadRow.click();
    await page.waitForSelector('text=Therapy lead', { timeout: 5000 });
    await page.waitForTimeout(400);
    await shot(page, 'admin-11-lead-drawer', {
      title: 'Lead Drawer (right-hand panel)',
      summary:
        "Full lead detail. Tap-to-call phone, tap-to-email, copy-to-clipboard chips on contact info, status dropdown, internal notes textarea, delete button.",
      youSee: [
        'Age, phone, email, slot, therapist requested',
        'Status dropdown',
        'Internal notes textarea',
        'Delete + Save buttons',
      ],
      youCan: [
        'Update lead status as you progress the conversation',
        'Capture notes from your phone call',
        'Click the phone to dial directly from your computer',
      ],
    });
    await page.keyboard.press('Escape');
  }

  /* ========== Test submissions ========== */
  await page.goto(FRONTEND + '/admin/tests');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-12-tests-list', {
    title: 'Test Submissions Inbox',
    summary:
      "Every psychometric test submission lands here. Filter by test or by review status.",
    youSee: [
      'Test filter dropdown + Pending / In review / Completed pills',
      'Table: client, test name, answer count, status, received time',
    ],
    youCan: ['Open any row to read each answer with the matching question text'],
  });

  /* Open a submission detail */
  const subOpen = page.locator('a:has-text("Open")').first();
  if (await subOpen.isVisible().catch(() => false)) {
    await subOpen.click();
    await page.waitForLoadState('networkidle');
    await shot(page, 'admin-13-submission-detail', {
      title: 'Submission Detail — Q&A with Scoring Summary',
      summary:
        "Per-question answers rendered properly: Likert numbers get their scale label, MCQ letters get the full option text, free-text answers preserve line breaks.",
      youSee: [
        "Left rail with client contact info, review-status dropdown, internal summary textarea",
        "Right column with every question + its answer block (Likert / MCQ / Text)",
      ],
      youCan: [
        'Type the clinical summary and mark Completed',
        'Copy phone or email to follow up',
        'Delete the submission if needed',
      ],
    });
  }

  /* ========== Purchases ========== */
  await page.goto(FRONTEND + '/admin/purchases');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-14-purchases-list', {
    title: 'Purchases & Receipts',
    summary:
      "Verification queue for the manual QR-checkout flow. Each row shows a thumbnail of the uploaded receipt.",
    youSee: [
      'Status pills (Pending / Active / Expired / Rejected) with counts',
      'Table: receipt thumb, payer, course, amount, status, received time',
    ],
    youCan: [
      'Click any row to inspect the full-size receipt',
      'Approve to start the validity window',
      'Reject with a note that explains why',
    ],
  });

  /* Open a purchase drawer if any pending */
  const pRow = page.locator('tbody tr').first();
  if (await pRow.isVisible().catch(() => false)) {
    await pRow.click();
    await page.waitForSelector('text=Receipt verification', { timeout: 5000 });
    await page.waitForTimeout(400);
    await shot(page, 'admin-15-purchase-drawer', {
      title: 'Receipt Verification Drawer',
      summary:
        "Full-size receipt + payer contact + admin note. Approve sets activated/expires timestamps; Reject saves a reason.",
      youSee: [
        "Receipt preview, click to open in a new tab",
        "Payer email + phone with copy buttons",
        "Validity badge from the course definition",
        "Approve & unlock + Reject buttons (only shown when status is Pending)",
      ],
      youCan: [
        "Compare the receipt against the course price visually",
        "Approve to instantly unlock the course for the student",
        "Reject with a note explaining why",
      ],
    });
    await page.keyboard.press('Escape');
  }

  /* ========== Certificates ========== */
  await page.goto(FRONTEND + '/admin/certificates');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-16-certificates-list', {
    title: 'Certificate Dispatch Queue',
    summary:
      "When a student hits 100% on a diploma, a row appears here automatically. Move it through Printed → Dispatched → Delivered.",
    youSee: [
      'Status pills (Queued / Printed / Dispatched / Delivered) with counts',
      'Search across student, course, tracking ID',
      'Table: student, course, status, tracking, queued time',
    ],
    youCan: ['Click any row to open the dispatch drawer', 'Filter to a particular status step'],
  });

  /* ========== Staff ========== */
  await page.goto(FRONTEND + '/admin/staff');
  await page.waitForLoadState('networkidle');
  await shot(page, 'admin-17-staff-list', {
    title: 'Staff & Roles',
    summary:
      "Add, edit, deactivate, or delete admin/intern accounts. Strict self-protection prevents an admin from accidentally locking themselves out.",
    youSee: [
      'Search, role filter (Admin / Intern)',
      "Table with 'You' badge on your own row",
      'Role dropdown inline, status pill, Edit / Pause / Delete icons',
    ],
    youCan: [
      'Invite by email — system generates a one-time temporary password',
      'Promote intern → admin via dropdown',
      'Deactivate to revoke login + sessions instantly',
      'Delete a staff account (blocked for self or last admin)',
    ],
  });

  /* Open invite modal */
  await page.click('button:has-text("Invite staff")');
  await page.waitForSelector('text=Add admin or intern', { timeout: 5000 });
  await page.waitForTimeout(400);
  await shot(page, 'admin-18-staff-invite', {
    title: 'Invite Staff Modal',
    summary:
      "Creates a new admin or intern account. A random 10-char temp password is shown on screen so you can share it manually until Phase 5 wires up email delivery.",
    youSee: [
      'Name, email, contact number (10-digit Indian validation), role dropdown',
      'A yellow help banner explaining the temp-password flow',
    ],
    youCan: ['Issue a new staff account in seconds'],
  });

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifest.length} admin screens to ${OUT_DIR}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
