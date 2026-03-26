import { jest } from '@jest/globals';

const ladeRezepteMock = jest.fn();
const speichereRezepteMock = jest.fn();
const rezeptEditierMenueMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const frageTextMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();

await jest.unstable_mockModule('../daten/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../bearbeitungen/rezeptFelderBearbeitung.js', () => ({
    rezeptEditierMenue: rezeptEditierMenueMock
}));

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    frageJaNein: frageJaNeinMock,
    leereKonsole: leereKonsoleMock,
    frageText: frageTextMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

const {
    rezeptLoeschenMenue,
    rezeptHinzufuegenMenue,
    rezeptVeraendernEinzelnMenue
} = await import('../menues/rezeptVerwaltung.js');

describe('rezeptVerwaltung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('rezeptLoeschenMenue kehrt zurueck wenn keine Rezepte vorhanden sind', async () => {
        ladeRezepteMock.mockReturnValue([]);

        await rezeptLoeschenMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('rezeptVeraendernEinzelnMenue kehrt zurueck wenn keine Rezepte vorhanden sind', async () => {
        ladeRezepteMock.mockReturnValue([]);

        await rezeptVeraendernEinzelnMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('rezeptHinzufuegenMenue bricht ab wenn das erste Pflichtfeld abgebrochen wird', async () => {
        ladeRezepteMock.mockReturnValue([]);
        fragePflichtfeldMock.mockResolvedValue(null);

        await rezeptHinzufuegenMenue();

        expect(fragePflichtfeldMock).toHaveBeenCalled();
        expect(speichereRezepteMock).not.toHaveBeenCalled();
    });

    test('rezeptLoeschenMenue bricht ab wenn der Nutzer mit n antwortet', async () => {
        ladeRezepteMock.mockReturnValue([
            { id: 1, name: 'Pasta' },
            { id: 2, name: 'Suppe' }
        ]);
        frageGanzzahlMock.mockResolvedValue(1);
        frageJaNeinMock.mockResolvedValue(false);

        await rezeptLoeschenMenue();

        expect(speichereRezepteMock).not.toHaveBeenCalled();
        expect(warteAufEnterMock).toHaveBeenCalled();
    });

    test('rezeptLoeschenMenue loescht ein Rezept nach Bestaetigung mit j', async () => {
        ladeRezepteMock.mockReturnValue([
            { id: 1, name: 'Pasta' },
            { id: 2, name: 'Suppe' }
        ]);
        frageGanzzahlMock.mockResolvedValue(1);
        frageJaNeinMock.mockResolvedValue(true);

        await rezeptLoeschenMenue();

        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        const gespeicherteRezepte = speichereRezepteMock.mock.calls[0][0];
        expect(gespeicherteRezepte).toHaveLength(1);
        expect(gespeicherteRezepte[0].name).toBe('Suppe');
    });

    test('rezeptHinzufuegenMenue erstellt und speichert ein vollstaendiges Rezept', async () => {
        ladeRezepteMock.mockReturnValue([]);

        fragePflichtfeldMock
            .mockResolvedValueOnce('Neues Rezept')
            .mockResolvedValueOnce('30 Minuten')
            .mockResolvedValueOnce('500g');

        frageGanzzahlMock.mockResolvedValue(1);

        frageTextMock
            .mockResolvedValueOnce('Pasta, Schnell')
            .mockResolvedValueOnce('Mehl')
            .mockResolvedValueOnce('fertig')
            .mockResolvedValueOnce('Mischen')
            .mockResolvedValueOnce('fertig');

        wurdeAbgebrochenMock.mockResolvedValue(false);

        await rezeptHinzufuegenMenue();

        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        const gespeicherteRezepte = speichereRezepteMock.mock.calls[0][0];
        expect(gespeicherteRezepte).toHaveLength(1);
        expect(gespeicherteRezepte[0].name).toBe('Neues Rezept');
        expect(gespeicherteRezepte[0].schwierigkeitsgrad).toBe('Leicht');
        expect(gespeicherteRezepte[0].kategorien).toEqual(['Pasta', 'Schnell']);
        expect(gespeicherteRezepte[0].zutaten).toEqual([{ name: 'Mehl', menge: '500g' }]);
        expect(gespeicherteRezepte[0].arbeitsschritte).toEqual(['Mischen']);
    });

    test('rezeptVeraendernEinzelnMenue oeffnet den Editor fuer das ausgewaehlte Rezept', async () => {
        const rezepte = [{ id: 1, name: 'Pasta' }];
        ladeRezepteMock
            .mockReturnValueOnce(rezepte)
            .mockReturnValueOnce(rezepte);
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2);

        await rezeptVeraendernEinzelnMenue();

        expect(rezeptEditierMenueMock).toHaveBeenCalledWith(rezepte[0], rezepte);
    });
});
