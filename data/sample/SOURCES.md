# Sample data

Fixtures for tests. Small on purpose: `docs/harness.md` (H-04) caps what may
live in git, and anything larger is fetched by script instead.

| File | What it is | Provenance | Licence |
|---|---|---|---|
| `polica-track.gpx` | GPX `trk` with elevations and timestamps | **Synthetic**, hand-written for this repository | Same as the repository (MIT) |
| `polica-planned.gpx` | GPX `rte`, no timestamps | **Synthetic** | MIT |
| `beskid-niski-drive.kml` | KML in the shape Google My Maps exports | **Synthetic** | MIT |
| `beskid-niski-absolute.kml` | The same drive, declaring `altitudeMode` `absolute` | **Synthetic** | MIT |
| `polica-paused.gpx` | A paused recording: two `trkseg`s, first fix untimed | **Synthetic** | MIT |

## These are not real exports, and that matters

Every file here was written by hand to exercise the *shape* of its format.
None came out of mapa-turystyczna.pl, a GPS watch or Google My Maps.

So they demonstrate FR-01 and FR-04, and they do **not** demonstrate FR-02 or
FR-03, which are promises about what those particular services emit. Real
consumer exports carry namespace variations, extension elements and
inconsistent elevation handling that invented fixtures never will — a parser
passes fixtures its own author wrote almost by construction.

Replacing these with one real export from each service is genuine outstanding
work, not tidying. Coordinates are around Polica in the Beskid Żywiecki and a
stretch of the Beskid Niski, matching the pilot region in the specification.
