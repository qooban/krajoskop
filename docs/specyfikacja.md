# Krajoskop — specyfikacja

**Wersja:** alpha
**Data:** wrzesień 2026
**Region pilotażowy:** Beskidy oraz trasy Kraków–Podkarpacie

Dokument żyjący. Zmieniany w miarę budowy.

---

## W skrócie

Krajoskop liczy z numerycznego modelu terenu rzeczy, których nie podaje żadna
aplikacja turystyczna, i podaje je w jednym dokumencie.

Dla pieszego: realny czas przejścia kalibrowany na własnych przejściach, mapa
stromizn z rozróżnieniem podejść i zejść, przebieg cienia w konkretnym dniu,
nazwane szczyty z punktów widokowych.

Dla jadącego: co jest widoczne z drogi, po której stronie, jak długo, gdzie
wolno stanąć i o której światło będzie dobre.

Oba tryby są równoprawne i rozwijane równolegle. Nie muszą być równie dojrzałe
w tym samym momencie — tor samochodowy ma szansę być ciekawszy, bo jest mniej
obsadzony.

> Projekt prowadzony dla przyjemności, nie pod termin. Konsekwencja: każdy krok
> musi dawać coś użytecznego sam z siebie i dać się zweryfikować w terenie —
> przejściem albo przejazdem.

## Nazewnictwo

| Nazwa | Co oznacza |
|---|---|
| **Krajoskop** | Projekt, silnik, repozytorium. Przyrząd do oglądania kraju |
| **Zaokno** | Nazwa trybu samochodowego w interfejsie |
| **Włóczykij** | Nazwa głosu prowadzącego narrację w aucie |

Uwaga do ostatniej pozycji: „włóczykij" funkcjonuje w polszczyźnie jako
rzeczownik pospolity, ale jest też polskim imieniem postaci z Muminków
(ang. Snufkin), a Muminki to aktywnie licencjonowana własność. Nazwa głosu
zostaje wyłącznie w warstwie wewnętrznej i nie towarzyszy jej żadna aluzja
wizualna. Przed jakąkolwiek publikacją czy komercjalizacją — do weryfikacji
w rejestrach znaków.

---

## Dla kogo

### Przewodnik prowadzący grupy — tryb pieszy

Planuje wyjście dla grupy o mieszanej kondycji i odpowiada za powrót przed
zmrokiem. Potrzebuje liczb, nie wrażeń.

> „Muszę wiedzieć, czy zejście da się przejść z osobami po sześćdziesiątce,
> i o której realnie będziemy pod schroniskiem — nie według kalkulatora,
> który zakłada 4 km/h."

### Turysta weekendowy — tryb pieszy

Wybiera trasę w piątek wieczorem, idzie w sobotę. Czyta gotową kartę,
nic nie konfiguruje.

> „Chcę wiedzieć, na co się piszę, zanim wyjdę z domu — i czy warto wstać
> wcześniej, żeby nie iść całego podejścia w słońcu."

### Rodzina w drodze — tryb samochodowy

Jadą przez góry na wakacje. Kierowca prowadzi, pasażerowie patrzą przez okno
i nudzą się po godzinie. Dzieci są odbiorcą krytycznym: albo treść trafi
w moment, albo przestaną słuchać.

> „Minęliśmy jakiś zamek i nikt nie wiedział, co to. Chcę usłyszeć wcześniej,
> że za pięć minut po lewej będzie coś, na co warto spojrzeć."

---

## Dwa tryby

Tryby nie są wariantami tej samej funkcji z innymi stałymi. Mają inne pytanie,
inny moment konsumpcji i inne ograniczenie krytyczne. Wspólny jest rdzeń liczący.

| | Pieszy | Samochodowy |
|---|---|---|
| Pytanie | Ile mnie to kosztuje? | Co zobaczymy? |
| Moment | Przed wyjściem | W trakcie jazdy |
| Nośnik | Dokument, druk | Głos, hands-free |
| Czas przejazdu | Problem trudny, sedno toru | Rozwiązany przez routing |
| Nachylenie | Kluczowe | Nieistotne poza przełęczami |
| Widoczność | Z punktu, panorama | Wzdłuż linii, ze stroną i czasem |
| Słońce | Cień na podejściu | Oślepianie, światło na postoju |
| Ograniczenie | Kondycja, czas do zmroku | Okno widoczności w sekundach |
| Nasycenie rynku | Wysokie | Analiza — zerowe |

