# ProjektKochrezepte – Copilot Instructions

German-language interactive CLI cookbook manager built with Node.js ESM modules.

## Running the Project

```bash
node main.js
```

## Architecture

| File | Role |
|---|---|
| `main.js` | Einstiegspunkt der Anwendung. Startet das Hauptmenü und initialisiert die CLI. |
| `rezepte.json` | Flat-file database — JSON array of recipe objects, read/written synchronously. |
| `menues/`, `bearbeitungen/`, `oberflaeche/`, `daten/` | Aufgeteilte Module für Menüs, Bearbeitung, Anzeige/Eingabe und Speicherlogik. |

Menu hierarchy rooted at `hauptMenue()` with options:
- `rezeptSucheMenue()` (Name-basierte Suche, case-insensitive Teilstring)
- `rezeptAuswahlMenue()` (Kategorie/Alle Rezepte)
- `rezepteBearbeitenMenue()` (Hinzufügen, Löschen, Verändern)
- `kiBeratungMenue()` (KI-Vorschläge aus Zutaten, optionales Speichern als Rezept)

## Recipe Data Shape

```jsonc
{
  "id": 1770730983365,              // Date.now() used as unique ID
  "name": "Spaghetti",
  "schwierigkeitsgrad": "Leicht",   // enum: "Leicht" | "Mittel" | "Schwer"
  "zeitaufwand": "15 Minuten",      // free-text
  "kategorien": ["Pasta", "Vegan"], // string array
  "zutaten": [{ "name": "Spaghetti", "menge": "400g" }],
  "arbeitsschritte": ["Wasser kochen", "Nudeln kochen"]
}
```

## Conventions

- **ES Modules** — `import`/`export` throughout; resolve `rezepte.json` path via `fileURLToPath(new URL(..., import.meta.url))`.
- **Loop-based navigation** — Menüs laufen über `while (true)` + `return` für "Zurück"/"Beenden".
- **Cancellation via `null`** — edit helpers return `null` on user cancel, modified object on success. Callers check `!== null` before saving.
- **`"abbrechen"` keyword** — users type `"abbrechen"` in any text prompt to cancel and go back.
- **`frageGanzzahl(min, max, prompt)`** — reusable integer-input helper with retry loop; use it for all numbered menus.
- **`frageJaNein(prompt, fehlerText?)`** — shared j/n confirmation helper; use it instead of duplicating confirmation loops.
- **German locale sorting** — use `.sort((a, b) => a.localeCompare(b, "de"))` for all displayed lists.
- **Screen clearing** — start each new screen with `process.stdout.write('\x1Bc')`.
- **Duplicate detection** — always use case-insensitive `.some()` checks before adding recipes or categories.
- **Defensive duplicate checks** — when comparing names/categories/ingredients, guard with `typeof ... === "string"` before calling `toLowerCase()`.
- **Search behavior** — Rezeptsuche prüft `rezept.name` per `toLowerCase().includes(...)`.
- **Shared list editors** — `bearbeiteListenMenue(...)` steuert wiederverwendbare Listen-Editor-Flows.
- **Shared favorites flow** — Favoritenstatus wird über `bearbeiteFavorit(...)` + `aktualisiereFavoritStatus(...)` umgesetzt.
- **Save errors** — in `catch` blocks, include the concrete error message for easier debugging.

## Known Issues / Technical Debt

- KI-Beratung benötigt `OPENAI_API_KEY`; ohne Key wird der Pfad mit klarer Fehlermeldung beendet.
- KI- und Speicher-Fehlerpfade sind getestet, aber Integration gegen echte API bleibt weiterhin außerhalb der Unit-Tests.
