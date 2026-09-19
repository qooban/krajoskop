# Harness — plan

**Status:** Accepted. E0–E5 done; E6 is the last one.
**Date:** September 2026
**State of the repository:** README, two documents, two ADRs, LICENSE.
No code, no configuration, no `.gitignore`.

What to put in the repository before the first line of computing code, in what
order, and — for each item — which industry practice it comes from and what
was deliberately left out of it.

Assumes [ADR 0002](decisions/0002-technology-stack.md): TypeScript, with GDAL
and WhiteboxTools as command-line tools. The practices in sections 1 to 9 are
stack-agnostic; only the toolchain table changes if that ADR is rejected.

---

## Why this project needs one

Three traits decide the shape. Everything below is traceable to one of them;
anything that is not traceable to one of them was cut.

**One person, working in bursts, often from a phone.** The harness has to
reconstruct context. After three weeks away, "what now" must be answerable
from the repository rather than from memory.

**A specification that is already an identifier system.** R1–R9, P1–P6, S1–S6,
UC-01…UC-20, FR-01…FR-35, NFR-01…NFR-10, R-01…R-11. Either those get wired
into commits, templates and CI, or in six months they are a dead document that
disagrees with the code.

**Results are numbers you cannot eyeball.** A wrong CRS, swapped units or a
half-pixel raster offset do not crash anything. They produce a plausible number
that is wrong. Code review does not catch this class of defect; tests and
narrow automated checks do.

## What "industry best practice" means here

The practices below are the ones with real evidence or genuine consensus
behind them. They were filtered against a rule: a practice designed to
coordinate a team of thirty, or to satisfy an auditor, is not automatically
good for a solo hobby project. Most of what is skipped is skipped because its
benefit is coordination, and there is nobody to coordinate with.

| Practice                                      | Source of authority                                   | Taken?                 |
| --------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| Trunk-based development, short-lived branches | DORA / Accelerate research; trunkbaseddevelopment.com | Yes                    |
| Conventional Commits                          | De facto standard, tooling ecosystem                  | Yes                    |
| Semantic Versioning                           | semver.org                                            | Yes, in 0.x            |
| Keep a Changelog                              | keepachangelog.com                                    | Yes, generated         |
| Architecture Decision Records                 | Nygard, MADR                                          | Yes, already started   |
| GitHub issue forms, PR templates              | GitHub-native                                         | Yes                    |
| Branch protection, required checks            | OpenSSF SCM Best Practices                            | Yes, narrow            |
| Pinned dependencies, frozen lockfile installs | OpenSSF Scorecard                                     | Yes                    |
| Automated dependency updates                  | Renovate / Dependabot                                 | Yes, grouped monthly   |
| Pinned GitHub Action SHAs                     | OpenSSF Scorecard                                     | Yes — cheap            |
| Diátaxis documentation structure              | diataxis.fr                                           | Partly, when docs grow |
| Requirement traceability matrix               | Safety-critical engineering                           | **Adapted** — see §10  |
| CODEOWNERS, review requirements               | Team practice                                         | No — solo              |
| Signed commits, DCO, CLA                      | Supply chain, legal                                   | No — no contributors   |
| OS and runtime version matrix in CI           | Library practice                                      | No — Linux only        |
| Monorepo build orchestration (Nx, Turborepo)  | Large TS repos                                        | Not yet — see §11      |

## 1. Integration and branching

Trunk-based development: `main` protected, linear history, branches that live
hours or days rather than weeks. This is the practice with the strongest
empirical backing in the DORA research, and its benefit is not team
coordination — it is that small batches make failures easy to attribute, which
matters as much alone as in a team.

Branch names carry the specification ID: `R2/sample-elevation-profile`.
Agent sessions keep their `claude/` prefix. Squash merge, so `main` has one
commit per unit of work and `git bisect` stays useful — which for a project
whose failures are wrong numbers is a genuinely important property.

## 2. Commits

Conventional Commits, English (ADR 0001), scope carries the ID:

```
feat(R2): sample elevation profile from NMT
fix(P1): correct descent speed on slopes above 25%
```

The body may add `Implements: FR-05, UC-01`. This is what makes §10 and the
changelog work without extra bookkeeping.

## 3. Versioning and release

SemVer within 0.x while there is no public API. Milestones map to versions:
alpha is 0.1, beta is 0.2, live narration (S5) is 1.0.

**release-please** rather than Changesets or semantic-release. The comparison:
semantic-release publishes automatically on every merge, which is right for a
library on a fast cadence and wrong for a project where a release should be a
deliberate act; Changesets is the strongest option for multi-package monorepos
with independent versions, but it asks for a hand-written changeset file per
PR, which is ceremony a single package does not need. release-please reads
Conventional Commits, keeps an open release PR with the computed version and
changelog, and releases when that PR is merged. Conventional Commits are
already being adopted for other reasons, so this comes almost free.

