const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const siteExtensions = new Set(['.html', '.css', '.js', '.xml']);
const pages = fs.readdirSync(root).filter(name => siteExtensions.has(path.extname(name)));
const assets = new Set();

if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Build output must be the project dist directory');
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of pages) {
  const source = path.join(root, name);
  const content = fs.readFileSync(source, 'utf8');
  fs.copyFileSync(source, path.join(output, name));
  for (const match of content.matchAll(/Assets\/[A-Za-z0-9_./-]+/g)) {
    assets.add(match[0]);
  }
}

for (const asset of assets) {
  const source = path.join(root, asset);
  if (!fs.existsSync(source)) throw new Error(`Missing site asset: ${asset}`);
  const destination = path.join(output, asset);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`Built ${pages.length} site files and ${assets.size} referenced assets in dist/`);
