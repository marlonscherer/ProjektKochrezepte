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
            "[4] KI Beratung\n",
            "[5] Beenden\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 5, "Was möchtest du tun?\n");

        // Flache if-Kette fuer klare Navigation zwischen den Menues.
        if (menueSteuerung === 1) {
            await rezeptSucheMenue();
        } else if (menueSteuerung === 2) {
            await rezeptAuswahlMenue();
        } else if (menueSteuerung === 3) {
            await rezepteBearbeitenMenue();
        } else if (menueSteuerung === 4) {
            await kiBeratungMenue();
        } else if (menueSteuerung === 5) {
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

async function kiBeratungMenue() {
    console.log("Dummy: KI Beratung-Menü (noch nicht implementiert)");
    await warteAufEnter();
}
