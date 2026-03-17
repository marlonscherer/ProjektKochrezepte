# Unit Tests für ProjektKochrezepte

Dieses Verzeichnis enthält die Unit-Tests für den CLI-Cookbook-Manager.

## Aktueller Stand

Zuletzt verifizierter Stand:

- **14 Test-Suites**
- **116 Tests**
- **0 fehlgeschlagene Tests**

Die Zahlen stammen aus einer lokalen Ausführung mit:

```bash
npm test -- --json --outputFile=tmp-jest-latest.json
```

## Test-Struktur

```
tests/
├── anzeige.test.js
├── arbeitsschritteBearbeitung.editor.test.js
├── auswahlMenues.test.js
├── bearbeitungen.test.js
├── eingabe.async.test.js
├── eingabe.test.js
├── hauptMenues.test.js
├── kategorienBearbeitung.editor.test.js
├── listenMenue.test.js
├── rezeptFelderBearbeitung.editor.test.js
├── rezeptSpeicher.test.js
├── rezeptVerwaltung.test.js
├── validierung.test.js
├── zutatenBearbeitung.editor.test.js
└── README.md
```

## Abgedeckte Bereiche

### data/
- `rezeptSpeicher.test.js` testet Laden/Speichern von Rezepten inkl. Fehlerfaellen.

### ui/
- `anzeige.test.js` testet Kategorien-, Zutaten-, Arbeitsschritte- und Detailanzeige.
- `eingabe.test.js` testet pure Validierungslogik (`wurdeAbgebrochen`, Ganzzahl-, Pflichtfeld-Checks).
- `eingabe.async.test.js` testet asynchrone Eingabe-Funktionen (`question`, `fragePflichtfeld`, `frageGanzzahl`, `warteAufEnter`, `schliesseEingabe`).
- `listenMenue.test.js` testet den generischen Listen-Menue-Flow.

### editors/
- `zutatenBearbeitung.editor.test.js`
- `kategorienBearbeitung.editor.test.js`
- `arbeitsschritteBearbeitung.editor.test.js`
- `rezeptFelderBearbeitung.editor.test.js`

Diese Tests pruefen die Editor-Flows in isolierter Form.

### menus/
- `hauptMenues.test.js`
- `auswahlMenues.test.js`
- `rezeptVerwaltung.test.js`

Diese Tests pruefen zentrale Navigations- und CRUD-Pfade.

### Querschnitt / Validierung
- `bearbeitungen.test.js` testet Duplikat-Erkennung, Mindestanzahl-Validierungen, Array-Initialisierung und positionsbasiertes Einfuegen.
- `validierung.test.js` testet Rezept-Namensvalidierung.

## Verwendung

### Tests ausfuehren

```bash
npm test
```

### Watch-Mode

```bash
npm run test:watch
```

### Coverage erzeugen

```bash
npm run test:coverage
```

### JSON-Report erzeugen

```bash
npm test -- --json --outputFile=tmp-jest-latest.json
```

## Test-Framework

Jest wird mit ESM-Unterstuetzung ausgefuehrt (siehe `package.json`):

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

## Hinweise

- Bei Aenderungen an Menue- oder Eingabe-Logik sollte mindestens die relevante Datei in `tests/` angepasst werden.
- Fuer neue Features bevorzugt isolierte Unit-Tests schreiben und I/O ueber Mocks kapseln.

## Moegliche Erweiterungen

- Integration-Tests fuer komplette Menue-Navigation ueber mehrere Screens.
- End-to-End-Tests mit mockiertem Input/Output.
- Weitere Edge-Case-Tests (z. B. sehr lange Eingaben, unerwartete Datentypen).
