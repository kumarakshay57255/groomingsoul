/**
 * Audits every link in the page chrome (header / nav / sidebar) across the
 * public site AND the admin console. Excludes <footer> links — those have
 * their own audit script.
 *
 *   cd docs && node audit-nav.mjs
 */
import { chromium } from 'playwright';

const FRONTEND = 'http://localhost:4321';

const PUBLIC_PAGES = [
  '/',
  '/therapy',
  '/therapy/tests',
  '/therapy/tests/ocean-big-five',
  '/academy',
  '/academy/courses/cuet-ug-psychology-master',
  '/diploma',
  '/diploma/courses/diploma-cbt-foundations',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/login',
  '/signup',
  '/forgot-password',
];

const ADMIN_PAGES = [
  '/admin',
  '/admin/therapists',
  '/admin/team',
  '/admin/advisory',
  '/admin/courses',
  '/admin/leads',
  '/admin/tests',
  '/admin/purchases',
  '/admin/certificates',
  '/admin/staff',
];

const ADMIN_EMAIL = 'grooming@admin.com';
const ADMIN_PASSWORD = 'grooming@admin';

function color(c, s) {
  const codes = { red: 31, green: 32, yellow: 33, blue: 34, dim: 2, bold: 1 };
  return `\x1b[${codes[c]}m${s}\x1b[0m`;
}

/**
 * Extract every <a href> on the page that is NOT inside <footer>.
 * Returns {href, label, source}.
 */
async function extractNavLinks(page) {
  return page.$$eval('a[href]', (as) => {
    function inside(el, sel) {
      let cur = el;
      while (cur) {
        if (cur.matches && cur.matches(sel)) return true;
        cur = cur.parentElement;
      }
      return false;
    }
    function ancestor(el, ...selectors) {
      let cur = el;
      while (cur && cur.tagName) {
        for (const s of selectors) {
          if (cur.matches && cur.matches(s)) return s;
        }
        cur = cur.parentElement;
      }
      return null;
    }
    return as
      .filter((a) => !inside(a, 'footer'))
      .map((a) => ({
        href: a.getAttribute('href'),
        label: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        source:
          ancestor(a, 'header', 'aside', 'nav', 'main') || 'document',
      }))
      .filter((l) => l.href);
  });
}

async function loginAsAdmin(page) {
  await page.goto(FRONTEND + '/login');
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

async function visit(page, path) {
  try {
    const r = await page.goto(FRONTEND + path, {
      waitUntil: 'networkidle',
      timeout: 20_000,
    });
    return r ? r.status() : 0;
  } catch (err) {
    return 'err:' + err.message;
  }
}

async function classifyLinks(page, links) {
  const buckets = {
    ok: [],
    anchor: [],
    scheme: [],
    external: [],
    placeholder: [],
    broken: [],
  };
  /* dedupe by href */
  const seen = new Map();
  for (const l of links) {
    if (!seen.has(l.href)) seen.set(l.href, l);
  }

  for (const [href, info] of seen) {
    if (href.startsWith('#')) {
      buckets.anchor.push({ href, info });
      continue;
    }
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      buckets.scheme.push({ href, info });
      continue;
    }
    if (href === '#' || href === 'javascript:void(0)') {
      buckets.placeholder.push({ href, info });
      continue;
    }
    if (/^https?:\/\//.test(href) && !href.startsWith(FRONTEND)) {
      buckets.external.push({ href, info });
      continue;
    }
    let url = href;
    if (href.startsWith('/')) url = FRONTEND + href;
    const httpUrl = url.split('#')[0];
    try {
      const r = await page.request.get(httpUrl, { failOnStatusCode: false });
      if (r.status() < 400) buckets.ok.push({ href, info, code: r.status() });
      else buckets.broken.push({ href, info, code: r.status() });
    } catch (err) {
      buckets.broken.push({ href, info, code: 'error: ' + err.message });
    }
  }
  return buckets;
}

function report(label, buckets) {
  const fmt = ({ href, info, code }) =>
    `  ${color('dim', String(code ?? '').padEnd(4))} ${color('dim', info.source.padEnd(8))} ${href.padEnd(40)} ${color('dim', `“${info.label || '—'}”`)}`;

  console.log(`\n${color('bold', label)}`);
  if (buckets.ok.length) {
    console.log(color('green', `  ${buckets.ok.length} internal links working`));
    buckets.ok.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.anchor.length) {
    console.log(color('green', `  ${buckets.anchor.length} on-page anchors`));
    buckets.anchor.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.scheme.length) {
    console.log(color('green', `  ${buckets.scheme.length} tel: / mailto:`));
    buckets.scheme.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.external.length) {
    console.log(color('green', `  ${buckets.external.length} external`));
    buckets.external.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.placeholder.length) {
    console.log(color('yellow', `  ⚠ ${buckets.placeholder.length} placeholder hrefs ("#")`));
    buckets.placeholder.forEach((b) => console.log(fmt(b)));
  }
  if (buckets.broken.length) {
    console.log(color('red', `  ✗ ${buckets.broken.length} BROKEN`));
    buckets.broken.forEach((b) => console.log(fmt(b)));
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  /* ----- Public pages — chrome links ----- */
  console.log(color('bold', `\nAuditing chrome (header/nav) on ${PUBLIC_PAGES.length} public pages…`));
  const publicAll = [];
  for (const p of PUBLIC_PAGES) {
    const code = await visit(page, p);
    if (typeof code === 'number' && code >= 400) {
      console.log(color('yellow', `↳ ${p} returned ${code}, skipping`));
      continue;
    }
    const links = await extractNavLinks(page);
    publicAll.push(...links);
  }
  const publicBuckets = await classifyLinks(page, publicAll);
  report('PUBLIC CHROME LINKS', publicBuckets);

  /* ----- Admin pages — sidebar links ----- */
  console.log(color('bold', `\nSigning in as admin…`));
  await loginAsAdmin(page);

  console.log(color('bold', `Auditing sidebar/topbar on ${ADMIN_PAGES.length} admin pages…`));
  const adminAll = [];
  for (const p of ADMIN_PAGES) {
    const code = await visit(page, p);
    if (typeof code === 'number' && code >= 400) {
      console.log(color('yellow', `↳ ${p} returned ${code}, skipping`));
      continue;
    }
    const links = await extractNavLinks(page);
    adminAll.push(...links);
  }
  const adminBuckets = await classifyLinks(page, adminAll);
  report('ADMIN CHROME LINKS', adminBuckets);

  const totalBroken = publicBuckets.broken.length + adminBuckets.broken.length;
  const totalPlaceholders =
    publicBuckets.placeholder.length + adminBuckets.placeholder.length;

  console.log(
    `\n${color('bold', 'Overall')}: ${color(
      totalBroken === 0 && totalPlaceholders === 0 ? 'green' : 'red',
      `broken=${totalBroken} placeholders=${totalPlaceholders}`
    )}`
  );

  await browser.close();
  process.exit(totalBroken + totalPlaceholders > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
