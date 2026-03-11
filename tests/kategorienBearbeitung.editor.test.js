import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();
const questionMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock,
    question: questionMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

const { bearbeiteKategorien } = await import('../editors/kategorienBearbeitung.js');

describe('editors/kategorienBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('adds a category', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock.mockResolvedValue('Vegan');

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Pasta', 'Vegan']);
    });

    test('returns null on back', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock.mockResolvedValue(5);

        const result = await bearbeiteKategorien(rezept);

        expect(result).toBeNull();
    });

    test('renames a category', async () => {
        const rezept = { kategorien: ['Pasta', 'Suppe'] };
        frageGanzzahlMock
            .mockResolvedValueOnce(3) // Kategorie umbenennen
            .mockResolvedValueOnce(1); // erste Kategorie waehlen
        fragePflichtfeldMock.mockResolvedValue('Nudeln');

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Nudeln', 'Suppe']);
    });

    test('replaces all categories from comma-separated input', async () => {
        const rezept = { kategorien: ['Alt'] };
        frageGanzzahlMock.mockResolvedValue(4);
        questionMock.mockResolvedValue('Pasta, Vegetarisch');
        wurdeAbgebrochenMock.mockResolvedValue(false);

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Pasta', 'Vegetarisch']);
    });
});
