import { jest } from '@jest/globals';

const frageGanzzahlMock = jest.fn();
const leereKonsoleMock = jest.fn();
const frageTextMock = jest.fn();
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

await jest.unstable_mockModule('../oberflaeche/eingabe.js', () => ({
    frageGanzzahl: frageGanzzahlMock,
    leereKonsole: leereKonsoleMock,
    frageText: frageTextMock,
    warteAufEnter: warteAufEnterMock,
    wurdeAbgebrochen: wurdeAbgebrochenMock
}));

await jest.unstable_mockModule('../menues/auswahlMenues.js', () => ({
    rezeptSucheMenue: rezeptSucheMenueMock,
    rezeptAuswahlMenue: rezeptAuswahlMenueMock
}));

await jest.unstable_mockModule('../menues/rezeptVerwaltung.js', () => ({
    rezeptHinzufuegenMenue: rezeptHinzufuegenMenueMock,
    rezeptLoeschenMenue: rezeptLoeschenMenueMock,
    rezeptVeraendernEinzelnMenue: rezeptVeraendernEinzelnMenueMock
}));

await jest.unstable_mockModule('../daten/rezeptSpeicher.js', () => ({
    ladeRezepte: ladeRezepteMock,
    speichereRezepte: speichereRezepteMock
}));

await jest.unstable_mockModule('../oberflaeche/anzeige.js', () => ({
    zeigeRezeptDetails: zeigeRezeptDetailsMock
}));

await jest.unstable_mockModule('../daten/kiBeratung.js', () => ({
    holeKiRezeptvorschlaegeAusZutaten: holeKiRezeptvorschlaegeAusZutatenMock
}));

const { hauptMenue } = await import('../menues/hauptMenues.js');

describe('hauptMenues', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('beendet das Programm bei Auswahl von Beenden', async () => {
        frageGanzzahlMock.mockResolvedValue(6);

        await hauptMenue();

        expect(frageGanzzahlMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledWith(1, 6, 'Was möchtest du tun?\n');
        expect(rezeptSucheMenueMock).not.toHaveBeenCalled();
        expect(rezeptAuswahlMenueMock).not.toHaveBeenCalled();
        expect(rezeptHinzufuegenMenueMock).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('Das Programm wird beendet. Auf wiedersehen!');
    });

    test('kehrt nach der Suche zum Hauptmenue zurueck und beendet danach', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptSucheMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(2);
    });

    test('verzweigt im Rezeptverwaltungsmenue und kehrt danach ins Hauptmenue zurueck', async () => {
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

    test('oeffnet die Rezeptauswahl und kehrt vor dem Beenden ins Hauptmenue zurueck', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(rezeptAuswahlMenueMock).toHaveBeenCalledTimes(1);
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(2);
    });

    test('oeffnet das KI-Menue und kehrt ueber Zurueck ins Hauptmenue zurueck', async () => {
        frageGanzzahlMock
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).not.toHaveBeenCalled();
        expect(frageGanzzahlMock).toHaveBeenCalledTimes(3);
        expect(leereKonsoleMock).toHaveBeenCalledTimes(3);
    });

    test('oeffnet das Favoritenmenue und kehrt bei fehlenden Favoriten zurueck', async () => {
        ladeRezepteMock.mockReturnValue([]);
        frageGanzzahlMock
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(6);

        await hauptMenue();

        expect(warteAufEnterMock).toHaveBeenCalledWith('Drücke Enter um zum Hauptmenü zurückzukehren');
        expect(zeigeRezeptDetailsMock).not.toHaveBeenCalled();
    });

    test('entfernt einen Favoriten im Favoritenmenue und speichert die Aenderung', async () => {
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

    test('speichert den ausgewaehlten KI-Rezeptvorschlag nach Bestaetigung', async () => {
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

        frageTextMock.mockResolvedValue('Tomate, Pasta');
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

    test('speichert kein KI-Rezept wenn der Rezeptname bereits existiert', async () => {
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

        frageTextMock.mockResolvedValue('Tomate, Pasta');
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

    test('zeigt eine klare Meldung wenn OPENAI_API_KEY fehlt', async () => {
        frageTextMock.mockResolvedValue('Tomate, Pasta');
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

    test('zeigt bei unerwarteten Fehlern eine allgemeine KI-Fehlermeldung', async () => {
        frageTextMock.mockResolvedValue('Tomate, Pasta');
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

    test('zeigt eine Meldung wenn die KI keine Vorschlaege liefert', async () => {
        frageTextMock.mockResolvedValue('Tomate, Pasta');
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

    test('protokolliert einen Speicherfehler wenn ein KI-Rezept nicht gespeichert werden kann', async () => {
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

        frageTextMock.mockResolvedValue('Tomate, Pasta');
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
