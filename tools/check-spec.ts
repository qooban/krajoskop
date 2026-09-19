/**
 * Keeps the specification and the code from drifting apart.
 *
 * The specification is an identifier system — R1-R9, P1-P6, S1-S6, UC-01…,
 * FR-01…, NFR-01…, R-01… — and today it holds nearly all of the project's
 * thinking. Identifiers maintained by good intentions rot: a requirement gets
 * renumbered, a test claims to cover something that no longer exists, and the
 * document quietly stops describing the code. So it is checked by a program.
 *
 * This tool:
 *   1. reads every ID the specification actually defines;
 *   2. finds every claim made about those IDs, in code and in a pull request
 *      body, and rejects claims about IDs that do not exist;
 *   3. regenerates docs/coverage.md and fails when the committed copy is
 *      stale, so "how much of alpha is done" is answered by a file rather
 *      than by memory.
 *
 * Usage:
 *   node tools/check-spec.ts            validate, and verify coverage.md is current
 *   node tools/check-spec.ts --write    regenerate coverage.md
 *   PR_BODY="…" node tools/check-spec.ts   also validate a pull request body
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SPEC = join(ROOT, 'docs', 'specification.md');
const COVERAGE = join(ROOT, 'docs', 'coverage.md');

/** Only code makes claims. Prose in docs/ mentions IDs constantly. */
const SCANNED_DIRECTORIES = ['src', 'tests', 'tools'];

/**
 * Order matters: NFR must be tried before FR, and R- before R<digit>, or the
 * shorter alternative wins and NFR-01 is read as the non-existent FR-01.
 */
const ID_TOKEN = /\b(?:NFR-\d+|FR-\d+|UC-\d+|R-\d+|[RPS]\d+)\b/g;

/** A claim that some code implements, or some test covers, requirements. */
const CLAIM = /\b(Implements|Covers):\s*(.+)$/;

type Kind = 'track' | 'useCase' | 'requirement' | 'risk';

interface Definition {
  readonly id: string;
  readonly kind: Kind;
  readonly summary: string;
}

interface Claim {
  readonly id: string;
  readonly verb: 'Implements' | 'Covers';
  readonly file: string;
  readonly line: number;
}

function firstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const stop = cleaned.indexOf('. ');
  const sentence = stop === -1 ? cleaned : cleaned.slice(0, stop + 1);
  return sentence.length > 110 ? `${sentence.slice(0, 107)}…` : sentence;
}

function parseSpecification(text: string): Map<string, Definition> {
  const definitions = new Map<string, Definition>();

  const add = (id: string, kind: Kind, summary: string): void => {
    // A duplicate ID in the specification is itself a defect worth knowing
    // about, but the first definition wins so output stays deterministic.
    if (!definitions.has(id)) {
      definitions.set(id, { id, kind, summary: firstSentence(summary) });
    }
  };

  // Development track tables: | R1 | Route loading… | — |
  for (const m of text.matchAll(/^\|\s*([RPS]\d+)\s*\|\s*([^|]+?)\s*\|/gm)) {
    add(m[1] ?? '', 'track', m[2] ?? '');
  }

  // Use case table: | UC-01 | Load a GPX track… | R |
  for (const m of text.matchAll(/^\|\s*(UC-\d+)\s*\|\s*([^|]+?)\s*\|/gm)) {
    add(m[1] ?? '', 'useCase', m[2] ?? '');
  }

  // Requirements: - **FR-01** — The system accepts a GPX file…
  for (const m of text.matchAll(
    // The terminator must not use $ under /m, which means end of LINE and
    // would truncate every multi-line requirement at its first newline.
    /^\s*-\s+\*\*((?:NFR|FR)-\d+)\*\*\s+—\s+([\s\S]*?)(?=\n\s*-\s+\*\*|\n\s*\n|(?![\s\S]))/gm,
  )) {
    add(m[1] ?? '', 'requirement', m[2] ?? '');
  }

  // Risks: **R-01 — Google Maps licensing.** Google Maps Platform terms…
  for (const m of text.matchAll(/^\*\*(R-\d+)\s+—\s+([^*]+)\*\*/gm)) {
    add(m[1] ?? '', 'risk', m[2] ?? '');
  }

  return definitions;
}

async function findSourceFiles(directory: string): Promise<string[]> {
  const found: string[] = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      found.push(...(await findSourceFiles(path)));
    } else if (entry.name.endsWith('.ts')) {
      found.push(path);
    }
  }
  return found;
}

/** Pulls ID tokens out of the text following a claim marker. */
function idsIn(text: string): string[] {
  return [...text.matchAll(ID_TOKEN)].map((m) => m[0]);
}

