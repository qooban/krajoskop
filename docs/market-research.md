# Market research

As of September 2026. Done before closing the alpha specification, to
establish what is not worth building.

## The conclusion in one sentence

**The delivery channel is saturated; the analytical layer is not.**

## GPS narration in the car — the market is taken

| Product                                       | What it does                                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Autio                                         | Over 25,000 stories tied to locations in the USA, voiced by narrators and actors, queued by direction of travel, offline mode |
| GuideAlong                                    | Over 100 destinations, automatic playback while driving                                                                       |
| Action Tour Guide                             | Named in 2026 round-ups as the best app in the category                                                                       |
| StreetPhonia (Road Trip: Voice Tour Guide AI) | AI narration generated in real time, multilingual, topic filtering, configurable gap between stories                          |
| TravelStorys, VoiceMap, Shaka Guide           | Variants of the same model, some with content written by local authors                                                        |

**They all work the same way: a radius around a point.** You pass an object
within a set distance and content plays. None of them checks whether that
object is visible from the road.

The consequence for us: competing on volume of content is lost from the start.
The advantage has to lie in the aptness of moment and side — that is, in the
core.

## Terrain analysis — partly taken

**Panoramas and summit names — solved.** PeakFinder renders a 360° panorama
from any point, offline and worldwide, on a built-in elevation model, with a
database of over a million summits and a function showing visible peaks.
PeakVisor adds 3D models, summit identification and route planning with a
profile and estimated time.

**Shade and sun — solved.** ShadeMap simulates shadows from terrain,
buildings and vegetation worldwide by ray casting, in real time. Its Trail
Shade and GPX Replay features take a track and generate shade along the route
over time.

**Visibility from the road — only in academia.** S. D. Quinn's paper
(Geographica Helvetica, 2022) computed a cumulative viewshed for the road
network of Washington State, to establish which landforms are visible from the
road and which are occluded, and to identify candidates for scenic routes.
No product implements this for a traveller.

**This is Krajoskop's gap.**

## Walking time — a documented weakness in the competition

A 2025 study compared actual walking times on 25 Italian loop routes (GPS data
from at least 20 users per route) with the estimates of popular tools:

| Source of estimate            | Deviation from reality    |
| ----------------------------- | ------------------------- |
| Komoot                        | about −49 min             |
| Outdooractive                 | about −69 min             |
| Trail signposts               | about −30 min             |
| Personalised algorithm (MOVE) | no significant difference |

The first three are all statistically significant (p < 0.001).

**What this means for us:** the point is not a better universal model, it is
calibration on your own tracks. Exactly what the study identifies as working.

## Market consolidation — a window of opportunity

FATMAP, the first product to bring consumers 3D terrain analysis on a
high-resolution elevation model, was bought by Strava and shut down on
1 October 2024. Much of its functionality was not carried over. Komoot passed
to Bending Spoons in March 2025 and is widening its paywall.

Tools oriented towards serious terrain analysis are leaving the market, not
entering it.

## Krajoskop's differentiators

### 1. The surface model as a data moat

Global applications work on models of around 30 m resolution and without a
vegetation layer. For Poland, lidar-derived DTM (NMT) is freely available, and
so is **DSM (NMPT)** — a digital representation of terrain relief together
with what stands on it, buildings and vegetation.

That means visibility for Poland can be computed **with occluders taken into
account**, which the global competition will not do — not because they cannot,
but because there is no reason to build a pipeline for a single country.

Here a narrower market is an advantage, not a drawback.

### 2. The historical layer — "what used to be here"

Overlaying pre-war WIG maps on today's terrain gives narration a dimension
nobody else has:

> On the right, in the valley, where there is now a meadow and a clump of
> trees, a village stood until 1947.

In the Beskid Niski and the Bieszczady this is not trivia, it is the substance
of the landscape — displaced villages, Lemko churches, gone-wild orchards,
cemeteries without villages. The link to visibility is natural: we show what
can be seen and say what was there.

**Caveat:** the legal status of WIG maps needs checking. OSM community
discussions take the view that pre-war maps are not part of the Polish state
survey resource and, if produced for official use, may not have been
copyrighted — but this often comes with a question about sourcing. To be
confirmed, not assumed. See R-09 in the specification.

### 3. The Polish register and Polish inflection

Names from PRNG plus correct declension in narration. It sounds like a detail
until you hear an English TTS say "Hala Krupowa". On top of that, things the
global players will not touch: GOT points, PTTK trail colours, a narration
register for children in Polish.

## Sources

**Competition — GPS narration**

- Autio — https://autio.com/
- GuideAlong — https://apps.apple.com/us/app/guidealong-gps-audio-tours/id1460032075
- StreetPhonia / Road Trip: Voice Tour Guide AI — https://apps.apple.com/us/app/road-trip-voice-tour-guide-ai/id1671354231
- TravelStorys — https://travelstorys.com/
- 2026 app round-up — https://tourinabox.com/blog/best-self-guided-tour-apps/

**Competition — terrain analysis**

- PeakFinder — https://www.peakfinder.com/mobile/
- PeakVisor — https://peakvisor.com/panorama.html
- ShadeMap — https://shademap.app/ , description of Trail Shade and GPX Replay: https://bellingcat.gitbook.io/toolkit/more/all-tools/shademap
- Shadowmap — https://shadowmap.org/

**Research**

- S. D. Quinn, _What can we see from the road? Applications of a cumulative viewshed analysis on a US state highway network_, Geographica Helvetica 77, 2022 — https://gh.copernicus.org/articles/77/165/2022/
- Study on the accuracy of walking time estimates (MOVE algorithm) — https://pmc.ncbi.nlm.nih.gov/articles/pmid/39859097

**Market**

- FATMAP shutdown — https://mattruta.com/2024/12/07/replacing-fatmap/
- Bending Spoons acquiring Komoot — https://blog.hiiker.app/2025/03/26/is-this-the-end-of-komoot/

**Data and tools**

- GUGiK products, definitions of NMT and NMPT — http://www.gugik.gov.pl/projekty/isok/produkty
- QGIS plugin "Pobieracz danych GUGiK" — https://plugins.qgis.org/plugins/pobieracz_danych_gugik/
- BDOT10k — https://www.geoportal.gov.pl/en/data/topographic-objects-database-bdot10k/
- Bielik — https://pl.wikipedia.org/wiki/Bielik_(model_językowy)
- Piper TTS — https://tts.ai/voices/piper/
- Google Maps Platform terms (usage and caching restrictions) — https://cloud.google.com/maps-platform/terms/maps-service-terms/index-20240422
