/**
 * Keeps committed sample data small.
 *
 * H-04 in docs/harness.md: terrain models are heavy, and a repository that
 * quietly accumulates them becomes unpleasant to clone long before anyone
 * notices. Everything beyond a fixture belongs behind tools/fetch-data.ts
 * with a checksum, not in git.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SAMPLES = join(ROOT, 'data', 'sample');

/** Generous for text fixtures, far below anything raster. */
const TOTAL_LIMIT_BYTES = 5 * 1024 * 1024;
const FILE_LIMIT_BYTES = 1 * 1024 * 1024;

interface Entry {
  readonly path: string;
  readonly bytes: number;
}

async function collect(directory: string): Promise<Entry[]> {
  const entries: Entry[] = [];
  let listing;
  try {
    listing = await readdir(directory, { withFileTypes: true });
  } catch {
    return entries;
  }
  for (const item of listing) {
    const path = join(directory, item.name);
    if (item.isDirectory()) {
      entries.push(...(await collect(path)));
    } else {
      entries.push({ path, bytes: (await stat(path)).size });
    }
  }
  return entries;
}

const files = await collect(SAMPLES);
const total = files.reduce((sum, file) => sum + file.bytes, 0);
const oversized = files.filter((file) => file.bytes > FILE_LIMIT_BYTES);

const mib = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(2)} MiB`;

if (oversized.length > 0 || total > TOTAL_LIMIT_BYTES) {
  for (const file of oversized) {
    console.error(
      `${relative(ROOT, file.path)} is ${mib(file.bytes)}, over the ${mib(FILE_LIMIT_BYTES)} per-file limit.`,
    );
  }
  if (total > TOTAL_LIMIT_BYTES) {
    console.error(
      `data/sample/ totals ${mib(total)}, over the ${mib(TOTAL_LIMIT_BYTES)} limit.`,
    );
  }
  console.error(
    '\nFetch large data with a checksummed script instead of committing it. See H-04.',
  );
  process.exit(1);
}

console.log(
  `data/sample/: ${String(files.length)} file(s), ${mib(total)} of ${mib(TOTAL_LIMIT_BYTES)}.`,
);