Because merges are squashed, the **pull request title** is the commit that
lands on `main`, and therefore the text release-please reads. That makes a
malformed title a release-notes defect rather than a style lapse, which is why
CI checks it (`tools/check-pr-title.ts`).

While below 1.0 both `feat` and `fix` bump the patch digit; a breaking change
bumps the minor. The milestone versions in the specification — 0.1 for alpha,
0.2 for beta — are deliberate acts, taken by putting `Release-As: 0.1.0` in a
commit body rather than by accumulating commits.

**Deployment: there is nothing to deploy for alpha.** The core is a library
with a CLI and the product is a PDF. Publishing to a registry waits until
somebody other than the author installs it. The mobile app (S5) gets its own
plan when it has something to replay. Stated explicitly so the harness does
not grow infrastructure on speculation.

## 4. Decisions

ADRs in `docs/decisions/`, numbered, MADR-shaped: context, decision,
consequences, alternatives, and — added here — an explicit _when to reverse
this_ section. The specification already contains "Decyzja architektoniczna"
blocks; new decisions land here instead of being buried in prose.

The rule that gives ADRs their value: **a new dependency requires an ADR.**
For a project whose core constraint is NFR-10 (no paid services) and whose
correctness depends on a small number of well-chosen geospatial tools, the
dependency list is the architecture.

## 5. Issues and pull requests

GitHub issue forms, four kinds:

| Form       | Required fields                                                       |
| ---------- | --------------------------------------------------------------------- |
| Track task | ID, requirements, use cases, "done when", field verification (NFR-06) |
| Defect     | Route and input data, expected vs actual value, model version         |
| Decision   | Context, options, choice, consequences — becomes an ADR               |
| Risk       | Description, when it must be settled, what it blocks if confirmed     |

PR template as a checklist: ID present, tests, CRS and units explicit (NFR-07),
result deterministic (NFR-08), `docs/coverage.md` current, no new dependency
without an ADR.

Labels in `.github/labels.json`, synced to GitHub by a workflow on change: `core`, `track:walking`,
`track:zaokno`, `milestone:alpha|beta|1.0`, `data`, `performance`, `decision`,
`risk`.

## 6. Continuous integration

GitHub Actions, free for public repositories (see D-04). Concurrency groups to
cancel superseded runs, dependency caching, path filters so documentation-only
changes skip the test matrix.

| Check                 | Tool                                             | When                           |
| --------------------- | ------------------------------------------------ | ------------------------------ |
| Lint and format       | ESLint (`strictTypeChecked`) + Prettier          | Every push                     |
| Types                 | `tsc --noEmit`, strict                           | Every push                     |
| Unit tests            | Vitest, budget 60 s                              | Every push                     |
| Golden-file tests     | Vitest snapshots against `data/sample/expected/` | Every push                     |
| Geospatial tool tests | GDAL, WhiteboxTools installed                    | Nightly and on label           |
| Traceability          | `tools/check-spec.ts`                            | Every push                     |
| Docs                  | Link check, markdown lint                        | Every push                     |
| Performance           | Benchmarks against NFR-01, NFR-02                | Nightly, non-blocking at first |

Required checks on `main`: lint, types, unit, golden, traceability. The
geospatial and performance jobs are deliberately not required — a nightly
signal that cannot block a merge is worth more than a slow required job that
teaches you to ignore it.

Actions pinned to commit SHAs, not tags, per OpenSSF Scorecard. Two minutes of
work, removes a whole class of supply chain surprise.

## 7. Testing strategy

The standard pyramid is the wrong primary axis for a project whose output is
numbers. Three layers that match the actual failure modes:

**Unit tests** for pure logic — window arithmetic, side-of-vehicle
determination, narration length fitting.

**Golden-file tests** as the direct implementation of NFR-08. Reference
inputs in `data/sample/`, expected outputs committed as JSON. Any change in
computed numbers shows up as a reviewable diff in the PR. This is the single
highest-value check in the whole harness: it is what catches the shifted
raster and the swapped units, and it costs almost nothing once the fixtures
exist.

**Property-based tests** with `fast-check` for invariants that hold for all
inputs: reprojection round-trips within tolerance, cumulative distance is
monotonic, a viewshed from a point is symmetric in the sense the algorithm
promises, visibility windows never have negative duration. This is the
underused technique for exactly this class of bug, and it is cheap in
TypeScript.

