import fs from "fs";
import { fileURLToPath } from "url";

const rezepteDatei = fileURLToPath(new URL("../rezepte.json", import.meta.url));

export function ladeRezepte() {
    try {
        const daten = fs.readFileSync(rezepteDatei, "utf-8");
        const rezepte = JSON.parse(daten);
        return Array.isArray(rezepte) ? rezepte : [];
    } catch (error) {
        console.log("Fehler beim Laden der Rezepte.");
        return [];
    }
}

export function speichereRezepte(rezepte) {
    fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8");
}
