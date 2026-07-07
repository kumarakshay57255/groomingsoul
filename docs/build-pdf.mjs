/**
 * Renders a polished HTML walk-through using the captured screenshots and
 * uses Playwright's chromium to print it to a single PDF.
 *
 *   cd docs && npm run build
 *
 * Output: docs/grooming-souls-flow.pdf
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('./');
const MANIFEST = path.resolve('./screenshots/manifest.json');
const OUT_HTML = path.resolve('./flow.html');
const OUT_PDF = path.resolve('./grooming-souls-flow.pdf');

const COPY = {
  '01-homepage': {
    h: 'Public marketing site',
    body:
      "The public-facing homepage at <code>/</code>. Hero, trust badges, founder profile, " +
      'core team, advisory panel, and stats are all rendered from live Postgres data — ' +
      'the admin team can edit any of it from the CMS without code changes.',
  },
  '02-diploma-listing': {
    h: 'Diploma catalogue (Page 4)',
    body:
      'Specialised psychology diplomas, each with strict time-bound access. The dark "Manual ' +
      'Certificate Workflow" section below this listing explains the hardcopy promise to students.',
  },
  '03-diploma-detail': {
    h: 'Diploma detail page',
    body:
      'Curriculum tree, validity badge, instructor, and the prominent <em>"Buy now"</em> ' +
      'CTA. The cert-by-courier promise is highlighted in coral so it can never be missed.',
  },
  '04-signup-filled': {
    h: 'Sign-up — Indian mobile validation',
    body:
      'When the visitor clicks <em>Buy now</em> while signed out, they\'re routed through a ' +
      'sign-in / sign-up flow that <strong>remembers the course they wanted</strong>. ' +
      'The 10-digit Indian mobile validator runs both client- and server-side; the phone is ' +
      'normalised to <code>+91XXXXXXXXXX</code> for storage.',
  },
  '05-checkout-modal': {
    h: 'Manual QR-payment modal',
    body:
      'After signup the student is auto-redirected back to the course with the manual QR ' +
      'checkout modal pre-opened. The official Grooming Souls QR appears on the left, the ' +
      'receipt-upload form on the right with their name + email + phone pre-filled.',
  },
  '06-receipt-attached': {
    h: 'Receipt screenshot attached',
    body:
      'Student picks any payment screenshot from disk. Live preview, file size, and replace ' +
      'button. <code>multer</code> enforces JPG/PNG/WebP only and a 5 MB cap.',
  },
  '07-checkout-pending': {
    h: '"Payment under review"',
    body:
      'On submit, the purchase row is created with <code>status = pending_verification</code>. ' +
      'The student lands on this confirmation page; nothing is unlocked until an admin verifies ' +
      'the receipt.',
  },
  '08-admin-dashboard': {
    h: 'Admin operations console',
    body:
      'Admin sign-in lands here. Realtime KPI tiles — receipts to verify, today\'s leads, ' +
      'certificates to dispatch, revenue last 30 days. Each clickable tile drills into the ' +
      'relevant queue with the right filter pre-applied.',
  },
  '09-purchases-pending': {
    h: 'Receipt verification queue',
    body:
      'Every Buy Now lands here. Receipts shown as inline thumbnails so the admin can scan ' +
      'down the list at a glance. Status pills filter the view; full-text search across payer ' +
      'name / email / phone / course title.',
  },
  '10-receipt-drawer': {
    h: 'Receipt verification drawer',
    body:
      'Click any row → full-size receipt preview, tap-to-call / tap-to-email recipient info, ' +
      'and a free-form admin note. The 90-day validity window comes from the course definition; ' +
      'the admin can\'t accidentally change it here.',
  },
  '11-receipt-approved': {
    h: 'Approve & unlock',
    body:
      'On <strong>Approve</strong>, the server sets <code>status = active</code>, stamps ' +
      '<code>activatedAt = NOW()</code>, and computes <code>expiresAt = activatedAt + course.validityDays</code>. ' +
      'The student\'s dashboard reflects this instantly.',
  },
  '12-student-dashboard': {
    h: 'Student dashboard (after approval)',
    body:
      'The student sees the course as Active with a real-time countdown chip. If less than ' +
      '7 days remain it flips to <em>Renew soon</em>; minutes-level granularity for last-day cases.',
  },
  '13-curriculum': {
    h: 'Curriculum view',
    body:
      'Click <em>Enter course</em> → the full curriculum tree. Each lesson shows duration; ' +
      'completion ticks light up as the student works through the course.',
  },
  '14-lesson-player': {
    h: 'Secure video player',
    body:
      'HTML5 video served via a signed <code>/api/stream/&lt;JWT&gt;</code> proxy — the real ' +
      'source URL is never sent to the browser. <strong>Floating watermark</strong> overlays the ' +
      'student\'s phone + email at random positions every 6.5 seconds. Speed control 0.5×–2×, ' +
      'quality selector (auto-detected resolution), and download/right-click are blocked.',
  },
  '15-final-completion': {
    h: 'Final lesson — cert queued',
    body:
      'Marking the final lesson of a <strong>diploma</strong> auto-inserts a row into ' +
      '<code>certificate_queue</code> server-side. The student sees the green toast confirming ' +
      'their hardcopy certificate is in the dispatch line.',
  },
  '16-curriculum-complete': {
    h: 'Curriculum at 100 %',
    body:
      'All three lessons green-ticked, progress bar full. The expiry countdown still runs in the ' +
      'top right — completion doesn\'t reset the clock.',
  },
  '17-cert-queue': {
    h: 'Certificate dispatch queue',
    body:
      'Admin → <em>Certificate queue</em>. The student\'s row appears automatically — no manual ' +
      'data entry. Status pills (Queued · Printed · Dispatched · Delivered) drive both the ' +
      'filter and the per-row workflow.',
  },
  '18-cert-drawer': {
    h: 'Dispatch drawer',
    body:
      'Click the row → drawer with recipient phone + email (copy-to-clipboard), shipping address ' +
      'textarea, courier tracking input, and a Printed → Dispatched → Delivered three-button workflow.',
  },
  '19-cert-dispatched': {
    h: 'Marked Dispatched',
    body:
      'Admin fills the address + tracking ID and clicks <strong>Dispatched</strong>. The server ' +
      'stamps <code>dispatchedAt</code> and saves the tracking ID. In Phase 5 a Resend email and ' +
      'MSG91 SMS will go out to the student with the courier link.',
  },
};

async function build() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));

  const sections = manifest
    .map((m, idx) => {
      const copy = COPY[m.slug] ?? { h: m.slug, body: m.narration };
      return `
        <section class="step">
          <div class="step-head">
            <span class="step-num">${String(idx + 1).padStart(2, '0')}</span>
            <h2>${copy.h}</h2>
          </div>
          <p class="step-body">${copy.body}</p>
          <img src="${m.file}" alt="${copy.h}" />
        </section>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Grooming Souls — Student → Certificate Flow</title>
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: #2A2520;
      background: #FBF7EE;
      line-height: 1.55;
      font-size: 11pt;
    }
    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 90vh;
      padding: 30mm 14mm;
      background: linear-gradient(160deg, #FBF7EE 0%, #F4ECDB 100%);
      text-align: left;
    }
    .cover .eyebrow {
      font-size: 9pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #7A8B5A;
    }
    .cover h1 {
      font-family: Georgia, 'Cormorant Garamond', serif;
      font-size: 42pt;
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: #5C3A2E;
      margin: 12mm 0 8mm 0;
      max-width: 160mm;
    }
    .cover p {
      font-size: 12pt;
      max-width: 150mm;
      color: #574B40;
    }
    .meta {
      margin-top: 18mm;
      border-top: 1px solid #E9E1CE;
      padding-top: 6mm;
      font-size: 9pt;
      color: #574B40;
    }
    .meta strong { color: #5C3A2E; }
    .toc {
      page-break-after: always;
      padding-top: 4mm;
    }
    .toc h2 {
      font-family: Georgia, serif;
      font-size: 18pt;
      color: #5C3A2E;
      margin: 0 0 8mm 0;
    }
    .toc ol {
      list-style: none;
      padding: 0;
      counter-reset: step;
    }
    .toc li {
      counter-increment: step;
      padding: 3mm 0;
      border-bottom: 1px solid #E9E1CE;
      display: flex;
      gap: 4mm;
      font-size: 10pt;
      color: #2A2520;
    }
    .toc li::before {
      content: counter(step, decimal-leading-zero);
      color: #7A8B5A;
      font-variant-numeric: tabular-nums;
    }
    .step {
      page-break-inside: avoid;
      page-break-after: always;
      padding-top: 2mm;
    }
    .step:last-of-type { page-break-after: auto; }
    .step-head { display: flex; align-items: baseline; gap: 5mm; }
    .step-num {
      font-family: Georgia, serif;
      font-size: 14pt;
      color: #7A8B5A;
      letter-spacing: 0.04em;
    }
    .step h2 {
      font-family: Georgia, serif;
      color: #5C3A2E;
      font-size: 18pt;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .step-body {
      margin: 2mm 0 5mm 0;
      max-width: 175mm;
      color: #574B40;
    }
    .step img {
      width: 100%;
      max-height: 130mm;
      object-fit: contain;
      border: 1px solid #E9E1CE;
      border-radius: 3mm;
      background: #FFF;
      display: block;
    }
    code {
      background: rgba(63, 95, 138, 0.10);
      border-radius: 3px;
      padding: 0 4px;
      font-family: 'JetBrains Mono', Menlo, monospace;
      font-size: 9.5pt;
      color: #2D4868;
    }
    strong { color: #5C3A2E; }
  </style>
</head>
<body>
  <section class="cover">
    <div class="eyebrow">Grooming Souls Mental Health & Welfare</div>
    <h1>Student → Hardcopy<br>Certificate Flow</h1>
    <p>
      A nineteen-step walkthrough captured directly from the live Grooming Souls platform —
      from a brand-new visitor on the marketing site, through the manual QR-checkout,
      receipt verification, secure lesson streaming, to the admin marking a physical
      certificate for dispatch.
    </p>
    <div class="meta">
      Generated automatically on <strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> ·
      Demo user: <strong>Demo Student</strong> · Course: <strong>Diploma in Trauma-Informed Care</strong>
    </div>
  </section>

  <section class="toc">
    <h2>What this document covers</h2>
    <ol>
      ${manifest
        .map((m) => {
          const c = COPY[m.slug] ?? { h: m.slug };
          return `<li><span>${c.h}</span></li>`;
        })
        .join('\n      ')}
    </ol>
  </section>

  ${sections}
</body>
</html>`;

  await fs.writeFile(OUT_HTML, html);
  console.log(`Wrote HTML: ${OUT_HTML}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + OUT_HTML);
  await page.waitForLoadState('networkidle');
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
  });
  await browser.close();

  const size = (await fs.stat(OUT_PDF)).size;
  console.log(
    `Wrote PDF: ${OUT_PDF}  (${(size / 1024).toFixed(0)} KB · ${manifest.length} steps)`
  );
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
