import {
    fragePflichtfeld,
    frageGanzzahl,
    leereKonsole,
    question,
    warteAufEnter,
    wurdeAbgebrochen
} from "../ui/eingabe.js";
import { zeigeZutatenListe } from "../ui/anzeige.js";
import { bearbeiteListenMenue } from "../ui/listenMenue.js";

export async function bearbeiteZutaten(rezept) {
    return bearbeiteListenMenue(rezept, "Zutaten ändern", zeigeZutatenListe, [
        { label: "Zutat und Menge hinzufügen", aktion: zutatHinzufuegen },
        { label: "Zutat löschen", aktion: zutatEntfernen },
        { label: "Zutat verändern", aktion: zutatVeraendern },
        { label: "Alle Zutaten neu schreiben", aktion: zutatenErsetzen }
    ]);
}

async function zutatHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Zutat und Menge hinzufügen===========");

    const zutaten = rezept.zutaten || [];
    if (zutaten.length === 0) {
        console.log("Keine Zutaten vorhanden");
    } else {
        zutaten.forEach((zutat, index) => {
            console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
        });
    }

    while (true) {
        const zutatName = await fragePflichtfeld(
            "\nName der neuen Zutat (oder 'abbrechen'): ",
            "Der Name der Zutat darf nicht leer sein!",
            "Zutat hinzufügen abgebrochen."
        );
        if (zutatName === null) {
            return null;
        }

        const zutatBereitsVorhanden = zutaten.some(
            (zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase()
        );
        if (zutatBereitsVorhanden) {
            console.log(`Die Zutat \"${zutatName}\" existiert bereits!`);
            continue;
        }

        const zutatMenge = await fragePflichtfeld(
            "Menge der Zutat (oder 'abbrechen'): ",
            "Die Menge darf nicht leer sein!",
            "Zutat hinzufügen abgebrochen."
        );
        if (zutatMenge === null) {
            return null;
        }

        if (!Array.isArray(rezept.zutaten)) {
            rezept.zutaten = [];
        }

        rezept.zutaten.push({ name: zutatName, menge: zutatMenge });
        console.log(`Zutat \"${zutatName}\" hinzugefügt!`);
        return rezept;
    }
}

async function zutatEntfernen(rezept) {
    leereKonsole();
    console.log("===========Zutat löschen===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Löschen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.zutaten.length === 1) {
        console.log("Es muss mindestens eine Zutat erhalten bleiben!");
        console.log(`Aktuelle Zutat: ${rezept.zutaten[0].name} (${rezept.zutaten[0].menge})`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Zutaten:");
    rezept.zutaten.forEach((zutat, index) => {
        console.log(`[${index + 1}] ${zutat.name} (${zutat.menge})`);
    });
    console.log(`[${rezept.zutaten.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.zutaten.length + 1, "\nWelche Zutat möchtest du löschen?\n");
    if (menueSteuerung === rezept.zutaten.length + 1) {
        console.log("Zutat löschen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const entfernteZutat = rezept.zutaten[menueSteuerung - 1];
    let bestaetigung = "";
    while (bestaetigung !== "j" && bestaetigung !== "n") {
        bestaetigung = (await question(`\nMöchtest du \"${entfernteZutat.name}\" wirklich löschen? (j/n): `)).trim().toLowerCase();
        if (bestaetigung !== "j" && bestaetigung !== "n") {
            console.log("Fehler: ungültige Eingabe.");
        }
    }

    if (bestaetigung === "n") {
        console.log("Löschvorgang abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.zutaten.splice(menueSteuerung - 1, 1);
    console.log(`Zutat \"${entfernteZutat.name}\" gelöscht!`);
    return rezept;
}

async function zutatVeraendern(rezept) {
    leereKonsole();
    console.log("===========Zutat verändern===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Verändern vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Zutaten:");
    rezept.zutaten.forEach((zutat, index) => {
        console.log(`[${index + 1}] ${zutat.name} (${zutat.menge})`);
    });
    console.log(`[${rezept.zutaten.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.zutaten.length + 1, "\nWelche Zutat möchtest du verändern?\n");
    if (menueSteuerung === rezept.zutaten.length + 1) {
        console.log("Zutat verändern abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alteZutat = rezept.zutaten[index];

    while (true) {
        const neuerName = await fragePflichtfeld(
            `\nNeuer Name für "${alteZutat.name}" (oder 'abbrechen'): `,
            "Der Name der Zutat darf nicht leer sein!",
            "Zutat verändern abgebrochen."
        );
        if (neuerName === null) {
            return null;
        }

        const zutatBereitsVorhanden = rezept.zutaten.some((zutat, aktuellePosition) => {
            return aktuellePosition !== index && zutat.name.toLowerCase() === neuerName.toLowerCase();
        });
        if (zutatBereitsVorhanden) {
            console.log(`Die Zutat \"${neuerName}\" existiert bereits!`);
            continue;
        }

        const neueMenge = await fragePflichtfeld(
            `Neue Menge für "${neuerName}" (oder 'abbrechen'): `,
            "Die Menge darf nicht leer sein!",
            "Zutat verändern abgebrochen."
        );
        if (neueMenge === null) {
            return null;
        }

        rezept.zutaten[index] = { name: neuerName, menge: neueMenge };
        console.log(`Zutat erfolgreich geändert: ${neuerName} (${neueMenge})`);
        return rezept;
    }
}

async function zutatenErsetzen(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Alle Zutaten neu schreiben===========");
        zeigeZutatenListe(rezept);

        console.log("\nGib neue Zutaten ein (Format: 'Name Menge, Name Menge', z.B. 'Spaghetti 400g, Knoblauch 4 Zehen')");
        const zutatenInput = (await question("Zutaten (oder 'abbrechen'): ")).trim();

        if (await wurdeAbgebrochen(zutatenInput, "Zutaten ersetzen abgebrochen.")) {
            return null;
        }

        if (zutatenInput === "") {
            console.log("Mindestens eine Zutat ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        const neueZutaten = zutatenInput
            .split(",")
            .map((zutatPaar) => {
                const teile = zutatPaar.trim().split(/\s+(.+)/);
                return {
                    name: teile[0],
                    menge: teile[1] || ""
                };
            })
            .filter((zutat) => zutat.name !== "" && zutat.menge !== "");

        if (neueZutaten.length === 0) {
            console.log("Keine gültigen Zutaten eingegeben!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        rezept.zutaten = neueZutaten;
        console.log(`Zutaten erfolgreich aktualisiert: ${neueZutaten.map((zutat) => `${zutat.name} (${zutat.menge})`).join(", ")}`);
        return rezept;
    }
}
