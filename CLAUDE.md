# Krajoskop — working notes

Terrain and visibility analysis for walking and driving routes in Poland.
Computes, from a digital terrain model, what no hiking app reports: real
walking time, shade across a day, and **what is visible from a road, on which
side, for how long**. That last one is the project's reason to exist.

This file is a map, not a summary. Follow the links; they are the truth.

| Question                                           | Read                                           |
| -------------------------------------------------- | ---------------------------------------------- |
| What is being built, and what do FR-05 or S1 mean? | [docs/specification.md](docs/specification.md) |
| Why English? Why TypeScript?                       | [docs/decisions/](docs/decisions/)             |
| How do I name a branch, a commit, a variable?      | [docs/conventions.md](docs/conventions.md)     |
| What is this Polish word in the code?              | [docs/glossary.md](docs/glossary.md)           |
| Why is the repository set up this way?             | [docs/harness.md](docs/harness.md)             |

## Commands

```bash
pnpm install          # Node 22, pnpm version pinned in package.json
pnpm check            # the whole gate: format, lint, types, tests,
                      # traceability, links, action pinning — run before pushing
pnpm test             # tests alone
pnpm test:watch
pnpm run coverage     # regenerate docs/coverage.md after adding a marker
```

## The three things that make this project different

**1. Failures look like plausible wrong numbers.** A wrong coordinate system,
swapped units or a half-pixel raster offset do not crash anything — they
return a believable number that is wrong. Review does not catch this. Tests
and naming do. Put the unit in the identifier: `distanceM`, `elevationM`,
`bearingDeg`, `speedKmh`. Put the system in the coordinate: `pointPl1992`,
`pointWgs84`. A bare `distance` is a defect waiting to happen.

**2. The specification is an identifier system, and it is load-bearing.**
Commit scopes carry a track ID (`feat(R2): ...`); commit bodies carry
`Implements: FR-05, UC-01`. Source and tests carry the same markers
(`Implements:` in `src/`, `Covers:` in `tests/`), and CI rejects an identifier
the specification does not define — in code and in the pull request body
alike. [docs/coverage.md](docs/coverage.md) is generated from them. Merges are squashed, so **the pull request title
is the commit that lands on `main`** and the text release automation reads.
CI rejects a malformed one.

**3. The heavy lifting belongs to other people's tools.** Viewshed, slope and
reprojection run in GDAL, WhiteboxTools or GRASS as subprocesses. Anything
that shells out goes through the one module that owns subprocess calls, so
the boundary stays testable in one place.

## Definition of done

- Tests cover it, and golden files were regenerated deliberately rather than
  to make a failure disappear.
- Units and coordinate reference system are explicit at every boundary (NFR-07).
- The result is deterministic for the same input (NFR-08).
- Requirement IDs are named in the commit body.
- No new dependency without an ADR.

## Never

- No paid external service. A dependency requiring one is a design error,
  not a compromise (NFR-10).
- No hand-written raycaster. Use `r.viewshed`, `gdal raster viewshed` or
  WhiteboxTools.
- No coordinate transformation in process. Reprojection goes through GDAL —
  `proj4js` does grid-based datum shifts wrong for this purpose (R-11).
- No mode branching in the core. A mode is configuration and a choice of
  analyses, not a path through the computing code (NFR-05).
- No number shown to a user without its source and model assumptions (FR-10).
- No new dependency without an ADR. The dependency list is the architecture.

## Language

The repository is English. The product speaks Polish. Narration text, PRNG
name forms and anything the route card prints are Polish **and covered by
requirements** — FR-31 wants correct inflection, not a nominative dropped into
a sentence. Polish output is a tested feature, not an accident.
