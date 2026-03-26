import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();
const frageTextMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock,
    frageText: frageTextMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

const { bearbeiteKategorien } = await import('../bearbeitungen/kategorienBearbeitung.js');

describe('bearbeitungen/kategorienBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fuegt eine Kategorie hinzu', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock.mockResolvedValue('Vegan');

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Pasta', 'Vegan']);
    });

    test('lehnt doppelte Kategorien ab und fragt bis zu einer eindeutigen Eingabe erneut', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock
            .mockResolvedValueOnce('pasta')
            .mockResolvedValueOnce('Vegan');

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Pasta', 'Vegan']);
        expect(console.log).toHaveBeenCalledWith('Die Kategorie "pasta" existiert bereits!');
    });

    test('gibt bei Zurueck null zurueck', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock.mockResolvedValue(5);

        const result = await bearbeiteKategorien(rezept);

        expect(result).toBeNull();
    });

    test('benennt eine Kategorie um', async () => {
        const rezept = { kategorien: ['Pasta', 'Suppe'] };
        frageGanzzahlMock
            .mockResolvedValueOnce(3) // Kategorie umbenennen
            .mockResolvedValueOnce(1); // erste Kategorie waehlen
        fragePflichtfeldMock.mockResolvedValue('Nudeln');

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Nudeln', 'Suppe']);
    });

    test('verhindert das Entfernen der letzten verbleibenden Kategorie', async () => {
        const rezept = { kategorien: ['Pasta'] };
        frageGanzzahlMock
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(5);

        const result = await bearbeiteKategorien(rezept);

        expect(result).toBeNull();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        expect(rezept.kategorien).toEqual(['Pasta']);
    });

    test('ersetzt alle Kategorien aus einer komma-separierten Eingabe', async () => {
        const rezept = { kategorien: ['Alt'] };
        frageGanzzahlMock.mockResolvedValue(4);
        frageTextMock.mockResolvedValue('Pasta, Vegetarisch');
        wurdeAbgebrochenMock.mockResolvedValue(false);

        const result = await bearbeiteKategorien(rezept);

        expect(result.kategorien).toEqual(['Pasta', 'Vegetarisch']);
    });
});
