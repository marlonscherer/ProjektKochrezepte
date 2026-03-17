# ProjektKochrezepte

Interaktiver CLI-Rezeptmanager (Deutsch) mit Node.js und ES Modules.

## Must-Haves

- Infos die die Rezepte enthalten:
  - Schwierigkeitsgrad
  - Zeitaufwand
  - Vegan, Vegetarisch, Normal
  - Zutaten
  - Arbeitsschritte
- Menü (in Deutsch):
  - Rezeptauswahl
    - Unterkategorien (z.B. Pasta, schnell, Fisch, ...)
  - Zurück / Menü-Button
  - Bearbeiten, Löschen und Hinzufügen von Rezepten oder Kategorien
  - Programm beenden

## Nice-To-Haves

- Personenanzahl einstellen (fehlt noch)
- Suchfunktion
- Zufallsrezept-Ausgabe (fehlt noch)
- Rezept bewerten  (fehlt noch)
- Favoriten markieren und Favoritenliste
- KI Beratung (Rezepte aus Zutaten vorschlagen, optional speichern)

## Funktionen

- Rezeptsuche nach Name (case-insensitive Teilstring)
- Rezeptauswahl nach Kategorien oder "Alle Rezepte"
- Rezepte favoritisieren und Favoriten verwalten
- Rezepte hinzufügen, löschen und bearbeiten
- Bearbeitung von:
  - Rezeptname
  - Schwierigkeitsgrad
  - Zeitaufwand
  - Kategorien
  - Zutaten
  - Arbeitsschritten
  - Favorit-Status
- Persistenz über lokale Datei [rezepte.json](rezepte.json)
- Defensivere Validierung bei Duplikatchecks (`typeof ... === "string"` vor `toLowerCase()`)
- Einheitliche j/n-Bestaetigungen ueber `frageJaNein(...)`

## Projekt starten

Voraussetzung: Node.js installiert.

```bash
npm install
npm start
```

Alternativ direkt:

```bash
node main.js
```

## Tests

Alle Tests ausführen:

```bash
npm test
```

Tests im Watch-Modus:

```bash
npm run test:watch
```

Tests mit Coverage:

```bash
npm run test:coverage
```

Einzelne Testdatei/Pattern ausführen:

```bash
npm test -- auswahlMenues
```

## Coverage-Regeln

In [jest.config.js](jest.config.js) sind globale Mindestwerte gesetzt:

- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Projektstruktur

- [main.js](main.js): Einstiegspunkt
- [menus/](menus/): Haupt- und Untermenues
- [editors/](editors/): Bearbeitungslogik fuer Rezeptfelder
- [ui/](ui/): Eingabe-/Anzeige-Helfer
- [data/](data/): Laden/Speichern der Rezepte
- [tests/](tests/): Unit- und Modultests

## Hinweis

Die KI-Beratung benoetigt die Umgebungsvariable `OPENAI_API_KEY`.

Beispiel (PowerShell):

```powershell
$env:OPENAI_API_KEY = "dein_key"
npm start
```
    
