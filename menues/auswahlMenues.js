import { ladeRezepte, speichereRezepte } from "../daten/rezeptSpeicher.js";
import { holeKategorien, zeigeRezeptDetails } from "../oberflaeche/anzeige.js";
import { frageGanzzahl, fragePflichtfeld, leereKonsole, warteAufEnter } from "../oberflaeche/eingabe.js";
import { bearbeiteFavorit, aktualisiereFavoritStatus } from "../bearbeitungen/favoritBearbeitung.js";

export async function rezeptSucheMenue() {
    leereKonsole();
    console.log("===========Rezept Suche===========");

    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte gefunden");
        await warteAufEnter("Drücke Enter um zum Hauptmenü zurückzukehren");
        return;
    }

    const suchbegriff = await fragePflichtfeld(
        "\nGib einen Rezeptnamen ein (oder 'abbrechen'):\n",
        "Fehler: Bitte gib einen Suchbegriff ein",
        "Suche abgebrochen."
    );

    if (suchbegriff === null) {
        return;
    }

    // Teilstring-Suche, damit auch unvollstaendige Eingaben Treffer liefern.
    const suchbegriffKlein = suchbegriff.toLowerCase();
    const gefundeneRezepte = rezepte.filter((rezept) => {
        return typeof rezept.name === "string" && rezept.name.toLowerCase().includes(suchbegriffKlein);
    });

    if (gefundeneRezepte.length === 0) {
        console.log("Keine Rezepte mit diesem Namen gefunden");
        await warteAufEnter("Drücke Enter um zur Suche zurückzukehren");
        return;
    }

    await rezeptListeMenue(gefundeneRezepte, `Suchergebnisse: ${suchbegriff}`);
}

export async function rezeptAuswahlMenue() {
    while (true) {
        leereKonsole();
        console.log("===========Rezept Auswahl===========");

        const rezepte = ladeRezepte();
        if (rezepte.length === 0) {
            console.log("Keine Rezepte gefunden");
            await warteAufEnter("Drücke Enter um zum Hauptmenü zurückzukehren");
            return;
        }

        const kategorien = holeKategorien(rezepte);
        const menuEintraege = ["Alle Rezepte", ...kategorien, "Zurück"];

        menuEintraege.forEach((eintrag, index) => {
            console.log(`[${index + 1}] ${eintrag}`);
        });

        const menueSteuerung = await frageGanzzahl(1, menuEintraege.length, "\nWähle eine Kategorie:\n");
        if (menueSteuerung === menuEintraege.length) {
            return;
        }

        // Sonderfall: "Alle Rezepte" ohne Kategoriefilter.
        if (menueSteuerung === 1) {
            await rezeptListeMenue(rezepte, "Alle Rezepte");
            continue;
        }

        const gewaehlteKategorie = kategorien[menueSteuerung - 2];
        const gefilterteRezepte = rezepte.filter((rezept) => {
            return Array.isArray(rezept.kategorien) && rezept.kategorien.some((kategorie) => {
                return kategorie.toLowerCase() === gewaehlteKategorie.toLowerCase();
            });
        });
        await rezeptListeMenue(gefilterteRezepte, `Kategorie: ${gewaehlteKategorie}`);
    }
}

async function rezeptListeMenue(rezepte, titel) {
    const alleRezepte = ladeRezepte();
    
    while (true) {
        leereKonsole();
        console.log(`===========${titel}===========`);

        if (!rezepte || rezepte.length === 0) {
            console.log("Keine Rezepte in dieser Kategorie gefunden");
            await warteAufEnter("Drücke Enter um zur Kategorieauswahl zurückzukehren");
            return;
        }

        rezepte.forEach((rezept, index) => {
            console.log(`[${index + 1}] ${rezept.name}`);
        });
        console.log(`[${rezepte.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWähle ein Rezept:\n");
        if (menueSteuerung === rezepte.length + 1) {
            return;
        }

        // Detailansicht mit Favoriten-Schnellmenü
        const rezept = rezepte[menueSteuerung - 1];
        zeigeRezeptDetails(rezept);

        const bearbeitetesRezept = await bearbeiteFavorit(rezept);
        if (bearbeitetesRezept !== null) {
            const aktualisiert = aktualisiereFavoritStatus(alleRezepte, bearbeitetesRezept);
            if (aktualisiert) {
                rezepte[menueSteuerung - 1].favorit = bearbeitetesRezept.favorit === true;
                try {
                    speichereRezepte(alleRezepte);
                    if (bearbeitetesRezept.favorit === true) {
                        console.log(`"${rezept.name}" wurde zu deinen Favoriten hinzugefügt!`);
                    } else {
                        console.log(`"${rezept.name}" wurde aus deinen Favoriten entfernt!`);
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
