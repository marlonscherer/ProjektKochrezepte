import { jest } from '@jest/globals';

const speichereRezepteMock = jest.fn();
const bearbeiteKategorienMock = jest.fn();
const bearbeiteZutatenMock = jest.fn();
const bearbeiteArbeitsschritteMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();

await jest.unstable_mockModule('../data/rezeptSpeicher.js', () => ({
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../editors/kategorienBearbeitung.js', () => ({
    bearbeiteKategorien: bearbeiteKategorienMock
}));

await jest.unstable_mockModule('../editors/zutatenBearbeitung.js', () => ({
    bearbeiteZutaten: bearbeiteZutatenMock
}));

await jest.unstable_mockModule('../editors/arbeitsschritteBearbeitung.js', () => ({
    bearbeiteArbeitsschritte: bearbeiteArbeitsschritteMock
}));

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock
}));

const { rezeptEditierMenue } = await import('../editors/rezeptFelderBearbeitung.js');

describe('editors/rezeptFelderBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renames recipe and saves', async () => {
        const rezept = { id: 1, name: 'Alt', schwierigkeitsgrad: 'Leicht', zeitaufwand: '10' };
        const rezepte = [rezept, { id: 2, name: 'Andere' }];

        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Name aendern
            .mockResolvedValueOnce(7); // Zurueck
        fragePflichtfeldMock.mockResolvedValue('Neu');

        await rezeptEditierMenue(rezept, rezepte);

        expect(rezepte[0].name).toBe('Neu');
        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        expect(warteAufEnterMock).toHaveBeenCalled();
    });

    test('changes difficulty and saves', async () => {
        const rezept = { id: 1, name: 'Alt', schwierigkeitsgrad: 'Leicht', zeitaufwand: '10' };
        const rezepte = [rezept];

        frageGanzzahlMock
            .mockResolvedValueOnce(2) // Schwierigkeitsgrad aendern
            .mockResolvedValueOnce(2) // Mittel
            .mockResolvedValueOnce(7); // Zurueck

        await rezeptEditierMenue(rezept, rezepte);

        expect(rezepte[0].schwierigkeitsgrad).toBe('Mittel');
        expect(speichereRezepteMock).toHaveBeenCalled();
    });

    test('delegates to categories editor and saves returned recipe', async () => {
        const rezept = { id: 1, name: 'Alt', kategorien: ['A'] };
        const geaendert = { ...rezept, kategorien: ['A', 'B'] };
        const rezepte = [rezept];

        frageGanzzahlMock
            .mockResolvedValueOnce(4) // Kategorien
            .mockResolvedValueOnce(7); // Zurueck
        bearbeiteKategorienMock.mockResolvedValue(geaendert);

        await rezeptEditierMenue(rezept, rezepte);

        expect(rezepte[0].kategorien).toEqual(['A', 'B']);
        expect(speichereRezepteMock).toHaveBeenCalled();
    });
});
