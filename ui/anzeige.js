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
    const kategorienMap = new Map();

    rezepte.forEach((rezept) => {
        if (!Array.isArray(rezept.kategorien)) {
            return;
        }

        rezept.kategorien.forEach((kategorie) => {
            // Vor dem Sammeln normalisieren, damit Whitespace und Gross-/Kleinschreibung keine Dubletten erzeugen.
            if (typeof kategorie === "string" && kategorie.trim() !== "") {
                const normalisierteKategorie = kategorie.trim();
                const schluessel = normalisierteKategorie.toLowerCase();

                if (!kategorienMap.has(schluessel)) {
                    kategorienMap.set(schluessel, normalisierteKategorie);
                }
            }
        });
    });

    // Fuer eine stabile, benutzerfreundliche Reihenfolge mit deutscher Sortierung.
    return Array.from(kategorienMap.values()).sort((a, b) => a.localeCompare(b, "de"));
}

export function zeigeRezeptDetails(rezept) {
    leereKonsole();
    // "-" signalisiert fehlende optionale Felder in der Detailansicht.
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
