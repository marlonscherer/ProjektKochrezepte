import {
    frageGanzzahl,
    fragePflichtfeld,
    leereKonsole,
    warteAufEnter,
    question,
    wurdeAbgebrochen
} from "../ui/eingabe.js";

export async function bearbeiteKategorien(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Kategorien ändern===========");
        console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);
        console.log(
            "[1] Kategorie hinzufügen",
            "\n[2] Kategorie entfernen",
            "\n[3] Kategorie umbenennen",
            "\n[4] Alle Kategorien ersetzen",
            "\n[5] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 5, "\nWas möchtest du tun?\n");

        let bearbeitetesRezept = null;
        if (menueSteuerung === 1) {
            bearbeitetesRezept = await kategorieHinzufuegen(rezept);
        } else if (menueSteuerung === 2) {
            bearbeitetesRezept = await kategorieEntfernen(rezept);
        } else if (menueSteuerung === 3) {
            bearbeitetesRezept = await kategorieUmbenennen(rezept);
        } else if (menueSteuerung === 4) {
            bearbeitetesRezept = await kategorienErsetzen(rezept);
        } else if (menueSteuerung === 5) {
            return null;
        }

        if (bearbeitetesRezept !== null) {
            return bearbeitetesRezept;
        }
    }
}

async function kategorieHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Kategorie hinzufügen===========");
    console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);

    if (!Array.isArray(rezept.kategorien)) {
        rezept.kategorien = [];
    }

    while (true) {
        const neueKategorie = await fragePflichtfeld(
            "Gib die neue Kategorie ein (oder 'abbrechen'): ",
            "Die Kategorie darf nicht leer sein!",
            "Kategorie hinzufügen abgebrochen."
        );
        if (neueKategorie === null) {
            return null;
        }

        // Kategorien im Rezept sind eindeutig (case-insensitive).
        const kategorieBereitsVorhanden = rezept.kategorien.some(
            (kategorie) => kategorie.toLowerCase() === neueKategorie.toLowerCase()
        );
        if (kategorieBereitsVorhanden) {
            console.log(`Die Kategorie "${neueKategorie}" existiert bereits!`);
            continue;
        }

        rezept.kategorien.push(neueKategorie);
        console.log(`Kategorie "${neueKategorie}" hinzugefügt!`);
        return rezept;
    }
}

async function kategorieEntfernen(rezept) {
    leereKonsole();
    console.log("===========Kategorie entfernen===========");

    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Entfernen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.kategorien.length === 1) {
        console.log("Es muss mindestens eine Kategorie erhalten bleiben!");
        console.log(`Aktuelle Kategorie: ${rezept.kategorien[0]}`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Kategorien:");
    rezept.kategorien.forEach((kategorie, index) => {
        console.log(`[${index + 1}] ${kategorie}`);
    });
    console.log(`[${rezept.kategorien.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(
        1,
        rezept.kategorien.length + 1,
        "\nWelche Kategorie möchtest du entfernen?\n"
    );

    if (menueSteuerung === rezept.kategorien.length + 1) {
        console.log("Kategorie entfernen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const entfernteKategorie = rezept.kategorien[menueSteuerung - 1];
    rezept.kategorien.splice(menueSteuerung - 1, 1);
    console.log(`Kategorie "${entfernteKategorie}" entfernt!`);
    return rezept;
}

async function kategorieUmbenennen(rezept) {
    leereKonsole();
    console.log("===========Kategorie umbenennen===========");

    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Umbenennen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Kategorien:");
    rezept.kategorien.forEach((kategorie, index) => {
        console.log(`[${index + 1}] ${kategorie}`);
    });
    console.log(`[${rezept.kategorien.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(
        1,
        rezept.kategorien.length + 1,
        "\nWelche Kategorie möchtest du umbenennen?\n"
    );

    if (menueSteuerung === rezept.kategorien.length + 1) {
        console.log("Kategorie umbenennen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const alteKategorie = rezept.kategorien[menueSteuerung - 1];
    console.log(`\nAlte Kategorie: ${alteKategorie}`);

    while (true) {
        const neueKategorie = await fragePflichtfeld(
            "Gib den neuen Namen ein (oder 'abbrechen'): ",
            "Der Kategoriename darf nicht leer sein!",
            "Kategorie umbenennen abgebrochen."
        );
        if (neueKategorie === null) {
            return null;
        }

        const kategorieBereitsVorhanden = rezept.kategorien.some((kategorie, index) => {
            return index !== (menueSteuerung - 1) && kategorie.toLowerCase() === neueKategorie.toLowerCase();
        });
        if (kategorieBereitsVorhanden) {
            console.log(`Die Kategorie "${neueKategorie}" existiert bereits!`);
            continue;
        }

        rezept.kategorien[menueSteuerung - 1] = neueKategorie;
        console.log(`Kategorie "${alteKategorie}" zu "${neueKategorie}" umbenannt!`);
        return rezept;
    }
}

async function kategorienErsetzen(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Alle Kategorien ersetzen===========");
        console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);

        console.log("\nGib neue Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
        const kategorienInput = (await question("Kategorien (oder 'abbrechen'): ")).trim();

        if (await wurdeAbgebrochen(kategorienInput, "Kategorien ersetzen abgebrochen.")) {
            return null;
        }

        if (kategorienInput === "") {
            console.log("Mindestens eine Kategorie ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        const neueKategorien = kategorienInput
            .split(",")
            .map((kategorie) => kategorie.trim())
            .filter((kategorie) => kategorie !== "");

        // Kompletter Replace statt Merge: alte Kategorien werden vollstaendig ersetzt.
        if (neueKategorien.length === 0) {
            console.log("Mindestens eine gültige Kategorie ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        rezept.kategorien = neueKategorien;
        console.log(`Kategorien erfolgreich aktualisiert: ${neueKategorien.join(", ")}`);
        return rezept;
    }
}
