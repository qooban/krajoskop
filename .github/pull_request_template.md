<!--
The title becomes the commit on main, because merges here are squashed.
Write it as a Conventional Commit; CI checks it.

  feat(R2): sample elevation profile from the terrain model
-->

## What and why

<!-- What changed, and the reason. The diff shows the what; this is for the why. -->

Implements:
<!-- FR and NFR IDs, e.g. FR-05, UC-01. Write "none" for harness work. -->

## Checklist

- [ ] Units and coordinate reference system are explicit at every boundary (NFR-07)
- [ ] The result is deterministic for the same input (NFR-08)
- [ ] Tests cover the change, and any golden files were regenerated deliberately rather than to make a failure go away
- [ ] No new dependency, or an ADR accompanies it
- [ ] No mode branching added to the core (NFR-05)
- [ ] Every number newly shown to a user carries its source (FR-10)

## Field verification

<!--
NFR-06: how this was, or will be, checked on foot or from the car.
"Not directly verifiable" is a fine answer for plumbing — say it rather than
inventing something.
-->
