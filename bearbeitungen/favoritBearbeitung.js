import { frageGanzzahl } from "../oberflaeche/eingabe.js";

export async function bearbeiteFavorit(rezept) {
    const istFavorit = rezept.favorit === true;
    const aktuellerStatus = istFavorit ? "Favorit" : "Kein Favorit";
    console.log(`\n===========Bearbeite Favorit: ${rezept.name}===========\n`);
    console.log(`Aktueller Status: ${aktuellerStatus}\n`);

    if (istFavorit) {
        console.log("[1] Aus Favoriten entfernen\n", "[2] Zurück (keine Änderung)\n");
        const wahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
        if (wahl === 1) {
            rezept.favorit = false;
            return rezept;
        }
        return null;
    }

    console.log("[1] Zu Favoriten hinzufügen\n", "[2] Zurück (keine Änderung)\n");
    const wahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
    if (wahl === 1) {
        rezept.favorit = true;
        return rezept;
    }

    return null;
}

export function aktualisiereFavoritStatus(rezepte, bearbeitetesRezept) {
    const rezeptIndex = rezepte.findIndex((rezept) => rezept.id === bearbeitetesRezept.id);
    if (rezeptIndex === -1) {
        return false;
    }

    rezepte[rezeptIndex].favorit = bearbeitetesRezept.favorit === true;
    return true;
}
