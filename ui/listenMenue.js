import { frageGanzzahl, leereKonsole } from "./eingabe.js";

export async function bearbeiteListenMenue(rezept, titel, zeigeEintraege, optionen) {
    while (true) {
        leereKonsole();
        console.log(`===========${titel}===========`);
        zeigeEintraege(rezept);
        console.log();

        optionen.forEach((option, index) => {
            console.log(`[${index + 1}] ${option.label}`);
        });
        console.log(`[${optionen.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, optionen.length + 1, "\nWas möchtest du tun?\n");
        if (menueSteuerung === optionen.length + 1) {
            return null;
        }

        // Aktionen liefern entweder ein geaendertes Rezept oder null (weiter im Menue).
        const bearbeitetesRezept = await optionen[menueSteuerung - 1].aktion(rezept);
        if (bearbeitetesRezept !== null) {
            return bearbeitetesRezept;
        }
    }
}
