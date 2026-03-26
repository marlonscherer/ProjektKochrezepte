import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    leereKonsole: leereKonsoleMock
}));

const { bearbeiteListenMenue } = await import('../oberflaeche/listenMenue.js');

describe('listenMenue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('rendert Titel und Optionen und gibt bei Zurueck null zurueck', async () => {
        frageGanzzahlMock.mockResolvedValue(3);

        const rezept = { id: 1 };
        const zeigeEintraege = jest.fn();
        const optionen = [
            { label: 'A', aktion: jest.fn() },
            { label: 'B', aktion: jest.fn() }
        ];

        const result = await bearbeiteListenMenue(rezept, 'Test', zeigeEintraege, optionen);

        expect(result).toBeNull();
        expect(leereKonsoleMock).toHaveBeenCalledTimes(1);
        expect(zeigeEintraege).toHaveBeenCalledWith(rezept);
        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 3, '\nWas möchtest du tun?\n');
        expect(console.log).toHaveBeenCalledWith('===========Test===========');
        expect(console.log).toHaveBeenCalledWith('[1] A');
        expect(console.log).toHaveBeenCalledWith('[2] B');
        expect(console.log).toHaveBeenCalledWith('[3] Zurück');
    });

    test('gibt das bearbeitete Rezept zurueck wenn die gewaehlte Aktion nicht-null liefert', async () => {
        frageGanzzahlMock.mockResolvedValue(1);

        const rezept = { id: 1, name: 'Alt' };
        const bearbeitet = { id: 1, name: 'Neu' };
        const zeigeEintraege = jest.fn();
        const optionen = [
            { label: 'A', aktion: jest.fn().mockResolvedValue(bearbeitet) }
        ];

        const result = await bearbeiteListenMenue(rezept, 'Test', zeigeEintraege, optionen);

        expect(result).toEqual(bearbeitet);
        expect(optionen[0].aktion).toHaveBeenCalledWith(rezept);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(1);
    });

    test('wiederholt, rendert das Menue neu und gibt spaeteres Aktionsergebnis nach einer null-Aktion zurueck', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2);

        const rezept = { id: 1 };
        const zeigeEintraege = jest.fn();
        const bearbeitet = { id: 1, status: 'geaendert' };
        const optionen = [
            { label: 'A', aktion: jest.fn().mockResolvedValue(null) },
            { label: 'B', aktion: jest.fn().mockResolvedValue(bearbeitet) }
        ];

        const result = await bearbeiteListenMenue(rezept, 'Test', zeigeEintraege, optionen);

        expect(result).toEqual(bearbeitet);
        expect(optionen[0].aktion).toHaveBeenCalledTimes(1);
        expect(optionen[1].aktion).toHaveBeenCalledWith(rezept);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(2);
        expect(zeigeEintraege).toHaveBeenCalledTimes(2);
    });
});
