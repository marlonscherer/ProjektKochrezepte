//Menüs fertigstellen, Funktionen für die Logik der Menüs erstellen, der Befehl question gibt Umlaute falsch aus und gibt diese auch falsch an die json weiter, Bei den Rezepten kann man auch was anderes vor Enter drücken um zurück zu kommen, umstrukturierung, README, wechsel auf native statt question
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import fs from "fs";
import { fileURLToPath } from "url";

const rezepteDatei = fileURLToPath(new URL("./rezepte.json", import.meta.url));
const rl = readline.createInterface({ input, output });
const INPUT_GESCHLOSSEN = "INPUT_GESCHLOSSEN";

async function question(promptText) {
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

function leereKonsole() {
    process.stdout.write("\x1Bc");
}

async function warteAufEnter(promptText = "\nDrücke Enter um fortzufahren") {
    await question(promptText);
}

async function wurdeAbgebrochen(eingabe, nachricht) {
    if (typeof eingabe === "string" && eingabe.trim().toLowerCase() === "abbrechen") {
        console.log(nachricht);
        await warteAufEnter();
        return true;
    }

    return false;
}

async function fragePflichtfeld(promptText, leereMeldung, abbruchNachricht) {
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

function zeigeZutatenListe(rezept) {
    console.log("Aktuelle Zutaten:");
    (rezept.zutaten || []).forEach((zutat, index) => {
        console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
    });
}

function zeigeArbeitsschritteListe(rezept) {
    console.log("Aktuelle Arbeitsschritte:");
    (rezept.arbeitsschritte || []).forEach((schritt, index) => {
        console.log(`${index + 1}. ${schritt}`);
    });
}

async function bearbeiteListenMenue(rezept, titel, zeigeEintraege, optionen) {
    while (true) {
        leereKonsole();
        console.log(`===========${titel}===========`);
        zeigeEintraege(rezept);

        optionen.forEach((option, index) => {
            console.log(`\n[${index + 1}] ${option.label}`);
        });
        console.log(`\n[${optionen.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, optionen.length + 1, "\nWas möchtest du tun?\n");
        if (menueSteuerung === optionen.length + 1) {
            return null;
        }

        const bearbeitetesRezept = await optionen[menueSteuerung - 1].aktion(rezept);
        if (bearbeitetesRezept !== null) {
            return bearbeitetesRezept;
        }
    }
}


//Erstellt das Hauptmenü
async function hauptMenue() {
    while (true) {
        leereKonsole();
        console.log(
            "===========Kochrezepte===========\n",
            "[1] Rezeptauswahl\n",
            "[2] Rezepte Bearbeiten\n",
            "[3] KI Beratung\n",
            "[4] Beenden\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 4, "Was möchtest du tun?\n");

        if (menueSteuerung === 1) {
            await rezeptAuswahlMenue();
        } else if (menueSteuerung === 2) {
            await rezepteBearbeitenMenue();
        } else if (menueSteuerung === 3) {
            await kiBeratungMenue();
        } else if (menueSteuerung === 4) {
            console.log("Das Programm wird beendet. Auf wiedersehen!");
            rl.close();
            return;
        }
    }
}

try {
    await hauptMenue();
} catch (error) {
    if (error instanceof Error && error.message === INPUT_GESCHLOSSEN) {
        if (!rl.closed) {
            rl.close();
        }
    } else {
        throw error;
    }
}

//Dummy-Funktionen für die Untermenüs (nur Platzhalter, um Fehler zu vermeiden und um Hauptmenü zu testen)
async function rezeptAuswahlMenue() {
    while (true) {
        leereKonsole();
        console.log("===========Rezept Auswahl===========");

        const rezepte = ladeRezepte();
        if (rezepte.length === 0) {
            console.log("Keine Rezepte gefunden");
            await warteAufEnter("Drücke Enter um zum Hauptmenü zurückzukehren");
            return;
        }

        const kategorien = holeKategorien(rezepte);
        const menuEintraege = ["Alle Rezepte", ...kategorien, "Zurück"];

        menuEintraege.forEach((eintrag, index) => {
            console.log(`[${index + 1}] ${eintrag}`);
        });

        const menueSteuerung = await frageGanzzahl(1, menuEintraege.length, "\nWähle eine Kategorie:\n");
        if (menueSteuerung === menuEintraege.length) {
            return;
        }

        if (menueSteuerung === 1) {
            await rezeptListeMenue(rezepte, "Alle Rezepte");
            continue;
        }

        const gewaehlteKategorie = kategorien[menueSteuerung - 2];
        const gefiltert = rezepte.filter((rezept) =>
            Array.isArray(rezept.kategorien) && rezept.kategorien.some((kategorie) => kategorie.toLowerCase() === gewaehlteKategorie.toLowerCase())
        );
        await rezeptListeMenue(gefiltert, `Kategorie: ${gewaehlteKategorie}`);
    }
}

async function rezepteBearbeitenMenue() {
    while (true) {
        leereKonsole();
        console.log(
            "===========Rezepte Bearbeiten===========\n",
            "[1] Rezept Hinzufügen\n",
            "[2] Rezept Löschen\n",
            "[3] Rezept Verändern\n",
            "[4] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 4, "Was möchtest du tun?\n");

        if (menueSteuerung === 1) {
            await rezeptHinzufuegenMenue();
        } else if (menueSteuerung === 2) {
            await rezeptLoeschenMenue();
        } else if (menueSteuerung === 3) {
            await rezeptVeraendernEinzelnMenue();
        } else if (menueSteuerung === 4) {
            return;
        }
    }
}

async function rezeptLoeschenMenue() {
    leereKonsole();
    console.log("===========Rezept Löschen===========")
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte zum Löschen gefunden");
        await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }   
    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);
    const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du löschen?\n");
    
    // Zurück-Option
    if (menueSteuerung === rezepte.length + 1) {
        return;
    }
    
    // Lösch-Bestätigung
    const rezeptName = rezepte[menueSteuerung - 1].name;
    let bestaetigung = "";
    while (bestaetigung !== "j" && bestaetigung !== "n") {
        bestaetigung = (await question(`\nMöchtest du "${rezeptName}" wirklich löschen? (j/n): `)).trim().toLowerCase();
        if (bestaetigung !== "j" && bestaetigung !== "n") {
            console.log("Fehler: Bitte nur 'j' oder 'n' eingeben.");
        }
    }

    if (bestaetigung === "n") {
        console.log("Löschvorgang abgebrochen");
        await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }
    
    rezepte.splice(menueSteuerung - 1, 1); //Entfernt das ausgewählte Rezept aus dem Array
   try {
        //Änderung Speichern
       fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8"); //Aktualisiert die JSON-Datei mit den Änderungen
       console.log("\nRezept erfolgreich gelöscht!");
   } catch (error) {
       console.log("\nFehler beim Speichern der Änderungen!");
   }
    await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");

}

async function rezeptHinzufuegenMenue() {
    leereKonsole();
    console.log("===========Rezept Hinzufügen===========\n",
        "'abbrechen' eingeben, um den Vorgang abzubrechen\n"
    );
    
    const rezepte = ladeRezepte();
    
    // Rezeptnamen abfragen und überprüfen
    let rezeptName = "";
    let nameIstEinzigartig = false;
    
    while (!nameIstEinzigartig) {
        rezeptName = await fragePflichtfeld(
            "Gib den Namen des neuen Rezepts ein: ",
            "Der Name darf nicht leer sein!",
            "Rezepterstellung abgebrochen."
        );
        if (rezeptName === null) {
            return;
        }
        
        // Prüfe, ob Name bereits existiert (case-insensitive)
        const nameBereitsVorhanden = rezepte.some((rezept) => rezept.name.toLowerCase() === rezeptName.toLowerCase());
        
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
    console.log(`[${schwierigkeitsgrade.length + 1}] Abbrechen`);
    const schwierigkeitIndex = await frageGanzzahl(1, schwierigkeitsgrade.length + 1, "Wähle den Schwierigkeitsgrad: ");
    if (schwierigkeitIndex === schwierigkeitsgrade.length + 1) {
        console.log("Rezepterstellung abgebrochen.");
        await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return;
    }
    const schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    
    // Zeitaufwand abfragen
    const zeitaufwand = await fragePflichtfeld(
        "\nGib den Zeitaufwand ein (z.B. '30 Minuten'): ",
        "Der Zeitaufwand darf nicht leer sein!",
        "Rezepterstellung abgebrochen."
    );
    if (zeitaufwand === null) {
        return;
    }
    
    // Kategorien abfragen
    console.log("\nGib Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
    const kategorienInput = ((await question("Kategorien: "))).trim();
    
    if (await wurdeAbgebrochen(kategorienInput, "Rezepterstellung abgebrochen.")) {
        return;
    }
    const kategorien = kategorienInput
        .split(",") //Eingabe aufteilen
        .map(kategorie => kategorie.trim()) //Leerzeichen entfernen
        .filter(kategorie => kategorie !== ""); //Leere Einträge entfernen
    
    // Zutaten abfragen
    console.log("\nZutaten hinzufügen (gib 'fertig' ein, um zu stoppen)");
    const zutaten = [];
    let zutatIndex = 1;
    
    while (true) {
        let zutatName = "";
        while (zutatName === "") {
            zutatName = (await question(`\nZutat ${zutatIndex} Name (oder 'fertig'): `)).trim();
            if (await wurdeAbgebrochen(zutatName, "Rezepterstellung abgebrochen.")) {
                return;
            } else if (zutatName === "") {
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
        
        const zutatMenge = await fragePflichtfeld(
            `Zutat ${zutatIndex} Menge: `,
            "Die Menge darf nicht leer sein!",
            "Rezepterstellung abgebrochen."
        );
        if (zutatMenge === null) {
            return;
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
            schritt = (await question(`\nSchritt ${schrittIndex} (oder 'fertig'): `)).trim();
            if (await wurdeAbgebrochen(schritt, "Rezepterstellung abgebrochen.")) {
                return;
            } else if (schritt === "") {
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
        console.log(`\nRezept "${rezeptName}" erfolgreich hinzugefügt!`);
    } catch (error) {
        console.log("\nFehler beim Speichern des Rezepts!");
    }
    
    await warteAufEnter("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
}

async function rezeptVeraendernEinzelnMenue() {
    while (true) {
        leereKonsole();
        console.log("===========Rezept Verändern===========");
        
        const rezepte = ladeRezepte();
        if (rezepte.length === 0) {
            console.log("Keine Rezepte zum Bearbeiten gefunden");
            await warteAufEnter("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
            return;
        }
        
        rezepte.forEach((rezept, index) => {
            console.log(`[${index + 1}] ${rezept.name}`);
        });
        console.log(`[${rezepte.length + 1}] Zurück`);
        
        const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du bearbeiten?\n");
        if (menueSteuerung === rezepte.length + 1) {
            return;
        }
        
        const rezept = rezepte[menueSteuerung - 1];
        await rezeptEditierMenue(rezept, rezepte);
    }
}

async function rezeptEditierMenue(rezept, rezepte) {
    while (true) {
        leereKonsole();
        console.log(`===========Bearbeite: ${rezept.name}===========\n`,
            "[1] Rezeptname ändern\n",
            "[2] Schwierigkeitsgrad ändern\n",
            "[3] Zeitaufwand ändern\n",
            "[4] Kategorien ändern\n",
            "[5] Zutaten ändern\n",
            "[6] Arbeitsschritte ändern\n",
            "[7] Zurück\n"
        );

        const menueSteuerung = await frageGanzzahl(1, 7, "Was möchtest du ändern?\n");

        let bearbeitetesRezept = null;
        if (menueSteuerung === 1) {
            bearbeitetesRezept = await bearbeiteRezeptName(rezept, rezepte);
        } else if (menueSteuerung === 2) {
            bearbeitetesRezept = await bearbeiteSchwierigkeitsgrad(rezept);
        } else if (menueSteuerung === 3) {
            bearbeitetesRezept = await bearbeiteZeitaufwand(rezept);
        } else if (menueSteuerung === 4) {
            bearbeitetesRezept = await bearbeiteKategorien(rezept);
        } else if (menueSteuerung === 5) {
            bearbeitetesRezept = await bearbeiteZutaten(rezept);
        } else if (menueSteuerung === 6) {
            bearbeitetesRezept = await bearbeiteArbeitsschritte(rezept);
        } else if (menueSteuerung === 7) {
            return;
        }

        // Nur speichern wenn tatsächlich eine Änderung gemacht wurde (nicht abgebrochen)
        if (bearbeitetesRezept !== null) {
            rezept = bearbeitetesRezept;
            
            // Bearbeitetes Rezept sicher zurück in die Liste schreiben
            const rezeptIndex = rezepte.findIndex((eintrag) => eintrag.id === rezept.id); //Sucht das Rezept mithilfe der ID
            if (rezeptIndex !== -1) {
                rezepte[rezeptIndex] = rezept; //Aktualisiert das Array mit der Änderung
            }

            // Änderungen speichern
            try {
                fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8");
                console.log("Änderungen gespeichert!");
            } catch (error) {
                console.log("Fehler beim Speichern der Änderungen!");
            }
            
            await warteAufEnter("Drücke Enter um fortzufahren");
        }
    }
}

async function kiBeratungMenue() {
    console.log("Dummy: KI Beratung-Menü (noch nicht implementiert)");
    await warteAufEnter();
}

// Funktionen für die Bearbeitung der Rezeptdetails (Logik wird gerade noch implementiert)
async function bearbeiteRezeptName(rezept, rezepte) {
    leereKonsole();
    console.log("===========Rezeptname ändern===========");
    console.log(`Aktueller Name: ${rezept.name}`);

    let neuerName = "";
    let nameIstEinzigartig = false;

    while (!nameIstEinzigartig) {
        neuerName = await fragePflichtfeld(
            "Gib den neuen Namen ein (oder 'abbrechen'): ",
            "Der Name darf nicht leer sein!",
            "Namensänderung abgebrochen."
        );
        if (neuerName === null) {
            return null;
        }

        // Prüfe, ob Name bereits existiert, außer beim aktuellen Rezept
        const nameBereitsVorhanden = rezepte.some((vorhandenesRezept) => {
            const istAktuellesRezept = vorhandenesRezept === rezept || vorhandenesRezept.id === rezept.id;
            return !istAktuellesRezept && vorhandenesRezept.name.toLowerCase() === neuerName.toLowerCase();
        });
        
        if (nameBereitsVorhanden) {
            console.log(`Ein Rezept mit dem Namen "${neuerName}" existiert bereits!`);
            continue;
        } else {
            nameIstEinzigartig = true;
        }
    }

    rezept.name = neuerName; // Name aktualisieren
    return rezept;
}

async function bearbeiteSchwierigkeitsgrad(rezept) {
    leereKonsole();
    console.log("===========Schwierigkeitsgrad ändern===========");
    console.log(`Aktueller Schwierigkeitsgrad: ${rezept.schwierigkeitsgrad}`);
    
    const schwierigkeitsgrade = ["Leicht", "Mittel", "Schwer"];
    console.log("\nSchwierigkeitsgrad:");
    schwierigkeitsgrade.forEach((grad, index) => {
        console.log(`[${index + 1}] ${grad}`);
    });
    console.log(`[${schwierigkeitsgrade.length + 1}] Abbrechen`);
    
    const schwierigkeitIndex = await frageGanzzahl(1, schwierigkeitsgrade.length + 1, "\nWähle den Schwierigkeitsgrad: ");
    
    if (schwierigkeitIndex === schwierigkeitsgrade.length + 1) {
        console.log("Änderung abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    rezept.schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    return rezept;
}

async function bearbeiteZeitaufwand(rezept) {
    leereKonsole();
    console.log("===========Zeitaufwand ändern===========");
    console.log(`Aktueller Zeitaufwand: ${rezept.zeitaufwand}`);

    const neuerZeitaufwand = await fragePflichtfeld(
        "Gib den neuen Zeitaufwand ein (oder 'abbrechen'): ",
        "Der Zeitaufwand darf nicht leer sein!",
        "Zeitaufwandänderung abgebrochen."
    );
    if (neuerZeitaufwand === null) {
        return null;
    }

    rezept.zeitaufwand = neuerZeitaufwand;
    return rezept;
}

async function bearbeiteKategorien(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Kategorien ändern===========");
        console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);
        console.log("[1] Kategorie hinzufügen",
            "\n[2] Kategorie entfernen",
            "\n[3] Kategorie umbenennen",
            "\n[4] Alle Kategorien ersetzen",
            "\n[5] Zurück\n"
        );

        let menueSteuerung = await frageGanzzahl(1, 5, "\nWas möchtest du tun?\n");

        let bearbeitetesRezept = null;
        if (menueSteuerung === 1) {
           bearbeitetesRezept = await kategorieHinzufuegen(rezept);
        } else if (menueSteuerung === 2) {
            bearbeitetesRezept = await kategorieEntfernen(rezept);
        } else if (menueSteuerung === 3) {
            bearbeitetesRezept = await kategorieUmbenennen(rezept);
        } else if (menueSteuerung === 4) {
            bearbeitetesRezept = await kategorienErsetzen(rezept);
        } else if (menueSteuerung === 5) {
            return null;
        }

        // Nur zurück wenn erfolgreich geändert, sonst bleibt man im Kategorien-Menü
        if (bearbeitetesRezept !== null) {
            rezept = bearbeitetesRezept;
            return rezept;
        }
    }
}

async function kategorieHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Kategorie hinzufügen===========");
    console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);

    let neueKategorie = "";
    let kategorieIstEinzigartig = false;

    if (!Array.isArray(rezept.kategorien)) {
        rezept.kategorien = [];
    }

    while (!kategorieIstEinzigartig) {
        neueKategorie = await fragePflichtfeld(
            "Gib die neue Kategorie ein (oder 'abbrechen'): ",
            "Die Kategorie darf nicht leer sein!",
            "Kategorie hinzufügen abgebrochen."
        );
        if (neueKategorie === null) {
            return null;
        }

        // Prüfe, ob Kategorie bereits existiert
        const kategorieBereitsVorhanden = rezept.kategorien.some((kategorie) => kategorie.toLowerCase() === neueKategorie.toLowerCase());

        if (kategorieBereitsVorhanden) {
            console.log(`Die Kategorie "${neueKategorie}" existiert bereits!`);
            continue;
        } else {
            kategorieIstEinzigartig = true;
        }
    }

    rezept.kategorien.push(neueKategorie);
    console.log(`Kategorie "${neueKategorie}" hinzugefügt!`);
    return rezept;
}

async function kategorieEntfernen(rezept) {
    leereKonsole();
    console.log("===========Kategorie entfernen===========");
    
    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Entfernen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    // Überprüfen, ob nur eine Kategorie vorhanden ist
    if (rezept.kategorien.length === 1) {
        console.log("Es muss mindestens eine Kategorie erhalten bleiben!");
        console.log(`Aktuelle Kategorie: ${rezept.kategorien[0]}`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    console.log("Aktuelle Kategorien:");
    rezept.kategorien.forEach((kategorie, index) => {
        console.log(`[${index + 1}] ${kategorie}`);
    });
    console.log(`[${rezept.kategorien.length + 1}] Abbrechen`);
    
    const menueSteuerung = await frageGanzzahl(1, rezept.kategorien.length + 1, "\nWelche Kategorie möchtest du entfernen?\n");
    
    if (menueSteuerung === rezept.kategorien.length + 1) {
        console.log("Kategorie entfernen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    const entfernteKategorie = rezept.kategorien[menueSteuerung - 1];
    rezept.kategorien.splice(menueSteuerung - 1, 1);
    console.log(`Kategorie "${entfernteKategorie}" entfernt!`);
    return rezept;
}

async function kategorieUmbenennen(rezept) {
    leereKonsole();
    console.log("===========Kategorie umbenennen===========");
    
    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Umbenennen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    console.log("Aktuelle Kategorien:");
    rezept.kategorien.forEach((kategorie, index) => {
        console.log(`[${index + 1}] ${kategorie}`);
    });
    console.log(`[${rezept.kategorien.length + 1}] Abbrechen`);
    
    const menueSteuerung = await frageGanzzahl(1, rezept.kategorien.length + 1, "\nWelche Kategorie möchtest du umbenennen?\n");
    
    if (menueSteuerung === rezept.kategorien.length + 1) {
        console.log("Kategorie umbenennen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    const alteKategorie = rezept.kategorien[menueSteuerung - 1];
    console.log(`\nAlte Kategorie: ${alteKategorie}`);
    
    let neueKategorie = "";
    let kategorieIstEinzigartig = false;
    
    while (!kategorieIstEinzigartig) {
        neueKategorie = await fragePflichtfeld(
            "Gib den neuen Namen ein (oder 'abbrechen'): ",
            "Der Kategoriename darf nicht leer sein!",
            "Kategorie umbenennen abgebrochen."
        );
        if (neueKategorie === null) {
            return null;
        }
        
        // Prüfe, ob neue Kategorie bereits existiert (außer der aktuellen)
        const kategorieBereitsVorhanden = rezept.kategorien.some((kategorie, index) => {
            return index !== (menueSteuerung - 1) && kategorie.toLowerCase() === neueKategorie.toLowerCase(); // Prüft ob Kategorie bereits vorhanden (außer die die umbenannt werden soll)
        });
        
        if (kategorieBereitsVorhanden) {
            console.log(`Die Kategorie "${neueKategorie}" existiert bereits!`);
            continue;
        } else {
            kategorieIstEinzigartig = true;
        }
    }
    
    rezept.kategorien[menueSteuerung - 1] = neueKategorie;
    console.log(`Kategorie "${alteKategorie}" zu "${neueKategorie}" umbenannt!`);
    return rezept;
}

async function kategorienErsetzen(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Alle Kategorien ersetzen===========");
        console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);
        
        console.log("\nGib neue Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
        const kategorienInput = (await question("Kategorien (oder 'abbrechen'): ")).trim();
        
        if (await wurdeAbgebrochen(kategorienInput, "Kategorien ersetzen abgebrochen.")) {
            return null;
        }
        
        if (kategorienInput === "") {
            console.log("Mindestens eine Kategorie ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }
        
        const neueKategorien = kategorienInput
            .split(",")
            .map((kategorie) => kategorie.trim())
            .filter((kategorie) => kategorie !== "");

        if (neueKategorien.length === 0) {
            console.log("Mindestens eine gültige Kategorie ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }
        
        rezept.kategorien = neueKategorien;
        console.log(`Kategorien erfolgreich aktualisiert: ${neueKategorien.join(", ")}`);
        return rezept;
    }
}

async function bearbeiteZutaten(rezept) {
    return bearbeiteListenMenue(rezept, "Zutaten ändern", zeigeZutatenListe, [
        { label: "Zutat und Menge hinzufügen", aktion: zutatHinzufuegen },
        { label: "Zutat löschen", aktion: zutatEntfernen },
        { label: "Zutat verändern", aktion: zutatVeraendern },
        { label: "Alle Zutaten neu schreiben", aktion: zutatenErsetzen }
    ]);
}

async function zutatHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Zutat und Menge hinzufügen===========");

    const zutaten = rezept.zutaten || [];
    if (zutaten.length === 0) {
        console.log("Keine Zutaten vorhanden");
    } else {
        zutaten.forEach((zutat, index) => {
            console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
        });
    }

    let zutatName = "";
    let nameIstEinzigartig = false;

    while (!nameIstEinzigartig) {
        zutatName = await fragePflichtfeld(
            "\nName der neuen Zutat (oder 'abbrechen'): ",
            "Der Name der Zutat darf nicht leer sein!",
            "Zutat hinzufügen abgebrochen."
        );
        if (zutatName === null) {
            return null;
        }

        const zutatBereitsVorhanden = zutaten.some((zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase());
        if (zutatBereitsVorhanden) {
            console.log(`Die Zutat \"${zutatName}\" existiert bereits!`);
            continue;
        }

        nameIstEinzigartig = true;
    }

    const zutatMenge = await fragePflichtfeld(
        "Menge der Zutat (oder 'abbrechen'): ",
        "Die Menge darf nicht leer sein!",
        "Zutat hinzufügen abgebrochen."
    );
    if (zutatMenge === null) {
        return null;
    }

    if (!Array.isArray(rezept.zutaten)) {
        rezept.zutaten = [];
    }

    rezept.zutaten.push({ name: zutatName, menge: zutatMenge });
    console.log(`Zutat \"${zutatName}\" hinzugefügt!`);
    return rezept;
}

async function zutatEntfernen(rezept) {
    leereKonsole();
    console.log("===========Zutat löschen===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Löschen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.zutaten.length === 1) {
        console.log("Es muss mindestens eine Zutat erhalten bleiben!");
        console.log(`Aktuelle Zutat: ${rezept.zutaten[0].name} (${rezept.zutaten[0].menge})`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Zutaten:");
    rezept.zutaten.forEach((zutat, index) => {
        console.log(`[${index + 1}] ${zutat.name} (${zutat.menge})`);
    });
    console.log(`[${rezept.zutaten.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.zutaten.length + 1, "\nWelche Zutat möchtest du löschen?\n");

    if (menueSteuerung === rezept.zutaten.length + 1) {
        console.log("Zutat löschen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const entfernteZutat = rezept.zutaten[menueSteuerung - 1];

    let bestaetigung = "";
    while (bestaetigung !== "j" && bestaetigung !== "n") {
        bestaetigung = (await question(`\nMöchtest du \"${entfernteZutat.name}\" wirklich löschen? (j/n): `)).trim().toLowerCase();
        if (bestaetigung !== "j" && bestaetigung !== "n") {
            console.log("Fehler: ungültige Eingabe.");
        }
    }

    if (bestaetigung === "n") {
        console.log("Löschvorgang abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.zutaten.splice(menueSteuerung - 1, 1);
    console.log(`Zutat \"${entfernteZutat.name}\" gelöscht!`);
    return rezept;
}

async function zutatVeraendern(rezept) {
    leereKonsole();
    console.log("===========Zutat verändern===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Verändern vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Zutaten:");
    rezept.zutaten.forEach((zutat, index) => {
        console.log(`[${index + 1}] ${zutat.name} (${zutat.menge})`);
    });
    console.log(`[${rezept.zutaten.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.zutaten.length + 1, "\nWelche Zutat möchtest du verändern?\n");

    if (menueSteuerung === rezept.zutaten.length + 1) {
        console.log("Zutat verändern abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alteZutat = rezept.zutaten[index];

    let neuerName = "";
    let nameIstEinzigartig = false;
    while (!nameIstEinzigartig) {
        neuerName = await fragePflichtfeld(
            `\nNeuer Name für "${alteZutat.name}" (oder 'abbrechen'): `,
            "Der Name der Zutat darf nicht leer sein!",
            "Zutat verändern abgebrochen."
        );
        if (neuerName === null) {
            return null;
        }

        const zutatBereitsVorhanden = rezept.zutaten.some((zutat, aktuellePosition) => {
            return aktuellePosition !== index && zutat.name.toLowerCase() === neuerName.toLowerCase();
        });

        if (zutatBereitsVorhanden) {
            console.log(`Die Zutat \"${neuerName}\" existiert bereits!`);
            continue;
        }

        nameIstEinzigartig = true;
    }

    const neueMenge = await fragePflichtfeld(
        `Neue Menge für "${neuerName}" (oder 'abbrechen'): `,
        "Die Menge darf nicht leer sein!",
        "Zutat verändern abgebrochen."
    );
    if (neueMenge === null) {
        return null;
    }

    rezept.zutaten[index] = { name: neuerName, menge: neueMenge };
    console.log(`Zutat erfolgreich geändert: ${neuerName} (${neueMenge})`);
    return rezept;
}

async function zutatenErsetzen(rezept) {
    while (true) {
        leereKonsole();
        console.log("===========Alle Zutaten neu schreiben===========");
        zeigeZutatenListe(rezept);

        console.log("\nGib neue Zutaten ein (Format: 'Name Menge, Name Menge', z.B. 'Spaghetti 400g, Knoblauch 4 Zehen')");
        const zutatenInput = (await question("Zutaten (oder 'abbrechen'): ")).trim();

        if (await wurdeAbgebrochen(zutatenInput, "Zutaten ersetzen abgebrochen.")) {
            return null;
        }

        if (zutatenInput === "") {
            console.log("Mindestens eine Zutat ist erforderlich!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        const neueZutaten = zutatenInput
            .split(",")
            .map((zutatPaar) => {
                const teile = zutatPaar.trim().split(/\s+(.+)/);
                return {
                    name: teile[0],
                    menge: teile[1] || ""
                };
            })
            .filter((zutat) => zutat.name !== "" && zutat.menge !== "");

        if (neueZutaten.length === 0) {
            console.log("Keine gültigen Zutaten eingegeben!");
            await warteAufEnter("\nDrücke Enter um fortzufahren");
            continue;
        }

        rezept.zutaten = neueZutaten;
        console.log(`Zutaten erfolgreich aktualisiert: ${neueZutaten.map((zutat) => `${zutat.name} (${zutat.menge})`).join(", ")}`);
        return rezept;
    }
}

async function bearbeiteArbeitsschritte(rezept) {
    return bearbeiteListenMenue(rezept, "Arbeitsschritte ändern", zeigeArbeitsschritteListe, [
        { label: "Arbeitsschritt hinzufügen", aktion: arbeitsschrittHinzufuegen },
        { label: "Arbeitsschritt löschen", aktion: arbeitsschrittEntfernen },
        { label: "Arbeitsschritt verändern", aktion: arbeitsschrittVeraendern },
        { label: "Alle Arbeitsschritte neu schreiben", aktion: arbeitsschritteErsetzen }
    ]);
}

async function arbeitsschrittHinzufuegen(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt hinzufügen===========");
    console.log("Aktuelle Arbeitsschritte:");

    const arbeitsschritte = rezept.arbeitsschritte || [];
    if (arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte vorhanden");
    } else {
        arbeitsschritte.forEach((schritt, index) => {
            console.log(`${index + 1}. ${schritt}`);
        });
    }

    console.log(`\n[1-${arbeitsschritte.length}] Position vor existierendem Schritt`);
    console.log(`[${arbeitsschritte.length + 1}] Am Ende hinzufügen`);
    console.log(`[${arbeitsschritte.length + 2}] Abbrechen`);

    const positionEingabe = await frageGanzzahl(1, arbeitsschritte.length + 2, "\nAn welcher Position soll der Schritt eingefügt werden?\n");

    if (positionEingabe === arbeitsschritte.length + 2) {
        console.log("Arbeitsschritt hinzufügen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const neuerArbeitsschritt = await fragePflichtfeld(
        "\nNeuen Arbeitsschritt eingeben (oder 'abbrechen'): ",
        "Der Arbeitsschritt darf nicht leer sein!",
        "Arbeitsschritt hinzufügen abgebrochen."
    );
    if (neuerArbeitsschritt === null) {
        return null;
    }

    if (!Array.isArray(rezept.arbeitsschritte)) {
        rezept.arbeitsschritte = [];
    }

    const insertPosition = positionEingabe - 1;
    rezept.arbeitsschritte.splice(insertPosition, 0, neuerArbeitsschritt);
    console.log("Arbeitsschritt hinzugefügt!");
    return rezept;
}

async function arbeitsschrittEntfernen(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt löschen===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Löschen vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.arbeitsschritte.length === 1) {
        console.log("Es muss mindestens ein Arbeitsschritt erhalten bleiben!");
        console.log(`Aktueller Arbeitsschritt: ${rezept.arbeitsschritte[0]}`);
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Arbeitsschritte:");
    rezept.arbeitsschritte.forEach((schritt, index) => {
        console.log(`[${index + 1}] ${schritt}`);
    });
    console.log(`[${rezept.arbeitsschritte.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.arbeitsschritte.length + 1, "\nWelchen Arbeitsschritt möchtest du löschen?\n");

    if (menueSteuerung === rezept.arbeitsschritte.length + 1) {
        console.log("Arbeitsschritt löschen abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const entfernterSchritt = rezept.arbeitsschritte[menueSteuerung - 1];

    let bestaetigung = "";
    while (bestaetigung !== "j" && bestaetigung !== "n") {
        bestaetigung = (await question(`\nMöchtest du \"${entfernterSchritt}\" wirklich löschen? (j/n): `)).trim().toLowerCase();
        if (bestaetigung !== "j" && bestaetigung !== "n") {
            console.log("Fehler: ungültige Eingabe.");
        }
    }

    if (bestaetigung === "n") {
        console.log("Löschvorgang abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.arbeitsschritte.splice(menueSteuerung - 1, 1);
    console.log(`Arbeitsschritt \"${entfernterSchritt}\" gelöscht!`);
    return rezept;
}

async function arbeitsschrittVeraendern(rezept) {
    leereKonsole();
    console.log("===========Arbeitsschritt verändern===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Verändern vorhanden.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    console.log("Aktuelle Arbeitsschritte:");
    rezept.arbeitsschritte.forEach((schritt, index) => {
        console.log(`[${index + 1}] ${schritt}`);
    });
    console.log(`[${rezept.arbeitsschritte.length + 1}] Abbrechen`);

    const menueSteuerung = await frageGanzzahl(1, rezept.arbeitsschritte.length + 1, "\nWelchen Arbeitsschritt möchtest du verändern?\n");

    if (menueSteuerung === rezept.arbeitsschritte.length + 1) {
        console.log("Arbeitsschritt verändern abgebrochen.");
        await warteAufEnter("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alterSchritt = rezept.arbeitsschritte[index];
    console.log(`\nAlter Arbeitsschritt: ${alterSchritt}`);

    const neuerArbeitsschritt = await fragePflichtfeld(
        "Neuer Arbeitsschritt (oder 'abbrechen'): ",
        "Der Arbeitsschritt darf nicht leer sein!",
        "Arbeitsschritt verändern abgebrochen."
    );
    if (neuerArbeitsschritt === null) {
        return null;
    }

    rezept.arbeitsschritte[index] = neuerArbeitsschritt;
    console.log(`Arbeitsschritt erfolgreich geändert zu: ${neuerArbeitsschritt}`);
    return rezept;
}

async function arbeitsschritteErsetzen(rezept) {
    leereKonsole();
    console.log("===========Alle Arbeitsschritte neu schreiben===========");
    zeigeArbeitsschritteListe(rezept);

    console.log("\nGib neue Arbeitsschritte ein (gib 'fertig' ein, um zu stoppen):");
    const neueArbeitsschritte = [];
    let schrittIndex = 1;

    while (true) {
        let schritt = "";
        while (schritt === "") {
            schritt = (await question(`Schritt ${schrittIndex} (oder 'fertig'): `)).trim();
            if (await wurdeAbgebrochen(schritt, "Arbeitsschritte ersetzen abgebrochen.")) {
                return null;
            } else if (schritt === "") {
                console.log("Der Arbeitsschritt darf nicht leer sein!");
            }
        }

        if (schritt.toLowerCase() === "fertig") {
            if (neueArbeitsschritte.length === 0) {
                console.log("Mindestens ein Arbeitsschritt ist erforderlich!");
                continue;
            }
            break;
        }

        neueArbeitsschritte.push(schritt);
        schrittIndex = schrittIndex + 1;
    }

    rezept.arbeitsschritte = neueArbeitsschritte;
    console.log(`Arbeitsschritte erfolgreich aktualisiert (${neueArbeitsschritte.length} Schritte)`);
    return rezept;
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

async function frageGanzzahl(min, max, prompt) {
    while (true) {
        const input = await question(prompt);
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

async function rezeptListeMenue(rezepte, titel) {
    while (true) {
        leereKonsole();
        console.log(`===========${titel}===========`);

        if (!rezepte || rezepte.length === 0) {
            console.log("Keine Rezepte in dieser Kategorie gefunden");
            await warteAufEnter("Drücke Enter um zur Kategorieauswahl zurückzukehren");
            return;
        }

        rezepte.forEach((rezept, index) => {
            console.log(`[${index + 1}] ${rezept.name}`);
        });
        console.log(`[${rezepte.length + 1}] Zurück`);

        const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWähle ein Rezept:\n");
        if (menueSteuerung === rezepte.length + 1) {
            return;
        }

        const rezept = rezepte[menueSteuerung - 1];
        zeigeRezeptDetails(rezept);
        await warteAufEnter("\nDrücke Enter um zur Rezeptliste zurückzukehren");
    }
}

function zeigeRezeptDetails(rezept) {
    process.stdout.write('\x1Bc');
    console.log(`===========${rezept.name}===========`);
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








