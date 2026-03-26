import { jest } from '@jest/globals';

const speichereRezepteMock = jest.fn();
const bearbeiteKategorienMock = jest.fn();
const bearbeiteZutatenMock = jest.fn();
const bearbeiteArbeitsschritteMock = jest.fn();
const frageGanzzahlMock = jest.fn();
const fragePflichtfeldMock = jest.fn();
const leereKonsoleMock = jest.fn();
const warteAufEnterMock = jest.fn();

await jest.unstable_mockModule('../daten/rezeptSpeicher.js', () => ({
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../bearbeitungen/kategorienBearbeitung.js', () => ({
    bearbeiteKategorien: bearbeiteKategorienMock
}));

await jest.unstable_mockModule('../bearbeitungen/zutatenBearbeitung.js', () => ({
    bearbeiteZutaten: bearbeiteZutatenMock
}));

await jest.unstable_mockModule('../bearbeitungen/arbeitsschritteBearbeitung.js', () => ({
    bearbeiteArbeitsschritte: bearbeiteArbeitsschritteMock
}));

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    fragePflichtfeld: fragePflichtfeldMock,
    leereKonsole: leereKonsoleMock,
    warteAufEnter: warteAufEnterMock
}));

const { rezeptEditierMenue } = await import('../bearbeitungen/rezeptFelderBearbeitung.js');

describe('bearbeitungen/rezeptFelderBearbeitung', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('benennt ein Rezept um und speichert', async () => {
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

    test('lehnt doppelte Rezeptnamen ab und fragt bis zur eindeutigen Eingabe erneut', async () => {
        const rezept = { id: 1, name: 'Alt', schwierigkeitsgrad: 'Leicht', zeitaufwand: '10' };
        const rezepte = [rezept, { id: 2, name: 'Andere' }];

        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Name aendern
            .mockResolvedValueOnce(7); // Zurueck
        fragePflichtfeldMock
            .mockResolvedValueOnce('andere')
            .mockResolvedValueOnce('Neu');

        await rezeptEditierMenue(rezept, rezepte);

        expect(console.log).toHaveBeenCalledWith('Ein Rezept mit dem Namen "andere" existiert bereits!');
        expect(rezepte[0].name).toBe('Neu');
        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
    });

    test('erlaubt den aktuellen Rezeptnamen, weil es dasselbe Rezept ist', async () => {
        const rezept = { id: 1, name: 'Alt', schwierigkeitsgrad: 'Leicht', zeitaufwand: '10' };
        const rezepte = [rezept, { id: 2, name: 'Andere' }];

        frageGanzzahlMock
            .mockResolvedValueOnce(1) // Name aendern
            .mockResolvedValueOnce(7); // Zurueck
        fragePflichtfeldMock.mockResolvedValue('Alt');

        await rezeptEditierMenue(rezept, rezepte);

        expect(rezepte[0].name).toBe('Alt');
        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
    });

    test('aendert den Schwierigkeitsgrad und speichert', async () => {
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

    test('speichert nicht wenn die Schwierigkeitsaenderung abgebrochen wird', async () => {
        const rezept = { id: 1, name: 'Alt', schwierigkeitsgrad: 'Leicht', zeitaufwand: '10' };
        const rezepte = [rezept];

        frageGanzzahlMock
            .mockResolvedValueOnce(2) // Schwierigkeitsgrad aendern
            .mockResolvedValueOnce(4) // Abbrechen in Untermenue
            .mockResolvedValueOnce(7); // Zurueck

        await rezeptEditierMenue(rezept, rezepte);

        expect(rezepte[0].schwierigkeitsgrad).toBe('Leicht');
        expect(speichereRezepteMock).not.toHaveBeenCalled();
        expect(warteAufEnterMock).toHaveBeenCalledWith('\nDrücke Enter um fortzufahren');
    });

    test('delegiert an den Kategorien-Editor und speichert das zurueckgegebene Rezept', async () => {
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
