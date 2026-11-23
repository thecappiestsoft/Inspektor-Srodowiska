# Inspektor Środowiska – wersja developerska

Edukacyjna gra detektywistyczna (chemia + ochrona środowiska, klasa 8 i liceum) dla 3–5 graczy przy jednym komputerze. Działa w przeglądarce, bez backendu, bez builda i bez zależności npm.

© 2026 CappySoft.pl

## Uruchomienie

- **Najprościej:** otwórz `index.html` w przeglądarce (działa też z `file://`).
- **Z serwerem lokalnym** (wygodniej przy edycji):
  ```bash
  npx serve .          # albo
  python3 -m http.server 8000
  ```

## Struktura

```
inspektor-srodowiska/
├── index.html              # szkielet strony + kolejność ładowania CSS/JS
├── css/
│   ├── base.css            # reset, typografia, fokus
│   ├── tokens.css          # zmienne kolorów i fontów, motyw ciemny
│   ├── layout.css          # pasek górny, przyciski, siatka mapa | panel
│   ├── components.css      # gracze, tura, kostka, wyniki, notatnik, dowody, karty, dziennik
│   └── overlays.css        # okna nakładek, tabele, banery, stopka
└── js/
    ├── core/
    │   ├── i18n.js         # LANG, THEME, T(), tr(), both(), plPL()
    │   ├── utils.js        # $, esc, rnd/pick/shuffle, KEY zapisu
    │   ├── state.js        # globalny stan S (gra) i UI (interfejs)
    │   └── persistence.js  # licznik czasu + zapis do localStorage
    ├── data/
    │   ├── world.js        # substancje, zakłady, drogi zrzutu, węzły i drogi na mapie
    │   ├── chemistry.js    # odczynniki, dowody do oskarżenia, równania reakcji
    │   ├── texts.js        # skutki, zalecenia, objawy w zeznaniach, rady chemika
    │   └── cards.js        # karty gry, kolory graczy
    ├── game/
    │   ├── generator.js    # losowanie sprawy, talie dokumentów, wydarzenia, newGame()
    │   ├── simulation.js   # stężenia w punktach, obserwacje testów, zasięg ruchu
    │   ├── turn.js         # rzut kostką, ruch, kolejne tury, wydarzenia rund
    │   ├── actions.js      # test, dokumenty, laboratorium, konfrontacja
    │   └── resolution.js   # oskarżenie i koniec gry
    ├── render/
    │   ├── map.js          # mapa SVG (warstwa statyczna + dynamiczna)
    │   ├── ui.js           # główny widok i panel boczny
    │   └── overlays.js     # setup, kurtyna, zasady, ściąga, oskarżenie, panel prowadzącego, raport
    ├── events/
    │   └── handlers.js     # klik → akcja (bindTop/bindMap/bindSide/bindOv, handleA, handleO)
    └── main.js             # start aplikacji
```

## Jak to działa

- **Skrypty klasyczne, nie moduły ES.** Wszystkie pliki JS dzielą jeden zakres globalny, więc **kolejność `<script>` w `index.html` ma znaczenie**: dane → narzędzia → stan → logika → render → zdarzenia → start. Nowy plik dodaj w odpowiednim miejscu tej listy. (Moduły ES nie działałyby po otwarciu z `file://`).
- **Render = przebudowa HTML.** Każda zmiana stanu kończy się wywołaniem `render()` (widok główny) lub `renderOv()` (nakładka), które generują HTML z template stringów, a potem `bind*()` podpina zdarzenia. Przyciski używają atrybutów `data-a` (widok) i `data-o` (nakładki) obsługiwanych w `handleA` / `handleO`.
- **Stan:** `S` – cała rozgrywka (zapisywana w `localStorage` pod kluczem `inspektor-srodowiska-v2`); `UI` – zakładka, nakładka, ustawienia przed grą. Zmieniając kształt `S`, podnieś wersję `S.v` i klucz `KEY`, żeby stare zapisy się nie wczytały.
- **Dwujęzyczność (PL/EN):**
  - `T('tekst pl','text en')` – tekst w bieżącym języku,
  - `tr(['pl','en'])` – to samo dla danych zapisanych jako tablica,
  - `both(fn)` – generuje tekst **jednocześnie w obu językach z tym samym ziarnem losowości** (dzięki temu zmiana języka w trakcie gry nie zmienia treści dowodów). Wszystko, co trafia do `S` (dziennik, dowody, talie), powinno przechodzić przez `both()`.
- **Motyw:** kolory wyłącznie przez zmienne CSS z `tokens.css`; motyw ciemny definiowany dwa razy (systemowy i `[data-theme="dark"]`).

## Typowe zmiany

| Chcę… | Gdzie |
|---|---|
| zmienić kolory / fonty | `css/tokens.css` |
| dodać substancję | `SUB` w `data/world.js` → `subs` w zakładzie → obserwacje w `observe()` (`game/simulation.js`) → `JUST`, `EQ` (`data/chemistry.js`) → `EFFECT`, `SYMPT` (`data/texts.js`) |
| dodać odczynnik | `REAG` w `data/chemistry.js` + nowy `case` w `observe()` + wiersz w `cheatHTML()` (`render/overlays.js`) |
| dodać zakład | `PLANT` (`data/world.js`), węzeł w `NODES`, drogi w `ROADS`, `RECO` (`data/texts.js`) |
| zmienić mapę | `NODES`, `ROUTES.geo`, `ROADS` (`data/world.js`), rysunek terenu w `staticMap()` (`render/map.js`) |
| dodać wydarzenie rundy | `genEvents()` w `game/generator.js`; efekt mechaniczny przez `modOn('id')` |
| zmienić treść zasad | `rulesHTML()` w `render/overlays.js` (osobno PL i EN) |

## Uwagi

- `main.js` obsługuje opcjonalne `window.claude.hot` (hot reload w środowisku Claude). Poza nim kod po prostu wywołuje `start({})` – można to bezpiecznie usunąć.
- Fonty ładowane z Google Fonts; offline przeglądarka użyje fontów zapasowych.
- Gra jest przeznaczona do pracy z uczniami – nie zbiera żadnych danych osobowych. Imiona graczy i notatki zostają tylko w `localStorage` danej przeglądarki.
