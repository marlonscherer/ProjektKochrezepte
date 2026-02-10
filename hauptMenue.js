import {question, questionInt} from "readline-sync";


//Erstellt das Hauptmenü
export function hauptMenue() {
process.stdout.write('\x1Bc'); //cleared das Terminal
console.log(
    "===========Kochrezepte===========\n",
    "[1] Rezeptauswahl\n",
    "[2] Rezepte Bearbeiten\n",
    "[3] KI Beratung\n",
    "[4] Beenden\n"

);


//Eingabe für Menüsteuerung mit Fehlerprüfung
let menueSteuerung;
while (true) {
    // Frage den Benutzer nach Eingabe
    const input = question("Was möchtest du tun?\n");
    // Versuche, die Eingabe in eine Zahl umzuwandeln
    const num = parseFloat(input);
    // Prüfe, ob die Eingabe keine gültige Zahl ist (z.B. Buchstaben)
    if (isNaN(num)) {
        console.log("Fehler: Bitte geben Sie eine gültige Zahl ein!");
    // Prüfe, ob es eine Dezimalzahl ist oder außerhalb 1-5 liegt
    } else if (num % 1 !== 0 || num < 1 || num > 4) {
        console.log("Fehler: Bitte wählen sie eine der oben genannten Optionen!");
    } else {
        // Eingabe ist gültig – speichere sie und beende die Schleife
        menueSteuerung = num;
        break;
    }
}

//Aufrufen des nächsten Untermenüs (mit Funktionen um es übersichtlicher zu halten)
if (menueSteuerung === 1) {
    rezeptAuswahlMenue();
} else if (menueSteuerung === 2) {
    rezepteBearbeitenMenue();
} else if (menueSteuerung === 3) {
   kiBeratungMenue();
} else if (menueSteuerung === 4) {
    console.log("Das Programm wird beendet. Auf wiedersehen!");
    process.exit(0); //Bricht das Programm ohne Fehlermeldung ab
} 
}

hauptMenue();

//Dummy-Funktionen für die Untermenüs (nur Platzhalter, um Fehler zu vermeiden und um Hauptmenü zu testen)
function rezeptAuswahlMenue() {
    console.log("Dummy: Rezeptauswahl-Menü (noch nicht implementiert)");
}

function rezepteBearbeitenMenue() {
    process.stdout.write('\x1Bc'); //cleared das Terminal
    console.log(
        "===========Rezepte Bearbeiten===========\n",
        "[1] Rezept Hinzufügen\n",
        "[2] Rezept Löschen\n",
        "[3] Rezept Bearbeiten\n",
        "[4] Zurück\n",
        "[5] Beenden\n"
    );

    //Eingabe für Menüsteuerung mit Fehlerprüfung
    let bearbeitenSteuerung;
    while (true) {
        // Frage den Benutzer nach Eingabe
        const input = question("Was möchtest du tun?\n");
        // Versuche, die Eingabe in eine Zahl umzuwandeln
        const num = parseFloat(input);
        // Prüfe, ob die Eingabe keine gültige Zahl ist (z.B. Buchstaben)
        if (isNaN(num)) {
            console.log("Fehler: Bitte geben Sie eine gültige Zahl ein!");
        // Prüfe, ob es eine Dezimalzahl ist oder außerhalb 1-5 liegt
        } else if (num % 1 !== 0 || num < 1 || num > 5) {
            console.log("Fehler: Bitte wählen sie eine der oben genannten Optionen!");
        } else {
            // Eingabe ist gültig – speichere sie und beende die Schleife
            bearbeitenSteuerung = num;
            break;
        }
    }

    //Aufrufen des nächsten Untermenüs
    if (bearbeitenSteuerung === 1) {
        rezeptHinzufuegenMenue();
    } else if (bearbeitenSteuerung === 2) {
        rezeptLoeschenMenue();
    } else if (bearbeitenSteuerung === 3) {
        rezeptBearbeitenEinzelnMenue();
    } else if (bearbeitenSteuerung === 4) {
        hauptMenue();
    } else if (bearbeitenSteuerung === 5) {
        console.log("Das Programm wird beendet. Auf wiedersehen!");
        process.exit(0);
    }
}

function rezeptLoeschenMenue() {
    console.log("Dummy: Rezept löschen-Menü (noch nicht implementiert)");
}

function rezeptHinzufuegenMenue() {
    console.log("Dummy: Rezept hinzufügen-Menü (noch nicht implementiert)");
}

function rezeptBearbeitenEinzelnMenue() {
    console.log("Dummy: Rezept bearbeiten-Menü (noch nicht implementiert)");
}

function kiBeratungMenue() {
    console.log("Dummy: KI Beratung-Menü (noch nicht implementiert)");
}