Widoczność wzdłuż linii to uogólnienie widoczności z punktu. Ta sama matematyka,
inny zakres. Dlatego rdzeń jest jeden, a nie dwa.

---

## Historie użycia

### Tryb pieszy

Marek prowadzi w sobotę grupę dziesięciu osób na Policę. Ma ślad z zeszłego roku.
Wrzuca go, podaje datę i planowaną godzinę startu.

Czas przejścia wychodzi 5 h 40 min zamiast 4 h 20 min z tabliczki, bo model
liczy odcinkami i wie, że zejście po stromiźnie jest wolniejsze niż płaski
marsz. Na trzecim kilometrze zejścia widzi odcinek 27% na dystansie 400 metrów
i notuje, żeby tam zrobić przerwę.

Przesuwa suwak godziny startu. Przy 7:00 całe podejście idzie w cieniu
wschodniego stoku, przy 10:00 ostatnia godzina wypada w pełnym słońcu
na odkrytej grani. Ustawia 7:00, eksportuje kartę do PDF, wysyła grupie.

### Tryb samochodowy

Dwa tygodnie później ta sama rodzina jedzie przez Beskid Niski. Marek planuje
trasę w Google Maps, eksportuje ją i wrzuca. Dostaje kartę wycieczki: oś trasy
z kilometrażem, a przy niej co się pojawi, po której stronie i na jak długo.

Na 34. kilometrze, po prawej, przez półtorej minuty widać dolinę z cerkwią —
z rachunku widoczności, nie z listy atrakcji przy drodze. Dwa kilometry dalej
jest zatoczka z lepszym widokiem, a o tej porze słońce świeci od tyłu,
więc zdjęcia wyjdą. Karta zaznacza to jako sensowny postój.

W samochodzie Marek włącza tryb odtwarzania. Telefon zna pozycję i prędkość,
odtwarza z wyprzedzeniem: *„za dwie minuty po prawej otworzy się dolina,
w niej drewniana cerkiew z XVIII wieku"*. Dzieci patrzą w odpowiednią stronę,
bo wiedzą kiedy i gdzie. Zasięgu nie ma — cała karta została policzona
i pobrana przed wyjazdem.

---

## Architektura

Trzy warstwy. Rdzeń liczy, tory konsumują, aplikacje prezentują.

**Rdzeń.** Wczytywanie tras, próbkowanie terenu, nachylenie, ekspozycja, pozycja
słońca, zacienienie, widoczność z punktu i wzdłuż linii, dopasowanie punktów
z OpenStreetMap, warstwa historyczna. Czysta biblioteka obliczeniowa,
bez wiedzy o trybie.

**Tory.** Kompozycja wyników rdzenia w odpowiedzi na pytania konkretnego trybu.
Tryb to konfiguracja i wybór analiz, nie odrębna ścieżka w kodzie liczącym.

**Prezentacja.** Karta jako dokument oraz aplikacja mobilna odtwarzająca
przygotowaną kartę. Aplikacja niczego nie liczy — odtwarza policzoną wcześniej
osnowę czasową.

> **Decyzja architektoniczna.** Ciężka analiza dzieje się przed wyjazdem,
> na maszynie z mocą i danymi. Telefon dostaje gotową, lekką strukturę: listę
> zdarzeń z kilometrażem, stroną, oknem czasowym i treścią. Dzięki temu narracja
> na żywo działa offline i nie wymaga liczenia widoczności na urządzeniu.

---

## Stack

Wszystko na wolnych licencjach, bez ani jednej płatnej usługi. Całość od danych
do głosu w samochodzie da się uruchomić lokalnie.

