import { jest } from '@jest/globals';

const leereKonsoleMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const warteAufEnterMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    leereKonsole: leereKonsoleMock,
    frageGanzzahl: frageGanzzahlMock,
    warteAufEnter: warteAufEnterMock
}));

const { bearbeiteFavorit } = await import('../editors/favoritBearbeitung.js');

describe('editors/favoritBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('adds recipe to favorites when recipe is not favorite', async () => {
        const rezept = { name: 'Pasta', favorit: false };
        frageGanzzahlMock.mockResolvedValue(1);

        const result = await bearbeiteFavorit(rezept);

        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 2, 'Was möchtest du tun?\n');
        expect(result).toBe(rezept);
        expect(result.favorit).toBe(true);
        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('returns null on back when recipe is not favorite', async () => {
        const rezept = { name: 'Pasta', favorit: false };
        frageGanzzahlMock.mockResolvedValue(2);

        const result = await bearbeiteFavorit(rezept);

        expect(result).toBeNull();
        expect(rezept.favorit).toBe(false);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('removes recipe from favorites when recipe is already favorite', async () => {
        const rezept = { name: 'Pasta', favorit: true };
        frageGanzzahlMock.mockResolvedValue(1);

        const result = await bearbeiteFavorit(rezept);

        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 2, 'Was möchtest du tun?\n');
        expect(result).toBe(rezept);
        expect(result.favorit).toBe(false);
        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('returns null on back when recipe is already favorite', async () => {
        const rezept = { name: 'Pasta', favorit: true };
        frageGanzzahlMock.mockResolvedValue(2);

        const result = await bearbeiteFavorit(rezept);

        expect(result).toBeNull();
        expect(rezept.favorit).toBe(true);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });
});
