# Krajoskop — specification

**Version:** alpha
**Date:** September 2026
**Pilot region:** the Beskids, and routes from Kraków into Podkarpacie

A living document. Changed as the project is built.

---

## In short

Krajoskop computes, from a digital terrain model, the things no hiking app
reports, and puts them in a single document.

For someone walking: real walking time calibrated on your own tracks, a
gradient map that distinguishes ascents from descents, how shade moves across
a given day, named summits from viewpoints.

For someone driving: what is visible from the road, on which side, for how
long, and when the light will be good.

Both modes are equals and are developed in parallel. They need not be equally
mature at the same moment — the driving mode has the better chance of being
interesting, because it is the less crowded one.

> A project run for pleasure, not against a deadline. The consequence: every
> step must be useful on its own and verifiable in the field — on foot or from
> the car.

## Naming

| Name          | Meaning                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| **Krajoskop** | The project, the engine, the repository. An instrument for viewing the country |
| **Zaokno**    | The name of the driving mode in the interface                                  |
| **Włóczykij** | The name of the voice narrating in the car                                     |

A note on the last entry: _włóczykij_ works in Polish as a common noun
(a wanderer, a rambler), but it is also the Polish name of the Moomin
character known in English as Snufkin, and the Moomins are actively licensed
property. The voice name stays strictly internal and carries no visual
allusion. Before any publication or commercialisation — to be checked against
trade mark registers.

---

## Who it is for

### A guide leading groups — walking mode

Plans an outing for a group of mixed fitness and is responsible for getting
them back before dark. Needs numbers, not impressions.

> "I need to know whether the descent is passable with people in their
> sixties, and what time we will realistically reach the hut — not according
> to a calculator that assumes 4 km/h."

### A weekend walker — walking mode

Chooses a route on Friday evening and walks it on Saturday. Reads a finished
card and configures nothing.

> "I want to know what I am signing up for before I leave the house — and
> whether it is worth getting up earlier so I am not climbing the whole
> ascent in full sun."

### A family on the road — driving mode

Driving through the mountains on holiday. The driver drives, the passengers
look out of the window and are bored after an hour. The children are the
critical audience: either the content lands at the right moment, or they stop
listening.

> "We passed some castle and nobody knew what it was. I want to hear in
> advance that in five minutes, on the left, there will be something worth
> looking at."

---

## Two modes

The modes are not variants of one function with different constants. They ask
a different question, are consumed at a different moment, and have a different
critical constraint. The computing core is shared.

|                   | Walking                                | Driving                            |
| ----------------- | -------------------------------------- | ---------------------------------- |
| Question          | What will this cost me?                | What will we see?                  |
| Moment            | Before setting out                     | While driving                      |
| Medium            | A document, print                      | Voice, hands-free                  |
| Travel time       | A hard problem, the heart of the track | Solved by routing                  |
| Gradient          | Crucial                                | Irrelevant outside passes          |
| Visibility        | From a point, a panorama               | Along a line, with side and timing |
| Sun               | Shade on the ascent                    | Glare, light at a stopping place   |
| Constraint        | Fitness, time until dusk               | A visibility window in seconds     |
| Market saturation | High                                   | For the analysis — zero            |

Visibility along a line is a generalisation of visibility from a point. Same
mathematics, different extent. That is why there is one core and not two.

---

## Usage stories

### Walking mode

On Saturday, Marek is leading ten people up Polica. He has last year's track.
He uploads it, gives the date and the planned start time.

Walking time comes out at 5 h 40 min instead of the 4 h 20 min on the
signpost, because the model works segment by segment and knows that descending
a steep slope is slower than walking on the flat. On the third kilometre of
the descent he sees a 27% section over 400 metres and notes it as a place to
take a break.

He moves the start-time slider. At 07:00 the whole ascent is in the shade of
the eastern slope; at 10:00 the last hour falls in full sun on an exposed
ridge. He sets 07:00, exports the card to PDF and sends it to the group.

### Driving mode

Two weeks later the same family drives through the Beskid Niski. Marek plans
the route in Google Maps, exports it and uploads it. He gets a trip card: the
route as an axis with distance markers, and against it what will appear, on
which side and for how long.

At kilometre 34, on the right, for a minute and a half, a valley with a
wooden Orthodox church is visible — from a visibility computation, not from a
list of roadside attractions. Two kilometres further on there is a lay-by with
a better view, and at that hour the sun is behind them, so photographs will
come out. The card marks it as a sensible stop.

