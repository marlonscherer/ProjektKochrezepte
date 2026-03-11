import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });
const INPUT_GESCHLOSSEN = "INPUT_GESCHLOSSEN";

export async function question(promptText) {
    if (rl.closed) {
        throw new Error(INPUT_GESCHLOSSEN);
    }

    return new Promise((resolve, reject) => {
        let erledigt = false;

        const cleanup = () => {
            rl.off("close", onClose);
            input.off("end", onEnd);
        };

        const finish = (handler) => (wert) => {
            if (erledigt) {
                return;
            }

            erledigt = true;
            cleanup();
            handler(wert);
        };

        const onClose = finish(() => reject(new Error(INPUT_GESCHLOSSEN)));
        const onEnd = finish(() => {
            if (!rl.closed) {
                rl.close();
            }
            reject(new Error(INPUT_GESCHLOSSEN));
        });

        rl.once("close", onClose);
        input.once("end", onEnd);
        rl.question(promptText).then(finish(resolve)).catch(finish(reject));
    });
}

export function leereKonsole() {
    process.stdout.write("\x1Bc");
}

export async function warteAufEnter(promptText = "\nDrücke Enter um fortzufahren") {
    await question(promptText);
}

export async function wurdeAbgebrochen(eingabe, nachricht) {
    if (typeof eingabe === "string" && eingabe.trim().toLowerCase() === "abbrechen") {
        console.log(nachricht);
        await warteAufEnter();
        return true;
    }

    return false;
}

export async function fragePflichtfeld(promptText, leereMeldung, abbruchNachricht) {
    while (true) {
        const eingabe = (await question(promptText)).trim();

        if (await wurdeAbgebrochen(eingabe, abbruchNachricht)) {
            return null;
        }

        if (eingabe === "") {
            console.log(leereMeldung);
            continue;
        }

        return eingabe;
    }
}

export async function frageGanzzahl(min, max, promptText) {
    while (true) {
        const eingabe = await question(promptText);
        if (!/^\d+$/.test(eingabe)) {
            console.log("Fehler: Bitte geben Sie eine gültige Zahl ein");
            continue;
        }

        const zahl = parseInt(eingabe, 10);
        if (zahl < min || zahl > max) {
            console.log("Fehler: Bitte wählen Sie eine der oben genannten Optionen");
            continue;
        }

        return zahl;
    }
}

export function schliesseEingabe() {
    if (!rl.closed) {
        rl.close();
    }
}

export function istInputGeschlossenFehler(error) {
    return error instanceof Error && error.message === INPUT_GESCHLOSSEN;
}
