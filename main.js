import { hauptMenue } from "./menus/hauptMenues.js";
import { istInputGeschlossenFehler, schliesseEingabe } from "./ui/eingabe.js";

try {
    await hauptMenue();
} catch (error) {
    if (!istInputGeschlossenFehler(error)) {
        throw error;
    }
} finally {
    schliesseEingabe();
}