In the car Marek switches on playback. The phone knows position and speed and
plays ahead of time: _"in two minutes, on the right, a valley will open up,
with an eighteenth-century wooden church in it."_ The children look the right
way, because they know when and where. There is no signal — the whole card was
computed and downloaded before departure.

---

## Architecture

Three layers. The core computes, the tracks consume, the applications present.

**Core.** Route loading, terrain sampling, gradient, slope aspect, solar
position, shading, visibility from a point and along a line, matching points
from OpenStreetMap, the historical layer. A pure computing library with no
knowledge of modes.

**Tracks.** Composition of core results in answer to the questions of a
specific mode. A mode is configuration and a choice of analyses, not a
separate path through the computing code.

**Presentation.** The card as a document, and a mobile application replaying a
prepared card. The application computes nothing — it replays a timeline
computed earlier.

> **Architectural decision.** The heavy analysis happens before departure, on
> a machine with power and data. The phone receives a finished, lightweight
> structure: a list of events with distance marker, side, time window and
> content. This is what lets live narration work offline without computing
> visibility on the device.

---

## Stack

Everything on free licences, without a single paid service. The whole chain,
from data to the voice in the car, can be run locally.

See [ADR 0002](decisions/0002-technology-stack.md) for why the implementation
language is TypeScript and why the heavy raster work is delegated to
command-line tools.

| Layer                   | Choice                                                        | Notes                                            |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| Terrain model           | DTM, DSM — NMT and NMPT (GUGiK)                               | Free. NMPT includes buildings and vegetation     |
| Topographic objects     | BDOT10k                                                       | Downloaded per county TERYT code                 |
| Names                   | PRNG                                                          | Official Polish names, correct grammatical forms |
| Trails, roads, POI      | OpenStreetMap                                                 | Lay-bys, car parks, viewpoints                   |
| Rasters and vectors     | GDAL CLI, WhiteboxTools, `geotiff.js`, `turf.js`              |                                                  |
| Visibility              | `gdal raster viewshed`, WhiteboxTools, GRASS GIS `r.viewshed` | Do not write a raycaster                         |
| Sun                     | `astronomy-engine`                                            | Computed locally, no network                     |
| Routing                 | Valhalla or GraphHopper                                       |                                                  |
| Language                | Bielik                                                        | Apache 2.0 from version 2.0, run locally         |
| Speech synthesis        | Piper                                                         | MIT, CPU only, offline, Polish voice             |
| Maps in the application | MapLibre GL + PMTiles                                         | No Google                                        |
| Data download           | QGIS plugin "Pobieracz danych GUGiK"                          | Manual at first, scripted later                  |

A spatial database (PostGIS) only once geometry queries start getting in the
way. At the scale of one region, a file format is enough.

---

## Development tracks

Dependencies are explicit. Tracks run in parallel but need not be equally
advanced.

### Core

| ID  | Scope                                                                  | Requires |
| --- | ---------------------------------------------------------------------- | -------- |
| R1  | Route loading: GPX, mapa-turystyczna.pl, Google Maps                   | —        |
| R2  | Terrain model sampling, elevation profile, smoothing                   | R1       |
| R3  | Gradient and slope aspect                                              | R2       |
| R4  | Solar position and shading by terrain                                  | R3       |
| R5  | Visibility from a point, and the horizon line                          | R2       |
| R6  | Visibility along a line, split by side, with a time window             | R5       |
| R7  | Points from OpenStreetMap and PRNG, matched to visibility results      | R5       |
| R8  | Land cover model: forest and buildings as occluders                    | R5       |
| R9  | Historical layer: georeferencing archival maps, "what used to be here" | R7       |

### Walking track

| ID  | Scope                                                               | Requires |
| --- | ------------------------------------------------------------------- | -------- |
| P1  | Walking time computed per segment and calibrated on your own tracks | R2       |
| P2  | Gradient map, critical sections, difficulty classification          | R3       |
| P3  | Shade along the route, and choosing a start time                    | R4       |
| P4  | Panorama from viewpoints with summit names                          | R5, R7   |
| P5  | Route card: a document, export for print                            | P1–P4    |
| P6  | Route generation from points by criteria in natural language        | R7, P1   |

### Driving track (Zaokno)

| ID  | Scope                                                                    | Requires |
| --- | ------------------------------------------------------------------------ | -------- |
| S1  | Trip card: what is visible, on which side, for how long                  | R6, R7   |
| S2  | Stops: a good view plus a legal place to pull over                       | S1       |
| S3  | Sun: driver glare, light at the stopping place                           | R4       |
| S4  | Narration content fitted in length to the visibility window              | S1       |
| S5  | Mobile application: live playback, geofencing, speech synthesis, offline | S4       |
| S6  | Generating a scenic route from points by criteria                        | R6, R7   |

