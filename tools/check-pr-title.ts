/**
 * Validates a pull request title as a Conventional Commit.
 *
 * Merges here are squashed, so the PR title becomes the commit message on
 * main, which is what release-please reads to compute the next version and
 * write the changelog. A malformed title is therefore not a style problem —
 * it silently drops the change out of the release notes.
 *
 * The title arrives through the environment rather than as an argument,
 * because it is attacker-controlled text and interpolating it into a shell
 * command would be an injection vector.
 */

const TYPES = [
  'feat',
  'fix',
  'perf',
  'docs',
  'test',
  'refactor',
  'chore',
  'ci',
  'build',
  'revert',
];

/** Scopes that are not specification IDs. */
const HARNESS_SCOPES = ['repo', 'ci', 'docs', 'data', 'deps'];

/** Track IDs from the specification: R1-R9, P1-P6, S1-S6. */
const TRACK_ID = /^[RPS]\d+$/;

const TITLE_PATTERN =
  /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/;

function fail(message: string, title: string): never {
  console.error(`Invalid pull request title: ${title}\n`);
  console.error(message);
  console.error(`
Expected a Conventional Commit, for example:

  feat(R2): sample elevation profile from the terrain model
  fix(P1): correct descent speed above 25% gradient
  ci(repo): pin action SHAs

Types:  ${TYPES.join(', ')}
Scopes: a track ID (R1-R9, P1-P6, S1-S6), or one of ${HARNESS_SCOPES.join(', ')}

See docs/conventions.md.`);
  process.exit(1);
}

const title = process.env['PR_TITLE'];

if (title === undefined || title.trim() === '') {
  console.error('PR_TITLE is not set.');
  process.exit(1);
}

const match = TITLE_PATTERN.exec(title);

if (match?.groups === undefined) {
  fail('It does not parse as "type(scope): subject".', title);
}

const { type, scope, subject } = match.groups;

if (type === undefined || !TYPES.includes(type)) {
  fail(`Unknown type "${type ?? ''}".`, title);
}

if (
  scope !== undefined &&
  !TRACK_ID.test(scope) &&
  !HARNESS_SCOPES.includes(scope)
) {
  fail(
    `Unknown scope "${scope}". Use a track ID from the specification, or one of ${HARNESS_SCOPES.join(', ')}.`,
    title,
  );
}

if (subject === undefined || subject.length < 10) {
  fail('The subject is too short to say anything useful.', title);
}

if (subject.endsWith('.')) {
  fail('The subject should not end with a full stop.', title);
}

if (/^[A-Z][a-z]/.test(subject)) {
  fail('The subject should start in lower case.', title);
}

console.log(`Title is a valid Conventional Commit: ${title}`);
