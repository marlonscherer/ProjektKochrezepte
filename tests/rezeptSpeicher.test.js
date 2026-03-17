import fs from 'fs';
import { jest } from '@jest/globals';
import { ladeRezepte, speichereRezepte } from '../data/rezeptSpeicher.js';

describe('rezeptSpeicher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('ladeRezepte', () => {
        test('should return recipes when JSON file is valid', () => {
            const mockRezepte = [{ id: 1, name: 'Pasta' }];
            const readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockRezepte));

            const result = ladeRezepte();

            expect(result).toEqual(mockRezepte);
            expect(readSpy).toHaveBeenCalledWith(expect.any(String), 'utf-8');
        });

        test('should return empty array when file contains no array', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ foo: 'bar' }));

            const result = ladeRezepte();

            expect(result).toEqual([]);
            expect(console.log).not.toHaveBeenCalled();
        });

        test('should return empty array and log once when JSON is invalid', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue('{ invalid json }');

            const result = ladeRezepte();

            expect(result).toEqual([]);
            expect(console.log).toHaveBeenCalledWith('Fehler beim Laden der Rezepte.');
            expect(console.log).toHaveBeenCalledTimes(1);
        });

        test('should return empty array and log once when file read fails', () => {
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
        test('should write recipes as formatted JSON', () => {
            const rezepte = [{ id: 1, name: 'Pasta' }];
            const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

            speichereRezepte(rezepte);

            expect(writeSpy).toHaveBeenCalledWith(
                expect.any(String),
                JSON.stringify(rezepte, null, 2),
                'utf-8'
            );
        });

        test('should propagate write errors', () => {
            const rezepte = [{ id: 1, name: 'Pasta' }];
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
                throw new Error('Disk full');
            });

            expect(() => speichereRezepte(rezepte)).toThrow('Disk full');
        });
    });
});
