import { jest } from '@jest/globals';

const fragePflichtfeldMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const frageTextMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();
const zeigeZutatenListeMock = jest.fn();
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
    zeigeZutatenListe: zeigeZutatenListeMock
}));

await jest.unstable_mockModule('../oberflaeche/listenMenue.js', () => ({
    bearbeiteListenMenue: bearbeiteListenMenueMock
}));

const { bearbeiteZutaten } = await import('../bearbeitungen/zutatenBearbeitung.js');

describe('bearbeitungen/zutatenBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fuegt ueber die erste Menueaktion eine neue Zutat hinzu', async () => {
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

    test('lehnt doppelte Zutaten ab und fragt bis zu einer eindeutigen Eingabe erneut', async () => {
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

    test('aendert eine Zutat ueber die dritte Menueaktion', async () => {
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

    test('verhindert das Loeschen der letzten verbleibenden Zutat', async () => {
        const rezept = { zutaten: [{ name: 'Tomate', menge: '1' }] };

        bearbeiteListenMenueMock.mockImplementation(async (_rezept, _titel, _zeige, optionen) => {
            return optionen[1].aktion(rezept);
        });

        const result = await bearbeiteZutaten(rezept);

        expect(result).toBeNull();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
        expect(rezept.zutaten).toEqual([{ name: 'Tomate', menge: '1' }]);
    });

    test('ersetzt Zutaten ueber die vierte Menueaktion', async () => {
        const rezept = { zutaten: [{ name: 'Alt', menge: '1' }] };
        frageTextMock.mockResolvedValue('Mehl 500g, Wasser 300ml');
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
