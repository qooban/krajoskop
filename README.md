# Krajoskop

An instrument for viewing the country.

Krajoskop computes, from a digital terrain model, the things no hiking app
reports, and puts them in a single document.

**Walking mode** answers "what will this cost me and when should I leave":
real walking time calibrated on your own tracks, a gradient map that
distinguishes ascents from descents, how shade moves across a given day,
named summits from viewpoints.

**Driving mode (Zaokno)** answers "what will we see on the way": what is
visible from the road, on which side, for how long, where you are allowed to
stop and when the light will be good. The narration is read by **Włóczykij**.

Both modes rest on one computing core and are developed in parallel.

## What this is not

Not another audio guide and not another trails app. The market for GPS
narration in the car is saturated — see the [market research](docs/market-research.md).
Krajoskop is the layer of **visibility and terrain analysis** that nobody has,
delivered through two channels: a card to read and narration on the move.

The sentence meant to separate this project from its competition:

> On the left, in two minutes, a view of the Tatras will open up, for forty
> seconds.

That is the result of a computation on a terrain model, not an entry in a list
of roadside attractions.

## Documentation

| Document                                           | Contents                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| [docs/specification.md](docs/specification.md)     | Personas, modes, architecture, development tracks, use cases, requirements, risks |
| [docs/market-research.md](docs/market-research.md) | What already exists, where the gap is, sources                                    |
| [docs/harness.md](docs/harness.md)                 | Working standards in the repository and the harness for Claude Code               |
| [docs/conventions.md](docs/conventions.md)         | Commits, branches, code and documentation style                                   |
| [docs/glossary.md](docs/glossary.md)               | Domain terms, Polish to English                                                   |
| [docs/decisions/](docs/decisions/)                 | Architecture decision records                                                     |

## Stack

Everything on free licences, without a single paid service.

- **Language** — TypeScript on Node.js. See [ADR 0002](docs/decisions/0002-technology-stack.md)
- **Terrain data** — DTM and DSM from airborne laser scanning (GUGiK, free),
  BDOT10k, PRNG; Copernicus DEM as a fallback outside Poland
- **Rasters and geometry** — GDAL CLI, WhiteboxTools, `geotiff.js`, `turf.js`
- **Visibility** — `gdal raster viewshed`, WhiteboxTools, GRASS GIS `r.viewshed`
- **Sun** — `astronomy-engine`, computed locally
- **Routing** — Valhalla or GraphHopper
- **Language model** — Bielik (Apache 2.0, run locally)
- **Speech synthesis** — Piper (MIT, CPU only, offline, Polish voice)
- **Maps in the application** — MapLibre GL with PMTiles

The repository is written in English; the product speaks Polish. See
[ADR 0001](docs/decisions/0001-language-of-the-repository.md).

## Status

Alpha specification, and the repository harness being put in place. No
computing code yet.

Next step: finish stages E0–E2 of [the harness plan](docs/harness.md), then
R1 — route loading.

## Licence

MIT. See [LICENSE](LICENSE).
