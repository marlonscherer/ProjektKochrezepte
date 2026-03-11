import { leereKonsole } from "./eingabe.js";

export function zeigeZutatenListe(rezept) {
    console.log("Aktuelle Zutaten:");
    (rezept.zutaten || []).forEach((zutat, index) => {
        console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
    });
}

export function zeigeArbeitsschritteListe(rezept) {
    console.log("Aktuelle Arbeitsschritte:");
    (rezept.arbeitsschritte || []).forEach((schritt, index) => {
        console.log(`${index + 1}. ${schritt}`);
    });
}

export function holeKategorien(rezepte) {
    const kategorienSet = new Set();

    rezepte.forEach((rezept) => {
        if (!Array.isArray(rezept.kategorien)) {
            return;
        }

        rezept.kategorien.forEach((kategorie) => {
            if (typeof kategorie === "string" && kategorie.trim() !== "") {
                kategorienSet.add(kategorie.trim());
            }
        });
    });

    return Array.from(kategorienSet).sort((a, b) => a.localeCompare(b, "de"));
}

export function zeigeRezeptDetails(rezept) {
    leereKonsole();
    console.log(`===========${rezept.name}===========`);
    console.log(`Schwierigkeitsgrad: ${rezept.schwierigkeitsgrad || "-"}`);
    console.log(`Zeitaufwand: ${rezept.zeitaufwand || "-"}`);
    console.log(`Kategorien: ${(rezept.kategorien || []).join(", ") || "-"}`);

    console.log("\nZutaten:");
    (rezept.zutaten || []).forEach((zutat) => {
        console.log(`- ${zutat.name} (${zutat.menge})`);
    });

    console.log("\nArbeitsschritte:");
    (rezept.arbeitsschritte || []).forEach((schritt, index) => {
        console.log(`${index + 1}. ${schritt}`);
    });
}