### Milestones

**Alpha.** R1, R2, P1, R5 and R6 in rough form, S1 on one short route.
Goal: see both modes working on your own data, even if ugly.

**Beta.** R3, R4, R7, R8; P2–P5; S2–S4. Goal: a complete card in both modes,
verifiable in the field.

**1.0.** S5 — live narration in the car. Then R9, P6 and S6.

---

## Use cases

| ID    | Use case                                                          | Track |
| ----- | ----------------------------------------------------------------- | ----- |
| UC-01 | Load a GPX track and display the elevation profile                | R     |
| UC-02 | Load a route planned on mapa-turystyczna.pl                       | R     |
| UC-03 | Load a driving route planned in Google Maps                       | R     |
| UC-04 | Estimate real walking time, split by segment                      | P     |
| UC-05 | Compare the estimate with actual time from a track, and calibrate | P     |
| UC-06 | Identify steep sections, ascents and descents separately          | P     |
| UC-07 | Determine shade along the route for a date and time               | P     |
| UC-08 | Choose a start time against a user's criterion                    | P     |
| UC-09 | Identify summits visible from a viewpoint                         | P     |
| UC-10 | Export the card to print-ready PDF                                | P     |
| UC-11 | Determine what is visible from the road and on which side         | S     |
| UC-12 | Determine an object's visibility window in seconds                | S     |
| UC-13 | Identify stops with a good view and a legal place to pull over    | S     |
| UC-14 | Assess driver glare and the light at a stopping place             | S     |
| UC-15 | Choose what to talk about when several things are visible at once | S     |
| UC-16 | Play narration live from position and speed                       | S     |
| UC-17 | Download the card for offline use before departure                | S     |
| UC-18 | Build a route from points by criteria in natural language         | P, S  |
| UC-19 | Save routes to a library and search it                            | R     |
| UC-20 | Tell what was in a given place in the past                        | P, S  |

---

## Functional requirements

### Route loading

- **FR-01** — The system accepts a GPX file containing a track or a route; it
  handles tracks with and without timestamps.
- **FR-02** — The system accepts a route exported from mapa-turystyczna.pl.
  The service offers a GPX download for a user-planned route, so that file is
  the entry path.
- **FR-03** — The system accepts a driving route from Google Maps. Google Maps
  does not export GPX directly; the supported path is export via My Maps to
  KML and conversion. A variant based on the Directions API is excluded —
  see R-01.
- **FR-04** — Whatever the source, a route is reduced internally to a single
  representation. The rest of the system does not know where it came from.

### Core

- **FR-05** — A point's elevation comes from the terrain model, not from the
  input file. Elevation from the file is kept only for comparison.
- **FR-06** — Gradient is computed on the smoothed profile. The raw profile is
  not used for derived computations.
- **FR-07** — Shading analysis accounts for occlusion by surrounding terrain,
  not only the orientation of the slope the observer is on.
- **FR-08** — Visibility analysis returns named objects with azimuth and
  distance from the observer.
- **FR-09** — Visibility analysis takes observer height as a parameter — a
  walker's eyes and a passenger's eyes are at different heights.
- **FR-10** — Every number presented to a user has its source and model
  assumptions available.
- **FR-31** — Object names come from PRNG where they occur there. Narration
  uses the correctly inflected form, not a nominative dropped into a sentence.

### Walking track

- **FR-11** — Estimated walking time is a sum of per-segment times, not a
  product of distance and average speed.
- **FR-12** — When a track has timestamps, the system computes and shows the
  difference between estimate and reality.
- **FR-13** — The time model's parameters can be tuned on a set of your own
  tracks without changing code.
- **FR-14** — Sections exceeding a gradient threshold are presented with
  distance marker and length, separately for ascents and descents.
- **FR-15** — The user can change the date and time of departure and see the
  recomputed distribution of sunlight.
- **FR-16** — The route card can be exported to a format suitable for
  printing.

### Driving track

- **FR-17** — Visibility is computed continuously along the route, and every
  result is assigned to the left or right side of the vehicle relative to the
  direction of travel.
- **FR-18** — Every visible object has a visibility window expressed in time
  at a given speed, not only in distance.
- **FR-19** — Objects with a window shorter than a threshold are rejected. The
  threshold is a parameter, not a constant in code.
- **FR-20** — A stop is proposed only where a confirmed place to pull over
  exists. No such place means no suggestion, however good the view.
- **FR-21** — When several objects compete within one window, the system picks
  one according to an explicit, recorded precedence rule and omits the rest.
