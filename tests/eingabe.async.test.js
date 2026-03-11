import { jest } from '@jest/globals';

// Mock für readline/promises – verhindert echte Konsolen-I/O in Tests
const mockRlQuestion = jest.fn();
const mockRlClose = jest.fn();
const mockRlOnce = jest.fn();
const mockRlOff = jest.fn();
const mockRl = {
    question: mockRlQuestion,
    close: mockRlClose,
    once: mockRlOnce,
    off: mockRlOff,
    closed: false,
};
const mockCreateInterface = jest.fn(() => mockRl);

await jest.unstable_mockModule('readline/promises', () => ({
    default: { createInterface: mockCreateInterface },
}));

const {
    question,
    leereKonsole,
    warteAufEnter,
    wurdeAbgebrochen,
    fragePflichtfeld,
    frageGanzzahl,
    schliesseEingabe,
    istInputGeschlossenFehler,
} = await import('../ui/eingabe.js');

describe('eingabe.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRl.closed = false;
    });

    // ─── leereKonsole ────────────────────────────────────────────────────────

    describe('leereKonsole', () => {
        test('schreibt ANSI-Clear-Escape-Code auf stdout', () => {
            const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            leereKonsole();
            expect(spy).toHaveBeenCalledWith('\x1Bc');
            spy.mockRestore();
        });
    });

    // ─── istInputGeschlossenFehler ────────────────────────────────────────────

    describe('istInputGeschlossenFehler', () => {
        test('gibt true zurück für INPUT_GESCHLOSSEN-Fehler', () => {
            expect(istInputGeschlossenFehler(new Error('INPUT_GESCHLOSSEN'))).toBe(true);
        });

        test('gibt false zurück für anderen Fehler', () => {
            expect(istInputGeschlossenFehler(new Error('unbekannter Fehler'))).toBe(false);
        });

        test('gibt false zurück für Nicht-Error-Werte', () => {
            expect(istInputGeschlossenFehler('string')).toBe(false);
            expect(istInputGeschlossenFehler(null)).toBe(false);
            expect(istInputGeschlossenFehler(undefined)).toBe(false);
            expect(istInputGeschlossenFehler(42)).toBe(false);
        });
    });

    // ─── question ────────────────────────────────────────────────────────────

    describe('question', () => {
        test('gibt die Benutzereingabe zurück', async () => {
            mockRlQuestion.mockResolvedValue('Testantwort');
            const result = await question('Prompt: ');
            expect(result).toBe('Testantwort');
            expect(mockRlQuestion).toHaveBeenCalledWith('Prompt: ');
        });

        test('kann mehrfach hintereinander aufgerufen werden', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('Antwort 1')
                .mockResolvedValueOnce('Antwort 2');
            const r1 = await question('A: ');
            const r2 = await question('B: ');
            expect(r1).toBe('Antwort 1');
            expect(r2).toBe('Antwort 2');
        });

        test('wirft Fehler wenn Interface bereits geschlossen', async () => {
            mockRl.closed = true;
            await expect(question('Prompt: ')).rejects.toThrow('INPUT_GESCHLOSSEN');
        });
    });

    // ─── warteAufEnter ────────────────────────────────────────────────────────

    describe('warteAufEnter', () => {
        test('ruft question mit Standard-Prompt auf', async () => {
            mockRlQuestion.mockResolvedValue('');
            await warteAufEnter();
            expect(mockRlQuestion).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        });

        test('ruft question mit benutzerdefiniertem Prompt auf', async () => {
            mockRlQuestion.mockResolvedValue('');
            await warteAufEnter('Weiter mit Enter...');
            expect(mockRlQuestion).toHaveBeenCalledWith('Weiter mit Enter...');
        });
    });

    // ─── wurdeAbgebrochen ─────────────────────────────────────────────────────

    describe('wurdeAbgebrochen', () => {
        test('gibt true zurück und wartet auf Enter bei "abbrechen"', async () => {
            mockRlQuestion.mockResolvedValue('');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await wurdeAbgebrochen('abbrechen', 'Vorgang abgebrochen.');
            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('Vorgang abgebrochen.');
            consoleSpy.mockRestore();
        });

        test('erkennt "ABBRECHEN" case-insensitive', async () => {
            mockRlQuestion.mockResolvedValue('');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await wurdeAbgebrochen('ABBRECHEN', 'Abgebrochen');
            expect(result).toBe(true);
            consoleSpy.mockRestore();
        });

        test('erkennt "  abbrechen  " mit Whitespace', async () => {
            mockRlQuestion.mockResolvedValue('');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await wurdeAbgebrochen('  abbrechen  ', 'Abgebrochen');
            expect(result).toBe(true);
            consoleSpy.mockRestore();
        });

        test('gibt false zurück bei normaler Eingabe', async () => {
            const result = await wurdeAbgebrochen('Hallo', 'Abgebrochen');
            expect(result).toBe(false);
            expect(mockRlQuestion).not.toHaveBeenCalled();
        });

        test('gibt false zurück bei leerer Eingabe', async () => {
            const result = await wurdeAbgebrochen('', 'Abgebrochen');
            expect(result).toBe(false);
        });

        test('gibt false zurück bei Nicht-String', async () => {
            const result = await wurdeAbgebrochen(null, 'Abgebrochen');
            expect(result).toBe(false);
        });
    });

    // ─── fragePflichtfeld ─────────────────────────────────────────────────────

    describe('fragePflichtfeld', () => {
        test('gibt eingegebenen Wert zurück', async () => {
            mockRlQuestion.mockResolvedValue('Mein Rezept');
            const result = await fragePflichtfeld('Name: ', 'Pflichtfeld!', 'Abbruch');
            expect(result).toBe('Mein Rezept');
        });

        test('trimmt Whitespace vom Rückgabewert', async () => {
            mockRlQuestion.mockResolvedValue('  Rezept  ');
            const result = await fragePflichtfeld('Name: ', 'Pflichtfeld!', 'Abbruch');
            expect(result).toBe('Rezept');
        });

        test('wiederholt die Frage bei leerer Eingabe', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('   ')
                .mockResolvedValueOnce('Gültiger Wert');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await fragePflichtfeld('Name: ', 'Leer!', 'Abbruch');
            expect(result).toBe('Gültiger Wert');
            expect(consoleSpy).toHaveBeenCalledWith('Leer!');
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            consoleSpy.mockRestore();
        });

        test('gibt null zurück bei "abbrechen"', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('abbrechen')
                .mockResolvedValueOnce(''); // für warteAufEnter
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await fragePflichtfeld('Name: ', 'Leer!', 'Abbruch!');
            expect(result).toBeNull();
            consoleSpy.mockRestore();
        });
    });

    // ─── frageGanzzahl ────────────────────────────────────────────────────────

    describe('frageGanzzahl', () => {
        test('gibt gültige Zahl zurück', async () => {
            mockRlQuestion.mockResolvedValue('3');
            const result = await frageGanzzahl(1, 5, 'Wahl: ');
            expect(result).toBe(3);
        });

        test('akzeptiert den Grenzwert min', async () => {
            mockRlQuestion.mockResolvedValue('1');
            expect(await frageGanzzahl(1, 5, 'Wahl: ')).toBe(1);
        });

        test('akzeptiert den Grenzwert max', async () => {
            mockRlQuestion.mockResolvedValue('5');
            expect(await frageGanzzahl(1, 5, 'Wahl: ')).toBe(5);
        });

        test('wiederholt bei nicht-numerischer Eingabe', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('abc')
                .mockResolvedValueOnce('xyz')
                .mockResolvedValueOnce('2');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await frageGanzzahl(1, 5, 'Wahl: ');
            expect(result).toBe(2);
            expect(consoleSpy).toHaveBeenCalledWith('Fehler: Bitte geben Sie eine gültige Zahl ein');
            expect(consoleSpy).toHaveBeenCalledTimes(2);
            consoleSpy.mockRestore();
        });

        test('wiederholt bei Zahl unterhalb des Minimums', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('0')
                .mockResolvedValueOnce('1');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await frageGanzzahl(1, 5, 'Wahl: ');
            expect(result).toBe(1);
            expect(consoleSpy).toHaveBeenCalledWith('Fehler: Bitte wählen Sie eine der oben genannten Optionen');
            consoleSpy.mockRestore();
        });

        test('wiederholt bei Zahl oberhalb des Maximums', async () => {
            mockRlQuestion
                .mockResolvedValueOnce('99')
                .mockResolvedValueOnce('3');
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = await frageGanzzahl(1, 5, 'Wahl: ');
            expect(result).toBe(3);
            expect(consoleSpy).toHaveBeenCalledWith('Fehler: Bitte wählen Sie eine der oben genannten Optionen');
            consoleSpy.mockRestore();
        });
    });

    // ─── schliesseEingabe ─────────────────────────────────────────────────────

    describe('schliesseEingabe', () => {
        test('schließt die readline-Schnittstelle', async () => {
            mockRlQuestion.mockResolvedValue('');
            await question('test');
            schliesseEingabe();
            expect(mockRlClose).toHaveBeenCalledTimes(1);
        });

        test('macht nichts wenn Interface bereits geschlossen ist', async () => {
            mockRlQuestion.mockResolvedValue('');
            await question('test');
            mockRl.closed = true;
            jest.clearAllMocks();
            schliesseEingabe();
            expect(mockRlClose).not.toHaveBeenCalled();
        });
    });
});
