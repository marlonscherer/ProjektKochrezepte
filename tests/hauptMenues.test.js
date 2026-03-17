import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();
const rezeptSucheMenueMock = jest.fn();
const rezeptAuswahlMenueMock = jest.fn();
const rezeptHinzufuegenMenueMock = jest.fn();
const rezeptLoeschenMenueMock = jest.fn();
const rezeptVeraendernEinzelnMenueMock = jest.fn();
const ladeRezepteMock = jest.fn();
const speichereRezepteMock = jest.fn();
const zeigeRezeptDetailsMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock
}));

await jest.unstable_mockModule('../menus/auswahlMenues.js', () => ({
    rezeptSucheMenue: rezeptSucheMenueMock,
    rezeptAuswahlMenue: rezeptAuswahlMenueMock
}));

await jest.unstable_mockModule('../menus/rezeptVerwaltung.js', () => ({
    rezeptHinzufuegenMenue: rezeptHinzufuegenMenueMock,
    rezeptLoeschenMenue: rezeptLoeschenMenueMock,
    rezeptVeraendernEinzelnMenue: rezeptVeraendernEinzelnMenueMock
}));

await jest.unstable_mockModule('../data/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../ui/anzeige.js', () => ({
    zeigeRezeptDetails: zeigeRezeptDetailsMock
}));

const { hauptMenue } = await import('../menus/hauptMenues.js');

describe('hauptMenues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('exits when selecting Beenden', async () => {
        frageGanzzahlMock.mockResolvedValue(6);

        await hauptMenue();

        expect(frageGanzzahlMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 6, 'Was möchtest du tun?\n');
        expect(rezeptSucheMenueMock).not.toHaveBeenCalled();
        expect(rezeptAuswahlMenueMock).not.toHaveBeenCalled();
        expect(rezeptHinzufuegenMenueMock).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Das Programm wird beendet. Auf wiedersehen!');
    });

    test('returns to the main menu after search and then exits', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptSucheMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(2);
    });

    test('dispatches within recipe management menu and returns to main menu afterwards', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptHinzufuegenMenueMock).toHaveBeenCalledTimes(1);
        expect(rezeptLoeschenMenueMock).not.toHaveBeenCalled();
        expect(rezeptVeraendernEinzelnMenueMock).not.toHaveBeenCalled();
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(1, 1, 6, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(2, 1, 4, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(3, 1, 4, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(4, 1, 6, 'Was möchtest du tun?\n');
    });

    test('opens recipe selection and then returns to the main menu before exit', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptAuswahlMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
    });

    test('shows KI menu, waits for enter, and then returns to the main menu', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
        expect(warteAufEnterMock).toHaveBeenCalledWith();
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(2);
    });

    test('opens Favoriten menu and returns when no favorites exist', async () => {
        ladeRezepteMock.mockReturnValue([]);
        frageGanzzahlMock
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zum Hauptmenü zurückzukehren');
        expect(zeigeRezeptDetailsMock).not.toHaveBeenCalled();
    });

    test('removes a favorite from Favoriten menu and saves changes', async () => {
        const rezepte = [{ id: 1, name: 'Pasta', favorit: true }];
        ladeRezepteMock.mockImplementation(() => rezepte);
        frageGanzzahlMock
            .mockResolvedValueOnce(4) // Hauptmenue: Favoriten
            .mockResolvedValueOnce(1) // Favoritenliste: Rezept waehlen
            .mockResolvedValueOnce(1) // Schnellmenue: entfernen
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(rezepte[0]);
        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        expect(speichereRezepteMock).toHaveBeenCalledWith([{ id: 1, name: 'Pasta', favorit: false }]);
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um fortzufahren');
    });
});
