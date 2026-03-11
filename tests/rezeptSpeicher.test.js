import fs from 'fs';
import { jest } from '@jest/globals';
import { ladeRezepte, speichereRezepte } from '../data/rezeptSpeicher.js';

describe('rezeptSpeicher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('ladeRezepte', () => {
        test('should return recipes when JSON file is valid', () => {
            const mockRezepte = [{ id: 1, name: 'Pasta' }];
            jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockRezepte));

            const result = ladeRezepte();

            expect(result).toEqual(mockRezepte);
        });

        test('should return empty array when file contains no array', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ foo: 'bar' }));

            const result = ladeRezepte();

            expect(result).toEqual([]);
        });

        test('should return empty array when JSON is invalid', () => {
            jest.spyOn(fs, 'readFileSync').mockReturnValue('{ invalid json }');

            const result = ladeRezepte();

            expect(result).toEqual([]);
        });

        test('should return empty array when file read fails', () => {
            jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
                throw new Error('File not found');
            });

            const result = ladeRezepte();

            expect(result).toEqual([]);
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
    });
});
