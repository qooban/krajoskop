# Research rynkowy

Stan na wrzesień 2026. Robiony przed zamknięciem specyfikacji alpha, żeby
ustalić, czego nie warto budować.

## Wniosek w jednym zdaniu

**Kanał dostarczania jest nasycony, warstwa analityczna nie.**

## Narracja GPS w aucie — rynek zajęty

| Produkt | Co robi |
|---|---|
| Autio | Ponad 25 tys. historii przypisanych do lokalizacji w USA, lektorzy i aktorzy, kolejkowanie według kierunku jazdy, tryb offline |
| GuideAlong | Ponad 100 destynacji, automatyczne odtwarzanie w trakcie jazdy |
| Action Tour Guide | W zestawieniach z 2026 wskazywany jako najlepsza aplikacja tej kategorii |
| StreetPhonia (Road Trip: Voice Tour Guide AI) | Narracja AI generowana w czasie rzeczywistym, wielojęzycznie, filtrowanie tematów, konfigurowalny odstęp między opowieściami |
| TravelStorys, VoiceMap, Shaka Guide | Warianty tego samego modelu, część z treścią tworzoną przez lokalnych autorów |

**Wszystkie działają na tej samej zasadzie: promień wokół punktu.** Mijasz obiekt
w zadanej odległości, odtwarza się treść. Żadna nie sprawdza, czy ten obiekt
jest z drogi widoczny.

Konsekwencja dla nas: konkurowanie objętością treści jest przegrane na starcie.
Przewaga musi leżeć w trafności momentu i strony, czyli w rdzeniu.

## Analiza terenu — częściowo zajęta

**Panorama i nazwy szczytów — rozwiązane.** PeakFinder renderuje panoramę 360°
z dowolnego punktu, offline i globalnie, na wbudowanym modelu wysokościowym,
z bazą ponad miliona szczytów i funkcją pokazywania widocznych wierzchołków.
PeakVisor dokłada modele 3D, identyfikację szczytów i planowanie tras
z profilem i szacowanym czasem.

**Cień i słońce — rozwiązane.** ShadeMap symuluje globalnie cienie od terenu,
budynków i roślinności metodą ray castingu, w czasie rzeczywistym. W funkcjach
Trail Shade i GPX Replay przyjmuje ślad i generuje cienie wzdłuż trasy w czasie.

**Widoczność z drogi — tylko w nauce.** Praca S. D. Quinna (Geographica
Helvetica, 2022) policzyła kumulatywny viewshed dla sieci dróg stanu Waszyngton,
żeby ustalić, które formy terenu są z drogi widoczne, a które zasłonięte,
i wskazać kandydatów na trasy widokowe. Nie ma produktu, który by to
zaimplementował dla podróżnego.

**To jest luka Krajoskopu.**

## Czas przejścia — udokumentowana słabość konkurencji

Badanie z 2025 roku porównało rzeczywiste czasy przejścia 25 włoskich pętli
(dane GPS od co najmniej 20 użytkowników na trasę) z szacunkami popularnych
narzędzi:

| Źródło szacunku | Odchylenie od rzeczywistości |
|---|---|
| Komoot | około −49 min |
| Outdooractive | około −69 min |
| Tabliczki szlakowe | około −30 min |
| Algorytm personalizowany (MOVE) | brak istotnej różnicy |

Wszystkie trzy pierwsze istotne statystycznie (p < 0,001).

**Wniosek dla nas:** nie chodzi o lepszy model uniwersalny, chodzi o kalibrację
na własnych śladach. Dokładnie to, co badanie wskazuje jako działające.

## Konsolidacja rynku — okno możliwości

FATMAP, pierwszy produkt, który przyniósł konsumentom analizę terenu 3D
na wysokiej rozdzielczości modelu wysokościowego, został kupiony przez Stravę
i wyłączony 1 października 2024. Jego funkcje w dużej części nie zostały
przeniesione. Komoot przeszedł w marcu 2025 do Bending Spoons i poszerza paywall.

Narzędzia zorientowane na rzetelną analizę terenu wypadają z rynku,
a nie na niego wchodzą.

## Różnicowniki Krajoskopu

### 1. NMPT jako fosa danych

