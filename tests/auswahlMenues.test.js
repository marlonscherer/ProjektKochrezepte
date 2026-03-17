import { jest } from '@jest/globals';

const ladeRezepteMock = jest.fn();
const speichereRezepteMock = jest.fn();
const holeKategorienMock = jest.fn();
const zeigeRezeptDetailsMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();

await jest.unstable_mockModule('../data/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../ui/anzeige.js', () => ({
    holeKategorien: holeKategorienMock,
    zeigeRezeptDetails: zeigeRezeptDetailsMock
}));

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock
}));

const { rezeptAuswahlMenue, rezeptSucheMenue } = await import('../menus/auswahlMenues.js');

describe('auswahlMenues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('returns early when no recipes exist', async () => {
        ladeRezepteMock.mockReturnValue([]);

        await rezeptAuswahlMenue();

        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zum Hauptmenü zurückzukehren');
        expect(holeKategorienMock).not.toHaveBeenCalled();
    });

    test('filters recipes by selected category case-insensitively and shows only matching recipe details', async () => {
        const rezepte = [
            { id: 1, name: 'Spaghetti', kategorien: ['pasta'] },
            { id: 2, name: 'Suppe', kategorien: ['Suppe'] },
            { id: 3, name: 'Lasagne', kategorien: ['Pasta', 'Ofen'] }
        ];
        ladeRezepteMock.mockReturnValue(rezepte);
        holeKategorienMock.mockReturnValue(['Pasta', 'Suppe']);
        frageGanzzahlMock
            .mockResolvedValueOnce(2) // Kategorie Pasta
            .mockResolvedValueOnce(2) // Lasagne aus gefilterter Liste
            .mockResolvedValueOnce(2) // Zurueck aus Favoriten-Schnellmenue
            .mockResolvedValueOnce(3) // Zurueck aus Rezeptliste
            .mockResolvedValueOnce(4); // Zurueck aus Kategorien

        await rezeptAuswahlMenue();

        expect(zeigeRezeptDetailsMock).toHaveBeenCalledTimes(1);
        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(rezepte[2]);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('shows recipe details in Alle Rezepte flow', async () => {
        const rezepte = [{ id: 1, name: 'Pasta', kategorien: ['A'] }];
        ladeRezepteMock.mockReturnValue(rezepte);
        holeKategorienMock.mockReturnValue(['A']);
        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Alle Rezepte
            .mockResolvedValueOnce(1) // Rezept 1
            .mockResolvedValueOnce(2) // Zurueck aus Favoriten-Schnellmenue
            .mockResolvedValueOnce(2) // Zurueck aus Liste
            .mockResolvedValueOnce(3); // Zurueck aus Kategorien

        await rezeptAuswahlMenue();

        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(rezepte[0]);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('search returns when user cancels input', async () => {
        ladeRezepteMock.mockReturnValue([{ id: 1, name: 'Pasta', kategorien: ['A'] }]);
        fragePflichtfeldMock.mockResolvedValue(null);

        await rezeptSucheMenue();

        expect(zeigeRezeptDetailsMock).not.toHaveBeenCalled();
        expect(frageGanzzahlMock).not.toHaveBeenCalled();
    });

    test('search finds recipe names case-insensitive and shows details', async () => {
        const rezepte = [
            { id: 1, name: 'Pasta', kategorien: ['A'] },
            { id: 2, name: 'Salat', kategorien: ['B'] }
        ];
        ladeRezepteMock.mockReturnValue(rezepte);
        fragePflichtfeldMock.mockResolvedValue('pas');
        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Rezept 1 in Trefferliste
            .mockResolvedValueOnce(2) // Zurueck aus Favoriten-Schnellmenue
            .mockResolvedValueOnce(2); // Zurueck aus Trefferliste

        await rezeptSucheMenue();

        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(rezepte[0]);
        expect(warteAufEnterMock).not.toHaveBeenCalled();
    });

    test('search shows message when no recipe matches', async () => {
        ladeRezepteMock.mockReturnValue([{ id: 1, name: 'Pasta', kategorien: ['A'] }]);
        fragePflichtfeldMock.mockResolvedValue('xyz');

        await rezeptSucheMenue();

        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zur Suche zurückzukehren');
        expect(zeigeRezeptDetailsMock).not.toHaveBeenCalled();
    });

    test('fuegt ein Rezept aus dem Schnellmenue zu Favoriten hinzu und speichert', async () => {
        const rezepte = [{ id: 1, name: 'Pasta', kategorien: ['A'], favorit: false }];
        ladeRezepteMock.mockReturnValue(rezepte);
        holeKategorienMock.mockReturnValue(['A']);
        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Alle Rezepte
            .mockResolvedValueOnce(1) // Rezept 1
            .mockResolvedValueOnce(1) // Zu Favoriten hinzufuegen
            .mockResolvedValueOnce(2) // Zurueck aus Liste
            .mockResolvedValueOnce(3); // Zurueck aus Kategorien

        await rezeptAuswahlMenue();

        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        expect(speichereRezepteMock).toHaveBeenCalledWith([
            { id: 1, name: 'Pasta', kategorien: ['A'], favorit: true }
        ]);
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um fortzufahren');
    });

    test('entfernt ein bereits favorisiertes Rezept aus Favoriten im Schnellmenue und speichert', async () => {
        const rezepte = [{ id: 1, name: 'Pasta', kategorien: ['A'], favorit: true }];
        ladeRezepteMock.mockReturnValue(rezepte);
        holeKategorienMock.mockReturnValue(['A']);
        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Alle Rezepte
            .mockResolvedValueOnce(1) // Rezept 1
            .mockResolvedValueOnce(1) // Aus Favoriten entfernen
            .mockResolvedValueOnce(2) // Zurueck aus Liste
            .mockResolvedValueOnce(3); // Zurueck aus Kategorien

        await rezeptAuswahlMenue();

        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        expect(speichereRezepteMock).toHaveBeenCalledWith([
            { id: 1, name: 'Pasta', kategorien: ['A'], favorit: false }
        ]);
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um fortzufahren');
    });
});
