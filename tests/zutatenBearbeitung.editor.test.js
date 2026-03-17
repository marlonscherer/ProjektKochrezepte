import { jest } from '@jest/globals';

const fragePflichtfeldMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const questionMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();
const zeigeZutatenListeMock = jest.fn();
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
    zeigeZutatenListe: zeigeZutatenListeMock
}));

await jest.unstable_mockModule('../ui/listenMenue.js', () => ({
    bearbeiteListenMenue: bearbeiteListenMenueMock
}));

const { bearbeiteZutaten } = await import('../editors/zutatenBearbeitung.js');

describe('editors/zutatenBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('adds a new ingredient via first menu action', async () => {
        const rezept = { zutaten: [{ name: 'Tomate', menge: '1' }] };
        fragePflichtfeldMock
            .mockResolvedValueOnce('Salz')
            .mockResolvedValueOnce('1 TL');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result.zutaten).toHaveLength(2);
        expect(result.zutaten[1]).toEqual({ name: 'Salz', menge: '1 TL' });
    });

    test('rejects duplicate ingredient and retries until unique input', async () => {
        const rezept = { zutaten: [{ name: 'Tomate', menge: '1' }] };
        fragePflichtfeldMock
            .mockResolvedValueOnce('tomate')
            .mockResolvedValueOnce('Salz')
            .mockResolvedValueOnce('1 TL');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[0].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result.zutaten).toEqual([
            { name: 'Tomate', menge: '1' },
            { name: 'Salz', menge: '1 TL' }
        ]);
        expect(console.log).toHaveBeenCalledWith('Die Zutat "tomate" existiert bereits!');
    });

    test('changes an ingredient via third menu action', async () => {
        const rezept = { zutaten: [{ name: 'Tomate', menge: '1' }, { name: 'Salz', menge: '1 TL' }] };
        frageGanzzahlMock.mockResolvedValue(1);
        fragePflichtfeldMock
            .mockResolvedValueOnce('Paprika')
            .mockResolvedValueOnce('2 Stk');

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[2].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result.zutaten[0]).toEqual({ name: 'Paprika', menge: '2 Stk' });
    });

    test('prevents deleting the last remaining ingredient', async () => {
        const rezept = { zutaten: [{ name: 'Tomate', menge: '1' }] };

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[1].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result).toBeNull();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        expect(rezept.zutaten).toEqual([{ name: 'Tomate', menge: '1' }]);
    });

    test('replaces ingredients via fourth menu action', async () => {
        const rezept = { zutaten: [{ name: 'Alt', menge: '1' }] };
        questionMock.mockResolvedValue('Mehl 500g, Wasser 300ml');
        wurdeAbgebrochenMock.mockResolvedValue(false);

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[3].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result.zutaten).toEqual([
            { name: 'Mehl', menge: '500g' },
            { name: 'Wasser', menge: '300ml' }
        ]);
    });
});