async function collectClaims(): Promise<Claim[]> {
  const claims: Claim[] = [];

  for (const directory of SCANNED_DIRECTORIES) {
    for (const file of await findSourceFiles(join(ROOT, directory))) {
      const lines = (await readFile(file, 'utf8')).split('\n');
      for (const [index, line] of lines.entries()) {
        const match = CLAIM.exec(line);
        if (match === null) continue;
        const verb = match[1] as 'Implements' | 'Covers';
        for (const id of idsIn(match[2] ?? '')) {
          claims.push({
            id,
            verb,
            file: relative(ROOT, file),
            line: index + 1,
          });
        }
      }
    }
  }

  return claims;
}

function renderCoverage(
  definitions: Map<string, Definition>,
  claims: readonly Claim[],
): string {
  const byId = new Map<string, Claim[]>();
  for (const claim of claims) {
    byId.set(claim.id, [...(byId.get(claim.id) ?? []), claim]);
  }

  const sections: Array<[Kind, string, string]> = [
    ['track', 'Development tracks', 'Track'],
    ['useCase', 'Use cases', 'Use case'],
    ['requirement', 'Requirements', 'Requirement'],
    ['risk', 'Risks', 'Risk'],
  ];

  const lines: string[] = [
    '<!-- Generated by tools/check-spec.ts. Do not edit by hand. -->',
    '',
    '# Coverage',
    '',
    'What the code claims about [the specification](specification.md).',
    'Regenerate with `node tools/check-spec.ts --write`.',
    '',
    'A row is covered when some file carries `Implements:` or `Covers:` naming',
    'that ID. This records claims, not proof — a covered row means someone said',
    'so in code, not that the requirement is satisfied.',
    '',
  ];

  const covered = [...definitions.values()].filter(
    (d) => (byId.get(d.id) ?? []).length > 0,
  ).length;
  lines.push(
    `**${String(covered)} of ${String(definitions.size)} identifiers are claimed by something.**`,
    '',
  );

  for (const [kind, heading, column] of sections) {
    const rows = [...definitions.values()].filter((d) => d.kind === kind);
    if (rows.length === 0) continue;

    lines.push(
      `## ${heading}`,
      '',
      `| ${column} | Summary | Claimed by |`,
      '| --- | --- | --- |',
    );
    for (const definition of rows) {
      const claimed = (byId.get(definition.id) ?? [])
        .map((c) => `\`${c.file}:${String(c.line)}\``)
        .join('<br>');
      lines.push(
        `| ${definition.id} | ${definition.summary} | ${claimed === '' ? '—' : claimed} |`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------

const specification = await readFile(SPEC, 'utf8');
const definitions = parseSpecification(specification);

if (definitions.size === 0) {
  console.error(`No identifiers parsed from ${relative(ROOT, SPEC)}.`);
  console.error('The specification format changed, or this tool is broken.');
  process.exit(1);
}

const problems: string[] = [];
const claims = await collectClaims();

for (const claim of claims) {
  if (!definitions.has(claim.id)) {
    problems.push(
      `${claim.file}:${String(claim.line)}  "${claim.verb}: ${claim.id}" — no such identifier in the specification`,
    );
  }
}

// A pull request body makes the same kind of claim and gets the same scrutiny.
const prBody = process.env['PR_BODY'];
if (prBody !== undefined && prBody.trim() !== '') {
  for (const line of prBody.split('\n')) {
    const match = CLAIM.exec(line);
    if (match === null) continue;
    for (const id of idsIn(match[2] ?? '')) {
      if (!definitions.has(id)) {
        problems.push(
          `pull request body  "${match[1] ?? ''}: ${id}" — no such identifier in the specification`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  console.error(
    `\n${String(problems.length)} claim(s) about identifiers that do not exist.`,
  );
  console.error(
    'Check docs/specification.md, or add the identifier there first.',
  );
  process.exit(1);
}

const rendered = renderCoverage(definitions, claims);

if (process.argv.includes('--write')) {
  await writeFile(COVERAGE, rendered, 'utf8');
  console.log(
    `Wrote ${relative(ROOT, COVERAGE)} (${String(definitions.size)} identifiers).`,
  );
} else {
  let committed: string;
  try {
    committed = await readFile(COVERAGE, 'utf8');
  } catch {
    // Not generated yet; any rendered content differs, which is correct.
    committed = '';
  }
  if (committed !== rendered) {
    console.error(
      `${relative(ROOT, COVERAGE)} is out of date.\nRun: node tools/check-spec.ts --write`,
    );
    process.exit(1);
  }
  console.log(
    `${String(definitions.size)} identifiers, ${String(claims.length)} claim(s); coverage.md is current.`,
  );
}
