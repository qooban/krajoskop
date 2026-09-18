# 0001 — Language of the repository

**Status:** Accepted
**Date:** September 2026
**Supersedes:** nothing

> This ADR is written in English on purpose. It is the proposal demonstrating
> itself. If the decision goes the other way, this file gets translated —
> it is new and short, so the cost of being wrong here is an hour.

## Context

Everything in the repository today is Polish: README, specification, market
research. The product is emphatically Polish — PRNG place names, GUGiK data,
Polish declension in narration (FR-31), Polish speech synthesis, Polish users.

But the repository is already a creole in every sentence that talks about
engineering. The specification says _harness_, _release_, _deployment_,
_pull request_, _use case'y_, _routing_, _stack_. Not out of laziness —
because there are no Polish words for those that a working programmer uses.

The effect compounds. Writing the harness plan, I had to coin terms for things
that have perfectly good English names: _bieg_ for a CI run, _recenzent-geo_
for a review subagent, _testy złote_ for golden-file tests. Those are
neologisms, they are mine, and nobody else says them. A reader — human or
model — has to decode them on every encounter. That decoding cost is paid
forever, by every session, in every file.

There are two distinct vocabularies in this project and they have been
conflated:

- **Domain vocabulary** — _Krajoskop_, _Zaokno_, _Włóczykij_, _zdarzenie
  widokowe_, _osnowa narracji_. Invented, evocative, and load-bearing.
  This is the product's own language and it is an asset.
- **Engineering vocabulary** — commit, branch, lint, fixture, viewshed,
  changelog. Borrowed from English, standardised worldwide, with exact
  meanings that Polish translations blur.

## Decision

**The repository is written in English. The product speaks Polish.**

| Layer                                                              | Language              |
| ------------------------------------------------------------------ | --------------------- |
| Code, identifiers, comments, docstrings                            | English               |
| Documentation in `docs/`, README                                   | English               |
| Commit messages, branch names, issue and PR text                   | English               |
| `CLAUDE.md` and everything under `.claude/`                        | English               |
| Narration text, route cards, UI strings, CLI output shown to users | **Polish**            |
| Test fixtures for Polish grammar, PRNG name forms                  | **Polish**            |
| Proper nouns: Krajoskop, Zaokno, Włóczykij, Beskidy                | **Polish, unchanged** |

Domain terms that earn their keep keep their Polish names as identifiers —
`zaokno`, `wloczykij` — with a glossary at `docs/glossary.md` mapping each to
its English gloss and its definition in the specification. A term qualifies
when it names something with no English equivalent. `osnowa narracji` becomes
`narrationTimeline`; `Zaokno` stays `Zaokno`, because it is a product name.

The Polish output of the product stops being an accident of the documentation
language and becomes an explicit, testable feature: FR-31 declension and
FR-32 registers get Polish fixtures and assertions, because they are
requirements, not a side effect of how the repo happens to be written.

## Consequences

**Good.** No translation layer at any boundary — library names, error
messages, stack traces, tool documentation and your own code finally agree.
Conventional Commits stop reading as half-English (`feat(R2): próbkowanie
profilu` becomes `feat(R2): sample elevation profile`). Sessions driven from
a phone produce consistent prose instead of drifting between languages
mid-paragraph. If the repository ever goes public — and the market research
is about a global market — it is already legible.

**Bad.** About 660 lines of good Polish prose need translating. The
specification is genuinely well written and some of its voice will not
survive intact; the terse assertive register it uses works in English, but
lines like _„Przyrząd do oglądania kraju"_ lose something. Some pleasure is
lost: writing a hobby project in your own language is part of why it is
a hobby project.

**Timing.** This is reversible now and effectively irreversible later. Today
it is three documents. After R2 it is documents plus identifiers plus test
names plus commit history. Decide before any code exists.

## Alternatives considered

**Keep everything Polish.** Honest to the project's character and to its
domain. Rejected because the creole is already there and will worsen with
every technical file added: the ratio of borrowed English to Polish rises
steeply as soon as there is tooling to describe.

**Polish docs, English code.** The previous plan's D-01. Rejected: it puts
the boundary in the worst possible place. Every commit message and every PR
description sits on the seam, so both languages are used within single
sentences — exactly the register that produced the neologisms in the first
place.
