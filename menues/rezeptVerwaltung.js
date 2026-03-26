import { ladeRezepte, speichereRezepte } from "../daten/rezeptSpeicher.js";
import { rezeptEditierMenue } from "../bearbeitungen/rezeptFelderBearbeitung.js";
import {
    frageGanzzahl,
    fragePflichtfeld,
    frageJaNein,
    frageText,
    leereKonsole,
    warteAufEnter,
    wurdeAbgebrochen
} from "../oberflaeche/eingabe.js";

export async function rezeptLoeschenMenue() {
    leereKonsole();
    console.log("===========Rezept Löschen===========");

    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte zum Löschen gefunden");
        await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }

    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);

    const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du löschen?\n");
    if (menueSteuerung === rezepte.length + 1) {
        return;
    }

    const rezeptName = rezepte[menueSteuerung - 1].name;
    const bestaetigt = await frageJaNein(`\nMöchtest du "${rezeptName}" wirklich löschen? (j/n): `);

    if (!bestaetigt) {
        console.log("Löschvorgang abgebrochen");
        await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }

    rezepte.splice(menueSteuerung - 1, 1);
    try {
        speichereRezepte(rezepte);
        console.log("\nRezept erfolgreich gelöscht!");
    } catch (error) {
        const fehlermeldung = error instanceof Error ? error.message : String(error);
        console.log(`\nFehler beim Speichern der Änderungen: ${fehlermeldung}`);
    }

    await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
}

export async function rezeptHinzufuegenMenue() {
    leereKonsole();
    console.log(
        "===========Rezept Hinzufügen===========\n",
        "'abbrechen' eingeben, um den Vorgang abzubrechen\n"
    );

    const rezepte = ladeRezepte();

    let rezeptName = "";
    while (true) {
        rezeptName = await fragePflichtfeld(
            "Gib den Namen des neuen Rezepts ein: ",
            "Der Name darf nicht leer sein!",
            "Rezepterstellung abgebrochen."
        );
        if (rezeptName === null) {
            return;
        }

        // Doppelte Namen blocken (case-insensitive), damit Suche und Auswahl eindeutig bleiben.
        const nameBereitsVorhanden = rezepte.some((rezept) => {
            return typeof rezept.name === "string" && rezept.name.toLowerCase() === rezeptName.toLowerCase();
        });
        if (nameBereitsVorhanden) {
            console.log(`Ein Rezept mit dem Namen "${rezeptName}" existiert bereits!`);
            continue;
        }

        break;
    }

    const schwierigkeitsgrade = ["Leicht", "Mittel", "Schwer"];
    console.log("\nSchwierigkeitsgrad:");
    schwierigkeitsgrade.forEach((grad, index) => {
        console.log(`[${index + 1}] ${grad}`);
    });
    console.log(`[${schwierigkeitsgrade.length + 1}] Abbrechen`);

    const schwierigkeitIndex = await frageGanzzahl(1, schwierigkeitsgrade.length + 1, "Wähle den Schwierigkeitsgrad: ");
    if (schwierigkeitIndex === schwierigkeitsgrade.length + 1) {
        console.log("Rezepterstellung abgebrochen.");
        await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }
    const schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];

    const zeitaufwand = await fragePflichtfeld(
        "\nGib den Zeitaufwand ein (z.B. '30 Minuten'): ",
        "Der Zeitaufwand darf nicht leer sein!",
        "Rezepterstellung abgebrochen."
    );
    if (zeitaufwand === null) {
        return;
    }

    console.log("\nGib Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
    const kategorienInput = (await frageText("Kategorien: ")).trim();
    if (await wurdeAbgebrochen(kategorienInput, "Rezepterstellung abgebrochen.")) {
        return;
    }

    const kategorien = kategorienInput
        .split(",")
        .map((kategorie) => kategorie.trim())
        .filter((kategorie) => kategorie !== "");

    console.log("\nZutaten hinzufügen (gib 'fertig' ein, um zu stoppen)");
    const zutaten = [];
    let zutatIndex = 1;

    while (true) {
        let zutatName = "";
        while (zutatName === "") {
            zutatName = (await frageText(`\nZutat ${zutatIndex} Name (oder 'fertig'): `)).trim();
            if (await wurdeAbgebrochen(zutatName, "Rezepterstellung abgebrochen.")) {
                return;
            }
            if (zutatName === "") {
                console.log("Der Name der Zutat darf nicht leer sein!");
            }
        }

        if (zutatName.toLowerCase() === "fertig") {
            // Beim Erstellen muss mindestens eine Zutat vorhanden sein.
            if (zutaten.length === 0) {
                console.log("Mindestens eine Zutat ist erforderlich!");
                continue;
            }
            break;
        }

        const zutatMenge = await fragePflichtfeld(
            `Zutat ${zutatIndex} Menge: `,
            "Die Menge darf nicht leer sein!",
            "Rezepterstellung abgebrochen."
        );
        if (zutatMenge === null) {
            return;
        }

        zutaten.push({ name: zutatName, menge: zutatMenge });
        zutatIndex += 1;
    }

    console.log("\nArbeitsschritte hinzufügen (gib 'fertig' ein, um zu stoppen):");
    const arbeitsschritte = [];
    let schrittIndex = 1;

    while (true) {
        let schritt = "";
        while (schritt === "") {
            schritt = (await frageText(`\nSchritt ${schrittIndex} (oder 'fertig'): `)).trim();
            if (await wurdeAbgebrochen(schritt, "Rezepterstellung abgebrochen.")) {
                return;
            }
            if (schritt === "") {
                console.log("Der Arbeitsschritt darf nicht leer sein!");
            }
        }

        if (schritt.toLowerCase() === "fertig") {
            // Mindestens ein Schritt ist Pflicht, sonst ist das Rezept unvollstaendig.
            if (arbeitsschritte.length === 0) {
                console.log("Mindestens ein Arbeitsschritt ist erforderlich!");
                continue;
            }
            break;
        }

        arbeitsschritte.push(schritt);
        schrittIndex += 1;
    }

    const neuesRezept = {
        id: Date.now(),
        name: rezeptName,
        schwierigkeitsgrad,
        zeitaufwand,
        kategorien,
        zutaten,
        arbeitsschritte
    };

    rezepte.push(neuesRezept);
    try {
        speichereRezepte(rezepte);
        console.log(`\nRezept "${rezeptName}" erfolgreich hinzugefügt!`);
    } catch (error) {
        const fehlermeldung = error instanceof Error ? error.message : String(error);
        console.log(`\nFehler beim Speichern des Rezepts: ${fehlermeldung}`);
    }

    await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
}

export async function rezeptVeraendernEinzelnMenue() {
    while (true) {
        leereKonsole();
        console.log("===========Rezept Verändern===========");

        const rezepte = ladeRezepte();
        if (rezepte.length === 0) {
            console.log("Keine Rezepte zum Bearbeiten gefunden");
            await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
            return;
        }

        rezepte.forEach((rezept, index) => {
            console.log(`[${index + 1}] ${rezept.name}`);
        });
        console.log(`[${rezepte.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du bearbeiten?\n");
        if (menueSteuerung === rezepte.length + 1) {
            return;
        }

        const rezept = rezepte[menueSteuerung - 1];
        await rezeptEditierMenue(rezept, rezepte);
    }
}
