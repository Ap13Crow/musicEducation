// pdf.js's worker is an ES module that Next 14's minifier can't bundle, so
// it ships as a static file instead: copied into .next/static (which the
// production image serves at /_next/static/) after every build, with the
// pdf.js version in its name so long-lived caching stays correct.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packageJson = require.resolve('pdfjs-dist/package.json');
const { version } = JSON.parse(readFileSync(packageJson, 'utf8'));
const target = join(process.cwd(), '.next/static/pdfjs');
mkdirSync(target, { recursive: true });
copyFileSync(join(dirname(packageJson), 'legacy/build/pdf.worker.min.mjs'), join(target, `pdf.worker-${version}.min.mjs`));
console.log(`pdf.js worker ${version} copied to .next/static/pdfjs`);
