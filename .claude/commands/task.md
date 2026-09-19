---
description: Start work on a specification ID (R2, P1, S4)
argument-hint: <track ID>
---

Start work on track item **$ARGUMENTS**.

The specification is the source of truth — read it rather than inferring from
the ID.

1. Find `$ARGUMENTS` in `docs/specification.md`, in the development tracks section.
   Report its scope and what it requires. If the ID does not exist, say so and
   stop; do not invent one.

2. Check its dependencies are actually done. A track item whose prerequisite
   is unbuilt is not ready to start, and saying so now is cheaper than
   discovering it three files in.

3. Gather what constrains it:
   - the FR and NFR requirements it has to satisfy,
   - the use cases it serves,
   - any risk (R-01 and up) that touches it — several are explicitly flagged
     as "settle before" a given track item.

4. Propose, and wait for agreement before writing code:
   - a branch name, `$ARGUMENTS/<short-slug>`,
   - the "done when" condition, checkable rather than a feeling,
   - how it gets verified in the field (NFR-06), or an honest statement that
     it is plumbing and cannot be,
   - the smallest first commit that leaves the repository working.

5. Once agreed, create the branch and start. Read `CLAUDE.md` for the
   prohibitions and the definition of done before the first edit — in
   particular: units and coordinate systems in identifiers, no reprojection in
   process, no new dependency without an ADR.
