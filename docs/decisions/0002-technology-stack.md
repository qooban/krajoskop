# 0002 — Technology stack

**Status:** Proposed
**Date:** September 2026
**Related:** [0001 — Language of the repository](0001-language-of-the-repository.md)

## Context

The specification names a Python stack — `rasterio`, `geopandas`, `pvlib`,
GRASS GIS — chosen on the reasonable assumption that serious geospatial work
means Python. The working preference is a full TypeScript stack, with one
condition: *Python must not decisively beat TypeScript in the availability of
solutions useful to this project.*

That is the right test. This ADR answers it capability by capability rather
than by reputation, because the reputation answer ("Python owns geospatial")
turns out to be misleading for this particular project.

## The fact that decides it

**The heavy geospatial work in Krajoskop is not available as a Python library.
It is available as a command-line binary, and binaries do not care what calls
them.**

Viewshed — the entire premise of the project — is `r.viewshed` in GRASS,
`gdal raster viewshed` in GDAL 3.11 and later (as `gdal_viewshed` since 3.1),
and `Viewshed` in WhiteboxTools, an MIT-licensed Rust package of 450+ tools
shipped as a standalone executable. The same is true of slope, aspect,
hillshade, warping, reprojection and georeferencing: `gdaldem`, `gdalwarp`,
`gdal_translate`, WhiteboxTools. Python reaches these tools through
subprocess calls and thin wrappers. So does Node.

The specification already forbids writing a raycaster by hand. That rule,
which exists for correctness reasons, happens to neutralise the single
largest argument for Python: the code that must not be written in Python is
also the code that must not be written in TypeScript.

The same holds for the two non-geospatial heavyweights. Bielik runs behind an
HTTP endpoint (llama.cpp or Ollama). Piper is a CPU binary reading text and
writing a WAV file. Valhalla and GraphHopper are servers. Every one of them
is language-agnostic.

## Capability matrix

Assessed against the specification's own track IDs.

| Need | Python | TypeScript | Verdict |
|---|---|---|---|
| R1 GPX and KML import | `gpxpy`, `fiona` | `@tmcw/togeojson`, XML parsers | Tie |
| R2 DEM read, windowed | `rasterio` | `geotiff.js` (pure JS, COG windows), `gdal-async` | Tie |
| R2 profile smoothing | `scipy.signal` | hand-written, ~50 lines | **Python** |
| R3 slope, aspect | `richdem`, `gdaldem` | `gdaldem`, WhiteboxTools | Tie — CLI |
| R4 solar position | `pvlib`, `astral` | `astronomy-engine`, `suncalc` | Tie |
| R4 terrain shading | GRASS, derived from viewshed | same tools | Tie — CLI |
| R5, R6 viewshed | GRASS `r.viewshed` | `gdal raster viewshed`, WhiteboxTools | Tie — CLI |
| R7 OSM and PRNG matching | `geopandas`, `shapely`, `osmnx` | `turf.js`, JSTS, Overpass clients | Slight Python |
| R8 landcover masks from NMPT | `rasterio` | GDAL CLI | Slight Python |
| R9 georeferencing old maps | GDAL CLI | GDAL CLI | Tie |
| CRS transforms | `pyproj`, full PROJ pipelines and grids | `proj4js`, Helmert only | **Python** — see R-11 |
| P1 walking-model calibration | `scipy.optimize`, `statsmodels` | hand-written least squares | **Python** |
| P5 printable route card | `reportlab`, `weasyprint` | HTML plus Playwright, or Typst | **TypeScript** |
| Map rendering, PMTiles | bindings | MapLibre GL, `pmtiles` — native home | **TypeScript** |
| S5 mobile app | not applicable | React Native or Expo | **TypeScript** |
| Bielik, Piper, routing | subprocess or HTTP | subprocess or HTTP | Tie |

Python wins four rows. Three of them — smoothing, calibration, statistics —
are the same row wearing different hats: **numerical glue**. That is the real
finding, and it is narrower than "Python owns geospatial".

## The structural argument

The specification already draws the decisive line, in the architecture
section: *the phone computes nothing, it replays a prepared timeline.*
S5 is a mobile app. The map layer is MapLibre GL and PMTiles. The route card
is a document.

**This project contains TypeScript whether or not anybody decides to use
TypeScript.** The question was never Python versus TypeScript. It was whether
the project should contain Python *as well*.

For a solo project worked on in bursts, often from a phone, through an agent,
a second language is not a neutral cost. It is a second toolchain, a second
lockfile, a second CI setup, a second set of conventions in `CLAUDE.md`, and
an interop boundary that has to be serialised, versioned and tested.

## Performance is not the tiebreaker

