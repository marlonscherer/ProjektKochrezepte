# Unit Tests für ProjektKochrezepte

Dieses Verzeichnis enthält die Unit-Tests für den CLI-Cookbook-Manager.

## Aktueller Stand

Zuletzt verifizierter Stand:

- **12 Test-Suites**
- **108 Tests**
- **0 fehlgeschlagene Tests**

Die Zahlen stammen aus einer lokalen Ausführung mit:

```bash
npm test -- --runInBand --json --outputFile=tmp-jest-latest.json
```

## Test-Struktur

```
tests/
├── anzeige.test.js
├── arbeitsschritteBearbeitung.editor.test.js
├── auswahlMenues.test.js
├── eingabe.async.test.js
├── favoritBearbeitung.editor.test.js
├── hauptMenues.test.js
├── kategorienBearbeitung.editor.test.js
├── listenMenue.test.js
├── rezeptFelderBearbeitung.editor.test.js
├── rezeptSpeicher.test.js
├── rezeptVerwaltung.test.js
├── zutatenBearbeitung.editor.test.js
└── README.md
```

## Abgedeckte Bereiche

### daten/
- `rezeptSpeicher.test.js` testet Laden/Speichern von Rezepten inkl. Fehlerfaellen.

### oberflaeche/
- `anzeige.test.js` testet Kategorien-, Zutaten-, Arbeitsschritte- und Detailanzeige.
- `eingabe.async.test.js` testet asynchrone Eingabe-Funktionen (`frageText`, `fragePflichtfeld`, `frageGanzzahl`, `frageJaNein`, `warteAufEnter`, `schliesseEingabe`).
- `listenMenue.test.js` testet den generischen Listen-Menue-Flow.

### bearbeitungen/
- `zutatenBearbeitung.editor.test.js`
- `kategorienBearbeitung.editor.test.js`
- `arbeitsschritteBearbeitung.editor.test.js`
- `favoritBearbeitung.editor.test.js`
- `rezeptFelderBearbeitung.editor.test.js`

Diese Tests pruefen die Editor-Flows in isolierter Form.

### Favoriten-Flow (neu)
- `favoritBearbeitung.editor.test.js` testet den neuen Favoriten-Editor:
	- Hinzufuegen zu Favoriten
	- Entfernen aus Favoriten
	- Ruecksprung ohne Aenderung fuer beide Status
	- Aktualisierung per Rezept-ID (`aktualisiereFavoritStatus`)
- `auswahlMenues.test.js` und `hauptMenues.test.js` decken die Schnellaktionen in Rezept- und Favoritenmenues ab.

### KI-Flow (neu erweitert)
- `hauptMenues.test.js` deckt zusaetzlich ab:
	- API-Key fehlt (`OPENAI_API_KEY fehlt`)
	- generischer KI-Fehlerpfad
	- leere Vorschlagsliste
	- Speicherfehler beim Speichern eines KI-Rezepts

## Qualitaetscheck

Aktueller Qualitaetsstatus nach lokalem Lauf:

- Stabilitaet: **108/108 Tests bestanden**
- Global Coverage: siehe `coverage/lcov-report/index.html` nach `npm run test:coverage`

Einschaetzung:
- Favoriten- und KI-Fehlerpfade sind jetzt deutlich besser abgesichert.
- Weitere sinnvolle Ausbaupunkte bleiben Integrationstests ueber mehrere Menueebenen.

### menues/
- `hauptMenues.test.js`
- `auswahlMenues.test.js`
- `rezeptVerwaltung.test.js`

Diese Tests pruefen zentrale Navigations- und CRUD-Pfade.

### Querschnitt / Validierung
- Die Validierungsregeln werden direkt ueber die Editor- und Menue-Flows getestet, statt ueber isolierte Fake-Logic-Tests.

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
