import { rezeptAuswahlMenue, rezeptSucheMenue } from "./auswahlMenues.js";
import {
    rezeptHinzufuegenMenue,
    rezeptLoeschenMenue,
    rezeptVeraendernEinzelnMenue
} from "./rezeptVerwaltung.js";
import { frageGanzzahl, leereKonsole, warteAufEnter } from "../ui/eingabe.js";

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
        
        // Schnellmenü zum Entfernen aus Favoriten
        console.log("\n[1] Aus Favoriten entfernen\n[2] Zurück zur Liste\n");
        const favoritWahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
        
        if (favoritWahl === 1) {
            const rezeptIndex = rezepte.findIndex((r) => r.id === gewaehltesFavorit.id);
            if (rezeptIndex !== -1) {
                rezepte[rezeptIndex].favorit = false;
                try {
                    speichereRezepte(rezepte);
                    console.log(`"${gewaehltesFavorit.name}" wurde aus deinen Favoriten entfernt!`);
                } catch (error) {
                    console.log("Fehler beim Speichern!");
                }
                await warteAufEnter("Drücke Enter um fortzufahren");
            }
        }
    }
}

async function kiBeratungMenue() {
    console.log("===========KI-Beratung===========\n");
    await warteAufEnter();
}
