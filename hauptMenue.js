//WICHTIG DAS MENÜ REZEPT HINZUFÜGEN NOCHMALS GRÜNDLICH AUF FEHLER TESTEN, HABE VIELLEICHT WAS ÜBERSEHEN, Menüs fertigstellen, Funktionen für die Logik der Menüs erstellen, der Befehl question gibt Umlaute falsch aus, Bei den Rezepten kann man auch was anderes vor Enter drücken um zurück zu kommen, Beim Rezept details hat die Überschrift Abstand
import {question, questionInt} from "readline-sync";
import fs from "fs";
import { fileURLToPath } from "url";

const rezepteDatei = fileURLToPath(new URL("./rezepte.json", import.meta.url));


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
const menueSteuerung = frageGanzzahl(1, 4, "Was möchtest du tun?\n");

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
    process.stdout.write('\x1Bc'); //cleared das Terminal
    console.log(
        "===========Rezept Auswahl==========="
    );

    // Lade alle Rezepte für die Kategorienauswahl
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte gefunden");
        question("Drücke Enter um zum Hauptmenü zurückzukehren");
        return hauptMenue();
    }

    // Kategorien dynamisch aus Rezeptdaten ableiten
    const kategorien = holeKategorien(rezepte);
    const menuEintraege = ["Alle Rezepte", ...kategorien, "Zurück"];

    menuEintraege.forEach((eintrag, index) => {
        console.log(`[${index + 1}] ${eintrag}`);
    });

    // Auswahl der Kategorie mit Validierung
    const menueSteuerung = frageGanzzahl(1, menuEintraege.length, "\nWähle eine Kategorie:\n");
    const istZurueck = menueSteuerung === menuEintraege.length;
    if (istZurueck) {
        return hauptMenue();
    }

    if (menueSteuerung === 1) {
        return rezeptListeMenue(rezepte, "Alle Rezepte");
    }

    const gewaehlteKategorie = kategorien[menueSteuerung - 2];
    const gefiltert = rezepte.filter((rezept) =>
        Array.isArray(rezept.kategorien) && rezept.kategorien.some(k => k.toLowerCase() === gewaehlteKategorie.toLowerCase()) // Zum vergleichen wird Kategorie in Kleinbuchstaben umgewandelt
    );
    return rezeptListeMenue(gefiltert, `Kategorie: ${gewaehlteKategorie}`);
}

function rezepteBearbeitenMenue() {
    process.stdout.write('\x1Bc'); //cleared das Terminal
    console.log(
        "===========Rezepte Bearbeiten===========\n",
        "[1] Rezept Hinzufügen\n",
        "[2] Rezept Löschen\n",
        "[3] Rezept Verändern\n",
        "[4] Zurück\n"
    );

    //Eingabe für Menüsteuerung mit Fehlerprüfung
    const menueSteuerung = frageGanzzahl(1, 4, "Was möchtest du tun?\n");

    //Aufrufen des nächsten Untermenüs
    if (menueSteuerung === 1) {
        rezeptHinzufuegenMenue();
    } else if (menueSteuerung === 2) {
        rezeptLoeschenMenue();
    } else if (menueSteuerung === 3) {
        rezeptVerändernEinzelnMenue();
    } else if (menueSteuerung === 4) {
        hauptMenue();
    } 
}

function rezeptLoeschenMenue() {
    process.stdout.write('\x1Bc');
    console.log("===========Rezept Löschen===========")
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte zum Löschen gefunden");
        question("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return rezepteBearbeitenMenue();
    }   
    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);
    const menueSteuerung = frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du löschen?\n");
    
    // Zurück-Option
    if (menueSteuerung === rezepte.length + 1) {
        return rezepteBearbeitenMenue();
    }
    
    // Lösch-Bestätigung
    const rezeptName = rezepte[menueSteuerung - 1].name;
    const bestaetigung = question(`\nMöchtest du "${rezeptName}" wirklich löschen? (j/n): `);
    if (bestaetigung.toLowerCase() !== "j") {
        console.log("Löschvorgang abgebrochen");
        question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return rezepteBearbeitenMenue();
    }
    
    rezepte.splice(menueSteuerung - 1, 1); //Entfernt das ausgewählte Rezept aus dem Array
   try {
        //Änderung Speichern
       fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8"); //Aktualisiert die JSON-Datei mit den Änderungen
       console.log("\n✓ Rezept erfolgreich gelöscht!");
   } catch (error) {
       console.log("\n✗ Fehler beim Speichern der Änderungen!");
   }
    question("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
    return rezepteBearbeitenMenue();

}