| Warstwa | Wybór | Uwagi |
|---|---|---|
| Model terenu | NMT, NMPT (GUGiK) | Bezpłatne. NMPT zawiera budynki i roślinność |
| Obiekty topograficzne | BDOT10k | Pobieranie po kodzie TERYT powiatu |
| Nazwy | PRNG | Oficjalne polskie nazwy, poprawne formy |
| Szlaki, drogi, POI | OpenStreetMap | Zatoczki, parkingi, punkty widokowe |
| Rastry i wektory | `rasterio`, `rioxarray`, `geopandas`, `shapely`, `pyproj` | |
| Widoczność | GRASS GIS `r.viewshed` | Nie pisać własnego raycastera |
| Słońce | `pvlib` lub `astral` | Liczone lokalnie, bez sieci |
| Routing | Valhalla lub GraphHopper | |
| Język | Bielik | Apache 2.0 od wersji 2.0, uruchamiany lokalnie |
| Synteza mowy | Piper | MIT, tylko CPU, offline, głos polski |
| Mapy w aplikacji | MapLibre GL + PMTiles | Bez Google |
| Pobieranie danych | Wtyczka QGIS „Pobieracz danych GUGiK" | Na start ręcznie, potem skrypt |

Baza przestrzenna (PostGIS) dopiero wtedy, gdy zapytania po geometrii zaczną
przeszkadzać. Na etapie jednego regionu format plikowy wystarczy.

---

## Tory rozwoju

Zależności jawne. Tory idą równolegle, ale nie muszą być równo zaawansowane.

### Rdzeń

| ID | Zakres | Wymaga |
|---|---|---|
| R1 | Wczytywanie tras: GPX, mapa-turystyczna.pl, Google Maps | — |
| R2 | Próbkowanie modelu terenu, profil wysokości, wygładzanie | R1 |
| R3 | Nachylenie i ekspozycja stoku | R2 |
| R4 | Pozycja słońca i zacienienie przez teren | R3 |
| R5 | Widoczność z punktu i linia horyzontu | R2 |
| R6 | Widoczność wzdłuż linii, z podziałem na stronę i oknem czasowym | R5 |
| R7 | Punkty z OpenStreetMap i PRNG, dopasowanie do wyników widoczności | R5 |
| R8 | Model pokrycia terenu: las i zabudowa jako zasłony | R5 |
| R9 | Warstwa historyczna: georeferencja map archiwalnych, „co tu było" | R7 |

### Tor pieszy

| ID | Zakres | Wymaga |
|---|---|---|
| P1 | Czas przejścia liczony odcinkowo i kalibrowany na własnych śladach | R2 |
| P2 | Mapa stromizn, odcinki krytyczne, klasyfikacja trudności | R3 |
| P3 | Cień na trasie i dobór godziny startu | R4 |
| P4 | Panorama z punktów widokowych z nazwami szczytów | R5, R7 |
| P5 | Karta trasy: dokument, eksport do druku | P1–P4 |
| P6 | Generowanie trasy z punktów wg kryteriów w języku naturalnym | R7, P1 |

### Tor samochodowy (Zaokno)

| ID | Zakres | Wymaga |
|---|---|---|
| S1 | Karta wycieczki: co widać, po której stronie, jak długo | R6, R7 |
| S2 | Postoje: dobry widok plus legalne miejsce zatrzymania | S1 |
| S3 | Słońce: oślepianie kierowcy, światło na postoju | R4 |
| S4 | Treść narracji dopasowana długością do okna widoczności | S1 |
| S5 | Aplikacja mobilna: odtwarzanie na żywo, geofencing, synteza mowy, offline | S4 |
| S6 | Generowanie trasy widokowej z punktów wg kryteriów | R6, R7 |

### Kamienie milowe

**Alpha.** R1, R2, P1, R5 i R6 w wersji zgrubnej, S1 na jednej krótkiej trasie.
Cel: zobaczyć oba tryby działające na własnych danych, nawet brzydko.

**Beta.** R3, R4, R7, R8; P2–P5; S2–S4. Cel: kompletna karta w obu trybach,
weryfikowalna w terenie.

**1.0.** S5, czyli narracja na żywo w aucie. Potem R9, P6 i S6.

---

## Use case'y

