import fs from 'fs';
import { jest } from '@jest/globals';
import { ladeRezepte, speichereRezepte } from '../daten/rezeptSpeicher.js';

describe('rezeptSpeicher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('ladeRezepte', () => {
        test('soll Rezepte zurueckgeben wenn die JSON-Datei gueltig ist', () => {
            const mockRezepte = [{ id: 1, name: 'Pasta' }];
            const readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockRezepte));

            const result = ladeRezepte();

            expect(result).toEqual(mockRezepte);
            expect(readSpy).toHaveBeenCalledWith(expect.any(String), 'utf-8');
        });

        test('soll ein leeres Array zurueckgeben wenn die Datei kein Array enthaelt', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ foo: 'bar' }));

            const result = ladeRezepte();

            expect(result).toEqual([]);
            expect(console.log).not.toHaveBeenCalled();
        });

        test('soll ein leeres Array zurueckgeben und einmal loggen wenn JSON ungueltig ist', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue('{ invalid json }');

            const result = ladeRezepte();

            expect(result).toEqual([]);
            expect(console.log).toHaveBeenCalledWith('Fehler beim Laden der Rezepte.');
            expect(console.log).toHaveBeenCalledTimes(1);
        });

        test('soll ein leeres Array zurueckgeben und einmal loggen wenn das Lesen der Datei fehlschlaegt', () => {
            jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
                throw new Error('File not found');
            });

            const result = ladeRezepte();

            expect(result).toEqual([]);
            expect(console.log).toHaveBeenCalledWith('Fehler beim Laden der Rezepte.');
            expect(console.log).toHaveBeenCalledTimes(1);
        });
    });

    describe('speichereRezepte', () => {
        test('soll Rezepte als formatiertes JSON schreiben', () => {
            const rezepte = [{ id: 1, name: 'Pasta' }];
            const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

            speichereRezepte(rezepte);

            expect(writeSpy).toHaveBeenCalledWith(
                expect.any(String),
                JSON.stringify(rezepte, null, 2),
                'utf-8'
            );
        });

        test('soll Schreibfehler weitergeben', () => {
            const rezepte = [{ id: 1, name: 'Pasta' }];
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('Disk full');
            });

            expect(() => speichereRezepte(rezepte)).toThrow('Disk full');
        });
    });
});