function rezeptHinzufuegenMenue() {
    process.stdout.write('\x1Bc');
    console.log("===========Rezept Hinzufügen===========\n");
    
    const rezepte = ladeRezepte();
    
    // Rezeptnamen abfragen und überprüfen
    let rezeptName = "";
    let nameIstEinzigartig = false;
    
    while (!nameIstEinzigartig) {
        rezeptName = question("Gib den Namen des neuen Rezepts ein: ").trim();
        
        if (rezeptName === "") {
            console.log("Der Name darf nicht leer sein!");
            continue;
        }
        
        // Prüfe, ob Name bereits existiert (case-insensitive)
        const nameBereitsVorhanden = rezepte.some(rezept => rezept.name.toLowerCase() === rezeptName.toLowerCase());
        
        if (nameBereitsVorhanden) {
            console.log(`Ein Rezept mit dem Namen "${rezeptName}" existiert bereits!`);
            continue;
        }
        
        nameIstEinzigartig = true;
    }
    
    // Schwierigkeitsgrad abfragen
    const schwierigkeitsgrade = ["Leicht", "Mittel", "Schwer"];
    console.log("\nSchwierigkeitsgrad:");
    schwierigkeitsgrade.forEach((grad, index) => {
        console.log(`[${index + 1}] ${grad}`);
    });
    const schwierigkeitIndex = frageGanzzahl(1, schwierigkeitsgrade.length, "Wähle den Schwierigkeitsgrad: ");
    const schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    
    // Zeitaufwand abfragen
    let zeitaufwand = "";
    while (zeitaufwand === "") {
        zeitaufwand = question("\nGib den Zeitaufwand ein (z.B. '30 Minuten'): ").trim();
        if (zeitaufwand === "") {
            console.log("Der Zeitaufwand darf nicht leer sein!");
        }
    }
    
    // Kategorien abfragen
    console.log("\nGib Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch'):");
    const kategorienInput = question("Kategorien: ").trim();
    const kategorien = kategorienInput
        .split(",") //Eingabe aufteilen
        .map(kategorie => kategorie.trim()) //Leerzeichen entfernen
        .filter(kategorie => kategorie !== ""); //Leere Einträge entfernen
    
    // Zutaten abfragen
    console.log("\nZutaten hinzufügen (gib 'fertig' ein, um zu stoppen):");
    const zutaten = [];
    let zutatIndex = 1;
    
    while (true) {
        let zutatName = "";
        while (zutatName === "") {
            zutatName = question(`\nZutat ${zutatIndex} Name (oder 'fertig'): `).trim();
            if (zutatName === "") {
                console.log("Der Name der Zutat darf nicht leer sein!");
            }
        }
        
        if (zutatName.toLowerCase() === "fertig") {
            if (zutaten.length === 0) {
                console.log("Mindestens eine Zutat ist erforderlich!");
                continue;
            }
            break;
        }
        
        let zutatMenge = "";
        while (zutatMenge === "") {
            zutatMenge = question(`Zutat ${zutatIndex} Menge: `).trim();
            if (zutatMenge === "") {
                console.log("Die Menge darf nicht leer sein!");
            }
        }
        
        zutaten.push({ name: zutatName, menge: zutatMenge });
        zutatIndex = zutatIndex + 1;
    }
    
    // Arbeitsschritte abfragen
    console.log("\nArbeitsschritte hinzufügen (gib 'fertig' ein, um zu stoppen):");
    const arbeitsschritte = [];
    let schrittIndex = 1;
    
    while (true) {
        let schritt = "";
        while (schritt === "") {
            schritt = question(`\nSchritt ${schrittIndex} (oder 'fertig'): `).trim();
            if (schritt === "") {
                console.log("Der Arbeitsschritt darf nicht leer sein!");
            }
        }
        
        if (schritt.toLowerCase() === "fertig") {
            if (arbeitsschritte.length === 0) {
                console.log("Mindestens ein Arbeitsschritt ist erforderlich!");
                continue;
            }
            break;
        }
        
        arbeitsschritte.push(schritt);
        schrittIndex = schrittIndex + 1;
    }
    
    // Neues Rezept erstellen
    const neuesRezept = {
        id: Date.now(),
        name: rezeptName,
        schwierigkeitsgrad: schwierigkeitsgrad,
        zeitaufwand: zeitaufwand,
        kategorien: kategorien,
        zutaten: zutaten,
        arbeitsschritte: arbeitsschritte
    };
    
    // Rezept speichern
    rezepte.push(neuesRezept);
    try {
        fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8");
        console.log(`\n✓ Rezept "${rezeptName}" erfolgreich hinzugefügt!`);
    } catch (error) {
        console.log("\n✗ Fehler beim Speichern des Rezepts!");
    }
    
    question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
    return rezepteBearbeitenMenue();
}

