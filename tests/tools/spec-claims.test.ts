import { describe, expect, it } from 'vitest';
import { idsIn, parseClaimLine } from '../../tools/spec-claims.ts';

describe('idsIn', () => {
  it('keeps NFR and FR apart', () => {
    // NFR-01 contains the text FR-01. A naive pattern reports both, inventing
    // a claim about FR-01 that nobody made.
    expect(idsIn('NFR-01')).toEqual(['NFR-01']);
    expect(idsIn('FR-01')).toEqual(['FR-01']);
    expect(idsIn('NFR-08 and FR-08')).toEqual(['NFR-08', 'FR-08']);
  });

  it('keeps risk R-01 apart from track R1', () => {
    expect(idsIn('R-01')).toEqual(['R-01']);
    expect(idsIn('R1')).toEqual(['R1']);
  });

  it('reads a comma-separated list', () => {
    expect(idsIn('FR-05, UC-01, NFR-07')).toEqual(['FR-05', 'UC-01', 'NFR-07']);
  });

  it('finds nothing in prose without identifiers', () => {
    expect(idsIn('none — harness work')).toEqual([]);
  });
});

describe('parseClaimLine', () => {
  it('reads a claim in a JSDoc comment', () => {
    expect(parseClaimLine(' * Implements: FR-05, UC-01')).toEqual({
      verb: 'Implements',
      ids: ['FR-05', 'UC-01'],
    });
  });

  it('reads a claim in a line comment and a Markdown bullet', () => {
    expect(parseClaimLine('// Covers: FR-01')?.ids).toEqual(['FR-01']);
    expect(parseClaimLine('- Implements: FR-01')?.ids).toEqual(['FR-01']);
  });

  it('allows a claim about nothing', () => {
    expect(parseClaimLine('Implements: none')).toEqual({
      verb: 'Implements',
      ids: [],
    });
  });

  /**
   * The first version of this checker matched the marker anywhere in a line,
   * so its own pull request — which described the checker — failed CI. Prose
   * mentioning a claim is not making one.
   */
  it('does not treat a mention inside a table cell as a claim', () => {
    const row = '| Invented ID in code (`Covers: NFR-99`) | exit 1 |';
    expect(parseClaimLine(row)).toBeUndefined();
  });

  it('does not treat a mention mid-sentence as a claim', () => {
    const prose =
      'Claims are markers: `Implements:` in src, `Covers:` in tests.';
    expect(parseClaimLine(prose)).toBeUndefined();
  });

  it('does not treat a quoted string as a claim', () => {
    expect(parseClaimLine("  'Covers: FR-99',")).toBeUndefined();
  });

  it('ignores a line with no marker at all', () => {
    expect(parseClaimLine('const x = 1;')).toBeUndefined();
  });
});
