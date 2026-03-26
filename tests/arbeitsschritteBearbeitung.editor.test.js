import { jest } from '@jest/globals';

const fragePflichtfeldMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const frageTextMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();
const zeigeArbeitsschritteListeMock = jest.fn();
const bearbeiteListenMenueMock = jest.fn();

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    fragePflichtfeld: fragePflichtfeldMock,
    frageGanzzahl: frageGanzzahlMock,
    frageJaNein: frageJaNeinMock,
    leereKonsole: leereKonsoleMock,
    frageText: frageTextMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

await jest.unstable_mockModule('../oberflaeche/anzeige.js', () => ({
    zeigeArbeitsschritteListe: zeigeArbeitsschritteListeMock
}));

await jest.unstable_mockModule('../oberflaeche/listenMenue.js', () => ({
    bearbeiteListenMenue: bearbeiteListenMenueMock
}));

const { bearbeiteArbeitsschritte } = await import('../bearbeitungen/arbeitsschritteBearbeitung.js');

describe('bearbeitungen/arbeitsschritteBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fuegt ueber die erste Menueaktion einen Schritt hinzu', async () => {
        const rezept = { arbeitsschritte: ['Schritt 2'] };
        frageGanzzahlMock.mockResolvedValue(1); // insert before first
        fragePflichtfeldMock.mockResolvedValue('Schritt 1');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2']);
    });

    test('haengt einen Schritt an wenn die Endposition gewaehlt ist', async () => {
        const rezept = { arbeitsschritte: ['Schritt 1'] };
        frageGanzzahlMock.mockResolvedValue(2); // am Ende hinzufügen
        fragePflichtfeldMock.mockResolvedValue('Schritt 2');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2']);
    });

    test('aendert einen Schritt ueber die dritte Menueaktion', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock.mockResolvedValue('Neu');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[2].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Neu']);
    });

    test('verhindert das Loeschen des letzten verbleibenden Schritts', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[1].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result).toBeNull();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        expect(rezept.arbeitsschritte).toEqual(['Alt']);
    });

    test('ersetzt alle Schritte ueber die vierte Menueaktion', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };
        frageTextMock
            .mockResolvedValueOnce('Schritt A')
            .mockResolvedValueOnce('Schritt B')
            .mockResolvedValueOnce('fertig');
        wurdeAbgebrochenMock.mockResolvedValue(false);

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[3].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Schritt A', 'Schritt B']);
    });
});
