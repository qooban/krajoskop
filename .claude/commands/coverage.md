---
description: Regenerate the requirement coverage table
---

Regenerate `docs/coverage.md` from the specification and the claims made in
code.

1. Run `pnpm run coverage`.

2. If it fails, it has found a claim about an identifier that does not exist
   in `docs/specification.md`. Do not invent the identifier to make the error
   go away — either the claim is a typo, or the specification needs the
   identifier adding first. Say which.

3. Report what changed: which identifiers gained or lost claims, and the
   overall count. If nothing changed, say so rather than showing a diff of
   nothing.

Remember what the table means: a row is covered when some file _claims_ to
implement or cover it. That is a record of intent, not proof the requirement
is satisfied.
