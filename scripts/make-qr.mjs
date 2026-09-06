// Writes one SVG and one PNG QR code per published plant into dist/qr/ after
// the build, so every deploy carries a printable code for each plant at
// /qr/<slug>.png. Runs as part of npm run build.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import { SITE_URL } from '../site.config.mjs';

const plantsDir = path.resolve('src/content/plants');
const outDir = path.resolve(process.argv[2] ?? 'dist/qr');
const options = { errorCorrectionLevel: 'H', margin: 4 };

await mkdir(outDir, { recursive: true });
const files = (await readdir(plantsDir)).filter((name) => name.endsWith('.md'));
let count = 0;

for (const file of files) {
  const text = await readFile(path.join(plantsDir, file), 'utf8');
  if (/^draft:\s*true\s*$/m.test(text)) continue;
  const slug = file.replace(/\.md$/, '');
  const url = new URL(`/plants/${slug}/`, SITE_URL).toString();
  await QRCode.toFile(path.join(outDir, `${slug}.png`), url, { ...options, width: 1024 });
  await writeFile(path.join(outDir, `${slug}.svg`), await QRCode.toString(url, { ...options, type: 'svg' }));
  console.log(`qr: ${slug}  ->  ${url}`);
  count += 1;
}

console.log(`qr: wrote ${count} code pairs to ${path.relative(process.cwd(), outDir)}/`);