NFR-01 asks for a 30 km walking route in under 10 seconds; NFR-02 for a 150 km
drive analysed in minutes. Under the design above, nearly all of that wall
clock is spent inside GDAL, WhiteboxTools or GRASS subprocesses operating on
rasters. The orchestrating language contributes process spawning, I/O and
bookkeeping. Node is at least as good as Python at supervising many
concurrent subprocesses, and better at it ergonomically.

R-03 in the specification — viewshed along a line being expensive — is a real
risk, and it is identical in both languages. It is solved by downsampling the
DEM for long-range visibility and by choosing observer spacing, not by
choosing a runtime.

## Decision

**TypeScript is the language of the project. Heavy raster work is delegated
to GDAL and WhiteboxTools as command-line tools. Python is not a runtime
dependency.**

- Node.js LTS, TypeScript in strict mode. Node rather than Deno, to keep
  native addons such as `gdal-async` available if `geotiff.js` proves
  insufficient; Deno's single-binary toolchain is attractive and can be
  revisited once it is clear no native addon is needed.
- Geospatial compute: GDAL CLI and WhiteboxTools, invoked through one narrow
  module that owns every subprocess call, so the tool boundary is testable
  and mockable in one place.
- In-process raster reads: `geotiff.js` for sampling elevations along a route.
- Vector geometry: `turf.js`.
- Sun: `astronomy-engine`.
- **All coordinate transformations go through GDAL or PROJ on the command
  line, never through `proj4js` in process.** See R-11.
- Python is permitted for exploration only — notebooks investigating why the
  walking model misfits — and those notebooks are not imported by any code
  path, not run in CI, and not required to reproduce any product output.
  They read and write the same GeoTIFF and JSON artefacts as everything else.

## Consequences

**Good.** One toolchain, one dependency manager, one test runner, one set of
conventions. The presentation layer, the map, the route card and the mobile
app are all in their native ecosystem. `CLAUDE.md` describes one language,
so agent sessions stop context-switching. The compute core stays honest: by
being unable to reach for a Python library, it has to keep the real work
inside tools that were written by geospatial specialists.

**Bad, and worth naming.** Roughly 500 to 1500 lines of numerical code will
be written by hand that Python would have supplied: Savitzky-Golay or
equivalent smoothing (FR-06), interpolation and resampling, a least-squares
fit for the walking-time model (FR-13), and error statistics for the alpha
exit criterion. These are well-specified, well-documented algorithms and they
are exactly the kind of thing that must be covered by golden-file tests
anyway under NFR-08 — but they are work, and they are the work Python would
have made free. `numpy-ts` exists as of 2026 and is roughly twice as slow as
native NumPy; it is not yet a foundation to build on.

**New risk R-11 — coordinate precision.** `proj4js` supports Helmert
transformations but not grid-based datum shifts, where `pyproj` exposes the
full PROJ pipeline machinery. For Poland this is smaller than it sounds:
EPSG:2180 is ETRS89-based, and ETRS89 differs from WGS84 by roughly half a
metre to a metre. Against a 1 m NMT that is borderline, not fatal — but it is
precisely the class of silent error NFR-07 exists to catch. Mitigation is the
rule stated above: reprojection happens in GDAL, and a test asserts known
control points round-trip within tolerance. Vertical datum — Kronsztadt'86
and PL-EVRF2007-NH against ellipsoidal heights — needs a geoid model and is
equally a problem in both languages, so it is a project risk, not a stack
argument.

## When to reverse this

Written down now, while it is cheap to be honest:

- If the calibration work in P1 turns into genuine statistical modelling
  rather than curve fitting, move that one component to Python behind a file
  boundary. Not the whole project.
- If `geotiff.js` cannot handle NMT tiles at the sizes involved and
  `gdal-async` proves unstable, reconsider — that would mean the in-process
  raster story has no good answer in Node.
- If more than about 2000 lines of hand-written numerics accumulate, the
  premise of this ADR has failed and it should be rewritten, not patched.

## Alternatives considered

**Python core, TypeScript presentation.** The seam the specification implies.
Genuinely defensible, and the strongest alternative: it puts each layer in
its best ecosystem and the interop boundary falls exactly where the
architecture already has one. Rejected because the cost of two toolchains is
paid every single working session, while the benefit — scipy — is paid out in
a handful of modules.

**Full Python, including the app.** Rejected. React Native or Expo has no
Python equivalent, so this does not actually avoid a second language; it only
postpones it to S5, the most complex milestone, which is the worst possible
moment to discover it.

**Deno instead of Node.** Tempting: TypeScript without a build step, and
linting, formatting and testing in one binary, which suits a harness-light
solo project. Held back only by native addon compatibility. Revisit at E6.
