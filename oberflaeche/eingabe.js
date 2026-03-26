import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

let rl = null;
const INPUT_GESCHLOSSEN = "INPUT_GESCHLOSSEN";

function holeReadline() {
    // Lazy Init verhindert offene Handles in Tests und ungenutzten Sessions.
    if (rl === null || rl.closed) {
        rl = readline.createInterface({ input, output });
    }

    return rl;
}

export async function frageText(promptText) {
    // Holt eine nutzbare readline-Instanz oder erzeugt bei Bedarf eine neue.
    const aktiveRl = holeReadline();

    // Falls das Interface bereits geschlossen ist, darf keine neue Frage mehr gestartet werden.
    if (aktiveRl.closed) {
        throw new Error(INPUT_GESCHLOSSEN);
    }

    return new Promise((resolve, reject) => {
        // Verhindert, dass die Promise durch konkurrierende Events mehrfach beendet wird.
        let erledigt = false;

        const cleanup = () => {
            // Entfernt die temporären Listener, sobald die Anfrage abgeschlossen ist.
            aktiveRl.off("close", onClose);
            input.off("end", onEnd);
        };

        const finish = (handler) => (wert) => {
            // Schutz gegen doppelte Aufloesung bei race zwischen close/end/question.
            if (erledigt) {
                return;
            }

            erledigt = true;
            cleanup();
            handler(wert);
        };

        // Wird das readline-Interface geschlossen, brechen wir die laufende Frage kontrolliert ab.
        const onClose = finish(() => reject(new Error(INPUT_GESCHLOSSEN)));

        // Endet stdin, schliessen wir das Interface und melden denselben definierten Fehler.
        const onEnd = finish(() => {
            if (!aktiveRl.closed) {
                aktiveRl.close();
            }
            reject(new Error(INPUT_GESCHLOSSEN));
        });

        // Die Listener gelten nur fuer diese eine Frage und werden danach wieder entfernt.
        aktiveRl.once("close", onClose);
        input.once("end", onEnd);

        // Startet die eigentliche Benutzereingabe und leitet Erfolg oder Fehler ueber finish weiter.
        aktiveRl.question(promptText).then(finish(resolve)).catch(finish(reject));
    });
}

export function leereKonsole() {
    process.stdout.write("\x1Bc");
}

export async function warteAufEnter(promptText = "\nDrücke Enter um fortzufahren") {
    await frageText(promptText);
}

export async function wurdeAbgebrochen(eingabe, nachricht) {
    // Globales Escape-Wort fuer alle Text-Dialoge.
    if (typeof eingabe === "string" && eingabe.trim().toLowerCase() === "abbrechen") {
        console.log(nachricht);
        await warteAufEnter();
        return true;
    }

    return false;
}

export async function fragePflichtfeld(promptText, leereMeldung, abbruchNachricht) {
    while (true) {
        const eingabe = (await frageText(promptText)).trim();

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
        const eingabe = await frageText(promptText);
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

export async function frageJaNein(promptText, fehlerText = "Fehler: Bitte nur 'j' oder 'n' eingeben.") {
    while (true) {
        const eingabe = (await frageText(promptText)).trim().toLowerCase();
        if (eingabe === "j") {
            return true;
        }

        if (eingabe === "n") {
            return false;
        }

        console.log(fehlerText);
    }
}

export function schliesseEingabe() {
    if (rl !== null && !rl.closed) {
        rl.close();
    }
}

export function istInputGeschlossenFehler(error) {
    return error instanceof Error && error.message === INPUT_GESCHLOSSEN;
}