| ID | Use case | Tor |
|---|---|---|
| UC-01 | Wczytanie śladu GPX i wyświetlenie profilu wysokościowego | R |
| UC-02 | Wczytanie trasy zaplanowanej na mapa-turystyczna.pl | R |
| UC-03 | Wczytanie trasy przejazdu zaplanowanej w Google Maps | R |
| UC-04 | Oszacowanie realnego czasu przejścia z podziałem na odcinki | P |
| UC-05 | Porównanie szacunku z rzeczywistym czasem z tracka i kalibracja | P |
| UC-06 | Wskazanie odcinków stromych, osobno podejścia i zejścia | P |
| UC-07 | Wyznaczenie cienia wzdłuż trasy dla daty i godziny | P |
| UC-08 | Dobór godziny startu pod kryterium użytkownika | P |
| UC-09 | Identyfikacja szczytów widocznych z punktu widokowego | P |
| UC-10 | Eksport karty do PDF gotowego do druku | P |
| UC-11 | Wyznaczenie, co jest widoczne z drogi i po której stronie | S |
| UC-12 | Wyznaczenie okna widoczności obiektu w sekundach | S |
| UC-13 | Wskazanie postojów z dobrym widokiem i legalnym zatrzymaniem | S |
| UC-14 | Ocena oślepiania kierowcy i światła na postoju | S |
| UC-15 | Wybór, o czym opowiedzieć, gdy widać kilka rzeczy naraz | S |
| UC-16 | Odtwarzanie narracji na żywo na podstawie pozycji i prędkości | S |
| UC-17 | Pobranie karty do trybu offline przed wyjazdem | S |
| UC-18 | Zbudowanie trasy z punktów wg kryteriów w języku naturalnym | P, S |
| UC-19 | Zapis tras do biblioteki i wyszukiwanie w niej | R |
| UC-20 | Opowiedzenie, co było w danym miejscu w przeszłości | P, S |

---

## Wymagania funkcjonalne

### Wczytywanie tras

- **FR-01** — System przyjmuje plik GPX ze śladem lub trasą; obsługuje ślady
  ze znacznikami czasu i bez.
- **FR-02** — System przyjmuje trasę wyeksportowaną z mapa-turystyczna.pl.
  Serwis udostępnia pobranie GPX dla trasy zaplanowanej przez użytkownika,
  więc ścieżką wejścia jest ten plik.
- **FR-03** — System przyjmuje trasę przejazdu z Google Maps. Google Maps
  nie eksportuje GPX bezpośrednio; obsługiwaną ścieżką jest eksport przez
  My Maps do KML i konwersja. Wariant oparty na Directions API jest wykluczony
  — patrz R-01.
- **FR-04** — Niezależnie od źródła trasa jest wewnętrznie sprowadzana do jednej
  reprezentacji. Reszta systemu nie wie, skąd trasa przyszła.

### Rdzeń

- **FR-05** — Wysokość punktu pochodzi z modelu terenu, nie z pliku wejściowego.
  Wysokość z pliku zachowywana wyłącznie do porównania.
- **FR-06** — Nachylenie liczone na wygładzonym profilu. Surowy profil
  nie służy do obliczeń pochodnych.
- **FR-07** — Analiza zacienienia uwzględnia przesłanianie przez okoliczny teren,
  nie tylko orientację własnego stoku.
- **FR-08** — Analiza widoczności zwraca nazwane obiekty z azymutem
  i odległością od obserwatora.
- **FR-09** — Analiza widoczności przyjmuje wysokość obserwatora jako parametr
  — oczy pieszego i oczy pasażera są na różnej wysokości.
- **FR-10** — Każda liczba prezentowana użytkownikowi ma dostępne źródło
  i założenia modelu.
- **FR-31** — Nazwy obiektów pochodzą z PRNG, gdy tam występują. Narracja używa
  poprawnej formy odmienionej, nie mianownika wstawionego w zdanie.

### Tor pieszy

- **FR-11** — Szacowany czas przejścia jest sumą czasów odcinkowych,
  nie iloczynem dystansu i średniej prędkości.
- **FR-12** — Gdy ślad ma znaczniki czasu, system liczy i pokazuje różnicę
  między szacunkiem a rzeczywistością.
- **FR-13** — Parametry modelu czasu dają się dostroić na zbiorze własnych
  śladów bez zmiany kodu.
- **FR-14** — Odcinki przekraczające próg nachylenia prezentowane z kilometrażem
  i długością, osobno dla podejść i zejść.
- **FR-15** — Użytkownik może zmienić datę i godzinę wyjścia i zobaczyć
  przeliczony rozkład nasłonecznienia.
- **FR-16** — Karta trasy da się wyeksportować do formatu nadającego się
  do druku.

### Tor samochodowy

