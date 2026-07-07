/**
 * Builds a polished PDF "handbook" from a screenshot manifest. Reused for
 * both the Public/Student handbook and the Admin handbook.
 *
 * Usage:
 *   node build-handbook.mjs public
 *   node build-handbook.mjs admin
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('./');

const PROFILES = {
  public: {
    manifest: 'screenshots-public/manifest.json',
    outHtml: 'handbook-public.html',
    outPdf: 'grooming-souls-website-handbook.pdf',
    eyebrow: 'Public Site + Student Handbook',
    title: 'How the Grooming Souls website works',
    intro:
      "A page-by-page tour of everything a visitor or student sees — from the homepage to taking a psychometric test, buying a course, and watching a lesson. Written for non-technical readers — no engineering knowledge required.",
    audience: 'Operations & non-technical readers',
  },
  admin: {
    manifest: 'screenshots-admin/manifest.json',
    outHtml: 'handbook-admin.html',
    outPdf: 'grooming-souls-admin-handbook.pdf',
    eyebrow: 'Admin Console Handbook',
    title: 'Running Grooming Souls from the Admin panel',
    intro:
      "Every page of the admin console explained, with the actions each role can perform. Use this as a quick reference when onboarding a new admin or intern.",
    audience: 'Foundation staff — admins, interns, dispatch team',
  },
};

async function build(profileKey) {
  const profile = PROFILES[profileKey];
  if (!profile) throw new Error(`Unknown profile '${profileKey}'`);

  const manifest = JSON.parse(
    await fs.readFile(path.resolve(profile.manifest), 'utf8')
  );

  /* Each section uses absolute file:// paths so chromium prints them. */
  const sections = manifest
    .map((m, i) => {
      const youSeeList = (m.youSee ?? []).map((x) => `<li>${x}</li>`).join('');
      const youCanList = (m.youCan ?? []).map((x) => `<li>${x}</li>`).join('');
      return `
        <section class="screen">
          <div class="screen-head">
            <span class="screen-num">${String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2>${m.title ?? m.slug}</h2>
              <p class="summary">${m.summary ?? ''}</p>
            </div>
          </div>
          <img src="${m.file}" alt="${m.title ?? m.slug}" />
          <div class="kv">
            ${
              youSeeList
                ? `<div><h3>What you see</h3><ul>${youSeeList}</ul></div>`
                : ''
            }
            ${
              youCanList
                ? `<div><h3>What you can do</h3><ul>${youCanList}</ul></div>`
                : ''
            }
          </div>
        </section>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${profile.title}</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: #2A2520;
    background: #FBF7EE;
    line-height: 1.55;
    font-size: 10.5pt;
  }
  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 90vh;
    padding: 30mm 14mm;
    background: linear-gradient(160deg, #FBF7EE 0%, #F4ECDB 100%);
  }
  .cover .eyebrow {
    font-size: 9pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7A8B5A;
  }
  .cover h1 {
    font-family: Georgia, 'Cormorant Garamond', serif;
    font-size: 36pt;
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: #5C3A2E;
    margin: 10mm 0 6mm 0;
    max-width: 170mm;
  }
  .cover p { font-size: 11.5pt; max-width: 160mm; color: #574B40; }
  .meta {
    margin-top: 16mm;
    border-top: 1px solid #E9E1CE;
    padding-top: 5mm;
    font-size: 9pt;
    color: #574B40;
  }
  .meta strong { color: #5C3A2E; }
  .toc { page-break-after: always; padding-top: 4mm; }
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
    padding: 2.5mm 0;
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
    min-width: 8mm;
  }

  .screen {
    page-break-inside: avoid;
    page-break-after: always;
    padding-top: 2mm;
  }
  .screen:last-of-type { page-break-after: auto; }
  .screen-head {
    display: flex;
    align-items: flex-start;
    gap: 6mm;
    margin-bottom: 4mm;
  }
  .screen-num {
    font-family: Georgia, serif;
    font-size: 16pt;
    color: #7A8B5A;
    letter-spacing: 0.04em;
    min-width: 12mm;
    padding-top: 1mm;
  }
  .screen h2 {
    font-family: Georgia, serif;
    color: #5C3A2E;
    font-size: 17pt;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .screen .summary {
    margin: 1.5mm 0 0 0;
    color: #574B40;
    font-size: 10.5pt;
    max-width: 170mm;
  }
  .screen img {
    width: 100%;
    max-height: 110mm;
    object-fit: contain;
    border: 1px solid #E9E1CE;
    border-radius: 3mm;
    background: #FFF;
    display: block;
    margin-bottom: 4mm;
  }
  .kv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5mm;
  }
  .kv h3 {
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 7.5pt;
    color: #7A8B5A;
    margin: 0 0 2mm 0;
  }
  .kv ul {
    margin: 0;
    padding-left: 4mm;
  }
  .kv li {
    font-size: 9.8pt;
    color: #2A2520;
    margin-bottom: 1.2mm;
    line-height: 1.45;
  }
  code {
    background: rgba(63, 95, 138, 0.10);
    border-radius: 3px;
    padding: 0 4px;
    font-family: 'JetBrains Mono', Menlo, monospace;
    font-size: 9pt;
    color: #2D4868;
  }
  strong { color: #5C3A2E; }
</style>
</head>
<body>
  <section class="cover">
    <div class="eyebrow">Grooming Souls Mental Health &amp; Welfare · ${profile.eyebrow}</div>
    <h1>${profile.title}</h1>
    <p>${profile.intro}</p>
    <div class="meta">
      Generated automatically on <strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
      ·  Audience: <strong>${profile.audience}</strong>
      ·  ${manifest.length} screens covered
    </div>
  </section>

  <section class="toc">
    <h2>Contents</h2>
    <ol>
      ${manifest.map((m) => `<li>${m.title ?? m.slug}</li>`).join('\n      ')}
    </ol>
  </section>

  ${sections}
</body>
</html>`;

  const htmlPath = path.resolve(profile.outHtml);
  await fs.writeFile(htmlPath, html);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath);
  await page.waitForLoadState('networkidle');
  await page.emulateMedia({ media: 'print' });
  const pdfPath = path.resolve(profile.outPdf);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
  });
  await browser.close();

  const size = (await fs.stat(pdfPath)).size;
  console.log(
    `→ ${profile.outPdf}  (${(size / 1024 / 1024).toFixed(2)} MB · ${manifest.length} screens)`
  );
}

const which = process.argv[2];
if (!which) {
  console.log('Building BOTH handbooks…\n');
  await build('public');
  await build('admin');
} else {
  await build(which);
}
