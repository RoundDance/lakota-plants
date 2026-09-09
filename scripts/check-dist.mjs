// Post-build checks: every published plant page exists and carries the
// pieces a placard visitor needs. Fails the build if anything is missing.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const plantsDir = path.resolve('src/content/plants');
const problems = [];

const unescape = (html) =>
  html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function readPage(relative) {
  const file = path.join(dist, relative);
  if (!(await exists(file))) {
    problems.push(`missing ${relative}`);
    return null;
  }
  return unescape(await readFile(file, 'utf8'));
}

const files = (await readdir(plantsDir)).filter((name) => name.endsWith('.md'));
let checked = 0;

for (const file of files) {
  const source = await readFile(path.join(plantsDir, file), 'utf8');
  if (/^draft:\s*true\s*$/m.test(source)) continue;
  const slug = file.replace(/\.md$/, '');
  const lakota = source
    .match(/^lakota_name:\s*(.+)$/m)?.[1]
    .trim()
    .replace(/^["']|["']$/g, '');
  const html = await readPage(`plants/${slug}/index.html`);
  if (!html) continue;
  checked += 1;
  const expect = {
    'share form': html.includes('name="form-name" value="share"'),
    'plant checkbox': html.includes(`name="plant_${slug.replace(/[^a-z0-9]+/gi, '_')}"`),
    disclaimer: html.includes('data-testid="disclaimer"'),
    pronunciation: html.includes('data-testid="pronunciation"'),
    'lakota name': lakota ? html.includes(lakota) : true,
    'plant marker': html.includes(`data-plant="${slug}"`),
    'qr code': await exists(path.join(dist, 'qr', `${slug}.png`)),
    'language question': html.includes('name="language"'),
  };
  for (const [label, ok] of Object.entries(expect)) {
    if (!ok) problems.push(`plants/${slug}: ${label} not found`);
  }
}

const shared = [
  'index.html',
  'share/index.html',
  'thank-you/index.html',
  '404.html',
  'admin/index.html',
  'admin/config.yml',
  'sitemap-index.xml',
  'robots.txt',
  'qr/site.png',
];
for (const page of shared) {
  if (!(await exists(path.join(dist, page)))) problems.push(`missing ${page}`);
}

// The share page carries the same form, and the photo field has to keep asking
// for named image types. A wildcard here would put the picker back to offering
// every file on the phone, which is where a harmful upload starts.
const shareHtml = await readPage('share/index.html');
if (shareHtml) {
  if (!shareHtml.includes('name="language"')) problems.push('share: language question not found');
  if (!shareHtml.includes('accept="image/jpeg')) problems.push('share: photo accept list not found');
  if (shareHtml.includes('accept="image/*"')) problems.push('share: photo accept is a wildcard');
}

if (problems.length) {
  console.error('check-dist: problems found');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`check-dist: ${checked} plant pages and the shared pages look right.`);