Sample data: one short GPX, one clipped NMT tile of a few MB, one drive
segment — committed, with `data/sample/SOURCES.md` recording provenance and
licence for each. Large data via `tools/fetch-data.ts` with checksums, never
in git. A CI check caps the size of `data/sample/`.

## 8. Supply chain and dependencies

Lockfile committed, `pnpm install --frozen-lockfile` in CI. Renovate grouped
into one monthly PR — for a solo project, a per-dependency PR stream is noise
that trains you to merge without looking. Node version pinned via `.nvmrc`
and corepack.

## 9. Documentation

Diátaxis (tutorial, how-to, reference, explanation) is the right structure and
the wrong amount of structure for four files. Adopt the vocabulary now, adopt
the directory layout when `docs/` exceeds roughly a dozen files. What matters
immediately is that the specification stays the single source of requirement
truth and nothing duplicates it — §10 is how that is enforced.

## 10. Requirement traceability

The part no repository template will give you, and the highest-value item
here after golden files.

Traceability matrices come from safety-critical engineering — DO-178C,
ISO 26262, IEC 62304 — where every requirement must be demonstrably covered by
design and test. That discipline arrives with certification ceremony that
would be absurd here. The idea underneath it is not absurd at all, and this
project has already done the expensive half by writing the identifiers.

Mechanism:

- Commit scope carries the ID; body carries `Implements: FR-05, UC-01`.
- Code declares what it implements, and tests what they cover, with a comment
  marker: `Implements: FR-05, UC-01` in `src/`, `Covers: FR-01` in `tests/`.
  The plan originally proposed a Vitest `{ tag: ... }` option; a comment won
  because it is runner-agnostic and works in source files too, which a test
  option cannot.
- `tools/check-spec.ts` verifies that every referenced ID exists in the
  specification, and regenerates `docs/coverage.md` — identifier by
  identifier, with the files claiming each. CI fails when it is stale.
- A pull request body is scanned the same way, so a made-up ID in
  `Implements:` fails the build rather than reaching `main`.

"How much of alpha is done" is then answered by a generated file. A made-up ID
in a PR body fails the build. The changelog groups itself by track.

## 11. The Claude Code harness

| File                             | Role                                                                                                                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                      | The project in ten sentences, where the specification lives, the ID discipline, how to run tests, definition of done, the prohibitions                                                                         |
| `.claude/settings.json`          | Pre-approves `pnpm install`, `pnpm run`, `pnpm exec`, `node tools/…` and read-only `git`. Deliberately **not** `pnpm add`: the dependency rule in §4 is enforced by the permission model rather than by memory |
| `.claude/hooks/session-start.sh` | Web session setup: `pnpm install --frozen-lockfile`, report missing GDAL or WhiteboxTools. Target: ready in under two minutes                                                                                  |
| `.claude/commands/task.md`       | `/task R2` — reads the spec by ID, opens issue, branch and plan                                                                                                                                                |
| `.claude/commands/coverage.md`   | `/coverage` — regenerates `docs/coverage.md`                                                                                                                                                                   |
| `.claude/commands/card.md`       | **Deferred until R1 exists.** There is no pipeline to run on a sample route yet                                                                                                                                |
| `.claude/agents/geo-reviewer.md` | Subagent reviewing diffs _only_ for CRS, units, raster axis direction and observer height                                                                                                                      |

The prohibitions are worth stating explicitly in `CLAUDE.md`, because every
one of them already exists in the specification and every one is the kind of
rule an agent will otherwise erode: no paid external service (NFR-10), no
hand-written raycaster, no mode branching in the core (NFR-05), no new
dependency without an ADR (§4), no in-process `proj4js` for coordinate
transforms (ADR 0002, R-11), no number shown to a user without its source and
model assumptions (FR-10).

`geo-reviewer` is the direct answer to the third trait in "Why this project
needs one". A general review will not notice that slope was computed on
geographic coordinates instead of projected ones. A narrow review with one job
will.

`CLAUDE.md` must fit on a screen and link to documents rather than summarise
them. A `CLAUDE.md` that restates the specification dilutes the parts that
matter and goes stale — the failure mode is silent, because nobody re-reads it.

---

## Stages