- **FR-22** — Narration length is fitted to the visibility window. Content
  that will not fit is shortened or dropped, never cut off mid-way.
- **FR-23** — Narration is triggered in advance, so the listener has time to
  look the right way before the object appears.
- **FR-24** — Playback works without signal. The whole timeline and its
  content are downloaded before departure.
- **FR-25** — The application computes neither visibility nor shading on the
  device. It replays a prepared card.
- **FR-26** — Interaction while driving is by voice or absent. No function
  requires the driver to look at a screen.
- **FR-32** — Narration has at least two registers: for adults and for
  children. The register is a user's choice, not the system's guess.

### Route generation

- **FR-27** — The user may describe what they want in natural language; the
  system separates hard criteria (distance, time, ascent) from soft ones
  (character, mood).
- **FR-28** — Hard criteria act as a filter, soft ones as a ranking. The two
  are not mixed into one numeric score without being broken out.
- **FR-29** — Route generation starts from the existing network of trails or
  roads. Laying out a course cross-country is out of scope.
- **FR-30** — The system shows a justification for its route choice, referring
  to the criteria the user gave.

### Historical layer

- **FR-33** — Archival maps are stored together with their georeferencing and
  information about its accuracy. The accuracy is presented to the user.
- **FR-34** — Historical content is bound to a visibility result, not to mere
  proximity. We talk about what can be seen from the observer's position.
- **FR-35** — Every piece of historical information has a stated source. No
  source means no information, not a guess.

---

## Non-functional requirements

- **NFR-01** — Computing a walking route of up to 30 km takes under 10 seconds
  on a laptop, without a GPU.
- **NFR-02** — Visibility analysis along a 150 km driving route finishes in
  minutes, not hours. Batch mode is acceptable.
- **NFR-03** — Terrain data is downloaded once and kept locally. Computation
  does not depend on an external API.
- **NFR-04** — Computation works offline. The network is needed to fetch data.
  Language features and speech synthesis run locally.
- **NFR-05** — Core code contains no branching on mode. A mode is
  configuration and a choice of analyses.
- **NFR-06** — Every step ends in a result verifiable in the field — on foot
  or from the car.
- **NFR-07** — Units and coordinate reference systems are explicit in code and
  in the interface; conversions between systems live in one place.
- **NFR-08** — Analysis results are deterministic and repeatable for the same
  inputs. This applies to the computing layer; language-generated content is
  excluded and is cached once generated.
- **NFR-09** — A card prepared for offline playback fits in a size reasonable
  to download over a mobile network.
- **NFR-10** — The whole stack runs without paid external services. A
  dependency that requires one is a design error, not a compromise.

---

## Data

| Layer                   | Source                                        | Notes                                                                                                                               |
| ----------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Terrain model           | DTM (NMT) from airborne laser scanning, GUGiK | Free. The primary source for the pilot region                                                                                       |
| Surface model           | DSM (NMPT), GUGiK                             | Terrain relief including buildings and vegetation. Critical for the driving track                                                   |
| Topographic objects     | BDOT10k                                       | Packaged per county, downloaded by TERYT code                                                                                       |
| Terrain model, fallback | Copernicus DEM                                | Global, lower resolution. Outside Poland                                                                                            |
| Geographic names        | PRNG                                          | Official Polish names and grammatical forms                                                                                         |
| Trails, roads, points   | OpenStreetMap                                 | Summits, viewpoints, huts, lay-bys, car parks, road geometry                                                                        |
| Walking routes          | Own GPX, mapa-turystyczna.pl                  | The service allows downloading a planned route as GPX; it also gives its own time estimate and GOT points — material for comparison |
| Driving routes          | Google Maps via My Maps and KML               | No direct GPX export. Licensing limits — see R-01                                                                                   |
| Calibration tracks      | Own walks and drives                          | The more of your own, the better the time model. An advantage the competition does not have                                         |
| Archival maps           | WIG maps and other pre-war sheets             | Legal status to be confirmed — see R-09                                                                                             |
| Solar position          | Computed locally                              | No network requests                                                                                                                 |

Before using any source, its licence terms must be checked, especially with
respect to whether the project would ever go beyond personal use.

---

## Data model

**Route** — identifier, name, mode, geometry, region, input source and format,
date, actual time if known.

**Route point** — position, cumulative distance, elevation from the model,
elevation from the file, gradient, slope aspect, direction of travel, actual
and estimated time.

**Analysis** — reference to a route, type, input parameters, result, model
version. Storing parameters and version makes results comparable after the
model changes.

