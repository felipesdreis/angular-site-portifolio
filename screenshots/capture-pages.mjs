import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const shots = [
  { url: 'http://localhost:4200/',         file: '01-home-fullpage.png' },
  { url: 'http://localhost:4200/',         file: '02-hero-closeup.png',  clip: { x: 440, y: 70,  width: 560, height: 420 } },
  { url: 'http://localhost:4200/',         file: '03-ticker.png',        clip: { x: 0,   y: 490, width: 1440, height: 70  } },
  { url: 'http://localhost:4200/projetos', file: '04-projetos-page.png' },
  { url: 'http://localhost:4200/projetos', file: '05-card-detail.png',   clip: { x: 340, y: 75,  width: 770, height: 510 } },
];

for (const shot of shots) {
  await page.goto(shot.url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const opts = { path: path.join(__dirname, shot.file), type: 'png' };
  if (shot.clip) opts.clip = shot.clip;
  await page.screenshot(opts);
  console.log('✓', shot.file);
}

await browser.close();