| Stage | Scope                                                                          | Done when                                                                                            |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| E0    | Hygiene: `.gitignore`, layout, conventions, licence, labels, ADR 0001 executed | **Done.** Fresh clone is clean; licence agrees with README                                           |
| E1    | Toolchain: `package.json`, lockfile, strict `tsconfig`, first tests, lint      | **Done.** `pnpm install && pnpm check` passes on a clean machine                                     |
| E2    | CI: lint, types, tests; branch protection                                      | **Done**, except branch protection, which is a repository setting — see below                        |
| E3    | Process: issue forms, PR template, Conventional Commits, release-please        | **Done**, with one manual step: a `RELEASE_PLEASE_TOKEN` secret — see below                          |
| E4    | Claude Code: `CLAUDE.md`, settings, hook, commands, subagent                   | **Done.** The hook provisions a clean clone in under 3 s and lint and tests run with no manual setup |
| E5    | Traceability: `check-spec.ts`, `docs/coverage.md` in CI                        | **Done.** An invented identifier fails the build, in code and in a pull request body                 |
| E6    | Prove it on R1 (GPX import)                                                    | Issue to release with no hand-editing of configuration                                               |

E0–E2 is one evening; E3–E5 a second. E6 is a measurement, not a formality.

> **Existence test for the harness.** R1 is small and dull — read a file,
> reduce it to one representation (FR-01, FR-04). If walking it from issue to
> release costs more than writing the code did, the harness is too heavy and
> must be cut before R2 starts. If it goes smoothly, the same path will carry
> R6.

## Open decisions

**D-01** — superseded by [ADR 0001](decisions/0001-language-of-the-repository.md).

**D-02** — superseded by [ADR 0002](decisions/0002-technology-stack.md).

**D-03 — Licence.** _Settled in E0: MIT._ GDAL is MIT/X-style, WhiteboxTools
is MIT, and GRASS is GPL but invoked as an external process, so its licence
does not reach this code. Still worth an ADR before any in-process GPL
dependency, which would change the answer.

**D-04 — Public repository now.** No secrets, and public repositories get
unlimited free Actions minutes. Recommended: public, with a README that says
plainly there is no code yet.

**D-05 — First real task.** R1 rather than R2: it exercises the harness
instead of the data.

**D-06 — Package layout.** Single package until there is a second consumer of
the core. When the mobile app arrives (S5), split into a pnpm workspace and
revisit Turborepo then — not before, and not on speculation.

## Settled while building E0-E2

**ESLint with `strictTypeChecked`, not Biome.** Type-aware rules are the
reason: this project orchestrates subprocesses, so `no-floating-promises` is a
correctness rule here rather than a style preference. It caught a real defect
within minutes of being switched on.

**TypeScript pinned to 5.x.** TypeScript 7, the native compiler, installs
happily but sits outside typescript-eslint's supported peer range, which would
cost the type-aware linting above. Revisit once typescript-eslint supports 7 —
the gain is a much faster `typecheck`.

**The package manager is pinned too.** `packageManager` in `package.json`
carries the exact pnpm version and its integrity hash, so corepack resolves
the same one locally and on a runner. Without it the first CI run failed at
setup: this container happens to have pnpm preinstalled, a runner does not.
The general lesson is the one in H-08.

**No runner dependency for tooling scripts.** Node 22 strips types natively, so
`tools/*.ts` runs under plain `node`, with no `tsx` or `ts-node` in the
dependency list.

**Float comparison is a lint error.** A custom `no-restricted-syntax` rule
rejects `===` between numbers and points at NFR-08. Computed distances and
elevations are compared with a tolerance or not at all.

**The release pull request needs a real token, for two reasons.** First,
repositories forbid Actions from creating pull requests unless that setting is
enabled, and `GITHUB_TOKEN` is Actions — the first run failed on exactly this.
Second, even with the setting on, a pull request opened by `GITHUB_TOKEN` does
not trigger other workflows, so CI would never report on the release pull
request, and a required check that never reports blocks the merge forever.

So the release job is **gated on a `RELEASE_PLEASE_TOKEN` secret** (a
fine-grained PAT with contents and pull-requests write) rather than left to
fail on every push. Without it the job writes a warning and a job summary and
passes. A prerequisite only a human can satisfy should be a visible notice,
not a permanent red X — a repository where `main` is always red is a
repository where nobody reads CI, which is H-02 arriving by a different road.

**Versioning needed two corrections the defaults got wrong.**
`include-component-in-tag` defaults to `true`, which would have produced tags
like `krajoskop-v0.1.0` rather than the `v0.1.0` this plan specifies. And with
no prior release, release-please proposes its default initial version of
1.0.0 regardless of the pre-major settings, so `initial-version` is pinned to
`0.0.1`. Both were caught by running it rather than by reading about it.

**Labels are not deleted by the sync.** A label absent from `labels.json` is
reported and left alone. Deleting it would strip it from whatever issue a
human put it on, which is worse than a stale label nobody uses.

