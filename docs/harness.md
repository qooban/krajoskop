# Harness — plan

**Wersja:** plan do zatwierdzenia
**Data:** wrzesień 2026
**Stan repozytorium:** README, dwa dokumenty, LICENSE. Zero kodu, zero
konfiguracji, brak `.gitignore`.

Dokument opisuje, co postawić w repozytorium, zanim powstanie pierwsza linia
kodu liczącego, i w jakiej kolejności. Zakres wzięty ze specyfikacji
(„Następny krok"): konwencje, szablony issue i pull requestów, zasady
wersjonowania, release i deploymentu — plus harness dla Claude Code, bo to
jest narzędzie, którym ten projekt będzie budowany.

---

## Po co

Projekt ma trzy cechy, które razem decydują o kształcie harnessu.

**Jedna osoba, praca zrywami, często z telefonu.** Harness ma odtwarzać
kontekst za ciebie. Po trzech tygodniach przerwy pytanie „co dalej"
ma mieć odpowiedź w repozytorium, nie w pamięci.

**Specyfikacja z identyfikatorami.** R1–R9, P1–P6, S1–S6, UC-01…UC-20,
FR-01…FR-35, NFR-01…NFR-10, R-01…R-10. To jest gotowy szkielet procesu —
albo zostanie wpięty w commity, issue i CI, albo za pół roku będzie martwym
dokumentem rozjeżdżonym z kodem. To najważniejsza decyzja w całym planie.

**Wyniki liczbowe, które trudno sprawdzić okiem.** Zły układ współrzędnych,
pomylone jednostki albo przesunięty model terenu nie wywalają programu —
dają liczbę, która wygląda wiarygodnie i jest fałszywa. Harness musi łapać
tę klasę błędów, bo przegląd kodu jej nie złapie.

## Zasady

- Każdy element harnessu ma powód wynikający z powyższych trzech cech.
  Nie ma „bo tak się robi".
- Etapami. Każdy etap zostawia repozytorium w stanie użytecznym.
- Zero płatnych usług, zgodnie z NFR-10. GitHub Actions w repozytorium
  publicznym wystarczy.
- Szybka pętla ma zostać szybka. Wszystko, co trwa dłużej niż minutę,
  idzie poza domyślny bieg testów.
- Harness nie jest projektem. Jeśli urośnie ponad tydzień roboty, coś poszło
  nie tak — patrz H-01.

---

## Składniki

### 1. Higiena repozytorium

| Element | Zawartość |
|---|---|
| `.gitignore` | `__pycache__`, `.venv`, `.pytest_cache`, `dane/` poza `dane/probne/`, artefakty QGIS i GRASS |
| Struktura katalogów | `src/krajoskop/` (rdzeń i tory), `tests/`, `narzedzia/` (skrypty repo), `dane/probne/`, `docs/` |
| `docs/konwencje.md` | Jedno miejsce na styl kodu, styl dokumentów, format commitów, nazewnictwo gałęzi |
| `docs/glosariusz.md` | Mapowanie pojęć z polskiej domeny na identyfikatory w kodzie — patrz D-01 |
| `docs/decyzje/` | ADR-y, numerowane. W specyfikacji są już bloki „Decyzja architektoniczna"; tutaj lądują następne |
| Licencja | README mówi „do ustalenia", plik mówi MIT. Rozstrzygnąć i uspójnić — patrz D-03 |

### 2. Środowisko

Python 3.12, `uv` jako menedżer zależności i lockfile (MIT, szybki, działa
w kontenerze sesji webowej bez zabawy). `rasterio`, `pyproj` i `geopandas`
mają koła manylinux z własnym GDAL i PROJ — systemowy GDAL nie jest potrzebny.

GRASS GIS jest wyjątkiem: `r.viewshed` nie instaluje się z pip. Stąd reguła:
**widoczność wchodzi do rdzenia przez interfejs z dwoma backendami** —
`grass` tam, gdzie jest zainstalowany, i zgrubny backend referencyjny
do testów i do maszyn bez GRASS-a. Testy wymagające GRASS-a dostają marker
`@pytest.mark.grass` i domyślnie są pomijane. Bez tego każda sesja z telefonu
zaczyna się od kwadransa instalacji, a połowa testów i tak nie przejdzie.

Dane próbne: jeden krótki ślad GPX, jeden wycinek NMT (kilka MB), jeden
fragment trasy przejazdu. W repozytorium, z plikiem `dane/probne/ZRODLA.md`
opisującym pochodzenie i licencję każdego. Duże dane — skryptem
`narzedzia/pobierz_dane.py` z sumą kontrolną, nigdy w git.

### 3. Kontrola jakości

| Bieg | Narzędzie | Kiedy |
|---|---|---|
| Lint i format | `ruff check`, `ruff format --check` | Każdy push |
| Typy | `mypy` w trybie strict na `src/` | Każdy push |
| Testy szybkie | `pytest -m "not wolne and not grass"` | Każdy push, budżet 60 s |
| Testy z GRASS | `pytest -m grass` po instalacji pakietu | Nocny bieg i na etykietę |
| Testy złote | Porównanie z `dane/probne/oczekiwane/*.json` | Każdy push |
| Identyfikatory | `narzedzia/sprawdz_spec.py` | Każdy push |
| Dokumenty | Martwe odnośniki, typografia polska | Każdy push |
| Wydajność | `pytest-benchmark` wobec NFR-01 i NFR-02 | Nocny bieg, na start bez blokowania |

Testy złote realizują NFR-08 wprost: ten sam ślad ma dawać ten sam wynik,
a każda zmiana liczb ma być widoczna w diffie pull requesta. To jest
mechanizm, który łapie przesunięty raster i pomylone jednostki.

Kontrola typografii brzmi jak fanaberia, ale dokumenty tego repozytorium mają
już konsekwentny styl — cudzysłowy „ " i pauzy — i tanio go utrzymać
automatem, zamiast poprawiać ręcznie po każdej sesji.

### 4. Identyfikatory ze specyfikacji

Rzecz, która odróżnia ten harness od dowolnego szablonu z internetu.

- Commit niesie identyfikator w zakresie: `feat(R2): próbkowanie profilu`.
- Issue i pull request mają pole `Realizuje:` z listą FR, NFR i UC.
- Test, który sprawdza wymaganie, niesie je w markerze: `@wymaganie("FR-05")`.
- `narzedzia/sprawdz_spec.py` sprawdza, że każdy przywołany identyfikator
  istnieje w specyfikacji, i generuje `docs/pokrycie.md` — tabelę wymaganie
  po wymaganiu z odesłaniem do testów, które je pokrywają. CI wywala się,
  gdy tabela jest nieaktualna.

Efekt: na pytanie „ile z alphy jest zrobione" odpowiada wygenerowany plik,
a nie wspomnienie. Przy okazji CHANGELOG pisze się prawie sam.

### 5. Proces

**Gałęzie.** `main` chroniony, historia liniowa, merge przez squash.
Gałęzie krótkie, nazwa od identyfikatora: `R2/probkowanie-profilu`.
Sesje agenta trzymają swój prefiks `claude/`.

**Commity.** Conventional Commits z polskim opisem. Zakres to identyfikator
toru albo `repo`, `dane`, `docs`.

**Szablony issue** — formularze YAML, cztery rodzaje:

| Szablon | Wymusza pola |
|---|---|
| Zadanie toru | Identyfikator, wymagania, use case'y, „gotowe, kiedy", sposób weryfikacji w terenie (NFR-06) |
| Błąd | Trasa i dane wejściowe, wartość oczekiwana i otrzymana, wersja modelu |
| Decyzja | Kontekst, warianty, wybór, konsekwencje — trafia do `docs/decyzje/` |
| Ryzyko | Opis, moment rozstrzygnięcia, co zablokuje, jeśli się potwierdzi |

**Szablon pull requesta** — lista kontrolna: identyfikator, testy, jawny układ
współrzędnych i jednostki (NFR-07), determinizm wyniku (NFR-08), aktualne
`docs/pokrycie.md`, wpis w CHANGELOG, brak nowej zależności bez ADR.

**Etykiety** w `.github/labels.yml`, synchronizowane workflowem:
`rdzen`, `tor:pieszy`, `tor:zaokno`, `kamien:alpha|beta|1.0`, `dane`,
`wydajnosc`, `decyzja`, `ryzyko`.

### 6. Wersjonowanie, release, deployment

**Wersjonowanie.** SemVer w paśmie 0.x, wersja trzymana w `pyproject.toml`.
Kamienie milowe ze specyfikacji mapują się na wersje: alpha to 0.1,
beta to 0.2, narracja na żywo (S5) to 1.0.

**Release.** Tag `v0.1.0` uruchamia workflow, który buduje pakiet i wystawia
GitHub Release z notatkami złożonymi przez `git-cliff` (MIT) z commitów,
pogrupowanymi po identyfikatorach torów. CHANGELOG w formacie Keep a Changelog,
po polsku, sekcja na wydanie.

**Deployment.** Do wydania alpha nie ma czego wdrażać: rdzeń to biblioteka
z interfejsem wiersza poleceń, a produktem jest karta w PDF. Publikacja
na PyPI dopiero wtedy, gdy ktoś poza tobą będzie instalował. Aplikacja
mobilna (S5) dostanie własny plan wtedy, kiedy będzie miała co odtwarzać.
Zapisane wprost, żeby harness nie rósł na zapas.

### 7. Harness dla Claude Code

| Plik | Rola |
|---|---|
| `CLAUDE.md` | Czym jest projekt w dziesięciu zdaniach, gdzie leży specyfikacja, dyscyplina identyfikatorów, jak uruchomić testy, definicja ukończenia, rzeczy zakazane |
| `.claude/settings.json` | Uprawnienia bez pytania na `uv run`, `pytest`, `ruff`, `git` w trybie odczytu; zmienne środowiskowe |
| `.claude/hooks/session-start.sh` | Przygotowanie sesji webowej: `uv sync --frozen`, komunikat o braku GRASS-a. Cel: gotowość poniżej dwóch minut |
| `.claude/commands/zadanie.md` | `/zadanie R2` — czyta specyfikację po identyfikatorze, zakłada issue, gałąź i plan |
| `.claude/commands/pokrycie.md` | `/pokrycie` — przelicza `docs/pokrycie.md` |
| `.claude/commands/karta.md` | `/karta` — puszcza pipeline na śladzie próbnym i pokazuje wynik |
| `.claude/agents/recenzent-geo.md` | Subagent czytający diff wyłącznie pod kątem układów współrzędnych, jednostek, kierunku osi rastra i wysokości obserwatora |

Rzeczy zakazane w `CLAUDE.md` warto wypisać wprost, bo wszystkie już padły
w specyfikacji: żadnej płatnej usługi zewnętrznej, żadnego własnego
raycastera zamiast `r.viewshed`, żadnego rozgałęzienia na tryb w rdzeniu
(NFR-05), żadnej nowej zależności bez ADR, żadnej liczby pokazanej
użytkownikowi bez źródła i założeń (FR-10).

Subagent `recenzent-geo` to odpowiedź na trzecią cechę projektu z sekcji
„Po co". Przegląd ogólny nie wyłapie, że ktoś policzył nachylenie
na współrzędnych geograficznych zamiast na metrycznych — wyspecjalizowany,
wąski przegląd wyłapie.

---

## Etapy

| Etap | Zakres | Gotowe, kiedy |
|---|---|---|
| E0 | Higiena: `.gitignore`, struktura, konwencje, licencja, etykiety | `git status` jest czysty na świeżym klonie, licencja zgodna w obu miejscach |
| E1 | Środowisko: `pyproject.toml`, `uv.lock`, szkielet pakietu, jeden trywialny test, ruff i mypy | `uv sync && uv run pytest` przechodzi na czystej maszynie |
| E2 | CI: workflow jakości i testów, ochrona `main` | Pull request nie da się scalić przy czerwonym biegu |
| E3 | Proces: szablony issue i pull requesta, commity, wersjonowanie, CHANGELOG, `git-cliff` | Tag `v0.0.1` wystawia Release z notatkami wygenerowanymi z commitów |
| E4 | Claude Code: `CLAUDE.md`, ustawienia, hook, komendy, subagent | Sesja z telefonu startuje i puszcza testy bez ręcznej konfiguracji |
| E5 | Identyfikatory: `sprawdz_spec.py`, `docs/pokrycie.md` w CI | Wymyślony identyfikator w treści pull requesta wywala bieg |
| E6 | Weryfikacja na R1 (wczytywanie GPX) | Zadanie przechodzi całą drogę: issue, gałąź, pull request, zielone CI, wydanie 0.0.2 — bez ręcznego dotykania konfiguracji |

E0–E2 to jeden wieczór. E3–E5 drugi. E6 jest miarą, nie formalnością.

> **Test istnienia harnessu.** R1 jest zadaniem małym i nudnym — wczytać plik
> i sprowadzić go do jednej reprezentacji (FR-01, FR-04). Jeśli przejście
> całej drogi od issue do wydania zajmie na nim więcej czasu niż samo
> napisanie kodu, harness jest za ciężki i trzeba go ściąć, zanim wejdzie
> R2. Jeśli przejdzie gładko, ta sama droga uniesie R6.

---

## Decyzje do podjęcia

**D-01 — Język w kodzie.** Domena jest polska i ma mocne własne słownictwo:
zdarzenie widokowe, osnowa narracji, okno widoczności. Kod stoi na
bibliotekach angielskich. Rekomendacja: identyfikatory w kodzie po angielsku,
dokumentacja, commity i interfejs po polsku, a `docs/glosariusz.md` wiąże
jedno z drugim. Wariant z polskimi identyfikatorami jest spójniejszy
z domeną i gorszy w każdym miejscu styku z biblioteką.

**D-02 — GRASS.** Rekomendacja z sekcji 2: interfejs z dwoma backendami
i marker `grass`. Wariant alternatywny — obraz kontenera z GRASS-em jako
jedyne środowisko — jest czystszy, ale kosztuje w sesji webowej i przy pracy
z telefonu. Do rozstrzygnięcia przed E1, bo wpływa na `pyproject.toml`.

**D-03 — Licencja.** MIT w pliku, „do ustalenia" w README. MIT jest
bezpieczny: `r.viewshed` jest uruchamiany jako proces zewnętrzny, więc GPL
GRASS-a nie przechodzi na kod projektu. Wymaga zapisania w ADR i utrzymania —
wciągnięcie GPL-owej biblioteki przez import zmienia sytuację.

**D-04 — Repozytorium publiczne od zaraz.** Nie ma sekretów, a publiczne
repozytorium ma darmowe Actions bez limitu minut. Rekomendacja: publiczne,
z README mówiącym wprost, że kodu jeszcze nie ma.

**D-05 — Zakres E6.** Czy pierwsze prawdziwe zadanie to R1, czy od razu R2
(próbkowanie terenu, wymaga danych). Rekomendacja: R1, bo testuje harness,
a nie dane.

---

## Czego świadomie nie robimy

- Nie ma Dockera jako środowiska domyślnego — dopiero gdy D-02 wyjdzie inaczej.
- Nie ma PostGIS, zgodnie ze specyfikacją: format plikowy do czasu, aż zacznie
  przeszkadzać.
- Nie ma automatycznego wersjonowania z bota ani wymuszonego podpisu commitów.
  Jedna osoba w repozytorium.
- Nie ma matrycy systemów operacyjnych w CI. Linux, bo tam liczy się widoczność.
- Nie ma wdrożenia ani infrastruktury — patrz sekcja 6.
- Nie ma workflow z recenzją Claude'a w pull requeście na starcie. Do rozważenia
  po E6, kiedy będzie co recenzować.

---

## Ryzyka harnessu

**H-01 — Harness większy od projektu.** Klasyczny sposób na to, żeby nigdy nie
napisać kodu. Mitygacja: budżet jednego tygodnia, etapy z osobną wartością
i test istnienia harnessu na R1.

**H-02 — Fałszywa zieleń bez GRASS-a.** Domyślny bieg pomija testy widoczności,
czyli sedno projektu. Mitygacja: nocny bieg z GRASS-em i widoczna liczba
pominiętych testów w podsumowaniu biegu.

**H-03 — Rozjazd specyfikacji z kodem.** Największe zagrożenie dla wartości
tego repozytorium, bo dziś cała treść projektu siedzi w dokumentach.
Mitygacja: E5, czyli identyfikatory sprawdzane automatem, a nie dobrą wolą.

**H-04 — Puchnięcie danych w git.** Model terenu waży. Mitygacja: twardy limit
na `dane/probne/`, reszta przez skrypt z sumą kontrolną, kontrola rozmiaru
w CI.

**H-05 — Ograniczenia sesji zdalnej.** Praca z telefonu oznacza kontener
z polityką sieci i limitem czasu. Mitygacja: hook startowy poniżej dwóch minut,
ciężkie pobrania i bieg z GRASS-em wyłącznie w CI.

**H-06 — Konwencje pisane dla agenta, nie dla człowieka.** `CLAUDE.md`, które
powtarza całą specyfikację, rozmywa to, co ważne. Mitygacja: `CLAUDE.md`
mieści się na ekranie i odsyła do dokumentów, zamiast je streszczać.
