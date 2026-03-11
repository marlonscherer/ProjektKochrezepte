# Unit Tests für ProjektKochrezepte

Dieses Verzeichnis enthält alle Unit Tests für das Cookbook-Manager-Projekt.

## Test-Struktur

```
tests/
├── rezeptSpeicher.test.js      # Tests für Rezept-Persistierung (JSON-Ladeung/Speicherung)
├── anzeige.test.js             # Tests für UI-Anzeigelemente (Kategorien, Zutaten, etc.)
├── eingabe.test.js             # Tests für reine Input-Validierungsfunktionen
├── validierung.test.js          # Tests für Rezept-Namens-Validierung
├── bearbeitungen.test.js        # Tests für Zutaten-, Kategorien- und Arbeitsschritte-Logik
└── README.md                   # Diese Datei
```

## Test-Coverage

Die Tests decken folgende Module/Funktionen ab:

### ✅ data/rezeptSpeicher.js
- `ladeRezepte()` - Laden von Rezepten aus JSON
- `speichereRezepte()` - Speichern von Rezepten in JSON
- Fehlerbehandlung (fehlende Dateien, ungültiges JSON)

### ✅ ui/anzeige.js
- `holeKategorien()` - Extrahieren und Sortieren von Kategorien
- `zeigeZutatenListe()` - Zutaten-Anzeige
- `zeigeArbeitsschritteListe()` - Arbeitsschritte-Anzeige
- `zeigeRezeptDetails()` - Vollständige Rezeptanzeige

### ✅ ui/eingabe.js
- `wurdeAbgebrochen()` - Erkennung von Abbruchkommandos

### ✅ Validierungslogik
- Duplikat-Erkennung (Namen, Zutaten, Kategorien)
- Mindestanzahl-Validierung (mind. 1 Zutat, Kategorie, Arbeitsschritt)
- Array-Initialisierung
- Position-basiertes Einfügen von Arbeitsschritten

## Verwendung

### Tests ausführen
```bash
npm test
```

### Tests im Watch-Mode ausführen
```bash
npm run test:watch
```

### Coverage-Report anzeigen
```bash
npm run test:coverage
```

## Test-Framework: Jest

Jest wurde ausgewählt, weil es:
- ✅ Vollständig mit ESM Modulen kompatibel ist
- ✅ Eingebautes Mocking von Dateisystem (fs) bietet
- ✅ Einfache Async/Await-Unterstützung hat
- ✅ Excellent Code-Coverage-Reporting bietet
- ✅ Schnelle und zuverlässige Testausführung ermöglicht

## Geschriebene Tests (Anzahl)

| Modul | Anzahl Tests |
|-------|--------------|
| rezeptSpeicher.js | 9 Tests |
| anzeige.js | 10 Tests |
| eingabe.js | 8 Tests |
| validierung.js | 3 Tests |
| bearbeitungen.js | 18 Tests |
| **Gesamt** | **~48 Tests** |

## Code-Coverage

Die aktuelle Test-Suite deckt ab:
- **Funktionen in data/** - 100%
- **Funktionen in ui/anzeige.js** - 100%
- **Funktionen in ui/eingabe.js (pure functions)** - 100%
- **Validierungslogik** - ~90%

## Zusätzliche Tests hinzufügen

Für neue Tests:
1. Neue `.test.js`-Datei in `tests/` erstellen
2. Jest `describe()` und `test()` verwenden
3. Mit `npm test` ausführen

### Beispiel:
```javascript
describe('meinModul', () => {
    test('sollte etwas machen', () => {
        expect(result).toBe(expected);
    });
});
```

## Bekannte Limitierungen

Einige Module können nicht vollständig getestet werden, da sie stark an CLI-Input/Output gekoppelt sind:
- `menus/` - Abhängig von `question()` und Benutzereingaben
- `readline` - Interaktive Ein-/Ausgabe
- Async Menu-Funktionen

Diese Module erfordern Integration-Tests oder manuelle Tests.

## Weitere Verbesserungen

Eine komplette Test-Suite könnte noch erweitert werden um:
- [ ] Integration-Tests für Menu-Navigation
- [ ] End-to-End Tests mit mokiertem Input/Output
- [ ] Performance-Tests für Rezept-Laden mit vielen Einträgen
- [ ] Tests für Edge-Cases (sehr lange Namen, Sonderzeichen etc.)
