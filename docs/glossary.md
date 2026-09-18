# Glossary

The repository is written in English and the product speaks Polish
([ADR 0001](decisions/0001-language-of-the-repository.md)). This file is the
join between the two.

## Product names — kept in Polish

| Term      | Identifier  | Meaning                                                                                                              |
| --------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Krajoskop | `krajoskop` | The project, the engine, the repository. Literally: an instrument for viewing the country                            |
| Zaokno    | `zaokno`    | The driving mode in the interface. Literally: "out-of-the-window"                                                    |
| Włóczykij | `wloczykij` | The voice narrating in the car. A wanderer, a rambler. Internal name only — see the naming note in the specification |

These are proper nouns. They keep their Polish spelling in prose and are
transliterated without diacritics in identifiers and file names.

## Domain terms — translated

| Polish (specification) | English (code and docs) | Definition                                                                                                                               |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| zdarzenie widokowe     | visibility event        | Object, start and end distance marker, side, azimuth, distance, duration at a given speed, priority. The unit the driving track rests on |
| osnowa narracji        | narration timeline      | Ordered list of events selected for playback, with content, register, trigger moment and length                                          |
| karta trasy            | route card              | The document produced for one route, in either mode                                                                                      |
| okno widoczności       | visibility window       | How long an object stays visible, expressed in time at a given speed                                                                     |
| tor                    | track                   | A development track: core, walking, driving. Not a GPS track                                                                             |
| ślad                   | GPS track               | A recorded GPS trace, as opposed to a planned route                                                                                      |
| przewyższenie          | ascent, elevation gain  | Cumulative climb along a route                                                                                                           |
| stromizna              | steep section           | A section exceeding the gradient threshold of FR-14                                                                                      |
| zacienienie            | shading                 | Occlusion of direct sunlight by terrain                                                                                                  |
| ekspozycja stoku       | slope aspect            | The compass direction a slope faces                                                                                                      |
| zatoczka               | lay-by                  | A place where a vehicle may legally pull over                                                                                            |
| punkt widokowy         | viewpoint               |                                                                                                                                          |
| schronisko             | mountain hut            |                                                                                                                                          |

## Polish data sources — kept as acronyms

| Acronym | Expansion                                    | English                                                                              |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| NMT     | numeryczny model terenu                      | DTM, digital terrain model — bare ground                                             |
| NMPT    | numeryczny model pokrycia terenu             | DSM, digital surface model — including buildings and vegetation                      |
| GUGiK   | Główny Urząd Geodezji i Kartografii          | The Polish national mapping agency                                                   |
| PRNG    | Państwowy Rejestr Nazw Geograficznych        | The national register of geographic names                                            |
| BDOT10k | Baza Danych Obiektów Topograficznych         | The topographic objects database                                                     |
| TERYT   | —                                            | The national register of territorial division; counties are identified by TERYT code |
| GOT     | Górska Odznaka Turystyczna                   | A Polish mountain hiking points scheme                                               |
| PTTK    | Polskie Towarzystwo Turystyczno-Krajoznawcze | The Polish tourist association; owns trail waymarking                                |
| WIG     | Wojskowy Instytut Geograficzny               | The pre-war Military Geographical Institute, source of the archival maps             |

Prefer the Polish acronym with the English gloss on first use in a document:
"DTM (NMT)". In code, use the English term — `terrainModel`, `surfaceModel` —
except where the identifier names a specific GUGiK product being downloaded.

## Where Polish stays in the code

Polish is not merely permitted but required in:

- narration text and everything the product says or prints;
- test fixtures for FR-31 (correct inflection of PRNG names) and FR-32
  (registers for adults and children);
- user-facing strings in the route card, the CLI and the mobile application.

These are covered by requirements and therefore by tests. Polish output is a
feature, not a side effect of how the repository happens to be written.
