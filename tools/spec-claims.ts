/**
 * Recognising a claim about a specification identifier.
 *
 * Extracted from check-spec.ts so it can be tested, after the first version
 * failed CI on its own pull request: the description of the checker was read
 * as a claim by the checker. Matching the marker anywhere in a line means
 * every sentence mentioning it becomes a claim.
 *
 * A claim is therefore a line that *begins* with the marker, allowing only
 * comment and list punctuation before it — so a JSDoc ` * Implements: FR-01`
 * and a Markdown `- Covers: FR-01` count, while a table cell or a sentence
 * that merely quotes one does not.
 */

/**
 * Order matters: NFR must be tried before FR, and R- before R<digit>, or the
 * shorter alternative wins and NFR-01 is read as the non-existent FR-01.
 */
const ID_TOKEN = /\b(?:NFR-\d+|FR-\d+|UC-\d+|R-\d+|[RPS]\d+)\b/g;

/**
 * Leading punctuation a claim may sit behind: whitespace, comment markers,
 * list bullets, block quotes. Deliberately excludes quotes, backticks and
 * table pipes, which are how a claim gets mentioned rather than made.
 */
const CLAIM_LINE = /^[\s*/#>-]*(Implements|Covers):\s*(.+)$/;

export type ClaimVerb = 'Implements' | 'Covers';

export interface ParsedClaim {
  readonly verb: ClaimVerb;
  readonly ids: readonly string[];
}

/** Every identifier-shaped token in a piece of text. */
export function idsIn(text: string): string[] {
  return [...text.matchAll(ID_TOKEN)].map((match) => match[0]);
}

/**
 * Reads one line as a claim, or returns undefined when the line does not make
 * one. A line that begins with the marker but names no identifier — such as
 * `Implements: none` — is a claim about nothing, which is allowed.
 */
export function parseClaimLine(line: string): ParsedClaim | undefined {
  const match = CLAIM_LINE.exec(line);
  if (match === null) return undefined;
  return { verb: match[1] as ClaimVerb, ids: idsIn(match[2] ?? '') };
}
