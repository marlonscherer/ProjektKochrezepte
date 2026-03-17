import { leereKonsole, frageGanzzahl, warteAufEnter } from "../ui/eingabe.js";

export async function bearbeiteFavorit(rezept) {
    leereKonsole();
    const istFavorit = rezept.favorit === true;
    const aktuellerStatus = istFavorit ? "Favorit" : "Kein Favorit";
    console.log(`===========Bearbeite Favorit: ${rezept.name}===========\n`);
    console.log(`Aktueller Status: ${aktuellerStatus}\n`);

    if (istFavorit) {
        console.log("[1] Aus Favoriten entfernen\n", "[2] Zurück (keine Änderung)\n");
        const wahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
        if (wahl === 1) {
            rezept.favorit = false;
            leereKonsole();
            console.log(`"${rezept.name}" wurde aus deinen Favoriten entfernt!`);
            await warteAufEnter();
            return rezept;
        }
        return null;
    }

    console.log("[1] Zu Favoriten hinzufügen\n", "[2] Zurück (keine Änderung)\n");
    const wahl = await frageGanzzahl(1, 2, "Was möchtest du tun?\n");
    if (wahl === 1) {
        rezept.favorit = true;
        leereKonsole();
        console.log(`"${rezept.name}" wurde zu deinen Favoriten hinzugefügt!`);
        await warteAufEnter();
        return rezept;
    }

    return null;
}
