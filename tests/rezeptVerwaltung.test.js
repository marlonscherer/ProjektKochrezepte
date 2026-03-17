import { jest } from '@jest/globals';

const ladeRezepteMock = jest.fn();
const speichereRezepteMock = jest.fn();
const rezeptEditierMenueMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const frageJaNeinMock = jest.fn();
const leereKonsoleMock = jest.fn();
const questionMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();

await jest.unstable_mockModule('../data/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../editors/rezeptFelderBearbeitung.js', () => ({
    rezeptEditierMenue: rezeptEditierMenueMock
}));

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    frageJaNein: frageJaNeinMock,
    leereKonsole: leereKonsoleMock,
    question: questionMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

const {
    rezeptLoeschenMenue,
    rezeptHinzufuegenMenue,
    rezeptVeraendernEinzelnMenue
} = await import('../menus/rezeptVerwaltung.js');

describe('rezeptVerwaltung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('rezeptLoeschenMenue returns when no recipes exist', async () => {
        ladeRezepteMock.mockReturnValue([]);

        await rezeptLoeschenMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('rezeptVeraendernEinzelnMenue returns when no recipes exist', async () => {
        ladeRezepteMock.mockReturnValue([]);

        await rezeptVeraendernEinzelnMenue();

        expect(warteAufEnterMock).toHaveBeenCalledTimes(1);
    });

    test('rezeptHinzufuegenMenue cancels when first mandatory field is canceled', async () => {
        ladeRezepteMock.mockReturnValue([]);
        fragePflichtfeldMock.mockResolvedValue(null);

        await rezeptHinzufuegenMenue();

        expect(fragePflichtfeldMock).toHaveBeenCalled();
        expect(speichereRezepteMock).not.toHaveBeenCalled();
    });

    test('rezeptLoeschenMenue cancels when user answers n', async () => {
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

    test('rezeptLoeschenMenue deletes recipe after confirmation j', async () => {
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

    test('rezeptHinzufuegenMenue creates and saves a complete recipe', async () => {
        ladeRezepteMock.mockReturnValue([]);

        fragePflichtfeldMock
            .mockResolvedValueOnce('Neues Rezept')
            .mockResolvedValueOnce('30 Minuten')
            .mockResolvedValueOnce('500g');

        frageGanzzahlMock.mockResolvedValue(1);

        questionMock
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

    test('rezeptVeraendernEinzelnMenue opens editor for selected recipe', async () => {
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