Globalne aplikacje pracują na modelach o rozdzielczości rzędu 30 m i bez warstwy
roślinności. Dla Polski dostępny jest bezpłatnie lidarowy NMT oraz **NMPT**,
czyli numeryczny model pokrycia terenu — cyfrowa reprezentacja rzeźby terenu
wraz z obiektami na niej, budynkami i roślinnością.

To znaczy, że dla Polski da się policzyć widoczność **z uwzględnieniem zasłon**,
czego globalna konkurencja nie zrobi — nie dlatego, że nie umie, tylko dlatego,
że nie ma po co budować pipeline'u pod jeden kraj.

Węższy rynek jest tu przewagą, nie wadą.

### 2. Warstwa historyczna — „co tu było"

Nałożenie przedwojennych map WIG na dzisiejszy teren daje narracji wymiar,
którego nie ma nikt:

> Po prawej, w dolinie, gdzie teraz jest łąka i kępa drzew, do 1947 roku
> stała wieś.

W Beskidzie Niskim i Bieszczadach to nie ciekawostka, to istota krajobrazu —
wysiedlone wsie, łemkowskie cerkwie, zdziczałe sady, cmentarze bez wsi.
Połączenie z widocznością jest naturalne: pokazujemy to, co widać,
i mówimy, co w tym miejscu było.

**Zastrzeżenie:** status prawny map WIG wymaga sprawdzenia. W dyskusjach
społeczności OSM przyjmuje się, że mapy przedwojenne nie wchodzą w skład
polskiego zasobu i jeśli powstawały do użytku służbowego, mogły nie być objęte
ochroną — ale bywa to opatrywane pytaniem o źródło. Do potwierdzenia,
nie do założenia. Patrz R-09 w specyfikacji.

### 3. Polski rejestr i polska odmiana

Nazwy z PRNG plus poprawna deklinacja w narracji. Brzmi jak drobiazg, dopóki
nie usłyszy się angielskiego TTS-a mówiącego „Hala Krupowa". Do tego rzeczy,
których globalni nie tkną: punktacja GOT, kolory szlaków PTTK, tryb narracji
dla dzieci po polsku.

## Źródła

**Konkurencja — narracja GPS**
- Autio — https://autio.com/
- GuideAlong — https://apps.apple.com/us/app/guidealong-gps-audio-tours/id1460032075
- StreetPhonia / Road Trip: Voice Tour Guide AI — https://apps.apple.com/us/app/road-trip-voice-tour-guide-ai/id1671354231
- TravelStorys — https://travelstorys.com/
- Zestawienie aplikacji 2026 — https://tourinabox.com/blog/best-self-guided-tour-apps/

**Konkurencja — analiza terenu**
- PeakFinder — https://www.peakfinder.com/mobile/
- PeakVisor — https://peakvisor.com/panorama.html
- ShadeMap — https://shademap.app/ , opis funkcji Trail Shade i GPX Replay: https://bellingcat.gitbook.io/toolkit/more/all-tools/shademap
- Shadowmap — https://shadowmap.org/

**Badania**
- S. D. Quinn, *What can we see from the road? Applications of a cumulative viewshed analysis on a US state highway network*, Geographica Helvetica 77, 2022 — https://gh.copernicus.org/articles/77/165/2022/
- Badanie dokładności szacunków czasu przejścia (algorytm MOVE) — https://pmc.ncbi.nlm.nih.gov/articles/pmid/39859097

**Rynek**
- Wyłączenie FATMAP — https://mattruta.com/2024/12/07/replacing-fatmap/
- Przejęcie Komoot przez Bending Spoons — https://blog.hiiker.app/2025/03/26/is-this-the-end-of-komoot/

**Dane i narzędzia**
- Produkty GUGiK, definicje NMT i NMPT — http://www.gugik.gov.pl/projekty/isok/produkty
- Wtyczka QGIS „Pobieracz danych GUGiK" — https://plugins.qgis.org/plugins/pobieracz_danych_gugik/
- BDOT10k — https://www.geoportal.gov.pl/en/data/topographic-objects-database-bdot10k/
- Bielik — https://pl.wikipedia.org/wiki/Bielik_(model_językowy)
- Piper TTS — https://tts.ai/voices/piper/
- Warunki Google Maps Platform (ograniczenia użycia i cache'owania) — https://cloud.google.com/maps-platform/terms/maps-service-terms/index-20240422
