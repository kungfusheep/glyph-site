import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = (name) => resolve(__dirname, '..', name);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 512, height: 512 });
await page.goto(`file://${resolve(__dirname, 'favicon-render.html')}`);
await page.waitForTimeout(2000);

// 512px master
await page.screenshot({ path: out('favicon-512.png') });
console.log('saved favicon-512.png');

await browser.close();

// resize with sips
for (const [size, name] of [[180, 'apple-touch-icon.png'], [32, 'favicon-32.png'], [16, 'favicon-16.png']]) {
  execSync(`sips -z ${size} ${size} --out ${out(name)} ${out('favicon-512.png')}`);
  console.log(`saved ${name}`);
}
