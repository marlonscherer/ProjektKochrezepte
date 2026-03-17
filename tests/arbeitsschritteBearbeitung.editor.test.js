import { jest } from '@jest/globals';

const fragePflichtfeldMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const questionMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();
const zeigeArbeitsschritteListeMock = jest.fn();
const bearbeiteListenMenueMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    fragePflichtfeld: fragePflichtfeldMock,
    frageGanzzahl: frageGanzzahlMock,
    frageJaNein: frageJaNeinMock,
    leereKonsole: leereKonsoleMock,
    question: questionMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

await jest.unstable_mockModule('../ui/anzeige.js', () => ({
    zeigeArbeitsschritteListe: zeigeArbeitsschritteListeMock
}));

await jest.unstable_mockModule('../ui/listenMenue.js', () => ({
    bearbeiteListenMenue: bearbeiteListenMenueMock
}));

const { bearbeiteArbeitsschritte } = await import('../editors/arbeitsschritteBearbeitung.js');

describe('editors/arbeitsschritteBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('adds a step via first menu action', async () => {
        const rezept = { arbeitsschritte: ['Schritt 2'] };
        frageGanzzahlMock.mockResolvedValue(1); // insert before first
        fragePflichtfeldMock.mockResolvedValue('Schritt 1');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2']);
    });

    test('appends a step when end position is selected', async () => {
        const rezept = { arbeitsschritte: ['Schritt 1'] };
        frageGanzzahlMock.mockResolvedValue(2); // am Ende hinzufügen
        fragePflichtfeldMock.mockResolvedValue('Schritt 2');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2']);
    });

    test('changes a step via third menu action', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock.mockResolvedValue('Neu');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[2].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result.arbeitsschritte).toEqual(['Neu']);
    });

    test('prevents deleting the last remaining step', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[1].aktion(rezept);
        });

        const result = await bearbeiteArbeitsschritte(rezept);

        expect(result).toBeNull();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        expect(rezept.arbeitsschritte).toEqual(['Alt']);
    });

    test('replaces all steps via fourth menu action', async () => {
        const rezept = { arbeitsschritte: ['Alt'] };
        questionMock
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
