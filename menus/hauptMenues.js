import { rezeptAuswahlMenue, rezeptSucheMenue } from "./auswahlMenues.js";
import {
    rezeptHinzufuegenMenue,
    rezeptLoeschenMenue,
    rezeptVeraendernEinzelnMenue
} from "./rezeptVerwaltung.js";
import { frageGanzzahl, leereKonsole, question, warteAufEnter, wurdeAbgebrochen } from "../ui/eingabe.js";
import { bearbeiteFavorit, aktualisiereFavoritStatus } from "../editors/favoritBearbeitung.js";

export async function hauptMenue() {
    while (true) {
        leereKonsole();
        console.log(
            "===========Kochrezepte===========\n",
            "[1] Rezept suchen\n",
            "[2] Rezeptauswahl\n",
            "[3] Rezepte Bearbeiten\n",
            "[4] Favoriten\n",
            "[5] KI Beratung\n",
            "[6] Beenden\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 6, "Was möchtest du tun?\n");

        // Flache if-Kette fuer klare Navigation zwischen den Menues.
        if (menueSteuerung === 1) {
            await rezeptSucheMenue();
        } else if (menueSteuerung === 2) {
            await rezeptAuswahlMenue();
        } else if (menueSteuerung === 3) {
            await rezepteBearbeitenMenue();
        } else if (menueSteuerung === 4) {
            await favoritenMenue();
        } else if (menueSteuerung === 5) {
            await kiBeratungMenue();
        } else if (menueSteuerung === 6) {
            console.log("Das Programm wird beendet. Auf wiedersehen!");
            return;
        }
    }
}

async function rezepteBearbeitenMenue() {
    while (true) {
        leereKonsole();
        console.log(
            "===========Rezepte Bearbeiten===========\n",
            "[1] Rezept Hinzufügen\n",
            "[2] Rezept Löschen\n",
            "[3] Rezept Verändern\n",
            "[4] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 4, "Was möchtest du tun?\n");

        // Rueckspruenge laufen ueber return, damit kein zusaetzlicher Zustand noetig ist.
        if (menueSteuerung === 1) {
            await rezeptHinzufuegenMenue();
        } else if (menueSteuerung === 2) {
            await rezeptLoeschenMenue();
        } else if (menueSteuerung === 3) {
            await rezeptVeraendernEinzelnMenue();
        } else if (menueSteuerung === 4) {
            return;
        }
    }
}

async function favoritenMenue() {
    const { ladeRezepte, speichereRezepte } = await import("../data/rezeptSpeicher.js");
    const { zeigeRezeptDetails } = await import("../ui/anzeige.js");

    while (true) {
        leereKonsole();
        console.log("===========Favoriten===========");

        const rezepte = ladeRezepte();
        const favoriten = rezepte.filter((rezept) => rezept.favorit === true);

        if (favoriten.length === 0) {
            console.log("Du hast noch keine Favoriten. Rufe ein Rezept auf und füge es zu deinen Favoriten hinzu.");
            await warteAufEnter("Drücke Enter um zum Hauptmenü zurückzukehren");
            return;
        }

        favoriten.forEach((rezept, index) => {
            console.log(`[${index + 1}] ${rezept.name}`);
        });
        console.log(`[${favoriten.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, favoriten.length + 1, "\nWähle ein Rezept:\n");
        if (menueSteuerung === favoriten.length + 1) {
            return;
        }

        const gewaehltesFavorit = favoriten[menueSteuerung - 1];
        zeigeRezeptDetails(gewaehltesFavorit);

        const bearbeitetesRezept = await bearbeiteFavorit(gewaehltesFavorit);
        if (bearbeitetesRezept !== null) {
            const aktualisiert = aktualisiereFavoritStatus(rezepte, bearbeitetesRezept);
            if (aktualisiert) {
                try {
                    speichereRezepte(rezepte);
                    if (bearbeitetesRezept.favorit === true) {
                        console.log(`"${gewaehltesFavorit.name}" wurde zu deinen Favoriten hinzugefügt!`);
                    } else {
                        console.log(`"${gewaehltesFavorit.name}" wurde aus deinen Favoriten entfernt!`);
                    }
                } catch (error) {
                    const fehlermeldung = error instanceof Error ? error.message : String(error);
                    console.log(`Fehler beim Speichern: ${fehlermeldung}`);
                }
                await warteAufEnter("Drücke Enter um fortzufahren");
            }
        }
    }
}

async function kiBeratungMenue() {
    while (true) {
        leereKonsole();
        console.log(
            "===========KI-Beratung===========\n",
            "[1] Rezeptvorschläge nach Zutaten\n",
            "[2] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
        if (menueSteuerung === 1) {
            await kiVorschlaegeNachZutatenMenue();
        } else if (menueSteuerung === 2) {
            return;
        }
    }
}

async function kiVorschlaegeNachZutatenMenue() {
    const { holeKiRezeptvorschlaegeAusZutaten } = await import("../data/kiBeratung.js");
    const { zeigeRezeptDetails } = await import("../ui/anzeige.js");
    const { ladeRezepte, speichereRezepte } = await import("../data/rezeptSpeicher.js");

    const eingabe = (await question("Gib Zutaten ein (kommagetrennt, oder 'abbrechen'): ")).trim();
    if (await wurdeAbgebrochen(eingabe, "KI-Beratung abgebrochen.")) {
        return;
    }

    const zutaten = eingabe
        .split(",")
        .map((eintrag) => eintrag.trim())
        .filter((eintrag) => eintrag !== "");

    if (zutaten.length === 0) {
        console.log("Bitte gib mindestens eine Zutat ein.");
        await warteAufEnter();
        return;
    }

    let vorschlaege = [];
    try {
        vorschlaege = await holeKiRezeptvorschlaegeAusZutaten(zutaten, 3);
    } catch (error) {
        if (error instanceof Error && error.message.includes("OPENAI_API_KEY fehlt")) {
            console.log("Fehler: OPENAI_API_KEY ist nicht gesetzt. Bitte API-Key als Umgebungsvariable setzen.");
            await warteAufEnter();
            return;
        }
        console.log("Fehler bei der KI-Beratung. Bitte versuche es später erneut.");
        await warteAufEnter();
        return;
    }

    if (!Array.isArray(vorschlaege) || vorschlaege.length === 0) {
        console.log("Keine Vorschläge gefunden.");
        await warteAufEnter();
        return;
    }

    leereKonsole();
    console.log("===========KI-Vorschläge===========");
    vorschlaege.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${vorschlaege.length + 1}] Zurück`);

    const auswahl = await frageGanzzahl(1, vorschlaege.length + 1, "\nWähle ein Rezept:\n");
    if (auswahl === vorschlaege.length + 1) {
        return;
    }

    const ausgewaehltesRezept = vorschlaege[auswahl - 1];
    zeigeRezeptDetails(ausgewaehltesRezept);

    console.log("\n[1] Rezept speichern\n[2] Zurück ohne Speichern\n");
    const speichernAuswahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");

    if (speichernAuswahl === 1) {
        const rezepte = ladeRezepte();
        const nameBereitsVorhanden = rezepte.some((rezept) => {
            return typeof rezept.name === "string" && rezept.name.toLowerCase() === ausgewaehltesRezept.name.toLowerCase();
        });

        if (nameBereitsVorhanden) {
            console.log(`Ein Rezept mit dem Namen "${ausgewaehltesRezept.name}" existiert bereits und wurde nicht erneut gespeichert.`);
            await warteAufEnter("Drücke Enter um zur KI-Beratung zurückzukehren");
            return;
        }

        const rezeptZumSpeichern = {
            ...ausgewaehltesRezept,
            favorit: false
        };

        rezepte.push(rezeptZumSpeichern);
        try {
            speichereRezepte(rezepte);
            console.log(`"${rezeptZumSpeichern.name}" wurde gespeichert.`);
        } catch (error) {
            const fehlermeldung = error instanceof Error ? error.message : String(error);
            console.log(`Fehler beim Speichern des KI-Rezepts: ${fehlermeldung}`);
        }
        await warteAufEnter("Drücke Enter um zur KI-Beratung zurückzukehren");
        return;
    }

    await warteAufEnter("Drücke Enter um zur KI-Beratung zurückzukehren");
}
