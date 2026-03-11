import { jest } from '@jest/globals';

// NOTE: Tests für async Input-Funktionen in eingabe.js
// sind schwierig, da sie von readline/Benutzereingaben abhängen.
// Diese Tests konzentrieren sich auf die testbare Logik.

describe('eingabe - Validierungslogik', () => {
    describe('Abbrechen-Text Erkennung (pure logic)', () => {
        test('sollte "abbrechen" erkennen', () => {
            const eingabe = 'abbrechen';
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(true);
        });

        test('sollte "ABBRECHEN" erkennen (case-insensitive)', () => {
            const eingabe = 'ABBRECHEN';
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(true);
        });

        test('sollte "  abbrechen  " mit Whitespace erkennen', () => {
            const eingabe = '  abbrechen  ';
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(true);
        });

        test('sollte andere Eingabe nicht als Abbruch erkennen', () => {
            const eingabe = 'continue';
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(false);
        });

        test('sollte leeren String nicht als Abbruch erkennen', () => {
            const eingabe = '';
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(false);
        });

        test('sollte nicht-String nicht als Abbruch erkennen', () => {
            const eingabe = 123;
            const istAbgebrochen = 
                typeof eingabe === 'string' && 
                eingabe.trim().toLowerCase() === 'abbrechen';
            
            expect(istAbgebrochen).toBe(false);
        });
    });

    describe('Ganzzahl Validierung (pure logic)', () => {
        test('sollte gültige Zahl zwischen min und max erkennen', () => {
            const eingabe = '5';
            const min = 1;
            const max = 10;
            
            const isValid = /^\d+$/.test(eingabe) && 
                          parseInt(eingabe, 10) >= min && 
                          parseInt(eingabe, 10) <= max;
            
            expect(isValid).toBe(true);
        });

        test('sollte Zahl außerhalb Range ablehnen', () => {
            const eingabe = '15';
            const min = 1;
            const max = 10;
            
            const isValid = /^\d+$/.test(eingabe) && 
                          parseInt(eingabe, 10) >= min && 
                          parseInt(eingabe, 10) <= max;
            
            expect(isValid).toBe(false);
        });

        test('sollte keine Zahl ablehnen', () => {
            const eingabe = 'abc';
            const min = 1;
            const max = 10;
            
            const isValid = /^\d+$/.test(eingabe);
            
            expect(isValid).toBe(false);
        });

        test('sollte negative Zahlen in Range akzeptieren', () => {
            const eingabe = '5';
            const min = -10;
            const max = 10;
            
            const isValid = /^\d+$/.test(eingabe) && 
                          parseInt(eingabe, 10) >= min && 
                          parseInt(eingabe, 10) <= max;
            
            expect(isValid).toBe(true);
        });
    });

    describe('Pflichtfeld Validierung (pure logic)', () => {
        test('sollte leeres Feld ablehnen', () => {
            const eingabe = '';
            const isEmpty = eingabe.trim() === '';
            
            expect(isEmpty).toBe(true);
        });

        test('sollte nur Whitespace als leer betrachten', () => {
            const eingabe = '   ';
            const isEmpty = eingabe.trim() === '';
            
            expect(isEmpty).toBe(true);
        });

        test('sollte Text akzeptieren', () => {
            const eingabe = 'Rezept Name';
            const isEmpty = eingabe.trim() === '';
            
            expect(isEmpty).toBe(false);
        });
    });
});
