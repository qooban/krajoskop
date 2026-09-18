# Conventions

Rationale for each of these lives in [harness.md](harness.md). This file is
the short version you actually work from.

## Language

English for everything in the repository. Polish for everything the product
emits. [ADR 0001](decisions/0001-language-of-the-repository.md),
[glossary](glossary.md).

## Branches

Trunk-based. `main` is protected and has linear history. Branches live hours
or days, not weeks.

```
R2/sample-elevation-profile     work on a specification ID
fix/gradient-sign-on-descent    a defect with no ID of its own
claude/<session-slug>           agent sessions
```

Squash merge, so `main` carries one commit per unit of work and `git bisect`
stays useful — which matters here, because failures look like plausible wrong
numbers rather than crashes.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). The scope is a
specification ID where one applies.

```
feat(R2): sample elevation profile from the terrain model
fix(P1): correct descent speed above 25% gradient
docs(repo): record the stack decision
chore(ci): pin action SHAs
```

Types in use: `feat`, `fix`, `perf`, `docs`, `test`, `refactor`, `chore`,
`ci`, `build`, `revert`. Scopes are a track ID (R1-R9, P1-P6, S1-S6) or one of
`repo`, `ci`, `docs`, `data`, `deps`.

`feat`, `fix`, `perf` and `revert` appear in the changelog; the rest are
hidden. Because merges are squashed, **the pull request title is the commit
that lands on `main`**, so it is the title that has to be a valid Conventional
Commit. CI checks it, and a malformed one drops the change out of the release
notes rather than merely looking untidy.

Where a commit implements requirements, name them in the body. This is what
feeds `docs/coverage.md`:

```
Implements: FR-05, UC-01
```

## Definition of done

A change is done when all of these hold:

- Tests cover it, and golden files were regenerated deliberately rather than
  to make a failure disappear.
- Coordinate reference system and units are explicit at every boundary
  (NFR-07).
- The result is deterministic for the same input (NFR-08).
- Requirement IDs are named and `docs/coverage.md` is current.
- No new dependency without an ADR.

## Code style

Formatting and linting are not matters of opinion here — Prettier and ESLint
decide, and CI enforces. What they cannot check:

- **Units and CRS in names.** `distanceM`, `elevationM`, `bearingDeg`,
  `speedKmh`. A bare `distance` is a defect waiting to happen. Coordinates
  carry their system: `pointPl1992`, `pointWgs84`.
- **No coordinate transformation in process.** Reprojection goes through GDAL.
  `proj4js` is not a dependency ([ADR 0002](decisions/0002-technology-stack.md), R-11).
- **One module owns subprocess calls.** Every invocation of GDAL,
  WhiteboxTools or GRASS goes through it, so the tool boundary is mockable and
  testable in one place.
- **No mode branching in the core** (NFR-05). A mode is configuration and a
  choice of analyses.
- **Every number shown to a user carries its source** (FR-10).

## Documentation style

- One sentence per line is not required, but keep lines under roughly 80
  characters so diffs stay readable.
- Em dashes, not double hyphens. Straight quotes only inside code spans.
- Tables for anything enumerable. Prose for anything that needs a reason.
- State the reason, not just the rule. A convention whose rationale is
  unrecorded gets dropped by the next person to find it inconvenient — and
  here, that person is you in three weeks.

## Issues and pull requests

Issue forms cover four kinds: track task, defect, decision, risk. Use them;
the fields exist because the answers are needed later.

Pull requests use the template checklist. A PR that references a requirement
ID that does not exist in the specification fails CI.

## Releases

`release-please` keeps an open pull request carrying the next version and the
generated changelog; merging it tags the release. Below 1.0 both `feat` and
`fix` bump the patch digit, so the milestone versions are deliberate: put
`Release-As: 0.1.0` in a commit body to cut alpha.

## Decisions

Anything that would be expensive to reverse gets an ADR in
[docs/decisions/](decisions/), numbered, with a _when to reverse this_
section. Adding a dependency counts.
