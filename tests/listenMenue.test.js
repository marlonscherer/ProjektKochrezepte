import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    leereKonsole: leereKonsoleMock
}));

const { bearbeiteListenMenue } = await import('../ui/listenMenue.js');

describe('listenMenue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns null when user selects Zurueck', async () => {
        frageGanzzahlMock.mockResolvedValue(3);

        const rezept = { id: 1 };
        const zeigeEintraege = jest.fn();
        const optionen = [
            { label: 'A', aktion: jest.fn() },
            { label: 'B', aktion: jest.fn() }
        ];

        const result = await bearbeiteListenMenue(rezept, 'Test', zeigeEintraege, optionen);

        expect(result).toBeNull();
        expect(zeigeEintraege).toHaveBeenCalledWith(rezept);
    });

    test('returns edited recipe when selected action returns non-null', async () => {
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
    });

    test('loops until an action returns non-null', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2);

        const rezept = { id: 1 };
        const zeigeEintraege = jest.fn();
        const optionen = [
            { label: 'A', aktion: jest.fn().mockResolvedValue(null) }
        ];

        const result = await bearbeiteListenMenue(rezept, 'Test', zeigeEintraege, optionen);

        expect(result).toBeNull();
        expect(optionen[0].aktion).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
    });
});
