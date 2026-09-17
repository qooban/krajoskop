# Krajoskop

Przyrząd do oglądania kraju.

Krajoskop liczy z numerycznego modelu terenu rzeczy, których nie podaje żadna
aplikacja turystyczna, i podaje je w jednym dokumencie.

**Tryb pieszy** odpowiada na pytanie „ile mnie to będzie kosztować i kiedy wyjść":
realny czas przejścia kalibrowany na własnych przejściach, mapa stromizn
z rozróżnieniem podejść i zejść, przebieg cienia w konkretnym dniu, nazwane
szczyty z punktów widokowych.

**Tryb samochodowy (Zaokno)** odpowiada na „co zobaczymy po drodze":
co jest widoczne z drogi, po której stronie, jak długo, gdzie wolno stanąć
i o której światło będzie dobre. Narrację czyta **Włóczykij**.

Oba tryby stoją na jednym rdzeniu liczącym i są rozwijane równolegle.

## Czym to nie jest

To nie jest kolejny audioprzewodnik ani kolejna apka ze szlakami. Rynek narracji
GPS w samochodzie jest nasycony — patrz [research rynkowy](docs/research-rynkowy.md).
Krajoskop jest warstwą **analizy widoczności i terenu**, której nikt nie ma,
dostarczaną dwoma kanałami: kartą do czytania i narracją w ruchu.

Zdanie, które ma odróżniać ten projekt od konkurencji:

> Po lewej za dwie minuty otworzy się widok na Tatry, przez czterdzieści sekund.

To wynik rachunku na modelu terenu, nie wpis z listy atrakcji przy drodze.

## Dokumentacja

| Dokument | Zawartość |
|---|---|
| [docs/specyfikacja.md](docs/specyfikacja.md) | Persony, tryby, architektura, tory rozwoju, use case'y, wymagania, ryzyka |
| [docs/research-rynkowy.md](docs/research-rynkowy.md) | Co już istnieje na rynku, gdzie jest luka, źródła |

## Stack

Wszystko na wolnych licencjach, bez ani jednej płatnej usługi.

- **Dane terenu** — NMT i NMPT z lotniczego skaningu laserowego (GUGiK, bezpłatne),
  BDOT10k, PRNG; Copernicus DEM jako zapas poza Polską
- **Geometria i rastry** — `rasterio`, `rioxarray`, `geopandas`, `shapely`, `pyproj`
- **Widoczność** — GRASS GIS `r.viewshed`
- **Słońce** — `pvlib` lub `astral`, liczone lokalnie
- **Routing** — Valhalla lub GraphHopper
- **Język** — Bielik (Apache 2.0, uruchamiany lokalnie)
- **Synteza mowy** — Piper (MIT, tylko CPU, offline, głos polski)
- **Mapy w aplikacji** — MapLibre GL z kaflami PMTiles

## Status

Wersja alpha specyfikacji. Kodu jeszcze nie ma.

Kolejny krok: standardy pracy w repo i harness dla Claude Code — konwencje,
szablony issue i pull requestów, zasady wersjonowania, release i deploymentu.
Dopiero potem analiza techniczna i development.

## Licencja

Do ustalenia.
