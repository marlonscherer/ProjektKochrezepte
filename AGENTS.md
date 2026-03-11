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
| `menus/`, `editors/`, `ui/`, `data/` | Aufgeteilte Module für Menüs, Bearbeitung, Anzeige/Eingabe und Speicherlogik. |

Menu hierarchy rooted at `hauptMenue()` → `rezeptAuswahlMenue()`, `rezepteBearbeitenMenue()`, `kiBeratungMenue()` (stub).

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
- **Navigation by recursive calls** — each menu function ends with `return otherMenue()`. Avoid deep extra nesting.
- **Cancellation via `null`** — edit helpers return `null` on user cancel, modified object on success. Callers check `!== null` before saving.
- **`"abbrechen"` keyword** — users type `"abbrechen"` in any text prompt to cancel and go back.
- **`frageGanzzahl(min, max, prompt)`** — reusable integer-input helper with retry loop; use it for all numbered menus.
- **German locale sorting** — use `.sort((a, b) => a.localeCompare(b, "de"))` for all displayed lists.
- **Screen clearing** — start each new screen with `process.stdout.write('\x1Bc')`.
- **Duplicate detection** — always use case-insensitive `.some()` checks before adding recipes or categories.

## Known Issues / Technical Debt

- `kiBeratungMenue()` ist weiterhin nur ein Stub.
