import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();
const rezeptSucheMenueMock = jest.fn();
const rezeptAuswahlMenueMock = jest.fn();
const rezeptHinzufuegenMenueMock = jest.fn();
const rezeptLoeschenMenueMock = jest.fn();
const rezeptVeraendernEinzelnMenueMock = jest.fn();

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

const { hauptMenue } = await import('../menus/hauptMenues.js');

describe('hauptMenues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('exits when selecting Beenden', async () => {
        frageGanzzahlMock.mockResolvedValue(5);

        await hauptMenue();

        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 5, 'Was möchtest du tun?\n');
    });

    test('calls rezeptSucheMenue and then exits', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(5);

        await hauptMenue();

        expect(rezeptSucheMenueMock).toHaveBeenCalledTimes(1);
    });

    test('calls rezeptAuswahlMenue and then exits', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(5);

        await hauptMenue();

        expect(rezeptAuswahlMenueMock).toHaveBeenCalledTimes(1);
    });

    test('calls KI menu path and then exits', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(5);

        await hauptMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });
});