function rezeptVerändernEinzelnMenue() {
    console.log("Dummy: Rezept bearbeiten-Menü (noch nicht implementiert)");
}

function kiBeratungMenue() {
    console.log("Dummy: KI Beratung-Menü (noch nicht implementiert)");
}

function ladeRezepte() {
    try {
        // JSON-Datei lesen und in Array umwandeln
        const daten = fs.readFileSync(rezepteDatei, "utf-8");
        const rezepte = JSON.parse(daten);
        if (Array.isArray(rezepte)) {
            return rezepte;
        } else {
         return [];
      }
    } catch (error) {
        console.log("Fehler beim Laden der Rezepte.");
        return [];
    }
}

function holeKategorien(rezepte) {
    const kategorienSet = new Set(); //Set um Duplikate automatisch zu entfernen
    rezepte.forEach((rezept) => {
        if (!Array.isArray(rezept.kategorien)) {
            return;
        }
        // Leere oder ungültige Einträge ignorieren
        rezept.kategorien.forEach((kategorie) => {
            if (typeof kategorie === "string" && kategorie.trim() !== "") {
                kategorienSet.add(kategorie.trim());
            }
        });
    });

    return Array.from(kategorienSet).sort((a, b) => a.localeCompare(b, "de")); //Sortiertes Array
}

function frageGanzzahl(min, max, prompt) {
    while (true) {
        const input = question(prompt);
        // Prüfe, ob die Eingabe nur Ziffern enthält (keine negativen Zahlen)
        if (!/^\d+$/.test(input)) {
            console.log("Fehler: Bitte geben Sie eine gültige Zahl ein");
            continue;
        }
        const num = parseInt(input, 10);
        if (num < min || num > max) {
            console.log("Fehler: Bitte wählen Sie eine der oben genannten Optionen");
        } else {
            return num;
        }
    }
}

function rezeptListeMenue(rezepte, titel) {
    process.stdout.write('\x1Bc');
    console.log(`===========${titel}===========`);

    // Kategorie ohne Treffer behandeln
    if (!rezepte || rezepte.length === 0) {
        console.log("Keine Rezepte in dieser Kategorie gefunden");
        question("Drücke Enter um zur Kategorieauswahl zurückzukehren");
        return rezeptAuswahlMenue();
    }

    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);

    // Rezeptauswahl mit Rücksprung
    const menueSteuerung = frageGanzzahl(1, rezepte.length + 1, "\nWähle ein Rezept:\n");
    if (menueSteuerung === rezepte.length + 1) {
        return rezeptAuswahlMenue();
    }

    const rezept = rezepte[menueSteuerung - 1];
    zeigeRezeptDetails(rezept);
    question("\nDrücke Enter um zur Rezeptliste zurückzukehren");
    return rezeptListeMenue(rezepte, titel);
}

function zeigeRezeptDetails(rezept) {
    process.stdout.write('\x1Bc');
    console.log(`===========${rezept.name}===========\n`);
    console.log(`Schwierigkeitsgrad: ${rezept.schwierigkeitsgrad || "-"}`);
    console.log(`Zeitaufwand: ${rezept.zeitaufwand || "-"}`);
    console.log(`Kategorien: ${(rezept.kategorien || []).join(", ") || "-"}`);

    console.log("\nZutaten:");
    (rezept.zutaten || []).forEach((zutat) => {
        console.log(`- ${zutat.name} (${zutat.menge})`);
    });

    console.log("\nArbeitsschritte:");
    (rezept.arbeitsschritte || []).forEach((schritt, index) => {
        console.log(`${index + 1}. ${schritt}`);
    });
}
