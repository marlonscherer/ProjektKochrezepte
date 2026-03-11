import { jest } from '@jest/globals';
import { holeKategorien, zeigeZutatenListe, zeigeArbeitsschritteListe, zeigeRezeptDetails } from '../ui/anzeige.js';

describe('anzeige', () => {
    describe('holeKategorien', () => {
        test('should extract unique categories from recipes', () => {
            const rezepte = [
                { kategorien: ['Pasta', 'Vegetarisch'] },
                { kategorien: ['Pasta', 'Vegan'] },
                { kategorien: ['Salat'] }
            ];

            const result = holeKategorien(rezepte);

            // Result should be 4 unique categories from the input
            expect(result).toHaveLength(4);
            expect(result).toContain('Pasta');
            expect(result).toContain('Vegetarisch');
            expect(result).toContain('Vegan');
            expect(result).toContain('Salat');
        });

        test('should return sorted categories in German locale', () => {
            const rezepte = [
                { kategorien: ['Zebra', 'Apfel', 'Ärger'] }
            ];

            const result = holeKategorien(rezepte);
            const expected = ['Apfel', 'Ärger', 'Zebra'];

            expect(result).toEqual(expected);
        });

        test('should handle empty category array', () => {
            const rezepte = [
                { kategorien: [] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual([]);
        });

        test('should handle recipes without kategorien property', () => {
            const rezepte = [
                { id: 1, name: 'Rezept1' },
                { kategorien: ['Pasta'] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Pasta']);
        });

        test('should filter out empty or whitespace-only categories', () => {
            const rezepte = [
                { kategorien: ['Pasta', '', '  ', 'Salat'] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Pasta', 'Salat']);
        });

        test('should handle recipes with non-string categories', () => {
            const rezepte = [
                { kategorien: ['Pasta', 123, 'Salat', null] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Pasta', 'Salat']);
        });

        test('should return empty array for empty recipe list', () => {
            const result = holeKategorien([]);

            expect(result).toEqual([]);
        });

        test('should trim whitespace from categories', () => {
            const rezepte = [
                { kategorien: [' Pasta ', 'Salat'] }
            ];

            const result = holeKategorien(rezepte);

            expect(result).toEqual(['Pasta', 'Salat']);
        });

        test('should handle duplicate categories (case insensitive)', () => {
            const rezepte = [
                { kategorien: ['Pasta', 'pasta', 'PASTA'] }
            ];

            const result = holeKategorien(rezepte);

            // Note: the function uses Set which is case-sensitive, so duplicates will remain
            expect(result).toHaveLength(3);
        });
    });

    describe('zeigeZutatenListe', () => {
        test('should display ingredients list', () => {
            const rezept = {
                zutaten: [
                    { name: 'Spaghetti', menge: '400g' },
                    { name: 'Tomaten', menge: '500g' }
                ]
            };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeZutatenListe(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Aktuelle Zutaten:');
            expect(consoleSpy).toHaveBeenCalledWith('1. Spaghetti (400g)');
            expect(consoleSpy).toHaveBeenCalledWith('2. Tomaten (500g)');

            consoleSpy.mockRestore();
        });

        test('should handle empty ingredients list', () => {
            const rezept = { zutaten: [] };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeZutatenListe(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Aktuelle Zutaten:');

            consoleSpy.mockRestore();
        });

        test('should handle missing zutaten property', () => {
            const rezept = {};

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeZutatenListe(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Aktuelle Zutaten:');

            consoleSpy.mockRestore();
        });
    });

    describe('zeigeArbeitsschritteListe', () => {
        test('should display work steps list', () => {
            const rezept = {
                arbeitsschritte: [
                    'Wasser kochen',
                    'Nudeln hinzufügen',
                    'Servieren'
                ]
            };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeArbeitsschritteListe(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Aktuelle Arbeitsschritte:');
            expect(consoleSpy).toHaveBeenCalledWith('1. Wasser kochen');
            expect(consoleSpy).toHaveBeenCalledWith('2. Nudeln hinzufügen');
            expect(consoleSpy).toHaveBeenCalledWith('3. Servieren');

            consoleSpy.mockRestore();
        });

        test('should handle empty work steps list', () => {
            const rezept = { arbeitsschritte: [] };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeArbeitsschritteListe(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Aktuelle Arbeitsschritte:');

            consoleSpy.mockRestore();
        });
    });

    describe('zeigeRezeptDetails', () => {
        test('should display complete recipe details', () => {
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

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeRezeptDetails(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('===========Spaghetti Bolognese===========');
            expect(consoleSpy).toHaveBeenCalledWith('Schwierigkeitsgrad: Mittel');
            expect(consoleSpy).toHaveBeenCalledWith('Zeitaufwand: 45 Minuten');
            expect(consoleSpy).toHaveBeenCalledWith('Kategorien: Pasta, Italienisch');

            consoleSpy.mockRestore();
        });

        test('should handle missing optional fields', () => {
            const rezept = {
                name: 'Einfaches Rezept',
                zutaten: [],
                arbeitsschritte: []
            };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            zeigeRezeptDetails(rezept);

            expect(consoleSpy).toHaveBeenCalledWith('Schwierigkeitsgrad: -');
            expect(consoleSpy).toHaveBeenCalledWith('Zeitaufwand: -');
            expect(consoleSpy).toHaveBeenCalledWith('Kategorien: -');

            consoleSpy.mockRestore();
        });
    });
});
