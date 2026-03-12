import {
    fragePflichtfeld,
    frageGanzzahl,
    leereKonsole,
    question,
    warteAufEnter,
    wurdeAbgebrochen
} from "../ui/eingabe.js";
import { zeigeArbeitsschritteListe } from "../ui/anzeige.js";
import { bearbeiteListenMenue } from "../ui/listenMenue.js";

export async function bearbeiteArbeitsschritte(rezept) {
    return bearbeiteListenMenue(rezept, "Arbeitsschritte ändern", zeigeArbeitsschritteListe, [
        { label: "Arbeitsschritt hinzufügen", aktion: arbeitsschrittHinzufuegen },
        { label: "Arbeitsschritt löschen", aktion: arbeitsschrittEntfernen },
        { label: "Arbeitsschritt verändern", aktion: arbeitsschrittVeraendern },
        { label: "Alle Arbeitsschritte neu schreiben", aktion: arbeitsschritteErsetzen }
    ]);
}

async function arbeitsschrittHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt hinzufügen===========");
    console.log("Aktuelle Arbeitsschritte:");

    const arbeitsschritte = rezept.arbeitsschritte || [];
    if (arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte vorhanden");
    } else {
        arbeitsschritte.forEach((schritt, index) => {
            console.log(`${index + 1}. ${schritt}`);
        });
    }

    console.log(`\n[1-${arbeitsschritte.length}] Position vor existierendem Schritt`);
    console.log(`[${arbeitsschritte.length + 1}] Am Ende hinzufügen`);
    console.log(`[${arbeitsschritte.length + 2}] Abbrechen`);

    const positionEingabe = await frageGanzzahl(
        1,
        arbeitsschritte.length + 2,
        "\nAn welcher Position soll der Schritt eingefügt werden?\n"
    );
    if (positionEingabe === arbeitsschritte.length + 2) {
        console.log("Arbeitsschritt hinzufügen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const neuerArbeitsschritt = await fragePflichtfeld(
        "\nNeuen Arbeitsschritt eingeben (oder 'abbrechen'): ",
        "Der Arbeitsschritt darf nicht leer sein!",
        "Arbeitsschritt hinzufügen abgebrochen."
    );
    if (neuerArbeitsschritt === null) {
        return null;
    }

    if (!Array.isArray(rezept.arbeitsschritte)) {
        rezept.arbeitsschritte = [];
    }

    const insertPosition = positionEingabe - 1;
    // splice mit deleteCount 0 fuegt an exakter Position ein.
    rezept.arbeitsschritte.splice(insertPosition, 0, neuerArbeitsschritt);
    console.log("Arbeitsschritt hinzugefügt!");
    return rezept;
}

async function arbeitsschrittEntfernen(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt löschen===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Löschen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.arbeitsschritte.length === 1) {
        console.log("Es muss mindestens ein Arbeitsschritt erhalten bleiben!");
        console.log(`Aktueller Arbeitsschritt: ${rezept.arbeitsschritte[0]}`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Arbeitsschritte:");
    rezept.arbeitsschritte.forEach((schritt, index) => {
        console.log(`[${index + 1}] ${schritt}`);
    });
    console.log(`[${rezept.arbeitsschritte.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(
        1,
        rezept.arbeitsschritte.length + 1,
        "\nWelchen Arbeitsschritt möchtest du löschen?\n"
    );
    if (menueSteuerung === rezept.arbeitsschritte.length + 1) {
        console.log("Arbeitsschritt löschen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const entfernterSchritt = rezept.arbeitsschritte[menueSteuerung - 1];
    let bestaetigung = "";
    while (bestaetigung !== "j" && bestaetigung !== "n") {
        bestaetigung = (await question(`\nMöchtest du \"${entfernterSchritt}\" wirklich löschen? (j/n): `)).trim().toLowerCase();
        if (bestaetigung !== "j" && bestaetigung !== "n") {
            console.log("Fehler: ungültige Eingabe.");
        }
    }

    if (bestaetigung === "n") {
        console.log("Löschvorgang abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.arbeitsschritte.splice(menueSteuerung - 1, 1);
    console.log(`Arbeitsschritt \"${entfernterSchritt}\" gelöscht!`);
    return rezept;
}

async function arbeitsschrittVeraendern(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt verändern===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Verändern vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Arbeitsschritte:");
    rezept.arbeitsschritte.forEach((schritt, index) => {
        console.log(`[${index + 1}] ${schritt}`);
    });
    console.log(`[${rezept.arbeitsschritte.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(
        1,
        rezept.arbeitsschritte.length + 1,
        "\nWelchen Arbeitsschritt möchtest du verändern?\n"
    );
    if (menueSteuerung === rezept.arbeitsschritte.length + 1) {
        console.log("Arbeitsschritt verändern abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alterSchritt = rezept.arbeitsschritte[index];
    console.log(`\nAlter Arbeitsschritt: ${alterSchritt}`);

    const neuerArbeitsschritt = await fragePflichtfeld(
        "Neuer Arbeitsschritt (oder 'abbrechen'): ",
        "Der Arbeitsschritt darf nicht leer sein!",
        "Arbeitsschritt verändern abgebrochen."
    );
    if (neuerArbeitsschritt === null) {
        return null;
    }

    rezept.arbeitsschritte[index] = neuerArbeitsschritt;
    console.log(`Arbeitsschritt erfolgreich geändert zu: ${neuerArbeitsschritt}`);
    return rezept;
}

async function arbeitsschritteErsetzen(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Alle Arbeitsschritte neu schreiben===========");
        zeigeArbeitsschritteListe(rezept);

        console.log("\nGib neue Arbeitsschritte ein (gib 'fertig' ein, um zu stoppen):");
        const neueArbeitsschritte = [];
        let schrittIndex = 1;

        while (true) {
            let schritt = "";
            while (schritt === "") {
                schritt = (await question(`Schritt ${schrittIndex} (oder 'fertig'): `)).trim();
                if (await wurdeAbgebrochen(schritt, "Arbeitsschritte ersetzen abgebrochen.")) {
                    return null;
                }
                if (schritt === "") {
                    console.log("Der Arbeitsschritt darf nicht leer sein!");
                }
            }

            if (schritt.toLowerCase() === "fertig") {
                // Replace wird erst abgeschlossen, wenn mindestens ein Schritt erfasst wurde.
                if (neueArbeitsschritte.length === 0) {
                    console.log("Mindestens ein Arbeitsschritt ist erforderlich!");
                    continue;
                }
                break;
            }

            neueArbeitsschritte.push(schritt);
            schrittIndex += 1;
        }

        rezept.arbeitsschritte = neueArbeitsschritte;
        console.log(`Arbeitsschritte erfolgreich aktualisiert (${neueArbeitsschritte.length} Schritte)`);
        return rezept;
    }
}
