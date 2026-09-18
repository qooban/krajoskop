/**
 * Enforces that every GitHub Action is pinned to a commit SHA.
 *
 * A tag is mutable: whoever controls the action can move v4 to different code
 * and it runs here with whatever permissions the workflow grants. OpenSSF
 * Scorecard flags this, and the fix is cheap — but only if it is checked,
 * because the temptation to paste a tag is permanent and the cost of a lapse
 * is invisible until it is not.
 *
 * Deliberately a regex over the raw text rather than a YAML parse: it needs no
 * dependency, and "uses:" lines are regular enough that parsing buys nothing.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const WORKFLOWS = join(ROOT, '.github', 'workflows');
const USES = /^\s*-?\s*uses:\s*(\S+)/;
const SHA = /^[0-9a-f]{40}$/;

interface Problem {
  readonly file: string;
  readonly line: number;
  readonly uses: string;
  readonly reason: string;
}

const problems: Problem[] = [];
const files = (await readdir(WORKFLOWS)).filter(
  (f) => f.endsWith('.yml') || f.endsWith('.yaml'),
);

for (const file of files) {
  const path = join(WORKFLOWS, file);
  const lines = (await readFile(path, 'utf8')).split('\n');

  for (const [index, line] of lines.entries()) {
    const match = USES.exec(line);
    const uses = match?.[1];
    if (uses === undefined) continue;

    // Local and container actions are not pinnable this way.
    if (uses.startsWith('./') || uses.startsWith('docker://')) continue;

    const at = uses.lastIndexOf('@');
    const problem = { file: relative(ROOT, path), line: index + 1, uses };

    if (at === -1) {
      problems.push({ ...problem, reason: 'no version at all' });
    } else if (!SHA.test(uses.slice(at + 1))) {
      problems.push({
        ...problem,
        reason: 'pinned to a tag, not a commit SHA',
      });
    }
  }
}

if (problems.length > 0) {
  for (const p of problems) {
    console.error(`${p.file}:${String(p.line)}  ${p.uses} — ${p.reason}`);
  }
  console.error(
    `\n${String(problems.length)} unpinned action(s). Resolve the tag with:\n` +
      '  git ls-remote --tags --refs https://github.com/<owner>/<repo>\n' +
      'and keep the tag in a trailing comment.',
  );
  process.exit(1);
}

console.log(
  `Checked ${String(files.length)} workflow file(s), all actions pinned to SHAs.`,
);
