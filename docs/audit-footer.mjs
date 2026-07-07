/**
 * Walks every footer link on /, /therapy, /academy, /diploma, /dashboard and
 * /admin and reports their status.
 *
 *   cd docs && node audit-footer.mjs
 */
import { chromium } from 'playwright';

const FRONTEND = 'http://localhost:4321';

const PAGES = [
  '/',
  '/therapy',
  '/therapy/tests',
  '/academy',
  '/diploma',
  '/dashboard',
  '/login',
  '/signup',
];

function color(c, s) {
  const codes = { red: 31, green: 32, yellow: 33, dim: 2, bold: 1 };
  return `\x1b[${codes[c]}m${s}\x1b[0m`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* Aggregate { href -> [{from, label}] } across pages */
  const linkMap = new Map();

  for (const path of PAGES) {
    try {
      const resp = await page.goto(FRONTEND + path, {
        waitUntil: 'networkidle',
        timeout: 20_000,
      });
      if (!resp || resp.status() >= 400) {
        console.log(color('yellow', `↳ ${path} returned ${resp?.status()}, skipping link extraction`));
        continue;
      }
      const links = await page.$$eval('footer a', (els) =>
        els.map((a) => ({
          href: a.getAttribute('href'),
          label: a.textContent?.trim() || '',
          rel: a.getAttribute('rel') || '',
          target: a.getAttribute('target') || '',
        }))
      );
      for (const l of links) {
        if (!l.href) continue;
        const key = l.href;
        if (!linkMap.has(key)) linkMap.set(key, { ...l, from: [] });
        linkMap.get(key).from.push(path);
      }
    } catch (err) {
      console.log(color('yellow', `↳ ${path} could not load: ${err.message}`));
    }
  }

  console.log(color('bold', `\nFound ${linkMap.size} unique footer hrefs across ${PAGES.length} pages.`));
  console.log('Verifying each…\n');

  const buckets = { ok: [], anchor: [], external: [], scheme: [], broken: [], placeholder: [] };

  for (const [href, info] of linkMap) {
    if (href.startsWith('#')) {
      buckets.anchor.push({ href, info });
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      buckets.scheme.push({ href, info });
      continue;
    }
    if (href === '#' || href === '#none' || href === 'javascript:void(0)') {
      buckets.placeholder.push({ href, info });
      continue;
    }
    if (/^https?:\/\//.test(href) && !href.startsWith(FRONTEND)) {
      buckets.external.push({ href, info });
      continue;
    }

    /* Internal route — fetch it */
    let url = href;
    if (href.startsWith('/')) url = FRONTEND + href;
    /* Strip hash for HTTP test */
    const httpUrl = url.split('#')[0];

    try {
      const r = await page.request.get(httpUrl, { failOnStatusCode: false });
      if (r.status() < 400) buckets.ok.push({ href, info, code: r.status() });
      else buckets.broken.push({ href, info, code: r.status() });
    } catch (err) {
      buckets.broken.push({ href, info, code: 'error: ' + err.message });
    }
  }

  /* Report */
  const fmt = ({ href, info, code }) =>
    `  ${color('dim', String(code ?? '').padEnd(4))} ${href.padEnd(34)} ${color('dim', `from: ${info.from.join(', ')}`)}`;

  if (buckets.ok.length) {
    console.log(color('green', `✓ ${buckets.ok.length} internal links working`));
    buckets.ok.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.anchor.length) {
    console.log(color('green', `\n✓ ${buckets.anchor.length} on-page anchors`));
    buckets.anchor.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.scheme.length) {
    console.log(color('green', `\n✓ ${buckets.scheme.length} tel: / mailto: links`));
    buckets.scheme.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.external.length) {
    console.log(color('green', `\n✓ ${buckets.external.length} external (social etc.) links — not fetched`));
    buckets.external.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.placeholder.length) {
    console.log(color('yellow', `\n⚠ ${buckets.placeholder.length} dead placeholder hrefs ("#") — no destination`));
    buckets.placeholder.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.broken.length) {
    console.log(color('red', `\n✗ ${buckets.broken.length} broken internal links`));
    buckets.broken.forEach((b) => console.log(fmt(b)));
  }

  console.log(
    `\n${color('bold', 'Summary')}: ok=${buckets.ok.length} anchors=${buckets.anchor.length} schemes=${buckets.scheme.length} external=${buckets.external.length} placeholders=${buckets.placeholder.length} broken=${buckets.broken.length}`
  );

  await browser.close();
  process.exit(buckets.broken.length + buckets.placeholder.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