**Visibility event** — object, distance marker where visibility starts and
ends, side, azimuth, distance, duration at a given speed, priority. This is
the unit the whole driving track rests on.

**Narration timeline** — an ordered list of events selected for playback, with
content, register, trigger moment and length. The structure downloaded to the
phone.

---

## Out of scope

- Navigation and turn-by-turn guidance — Krajoskop does not replace a
  navigator, it works alongside one
- Weather forecasting, avalanche risk, and anything requiring responsibility
  for someone else's safety
- Satellite image analysis and terrain change detection
- Laying out a course cross-country, without an existing path or road
- Accounts, sharing, social features
- Editorial content written by hand at scale — we do not compete on the number
  of stories, only on the aptness of the moment
- Any dependency on a paid external service

---

## Risks and open questions

**R-01 — Google Maps licensing.** Google Maps Platform terms forbid using
Directions API content together with a non-Google map, and limit caching of
coordinates to 30 days. That rules out basing import on the API. The
acceptable path: the user exports the route themselves via My Maps to KML and
uploads the file. Whether this is worth maintaining at all is undecided.

**R-02 — Where you are allowed to stop.** A viewpoint in OSM does not mean
there is a lay-by beside it. "Stop here" without a verge is worse than no
advice. To be checked early — data coverage may be a harder constraint than
the whole analysis.

**R-03 — The cost of visibility along a line.** Visibility from a point is
cheap; computed every hundred metres along a hundred-kilometre route it may
demand aggressive simplification. To be measured at R6, before entering S1.

**R-04 — Occluders outside the elevation model.** Forest and buildings close
off views that the ground does not. A detail for a walker on a ridge; for a
driver in a valley, the difference between a working analysis and a useless
one. Hence R8 as a separate core item, not an add-on. NMPT provides the data
to do it.

**R-05 — What "worth seeing" means.** Visibility can be computed, appeal
cannot. Without a relevance filter the card turns into a list of everything
visible, which is noise.

**R-06 — A saturated narration market.** Autio, GuideAlong, Action Tour Guide
and StreetPhonia have taken the channel. Competing on volume of content is
lost from the start. The advantage has to lie in the aptness of moment and
side — that is, in the core.

**R-07 — Driver attention.** Content played in a moving car is a safety
matter, not merely a convenience. Narration must not demand a reaction or
encourage the driver to look sideways at the wrong moment. A design rule, not
a feature.

**R-08 — Attention split across two tracks.** Two unfinished tracks are worse
than one finished one. Mitigation: a shared core carries both, and alpha
requires only one working scenario per track.

**R-09 — Legal status of archival maps.** WIG and other pre-war maps may not
be under copyright, but that requires confirmation, not assumption. To be
settled before entering R9, not after.

**R-10 — Quality of historical content.** Talking about displaced villages or
cemeteries concerns real people and events. It demands sources and tact;
without them, a strong differentiator becomes a tactless one. Hence FR-35.

**R-11 — Coordinate precision.** `proj4js` supports Helmert transformations
but not grid-based datum shifts. For Poland the effect is small — EPSG:2180 is
ETRS89-based and ETRS89 differs from WGS84 by roughly half a metre to a metre
— but against a 1 m DTM that is borderline, and it is exactly the class of
silent error NFR-07 exists to catch. Mitigation: all reprojection goes through
GDAL on the command line, never through `proj4js` in process, with a test
asserting that known control points round-trip within tolerance. The vertical
datum question — Kronsztadt'86 and PL-EVRF2007-NH against ellipsoidal heights
— needs a geoid model and is open. See [ADR 0002](decisions/0002-technology-stack.md).

---

## When alpha is done

**Walking track.** Five of your own tracks, each with an estimated time. Done
when you can explain every discrepancy above twenty percent — whether it was a
break for photographs, a model error on a steep descent, or a bad elevation
reading. The point is not accuracy; the point is understanding where the model
is wrong.

**Driving track.** One known route, driven with the card in hand. Done when,
for every announced object, you can say whether it was visible, on the right
side and at the right moment. Accuracy measured, not felt — a simple sheet:
object, predicted, observed.

> **Existence test for the project.** If after those two drives the driving
> card shows something Autio and StreetPhonia cannot show — because they do
> not compute visibility — the project has a reason to exist. If it turns out
> that a radius around a point gives the same result in practice, that has to
> be admitted honestly and the walking track is where to go back to.

---

## Next step

Working standards in the repository and a harness for Claude Code:
conventions, issue and pull request templates, versioning, release and
deployment rules. Groundwork before code. See [docs/harness.md](harness.md).
