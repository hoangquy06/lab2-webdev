import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function formatBytes(size: number) {
  if (size === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, exponent);
  return `${value.toFixed(2)} ${units[exponent]}`;
}

function collectFiles(dir: string): { file: string; size: number }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: { file: string; size: number }[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      const stats = fs.statSync(fullPath);
      files.push({ file: fullPath, size: stats.size });
    }
  }
  return files;
}

export function runBundleAnalysis(distRelativePath = '../../dist') {
  const distPath = path.resolve(__dirname, distRelativePath);
  if (!fs.existsSync(distPath)) {
    console.error('Build artifacts not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = collectFiles(distPath).sort((a, b) => b.size - a.size);
  const total = files.reduce((sum, item) => sum + item.size, 0);

  console.log('Bundle Size Report');
  console.log('==================');
  files.forEach(({ file, size }) => {
    console.log(`${path.relative(distPath, file).padEnd(40)} ${formatBytes(size)}`);
  });
  console.log('------------------');
  console.log(`Total size: ${formatBytes(total)}`);
}

const invokedDirectly = Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href);
if (invokedDirectly) {
  runBundleAnalysis();
}
