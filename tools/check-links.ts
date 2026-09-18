/**
 * Verifies that every relative Markdown link resolves to a file that exists.
 *
 * The documents cross-reference each other heavily — the specification points
 * at ADRs, the ADRs point back, the README indexes everything. Those links rot
 * silently on any rename, so they are checked rather than trusted.
 *
 * External links are not fetched: a network-dependent check that fails when a
 * third-party site is down teaches you to ignore red builds.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'coverage']);
const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

interface BrokenLink {
  readonly file: string;
  readonly line: number;
  readonly target: string;
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const found: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      found.push(...(await findMarkdownFiles(path)));
    } else if (entry.name.endsWith('.md')) {
      found.push(path);
    }
  }

  return found;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function checkFile(file: string): Promise<BrokenLink[]> {
  const contents = await readFile(file, 'utf8');
  const lines = contents.split('\n');
  const broken: BrokenLink[] = [];

  for (const [index, line] of lines.entries()) {
    for (const match of line.matchAll(LINK_PATTERN)) {
      const target = match[1];
      if (target === undefined) continue;
      if (/^(https?:|mailto:|#)/.test(target)) continue;

      const [path] = target.split('#');
      if (path === undefined || path === '') continue;

      if (!(await exists(resolve(dirname(file), path)))) {
        broken.push({
          file: relative(ROOT, file),
          line: index + 1,
          target,
        });
      }
    }
  }

  return broken;
}

const files = await findMarkdownFiles(ROOT);
const broken = (await Promise.all(files.map(checkFile))).flat();

if (broken.length > 0) {
  for (const link of broken) {
    console.error(
      `${link.file}:${String(link.line)}  broken link: ${link.target}`,
    );
  }
  console.error(`\n${String(broken.length)} broken link(s).`);
  process.exit(1);
}

console.log(
  `Checked ${String(files.length)} Markdown files, all links resolve.`,
);
