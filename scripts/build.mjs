import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// No bundler or dependencies: validate local references and copy static files.
const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
if (html.includes('<!-- PRICE_MENU -->')) throw new Error('The price menu is incomplete.');
const references = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]);
for (const reference of new Set(references)) {
  if (/^(?:https?:|tel:|mailto:)/.test(reference)) continue;
  await stat(resolve(root, reference));
}
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const path of ['index.html', 'css', 'js', 'assets', 'robots.txt']) {
  await cp(resolve(root, path), resolve(root, 'dist', path), { recursive: true });
}
await writeFile(resolve(root, 'dist', '404.html'), await readFile(resolve(root, '404.html')));
console.log(`Built dist/; validated ${new Set(references).size} page references.`);