- **FR-17** — Widoczność liczona ciągle wzdłuż trasy, a każdy wynik przypisany
  do lewej lub prawej strony pojazdu względem kierunku jazdy.
- **FR-18** — Każdy widoczny obiekt ma okno widoczności wyrażone w czasie
  przy zadanej prędkości, nie tylko w dystansie.
- **FR-19** — Obiekty o oknie krótszym niż próg są odrzucane. Próg jest
  parametrem, nie stałą w kodzie.
- **FR-20** — Postój proponowany wyłącznie tam, gdzie istnieje potwierdzone
  miejsce zatrzymania. Brak takiego miejsca oznacza brak sugestii, nawet
  przy najlepszym widoku.
- **FR-21** — Gdy w jednym oknie konkuruje kilka obiektów, system wybiera jeden
  według jawnej, zapisanej reguły pierwszeństwa i pomija pozostałe.
- **FR-22** — Długość treści narracji jest dopasowana do okna widoczności. Treść,
  która nie zmieści się w oknie, jest skracana lub pomijana, nigdy ucinana
  w połowie.
- **FR-23** — Narracja jest wyzwalana z wyprzedzeniem, tak by słuchacz zdążył
  spojrzeć w odpowiednią stronę przed pojawieniem się obiektu.
- **FR-24** — Odtwarzanie działa bez zasięgu. Cała osnowa czasowa i treść
  są pobierane przed wyjazdem.
- **FR-25** — Aplikacja nie liczy widoczności ani zacienienia na urządzeniu.
  Odtwarza przygotowaną kartę.
- **FR-26** — Interakcja w trakcie jazdy jest głosowa lub zerowa. Żadna funkcja
  nie wymaga patrzenia w ekran przez kierowcę.
- **FR-32** — Narracja ma co najmniej dwa rejestry: dla dorosłych i dla dzieci.
  Rejestr jest wyborem użytkownika, nie zgadywaniem systemu.

### Generowanie tras

- **FR-27** — Użytkownik może opisać oczekiwania w języku naturalnym; system
  wydziela z opisu kryteria twarde (dystans, czas, przewyższenie) i miękkie
  (charakter, nastrój).
- **FR-28** — Kryteria twarde działają jako filtr, miękkie jako ranking.
  Te dwie rzeczy nie są mieszane w jednym wyniku liczbowym bez rozbicia.
- **FR-29** — Generowanie trasy startuje od istniejącej sieci szlaków lub dróg.
  Wyznaczanie przebiegu w terenie bez ścieżki jest poza zakresem.
- **FR-30** — System pokazuje uzasadnienie wyboru trasy odnoszące się
  do kryteriów podanych przez użytkownika.

### Warstwa historyczna

- **FR-33** — Mapy archiwalne są przechowywane wraz z georeferencją i informacją
  o jej dokładności. Dokładność jest prezentowana użytkownikowi.
- **FR-34** — Treść historyczna jest wiązana z wynikiem widoczności, a nie
  z samą bliskością. Opowiadamy o tym, co widać z miejsca obserwatora.
- **FR-35** — Każda informacja historyczna ma wskazane źródło. Brak źródła
  oznacza brak informacji, nie domysł.

---

## Wymagania niefunkcjonalne

- **NFR-01** — Przeliczenie trasy pieszej do 30 km trwa poniżej 10 sekund
  na laptopie, bez GPU.
- **NFR-02** — Analiza widoczności wzdłuż trasy przejazdu 150 km kończy się
  w czasie liczonym w minutach, nie godzinach. Tryb wsadowy dopuszczalny.
- **NFR-03** — Dane terenowe pobierane raz i trzymane lokalnie. Obliczenia
  nie zależą od zewnętrznego API.
- **NFR-04** — Obliczenia działają offline. Sieć potrzebna do pobrania danych.
  Funkcje językowe i synteza mowy działają lokalnie.
- **NFR-05** — Kod rdzenia nie zawiera rozgałęzień na tryb. Tryb to konfiguracja
  i wybór analiz.
- **NFR-06** — Każdy krok kończy się wynikiem weryfikowalnym w terenie —
  przejściem albo przejazdem.
- **NFR-07** — Jednostki i układ współrzędnych jawne w kodzie i w interfejsie;
  przeliczenia między układami w jednym miejscu.
