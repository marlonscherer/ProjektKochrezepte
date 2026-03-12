import { ladeRezepte } from "../data/rezeptSpeicher.js";
import { holeKategorien, zeigeRezeptDetails } from "../ui/anzeige.js";
import { frageGanzzahl, fragePflichtfeld, leereKonsole, warteAufEnter } from "../ui/eingabe.js";

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

        // Detailansicht ist read-only; Rueckkehr erfolgt ueber Enter.
        const rezept = rezepte[menueSteuerung - 1];
        zeigeRezeptDetails(rezept);
        await warteAufEnter("\nDrücke Enter um zur Rezeptliste zurückzukehren");
    }
}
