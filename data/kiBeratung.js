import { sendeOpenAIAnfrage } from "./openaiClient.js";

function normalisiereSchwierigkeitsgrad(wert) {
    const text = String(wert || "").trim().toLowerCase();
    if (text === "leicht") {
        return "Leicht";
    }
    if (text === "schwer") {
        return "Schwer";
    }
    return "Mittel";
}

function normalisiereStringArray(wert) {
    if (!Array.isArray(wert)) {
        return [];
    }

    return wert
        .map((eintrag) => String(eintrag || "").trim())
        .filter((eintrag) => eintrag !== "");
}

function normalisiereZutaten(wert) {
    if (!Array.isArray(wert)) {
        return [];
    }

    return wert
        .map((zutat) => {
            return {
                name: String(zutat?.name || "").trim(),
                menge: String(zutat?.menge || "nach Bedarf").trim()
            };
        })
        .filter((zutat) => zutat.name !== "");
}

function extrahiereAntwortText(apiAntwort) {
    if (typeof apiAntwort?.output_text === "string" && apiAntwort.output_text.trim() !== "") {
        return apiAntwort.output_text.trim();
    }

    if (!Array.isArray(apiAntwort?.output)) {
        return "";
    }

    const textTeile = [];
    apiAntwort.output.forEach((eintrag) => {
        if (!Array.isArray(eintrag?.content)) {
            return;
        }

        eintrag.content.forEach((teil) => {
            if (typeof teil?.text === "string" && teil.text.trim() !== "") {
                textTeile.push(teil.text.trim());
            }
        });
    });

    return textTeile.join("\n").trim();
}

function normalisiereRezept(rezept, index) {
    const name = String(rezept?.name || "").trim();

    return {
        id: Date.now() + index,
        name: name || `KI-Rezept ${index + 1}`,
        schwierigkeitsgrad: normalisiereSchwierigkeitsgrad(rezept?.schwierigkeitsgrad),
        zeitaufwand: String(rezept?.zeitaufwand || "Unbekannt").trim(),
        kategorien: normalisiereStringArray(rezept?.kategorien),
        zutaten: normalisiereZutaten(rezept?.zutaten),
        arbeitsschritte: normalisiereStringArray(rezept?.arbeitsschritte),
        favorit: false
    };
}

function bauePrompts(zutaten, anzahl) {
    const systemPrompt = [
        "Du bist ein Rezeptassistent.",
        "Antworte ausschliesslich mit validem JSON.",
        "Keine Markdown-Codeblocks, kein Erklaertext."
    ].join(" ");

    const userPrompt = [
        `Erstelle ${anzahl} Rezeptvorschlaege auf Basis der folgenden Zutaten:`,
        zutaten.join(", "),
        "Antwortformat (exakt als JSON-Objekt):",
        "{",
        '  "rezepte": [',
        "    {",
        '      "name": "...",',
        '      "schwierigkeitsgrad": "Leicht|Mittel|Schwer",',
        '      "zeitaufwand": "...",',
        '      "kategorien": ["..."],',
        '      "zutaten": [{ "name": "...", "menge": "..." }],',
        '      "arbeitsschritte": ["..."]',
        "    }",
        "  ]",
        "}",
        "Gib mindestens eine Zutat und einen Arbeitsschritt pro Rezept an."
    ].join("\n");

    return { systemPrompt, userPrompt };
}

export async function holeKiRezeptvorschlaegeAusZutaten(zutaten, anzahl = 3) {
    const suchZutaten = normalisiereStringArray(zutaten);
    if (suchZutaten.length === 0) {
        throw new Error("Bitte mindestens eine Zutat angeben.");
    }

    const { systemPrompt, userPrompt } = bauePrompts(suchZutaten, anzahl);
    const apiAntwort = await sendeOpenAIAnfrage({ systemPrompt, userPrompt });
    const antwortText = extrahiereAntwortText(apiAntwort);

    if (antwortText === "") {
        throw new Error("Die KI hat keine auswertbare Antwort geliefert.");
    }

    let daten;
    try {
        daten = JSON.parse(antwortText);
    } catch (error) {
        throw new Error("Die KI-Antwort war kein gueltiges JSON.");
    }

    if (!Array.isArray(daten?.rezepte)) {
        throw new Error("Die KI-Antwort enthaelt kein Feld 'rezepte'.");
    }

    return daten.rezepte.map((rezept, index) => normalisiereRezept(rezept, index));
}
