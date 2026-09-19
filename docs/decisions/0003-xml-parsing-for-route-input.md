# 0003 — XML parsing for route input

**Status:** Accepted
**Date:** September 2026
**Related:** [0002 — Technology stack](0002-technology-stack.md), R1, FR-01…FR-04

## Context

R1 has to read GPX and KML. Both are XML, and the project had no runtime
dependency at all until now — deliberately, because
[the conventions](../conventions.md) make the dependency list part of the
architecture and require an ADR before adding to it.

Three shapes of answer were considered, and the deciding facts were checked
rather than assumed.

| Option                                       | Direct | Transitive | Licence           |
| -------------------------------------------- | ------ | ---------- | ----------------- |
| `fast-xml-parser`, map its output by hand    | 1      | **6**      | MIT               |
| `@xmldom/xmldom` alone, read the DOM by hand | 1      | 0          | MIT               |
| `@xmldom/xmldom` + `@tmcw/togeojson`         | 2      | **0**      | MIT, BSD-2-Clause |

`fast-xml-parser` was the first instinct and the worst fit: version 5 brings
six transitive packages, which is a poor trade for a project whose stated
constraint is that dependencies are architecture.

## Decision

**`@xmldom/xmldom` for the DOM, `@tmcw/togeojson` to read GPX and KML from
it.** Two packages, no transitive dependencies, both permissively licensed,
both offline — nothing here contacts a network, so NFR-03, NFR-04 and NFR-10
are untouched.

The reason to prefer it over parsing the DOM by hand is not effort, it is
**quirks**. FR-02 and FR-03 are promises about files produced by
mapa-turystyczna.pl and Google My Maps, and real consumer exports carry
namespace variations, `gx:Track` extensions, `MultiGeometry` and inconsistent
elevation handling. A hand-written reader passes synthetic fixtures precisely
because the author invented the fixtures; it meets the real file later.

That was borne out immediately. Timestamps are not where the obvious guess
puts them: `togeojson` exposes them at
`properties.coordinateProperties.times`, not the `coordTimes` of its earlier
major version, and `_gpxType` is what distinguishes a `trk` from an `rte`.
Both were found by running it, and both would have been wrong from memory.

GeoJSON is not the project's representation. FR-04 requires one internal
`Route`, so the converter's output is an intermediate that is mapped into it
and never escapes the reader module.

## Consequences

**Good.** GPX tracks, GPX routes and KML all arrive through one well-tested
converter. Two files, one licence check each, nothing transitive to audit.
The reader is the only module that knows about XML or GeoJSON.

**Bad.** `togeojson` is typed for a browser `Document`, so the Node DOM needs
a cast at the boundary — one `as` in one place, which is worth isolating and
commenting rather than spreading. GeoJSON also flattens elevation into the
coordinate tuple, so the mapping has to pull it out deliberately and name it
`elevationFromFileM`, per FR-05: elevation in the file is for comparison and
is never the elevation of a point.

**A limit found in use.** `togeojson` discards KML's `altitudeMode`, so the
third coordinate arrives stripped of the thing that says whether it is an
elevation at all. Under the default `clampToGround` it is defined to be
ignored. The reader therefore reads `altitudeMode` from the document itself
and only keeps an elevation declared `absolute` — delegation covers the
geometry, not the semantics attached to it.

**Unverified.** These packages are being trusted against real exports that
have not been obtained yet. The fixtures committed with R1 are synthetic. FR-02
and FR-03 remain structurally satisfied and empirically untested until a real
mapa-turystyczna.pl GPX and a real My Maps KML have been loaded.

## When to reverse this

- If real exports turn out to need pre-processing that `togeojson` cannot do,
  the reader already owns the boundary, so swapping the converter touches one
  module.
- If a second XML format arrives that `togeojson` does not cover, prefer
  reading the DOM directly for that one over adding a third parser.
