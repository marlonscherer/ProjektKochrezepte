import { jest } from '@jest/globals';
import { holeKategorien, zeigeZutatenListe, zeigeArbeitsschritteListe, zeigeRezeptDetails } from '../ui/anzeige.js';

describe('anzeige', () => {
    function sammleLogAusgaben() {
        const ausgaben = [];
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
            ausgaben.push(args.join(' '));
        });

        return { ausgaben, consoleSpy };
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('holeKategorien', () => {
        test('normalisiert Kategorien, entfernt ungueltige Eintraege und dedupliziert case-insensitive ueber mehrere Rezepte', () => {
            const rezepte = [
                { kategorien: [' Pasta ', 'Vegetarisch', '', null] },
                { kategorien: ['pasta', 'Vegan', 123] },
                { kategorien: ['Salat', 'PASTA'] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Pasta', 'Salat', 'Vegan', 'Vegetarisch']);
        });

        test('sortiert Kategorien mit deutscher Locale und behaelt die erste Schreibweise pro Kategorie', () => {
            const rezepte = [
                { kategorien: ['Zebra', 'Ärger', 'Apfel', 'apfel'] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Apfel', 'Ärger', 'Zebra']);
        });

        test('gibt ein leeres Array zurueck wenn keine verwertbaren Kategorien vorhanden sind', () => {
            const rezepte = [
                { id: 1, name: 'Rezept 1' },
                { kategorien: [] },
                { kategorien: [' ', null] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual([]);
        });

        test('gibt fuer eine leere Rezeptliste ebenfalls ein leeres Array zurueck', () => {
            expect(holeKategorien([])).toEqual([]);
        });
    });

    describe('zeigeZutatenListe', () => {
        test('gibt Ueberschrift und nummerierte Zutaten in Reihenfolge aus', () => {
            const rezept = {
                zutaten: [
                    { name: 'Spaghetti', menge: '400g' },
                    { name: 'Tomaten', menge: '500g' }
                ]
            };

            const { ausgaben } = sammleLogAusgaben();

            zeigeZutatenListe(rezept);

            expect(ausgaben).toEqual([
                'Aktuelle Zutaten:',
                '1. Spaghetti (400g)',
                '2. Tomaten (500g)'
            ]);
        });

        test('gibt bei fehlenden oder leeren Zutaten nur die Ueberschrift aus', () => {
            const { ausgaben } = sammleLogAusgaben();

            zeigeZutatenListe({});
            zeigeZutatenListe({ zutaten: [] });

            expect(ausgaben).toEqual([
                'Aktuelle Zutaten:',
                'Aktuelle Zutaten:'
            ]);
        });
    });

    describe('zeigeArbeitsschritteListe', () => {
        test('gibt Ueberschrift und nummerierte Arbeitsschritte aus', () => {
            const rezept = {
                arbeitsschritte: [
                    'Wasser kochen',
                    'Nudeln hinzufügen',
                    'Servieren'
                ]
            };

            const { ausgaben } = sammleLogAusgaben();

            zeigeArbeitsschritteListe(rezept);

            expect(ausgaben).toEqual([
                'Aktuelle Arbeitsschritte:',
                '1. Wasser kochen',
                '2. Nudeln hinzufügen',
                '3. Servieren'
            ]);
        });

        test('gibt bei fehlenden oder leeren Arbeitsschritten nur die Ueberschrift aus', () => {
            const { ausgaben } = sammleLogAusgaben();

            zeigeArbeitsschritteListe({});
            zeigeArbeitsschritteListe({ arbeitsschritte: [] });

            expect(ausgaben).toEqual([
                'Aktuelle Arbeitsschritte:',
                'Aktuelle Arbeitsschritte:'
            ]);
        });
    });

    describe('zeigeRezeptDetails', () => {
        test('leert die Konsole und gibt eine vollstaendige Detailansicht aus', () => {
            const rezept = {
                name: 'Spaghetti Bolognese',
                schwierigkeitsgrad: 'Mittel',
                zeitaufwand: '45 Minuten',
                kategorien: ['Pasta', 'Italienisch'],
                zutaten: [
                    { name: 'Spaghetti', menge: '400g' },
                    { name: 'Tomaten', menge: '500g' }
                ],
                arbeitsschritte: [
                    'Sauce vorbereiten',
                    'Nudeln kochen'
                ]
            };

            const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
            const { ausgaben } = sammleLogAusgaben();

            zeigeRezeptDetails(rezept);

            expect(stdoutSpy).toHaveBeenCalledWith('\x1Bc');
            expect(ausgaben).toEqual([
                '===========Spaghetti Bolognese===========',
                'Schwierigkeitsgrad: Mittel',
                'Zeitaufwand: 45 Minuten',
                'Kategorien: Pasta, Italienisch',
                '\nZutaten:',
                '- Spaghetti (400g)',
                '- Tomaten (500g)',
                '\nArbeitsschritte:',
                '1. Sauce vorbereiten',
                '2. Nudeln kochen'
            ]);
        });

        test('verwendet Platzhalter fuer fehlende optionale Felder und zeigt leere Bereiche stabil an', () => {
            const rezept = {
                name: 'Einfaches Rezept',
                zutaten: [],
                arbeitsschritte: []
            };

            const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
            const { ausgaben } = sammleLogAusgaben();

            zeigeRezeptDetails(rezept);

            expect(stdoutSpy).toHaveBeenCalledWith('\x1Bc');
            expect(ausgaben).toEqual([
                '===========Einfaches Rezept===========',
                'Schwierigkeitsgrad: -',
                'Zeitaufwand: -',
                'Kategorien: -',
                '\nZutaten:',
                '\nArbeitsschritte:'
            ]);
        });
    });
});
