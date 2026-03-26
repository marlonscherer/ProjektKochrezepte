import { jest } from '@jest/globals';

const leereKonsoleMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const warteAufEnterMock = jest.fn();

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    leereKonsole: leereKonsoleMock,
    frageGanzzahl: frageGanzzahlMock,
    warteAufEnter: warteAufEnterMock
}));

const { bearbeiteFavorit } = await import('../bearbeitungen/favoritBearbeitung.js');
const { aktualisiereFavoritStatus } = await import('../bearbeitungen/favoritBearbeitung.js');

describe('bearbeitungen/favoritBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fuegt ein Rezept zu Favoriten hinzu wenn es noch kein Favorit ist', async () => {
        const rezept = { name: 'Pasta', favorit: false };
        frageGanzzahlMock.mockResolvedValue(1);

        const result = await bearbeiteFavorit(rezept);

        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 2, 'Was möchtest du tun?\n');
        expect(result).toBe(rezept);
        expect(result.favorit).toBe(true);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('gibt bei Zurueck null zurueck wenn das Rezept kein Favorit ist', async () => {
        const rezept = { name: 'Pasta', favorit: false };
        frageGanzzahlMock.mockResolvedValue(2);

        const result = await bearbeiteFavorit(rezept);

        expect(result).toBeNull();
        expect(rezept.favorit).toBe(false);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('entfernt ein Rezept aus Favoriten wenn es bereits Favorit ist', async () => {
        const rezept = { name: 'Pasta', favorit: true };
        frageGanzzahlMock.mockResolvedValue(1);

        const result = await bearbeiteFavorit(rezept);

        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 2, 'Was möchtest du tun?\n');
        expect(result).toBe(rezept);
        expect(result.favorit).toBe(false);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('gibt bei Zurueck null zurueck wenn das Rezept bereits Favorit ist', async () => {
        const rezept = { name: 'Pasta', favorit: true };
        frageGanzzahlMock.mockResolvedValue(2);

        const result = await bearbeiteFavorit(rezept);

        expect(result).toBeNull();
        expect(rezept.favorit).toBe(true);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('aktualisiert Favoritenstatus im Zielarray per Rezept-ID', () => {
        const rezepte = [
            { id: 1, name: 'Pasta', favorit: false },
            { id: 2, name: 'Suppe', favorit: false }
        ];

        const bearbeitet = { id: 2, name: 'Suppe', favorit: true };
        const result = aktualisiereFavoritStatus(rezepte, bearbeitet);

        expect(result).toBe(true);
        expect(rezepte[1].favorit).toBe(true);
    });

    test('gibt false zurueck wenn Rezept-ID im Zielarray fehlt', () => {
        const rezepte = [{ id: 1, name: 'Pasta', favorit: false }];
        const bearbeitet = { id: 999, name: 'Unbekannt', favorit: true };

        const result = aktualisiereFavoritStatus(rezepte, bearbeitet);

        expect(result).toBe(false);
        expect(rezepte[0].favorit).toBe(false);
    });
});
