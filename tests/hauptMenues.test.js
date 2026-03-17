import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();
const questionMock = jest.fn();
const warteAufEnterMock = jest.fn();
const wurdeAbgebrochenMock = jest.fn();
const rezeptSucheMenueMock = jest.fn();
const rezeptAuswahlMenueMock = jest.fn();
const rezeptHinzufuegenMenueMock = jest.fn();
const rezeptLoeschenMenueMock = jest.fn();
const rezeptVeraendernEinzelnMenueMock = jest.fn();
const ladeRezepteMock = jest.fn();
const speichereRezepteMock = jest.fn();
const zeigeRezeptDetailsMock = jest.fn();
const holeKiRezeptvorschlaegeAusZutatenMock = jest.fn();

await jest.unstable_mockModule('../ui/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    leereKonsole: leereKonsoleMock,
    question: questionMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

await jest.unstable_mockModule('../menus/auswahlMenues.js', () => ({
    rezeptSucheMenue: rezeptSucheMenueMock,
    rezeptAuswahlMenue: rezeptAuswahlMenueMock
}));

await jest.unstable_mockModule('../menus/rezeptVerwaltung.js', () => ({
    rezeptHinzufuegenMenue: rezeptHinzufuegenMenueMock,
    rezeptLoeschenMenue: rezeptLoeschenMenueMock,
    rezeptVeraendernEinzelnMenue: rezeptVeraendernEinzelnMenueMock
}));

await jest.unstable_mockModule('../data/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../ui/anzeige.js', () => ({
    zeigeRezeptDetails: zeigeRezeptDetailsMock
}));

await jest.unstable_mockModule('../data/kiBeratung.js', () => ({
    holeKiRezeptvorschlaegeAusZutaten: holeKiRezeptvorschlaegeAusZutatenMock
}));

const { hauptMenue } = await import('../menus/hauptMenues.js');

describe('hauptMenues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('exits when selecting Beenden', async () => {
        frageGanzzahlMock.mockResolvedValue(6);

        await hauptMenue();

        expect(frageGanzzahlMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 6, 'Was möchtest du tun?\n');
        expect(rezeptSucheMenueMock).not.toHaveBeenCalled();
        expect(rezeptAuswahlMenueMock).not.toHaveBeenCalled();
        expect(rezeptHinzufuegenMenueMock).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Das Programm wird beendet. Auf wiedersehen!');
    });

    test('returns to the main menu after search and then exits', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptSucheMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(2);
    });

    test('dispatches within recipe management menu and returns to main menu afterwards', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptHinzufuegenMenueMock).toHaveBeenCalledTimes(1);
        expect(rezeptLoeschenMenueMock).not.toHaveBeenCalled();
        expect(rezeptVeraendernEinzelnMenueMock).not.toHaveBeenCalled();
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(1, 1, 6, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(2, 1, 4, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(3, 1, 4, 'Was möchtest du tun?\n');
        expect(frageGanzzahlMock).toHaveBeenNthCalledWith(4, 1, 6, 'Was möchtest du tun?\n');
    });

    test('opens recipe selection and then returns to the main menu before exit', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptAuswahlMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
    });

    test('opens KI menu and returns to main menu via back option', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).not.toHaveBeenCalled();
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(3);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(3);
    });

    test('opens Favoriten menu and returns when no favorites exist', async () => {
        ladeRezepteMock.mockReturnValue([]);
        frageGanzzahlMock
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zum Hauptmenü zurückzukehren');
        expect(zeigeRezeptDetailsMock).not.toHaveBeenCalled();
    });

    test('removes a favorite from Favoriten menu and saves changes', async () => {
        const rezepte = [{ id: 1, name: 'Pasta', favorit: true }];
        ladeRezepteMock.mockImplementation(() => rezepte);
        frageGanzzahlMock
            .mockResolvedValueOnce(4) // Hauptmenue: Favoriten
            .mockResolvedValueOnce(1) // Favoritenliste: Rezept waehlen
            .mockResolvedValueOnce(1) // Schnellmenue: entfernen
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(rezepte[0]);
        expect(speichereRezepteMock).toHaveBeenCalledTimes(1);
        expect(speichereRezepteMock).toHaveBeenCalledWith([{ id: 1, name: 'Pasta', favorit: false }]);
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um fortzufahren');
    });

    test('saves selected KI recipe suggestion after confirmation', async () => {
        const vorschlag = {
            id: 123,
            name: 'Tomaten Pasta',
            schwierigkeitsgrad: 'Leicht',
            zeitaufwand: '20 Minuten',
            kategorien: ['Pasta'],
            zutaten: [{ name: 'Tomate', menge: '2 Stück' }],
            arbeitsschritte: ['Kochen'],
            favorit: false
        };

        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockResolvedValue([vorschlag]);
        ladeRezepteMock.mockReturnValue([]);

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(1) // Vorschlag waehlen
            .mockResolvedValueOnce(1) // Speichern bestaetigen
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(holeKiRezeptvorschlaegeAusZutatenMock).toHaveBeenCalledWith(['Tomate', 'Pasta'], 3);
        expect(zeigeRezeptDetailsMock).toHaveBeenCalledWith(vorschlag);
        expect(speichereRezepteMock).toHaveBeenCalledWith([vorschlag]);
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zur KI-Beratung zurückzukehren');
    });

    test('does not save KI recipe when recipe name already exists', async () => {
        const vorschlag = {
            id: 456,
            name: 'Tomaten Pasta',
            schwierigkeitsgrad: 'Leicht',
            zeitaufwand: '20 Minuten',
            kategorien: ['Pasta'],
            zutaten: [{ name: 'Tomate', menge: '2 Stück' }],
            arbeitsschritte: ['Kochen'],
            favorit: false
        };

        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockResolvedValue([vorschlag]);
        ladeRezepteMock.mockReturnValue([{ id: 1, name: 'tomaten pasta' }]);

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(1) // Vorschlag waehlen
            .mockResolvedValueOnce(1) // Speichern bestaetigen
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(speichereRezepteMock).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Ein Rezept mit dem Namen "Tomaten Pasta" existiert bereits und wurde nicht erneut gespeichert.');
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zur KI-Beratung zurückzukehren');
    });

    test('shows dedicated message when OPENAI_API_KEY is missing', async () => {
        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockRejectedValue(new Error('OPENAI_API_KEY fehlt. Bitte als Umgebungsvariable setzen.'));

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(console.log).toHaveBeenCalledWith('Fehler: OPENAI_API_KEY ist nicht gesetzt. Bitte API-Key als Umgebungsvariable setzen.');
        expect(warteAufEnterMock).toHaveBeenCalled();
        expect(speichereRezepteMock).not.toHaveBeenCalled();
    });

    test('shows generic KI error message for unexpected errors', async () => {
        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockRejectedValue(new Error('Netzwerkfehler'));

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(console.log).toHaveBeenCalledWith('Fehler bei der KI-Beratung. Bitte versuche es später erneut.');
        expect(warteAufEnterMock).toHaveBeenCalled();
        expect(speichereRezepteMock).not.toHaveBeenCalled();
    });

    test('shows message when KI returns no suggestions', async () => {
        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockResolvedValue([]);

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(console.log).toHaveBeenCalledWith('Keine Vorschläge gefunden.');
        expect(warteAufEnterMock).toHaveBeenCalled();
        expect(speichereRezepteMock).not.toHaveBeenCalled();
    });

    test('logs save failure when KI recipe cannot be persisted', async () => {
        const vorschlag = {
            id: 777,
            name: 'Fehler Pasta',
            schwierigkeitsgrad: 'Leicht',
            zeitaufwand: '10 Minuten',
            kategorien: ['Pasta'],
            zutaten: [{ name: 'Tomate', menge: '2 Stück' }],
            arbeitsschritte: ['Kochen'],
            favorit: false
        };

        questionMock.mockResolvedValue('Tomate, Pasta');
        wurdeAbgebrochenMock.mockResolvedValue(false);
        holeKiRezeptvorschlaegeAusZutatenMock.mockResolvedValue([vorschlag]);
        ladeRezepteMock.mockReturnValue([]);
        speichereRezepteMock.mockImplementation(() => {
            throw new Error('Disk full');
        });

        frageGanzzahlMock
            .mockResolvedValueOnce(5) // Hauptmenue: KI Beratung
            .mockResolvedValueOnce(1) // KI-Menue: Vorschlaege nach Zutaten
            .mockResolvedValueOnce(1) // Vorschlag waehlen
            .mockResolvedValueOnce(1) // Speichern bestaetigen
            .mockResolvedValueOnce(2) // KI-Menue: Zurueck
            .mockResolvedValueOnce(6); // Hauptmenue: Beenden

        await hauptMenue();

        expect(console.log).toHaveBeenCalledWith('Fehler beim Speichern des KI-Rezepts: Disk full');
        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zur KI-Beratung zurückzukehren');
    });

});