- **NFR-08** — Wyniki analiz deterministyczne i powtarzalne dla tych samych
  danych wejściowych. Dotyczy warstwy liczącej; treść generowana językowo
  jest z tego wyłączona i cache'owana po wygenerowaniu.
- **NFR-09** — Karta przygotowana do odtwarzania offline mieści się w rozmiarze
  rozsądnym do pobrania przez sieć komórkową.
- **NFR-10** — Cały stack da się uruchomić bez płatnych usług zewnętrznych.
  Zależność, która tego wymaga, jest błędem projektowym, nie kompromisem.

---

## Dane

| Warstwa | Źródło | Uwagi |
|---|---|---|
| Model terenu | NMT z lotniczego skaningu laserowego, GUGiK | Bezpłatny. Podstawowe źródło dla regionu pilotażowego |
| Pokrycie terenu | NMPT, GUGiK | Rzeźba terenu wraz z budynkami i roślinnością. Krytyczne dla toru samochodowego |
| Obiekty topograficzne | BDOT10k | Paczki po powiatach, pobieranie po kodzie TERYT |
| Model terenu, zapas | Copernicus DEM | Globalny, niższa rozdzielczość. Poza Polską |
| Nazwy geograficzne | PRNG | Oficjalne polskie nazwy i formy |
| Szlaki, drogi, punkty | OpenStreetMap | Szczyty, punkty widokowe, schroniska, zatoczki, parkingi, geometria dróg |
| Trasy piesze | Własne GPX, mapa-turystyczna.pl | Serwis pozwala pobrać GPX zaplanowanej trasy; podaje też własny szacunek czasu i punktację GOT — materiał do porównań |
| Trasy samochodowe | Google Maps przez My Maps i KML | Brak eksportu GPX wprost. Ograniczenia licencyjne — patrz R-01 |
| Ślady kalibracyjne | Własne przejścia i przejazdy | Im więcej własnych, tym lepszy model czasu. To przewaga, której konkurencja nie ma |
| Mapy archiwalne | Mapy WIG i inne przedwojenne | Status prawny do potwierdzenia — patrz R-09 |
| Pozycja słońca | Obliczana lokalnie | Bez zapytań sieciowych |

Przed użyciem każdego źródła trzeba sprawdzić jego warunki licencyjne,
zwłaszcza pod kątem tego, czy projekt kiedykolwiek wyszedłby poza użytek własny.

---

## Model danych

**Trasa** — identyfikator, nazwa, tryb, geometria, region, źródło i format
wejściowy, data, czas rzeczywisty jeśli znany.

**Punkt trasy** — pozycja, dystans skumulowany, wysokość z modelu, wysokość
z pliku, nachylenie, ekspozycja, kierunek ruchu, czas rzeczywisty i szacowany.

**Analiza** — odniesienie do trasy, typ, parametry wejściowe, wynik, wersja
modelu. Przechowywanie parametrów i wersji pozwala porównywać wyniki po zmianie
modelu.

**Zdarzenie widokowe** — obiekt, kilometraż początku i końca widoczności, strona,
azymut, odległość, czas trwania przy zadanej prędkości, priorytet. To jednostka,
na której stoi cały tor samochodowy.

**Osnowa narracji** — uporządkowana lista zdarzeń wybranych do odtworzenia,
z treścią, rejestrem, momentem wyzwolenia i długością. Struktura pobierana
na telefon.

---

## Poza zakresem

- Nawigacja i prowadzenie po trasie — Krajoskop nie zastępuje nawigacji,
  działa obok niej
- Prognoza pogody, ryzyko lawinowe i wszystko, co wymaga odpowiedzialności
  za cudze bezpieczeństwo
- Analiza zdjęć satelitarnych i detekcja zmian terenu
- Wyznaczanie przebiegu w terenie bez istniejącej ścieżki lub drogi
- Konta, współdzielenie, funkcje społecznościowe
- Treść redakcyjna pisana ręcznie na skalę — nie konkurujemy liczbą historii,
  tylko trafnością momentu
- Jakakolwiek zależność od płatnej usługi zewnętrznej

---

## Ryzyka i pytania otwarte