**The release pull request had to be made to satisfy this repo's own rules.**
Two things only showed up once a real release pull request existed. Its title
was `chore(main): release 0.0.1`, and `main` is not a scope this repo allows,
so the Conventional Commit check rejected it — fixed by setting
`pull-request-title-pattern` rather than by widening the convention, because
that title becomes a commit on `main`. And `CHANGELOG.md`, which
release-please generates with `*` bullets where Prettier wants `-`, failed the
format check; it is now in `.prettierignore`, since formatting a generated
file is undone on the next release. General rule: **generated files are not
ours to format, and machine-authored titles still have to obey the
convention.**

**A checker must not be tripped by its own description.** The first version
of `check-spec.ts` matched `Implements:` and `Covers:` anywhere in a line, so
the pull request introducing it — which described its own negative tests —
failed CI on the examples in its prose. A claim is now a line that _begins_
with the marker, allowing comment and list punctuation but not quotes,
backticks or table pipes. The parsing moved into `tools/spec-claims.ts` so it
could be tested, and the line that broke CI is now a test case. The general
shape: a rule that scans text will eventually scan text _about_ the rule.

**One slash command is still deliberately absent.** `/card` needs a pipeline
that R1 has not built yet, and a command that errors reads as a broken harness
rather than as unbuilt work. `/coverage` was absent for the same reason until
E5 gave it something to run.

**Coverage records claims, not proof.** A covered row means a file says it
implements or covers that identifier. It does not mean the requirement is
satisfied. Saying so in the generated file matters, because a table of green
ticks invites exactly the wrong conclusion.

**The permission list encodes a rule.** `pnpm add` is not pre-approved, so
adding a dependency needs a human in the loop, which is what §4 asks for
anyway. Rules enforced by the mechanism outlive rules kept in a document.

**Branch protection is not in the repository.** It is a GitHub setting and
cannot be committed. Required checks to enable on `main` once the repository is
public (D-04): `Format, lint, types, tests` and `Documentation links`, plus
linear history and no force pushes.

## Deliberately skipped

Docker as the default environment; PostGIS, per the specification, until file
formats hurt; CODEOWNERS and review requirements; signed commits and DCO;
an OS matrix in CI (Linux only, because that is where visibility is computed);
any deployment infrastructure (§3); a Claude review workflow on pull requests
until E6 shows there is something worth reviewing.

## Risks

**H-01 — Harness larger than the project.** The classic way never to write any
code. Mitigated by a one-week budget, stages with standalone value, and the
existence test on R1.

**H-02 — False green without the geospatial tools.** The default run skips the
tests that exercise the point of the project. Mitigated by the nightly job and
by printing the skipped count in the run summary, so the gap is visible rather
than comfortable.

**H-03 — Specification drifting from code.** The largest threat to this
repository's value, since today the whole project _is_ the documents.
Mitigated by E5: IDs checked by a program, not by good intentions.

**H-04 — Sample data bloat.** Terrain models are heavy. Mitigated by a hard
size cap on `data/sample/` enforced in CI, with everything else fetched by
checksummed script.

**H-05 — Remote session limits.** Phone work means a container with a network
policy and a time limit. Mitigated by a start hook under two minutes, with
heavy downloads and tool-dependent tests confined to CI.

**H-06 — Conventions written for the agent rather than for a person.**
Mitigated by the one-screen rule for `CLAUDE.md`.

**H-08 — Local environment flattering the build.** A check that passes here
because this container happens to provide something is not a passing check.
The first CI run proved it: pnpm was preinstalled locally and absent on the
runner. Mitigated by pinning runtime and package manager versions in the
repository, and by treating CI rather than a local run as the verdict.

**H-07 — Hand-written numerics accumulating.** The cost accepted in ADR 0002.
Mitigated by golden-file and property-based tests, and by the 2000-line
threshold that triggers rewriting that ADR rather than patching it.

---

## Sources

- [Trunk Based Development](https://trunkbaseddevelopment.com/5-min-overview/) ·
  [Atlassian on trunk-based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development)
- [OpenSSF Scorecard](https://scorecard.dev/) ·
  [OpenSSF SCM Best Practices](https://best.openssf.org/SCM-BestPractices/)
- [Release automation compared: semantic-release, release-please, Changesets](https://oleksiipopov.com/blog/npm-release-automation/)
- [GDAL viewshed](https://gdal.org/en/stable/programs/gdal_raster_viewshed.html) ·
  [WhiteboxTools](https://www.whiteboxgeo.com/geospatial-software/)
- [proj4js](https://github.com/proj4js/proj4js) ·
  [pyproj transformation grids](https://pyproj4.github.io/pyproj/stable/transformation_grids.html)
- [Diátaxis](https://diataxis.fr/)
