import { execSync } from 'child_process';
import { rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('[v0] Removing package-lock.json...');
try {
  rmSync(join(projectRoot, 'package-lock.json'));
  console.log('[v0] Removed package-lock.json');
} catch (e) {
  console.log('[v0] package-lock.json not found, continuing...');
}

console.log('[v0] Removing node_modules...');
try {
  rmSync(join(projectRoot, 'node_modules'), { recursive: true, force: true });
  console.log('[v0] Removed node_modules');
} catch (e) {
  console.log('[v0] node_modules not found, continuing...');
}

console.log('[v0] Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('[v0] Cache cleaned');
} catch (e) {
  console.log('[v0] Cache clean failed, continuing...');
}

console.log('[v0] Running npm install...');
execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
console.log('[v0] Clean install complete!');