**R-01 — Licencja Google Maps.** Warunki Google Maps Platform zabraniają
używania treści z Directions API razem z mapą inną niż Google i ograniczają
cache'owanie współrzędnych do 30 dni. To wyklucza oparcie importu na API.
Dopuszczalna ścieżka: użytkownik sam eksportuje trasę przez My Maps do KML
i wrzuca plik. Do rozstrzygnięcia, czy w ogóle warto to utrzymywać.

**R-02 — Gdzie wolno stanąć.** Punkt widokowy w OSM nie znaczy, że jest przy nim
zatoczka. Rada „zatrzymajcie się tutaj" bez pobocza jest gorsza niż brak rady.
Do sprawdzenia wcześnie — pokrycie danych może być twardszym ograniczeniem
niż cała analiza.

**R-03 — Koszt widoczności wzdłuż linii.** Widoczność z punktu jest tania;
policzona co sto metrów na trasie stukilometrowej może wymagać agresywnego
upraszczania. Do zmierzenia na R6, przed wejściem w S1.

**R-04 — Zasłony spoza modelu wysokościowego.** Las i zabudowa zamykają widoki,
których grunt nie zasłania. Dla pieszego na grani drobiazg, dla jadącego doliną
różnica między działającą a bezużyteczną analizą. Stąd R8 jako osobna pozycja
rdzenia, nie dodatek. NMPT daje dane, żeby to zrobić.

**R-05 — Co znaczy „warto zobaczyć".** Widoczność da się policzyć, atrakcyjność
nie. Bez filtru istotności karta zamienia się w listę wszystkiego, co widać,
czyli w szum.

**R-06 — Nasycony rynek narracji.** Autio, GuideAlong, Action Tour Guide
i StreetPhonia obsadziły kanał. Konkurowanie objętością treści jest przegrane
na starcie. Przewaga musi leżeć w trafności momentu i strony, czyli w rdzeniu.

**R-07 — Uwaga kierowcy.** Treść odtwarzana w jadącym samochodzie jest kwestią
bezpieczeństwa, nie tylko wygody. Narracja nie może wymagać reakcji ani zachęcać
kierowcy do patrzenia w bok w złym momencie. Reguła projektowa, nie funkcja.

**R-08 — Rozstrzelenie uwagi na dwa tory.** Dwa niedokończone tory są gorsze
niż jeden dokończony. Mitygacja: wspólny rdzeń niesie oba, a alpha wymaga
tylko po jednym działającym scenariuszu na tor.

**R-09 — Status prawny map archiwalnych.** Mapy WIG i inne przedwojenne mogą
nie być objęte ochroną, ale to wymaga potwierdzenia, nie założenia. Do wyjaśnienia
przed wejściem w R9, nie po.

**R-10 — Jakość treści historycznej.** Opowiadanie o wysiedlonych wsiach czy
cmentarzach dotyczy realnych ludzi i wydarzeń. Wymaga źródeł i wyczucia,
inaczej z mocnego różnicownika robi się nietakt. Stąd FR-35.

---

## Kiedy alpha jest gotowa

**Tor pieszy.** Pięć własnych śladów, dla każdego szacowany czas. Gotowe, kiedy
potrafisz wyjaśnić każdą rozbieżność powyżej dwudziestu procent — czy to była
przerwa na zdjęcia, błąd modelu na stromym zejściu, czy zły odczyt wysokości.
Nie chodzi o dokładność, chodzi o zrozumienie, gdzie model się myli.

**Tor samochodowy.** Jedna znana trasa, przejechana z kartą w ręku. Gotowe,
kiedy dla każdego zapowiedzianego obiektu potrafisz powiedzieć, czy był widoczny,
po właściwej stronie i we właściwym momencie. Trafność mierzona, nie wrażeniowa
— prosty arkusz: obiekt, przewidziano, zaobserwowano.

> **Test istnienia projektu.** Jeśli po tych dwóch przejazdach karta samochodowa
> pokaże coś, czego Autio ani StreetPhonia pokazać nie mogą — bo nie liczą
> widoczności — projekt ma rację bytu. Jeśli okaże się, że promień wokół punktu
> daje w praktyce ten sam wynik, trzeba to uczciwie przyznać i wrócić do toru
> pieszego.

---

## Następny krok

Standardy pracy w repo i harness dla Claude Code: konwencje, szablony issue
i pull requestów, zasady wersjonowania, release i deploymentu. Baza przed kodem.
