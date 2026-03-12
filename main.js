import { hauptMenue } from "./menus/hauptMenues.js";
import { istInputGeschlossenFehler, schliesseEingabe } from "./ui/eingabe.js";

// Zentrale App-Schleife: bei normalem Input-Ende sauber beenden,
// bei echten Fehlern weiterhin crashen.
try {
    await hauptMenue();
} catch (error) {
    if (!istInputGeschlossenFehler(error)) {
        throw error;
    }
} finally {
    schliesseEingabe();
}








