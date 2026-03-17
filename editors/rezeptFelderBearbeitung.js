import { speichereRezepte } from "../data/rezeptSpeicher.js";
import { bearbeiteKategorien } from "./kategorienBearbeitung.js";
import { bearbeiteZutaten } from "./zutatenBearbeitung.js";
import { bearbeiteArbeitsschritte } from "./arbeitsschritteBearbeitung.js";
import { frageGanzzahl, fragePflichtfeld, leereKonsole, warteAufEnter } from "../ui/eingabe.js";

export async function rezeptEditierMenue(rezept, rezepte) {
    while (true) {
        leereKonsole();
        console.log(
            `===========Bearbeite: ${rezept.name}===========\n`,
            "[1] Rezeptname ändern\n",
            "[2] Schwierigkeitsgrad ändern\n",
            "[3] Zeitaufwand ändern\n",
            "[4] Kategorien ändern\n",
            "[5] Zutaten ändern\n",
            "[6] Arbeitsschritte ändern\n",
            "[7] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 7, "Was möchtest du ändern?\n");

        let bearbeitetesRezept = null;
        if (menueSteuerung === 1) {
            bearbeitetesRezept = await bearbeiteRezeptName(rezept, rezepte);
        } else if (menueSteuerung === 2) {
            bearbeitetesRezept = await bearbeiteSchwierigkeitsgrad(rezept);
        } else if (menueSteuerung === 3) {
            bearbeitetesRezept = await bearbeiteZeitaufwand(rezept);
        } else if (menueSteuerung === 4) {
            bearbeitetesRezept = await bearbeiteKategorien(rezept);
        } else if (menueSteuerung === 5) {
            bearbeitetesRezept = await bearbeiteZutaten(rezept);
        } else if (menueSteuerung === 6) {
            bearbeitetesRezept = await bearbeiteArbeitsschritte(rezept);
        } else if (menueSteuerung === 7) {
            return;
        }

        if (bearbeitetesRezept !== null) {
            rezept = bearbeitetesRezept;

            // Referenz im Gesamtarray aktualisieren, danach zentral speichern.
            const rezeptIndex = rezepte.findIndex((eintrag) => eintrag.id === rezept.id);
            if (rezeptIndex !== -1) {
                rezepte[rezeptIndex] = rezept;
            }

            try {
                speichereRezepte(rezepte);
                console.log("Änderungen gespeichert!");
            } catch (error) {
                const fehlermeldung = error instanceof Error ? error.message : String(error);
                console.log(`Fehler beim Speichern der Änderungen: ${fehlermeldung}`);
            }

            await warteAufEnter("Drücke Enter um fortzufahren");
        }
    }
}

async function bearbeiteRezeptName(rezept, rezepte) {
    leereKonsole();
    console.log("===========Rezeptname ändern===========");
    console.log(`Aktueller Name: ${rezept.name}`);

    while (true) {
        const neuerName = await fragePflichtfeld(
            "Gib den neuen Namen ein (oder 'abbrechen'): ",
            "Der Name darf nicht leer sein!",
            "Namensänderung abgebrochen."
        );
        if (neuerName === null) {
            return null;
        }

        const nameBereitsVorhanden = rezepte.some((vorhandenesRezept) => {
            const istAktuellesRezept = vorhandenesRezept === rezept || vorhandenesRezept.id === rezept.id;
            // Gleiches Rezept darf seinen Namen behalten; nur Fremdduplikate blockieren.
            return !istAktuellesRezept
                && typeof vorhandenesRezept.name === "string"
                && vorhandenesRezept.name.toLowerCase() === neuerName.toLowerCase();
        });
        if (nameBereitsVorhanden) {
            console.log(`Ein Rezept mit dem Namen "${neuerName}" existiert bereits!`);
            continue;
        }

        rezept.name = neuerName;
        return rezept;
    }
}

async function bearbeiteSchwierigkeitsgrad(rezept) {
    leereKonsole();
    console.log("===========Schwierigkeitsgrad ändern===========");
    console.log(`Aktueller Schwierigkeitsgrad: ${rezept.schwierigkeitsgrad}`);

    const schwierigkeitsgrade = ["Leicht", "Mittel", "Schwer"];
    console.log("\nSchwierigkeitsgrad:");
    schwierigkeitsgrade.forEach((grad, index) => {
        console.log(`[${index + 1}] ${grad}`);
    });
    console.log(`[${schwierigkeitsgrade.length + 1}] Abbrechen`);

    const schwierigkeitIndex = await frageGanzzahl(
        1,
        schwierigkeitsgrade.length + 1,
        "\nWähle den Schwierigkeitsgrad: "
    );
    if (schwierigkeitIndex === schwierigkeitsgrade.length + 1) {
        console.log("Änderung abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    return rezept;
}

async function bearbeiteZeitaufwand(rezept) {
    leereKonsole();
    console.log("===========Zeitaufwand ändern===========");
    console.log(`Aktueller Zeitaufwand: ${rezept.zeitaufwand}`);

    const neuerZeitaufwand = await fragePflichtfeld(
        "Gib den neuen Zeitaufwand ein (oder 'abbrechen'): ",
        "Der Zeitaufwand darf nicht leer sein!",
        "Zeitaufwandänderung abgebrochen."
    );
    if (neuerZeitaufwand === null) {
        return null;
    }

    rezept.zeitaufwand = neuerZeitaufwand;
    return rezept;
}
