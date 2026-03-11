//Menüs fertigstellen, Funktionen für die Logik der Menüs erstellen, der Befehl question gibt Umlaute falsch aus und gibt diese auch falsch an die json weiter, Bei den Rezepten kann man auch was anderes vor Enter drücken um zurück zu kommen, umstrukturierung, README, wechsel auf native statt question
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import fs from "fs";
import { fileURLToPath } from "url";

const rezepteDatei = fileURLToPath(new URL("./rezepte.json", import.meta.url));
const rl = readline.createInterface({ input, output });

async function question(promptText) {
    return rl.question(promptText);
}


//Erstellt das Hauptmenü
export async function hauptMenue() {
process.stdout.write('\x1Bc'); //cleared das Terminal
console.log(
    "===========Kochrezepte===========\n",
    "[1] Rezeptauswahl\n",
    "[2] Rezepte Bearbeiten\n",
    "[3] KI Beratung\n",
    "[4] Beenden\n"

);


//Eingabe für Menüsteuerung mit Fehlerprüfung
const menueSteuerung = await frageGanzzahl(1, 4, "Was möchtest du tun?\n");

//Aufrufen des nächsten Untermenüs (mit Funktionen um es übersichtlicher zu halten)
if (menueSteuerung === 1) {
    await rezeptAuswahlMenue();
} else if (menueSteuerung === 2) {
    await rezepteBearbeitenMenue();
} else if (menueSteuerung === 3) {
   await kiBeratungMenue();
} else if (menueSteuerung === 4) {
    console.log("Das Programm wird beendet. Auf wiedersehen!");
    process.exit(0); //Bricht das Programm ohne Fehlermeldung ab
} 
}

await hauptMenue();

//Dummy-Funktionen für die Untermenüs (nur Platzhalter, um Fehler zu vermeiden und um Hauptmenü zu testen)
async function rezeptAuswahlMenue() {
    process.stdout.write('\x1Bc'); //cleared das Terminal
    console.log(
        "===========Rezept Auswahl==========="
    );

    // Lade alle Rezepte für die Kategorienauswahl
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte gefunden");
        await question("Drücke Enter um zum Hauptmenü zurückzukehren");
        return await hauptMenue();
    }

    // Kategorien dynamisch aus Rezeptdaten ableiten
    const kategorien = holeKategorien(rezepte);
    const menuEintraege = ["Alle Rezepte", ...kategorien, "Zurück"];

    menuEintraege.forEach((eintrag, index) => {
        console.log(`[${index + 1}] ${eintrag}`);
    });

    // Auswahl der Kategorie mit Validierung
    const menueSteuerung = await frageGanzzahl(1, menuEintraege.length, "\nWähle eine Kategorie:\n");
    const istZurueck = menueSteuerung === menuEintraege.length;
    if (istZurueck) {
        return await hauptMenue();
    }

    if (menueSteuerung === 1) {
        return await rezeptListeMenue(rezepte, "Alle Rezepte");
    }

    const gewaehlteKategorie = kategorien[menueSteuerung - 2];
    const gefiltert = rezepte.filter((rezept) =>
        Array.isArray(rezept.kategorien) && rezept.kategorien.some(k => k.toLowerCase() === gewaehlteKategorie.toLowerCase()) // Zum vergleichen wird Kategorie in Kleinbuchstaben umgewandelt
    );
    return await rezeptListeMenue(gefiltert, `Kategorie: ${gewaehlteKategorie}`);
}

async function rezepteBearbeitenMenue() {
    process.stdout.write('\x1Bc'); //cleared das Terminal
    console.log(
        "===========Rezepte Bearbeiten===========\n",
        "[1] Rezept Hinzufügen\n",
        "[2] Rezept Löschen\n",
        "[3] Rezept Verändern\n",
        "[4] Zurück\n"
    );

    //Eingabe für Menüsteuerung mit Fehlerprüfung
    const menueSteuerung = await frageGanzzahl(1, 4, "Was möchtest du tun?\n");

    //Aufrufen des nächsten Untermenüs
    if (menueSteuerung === 1) {
        await rezeptHinzufuegenMenue();
    } else if (menueSteuerung === 2) {
        await rezeptLoeschenMenue();
    } else if (menueSteuerung === 3) {
        await rezeptVeraendernEinzelnMenue();
    } else if (menueSteuerung === 4) {
        await hauptMenue();
    } 
}

async function rezeptLoeschenMenue() {
    process.stdout.write('\x1Bc');
    console.log("===========Rezept Löschen===========")
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte zum Löschen gefunden");
        await question("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return await rezepteBearbeitenMenue();
    }   
    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);
    const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du löschen?\n");
    
    // Zurück-Option
    if (menueSteuerung === rezepte.length + 1) {
        return await rezepteBearbeitenMenue();
    }
    
    // Lösch-Bestätigung
    const rezeptName = rezepte[menueSteuerung - 1].name;
    const bestaetigung = await question(`\nMöchtest du "${rezeptName}" wirklich löschen? (j/n): `);
    if (bestaetigung.toLowerCase() !== "j") {
        console.log("Löschvorgang abgebrochen");
        await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return await rezepteBearbeitenMenue();
    }
    
    rezepte.splice(menueSteuerung - 1, 1); //Entfernt das ausgewählte Rezept aus dem Array
   try {
        //Änderung Speichern
       fs.writeFileSync(rezepteDatei, JSON.stringify(rezepte, null, 2), "utf-8"); //Aktualisiert die JSON-Datei mit den Änderungen
       console.log("\nRezept erfolgreich gelöscht!");
   } catch (error) {
       console.log("\nFehler beim Speichern der Änderungen!");
   }
    await question("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
    return await rezepteBearbeitenMenue();

}

async function rezeptHinzufuegenMenue() {
    process.stdout.write('\x1Bc');
    console.log("===========Rezept Hinzufügen===========\n",
        "'abbrechen' eingeben, um den Vorgang abzubrechen\n"
    );
    
    const rezepte = ladeRezepte();
    
    // Rezeptnamen abfragen und überprüfen
    let rezeptName = "";
    let nameIstEinzigartig = false;
    
    while (!nameIstEinzigartig) {
        rezeptName = ((await question("Gib den Namen des neuen Rezepts ein: "))).trim();
        
        if (rezeptName.toLowerCase() === "abbrechen") {
            console.log("Rezepterstellung abgebrochen.");
            await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
            return await rezepteBearbeitenMenue();
        } else if (rezeptName === "") {
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
    console.log(`[${schwierigkeitsgrade.length + 1}] Abbrechen`);
    const schwierigkeitIndex = await frageGanzzahl(1, schwierigkeitsgrade.length + 1, "Wähle den Schwierigkeitsgrad: ");
    if (schwierigkeitIndex === schwierigkeitsgrade.length + 1) {
        console.log("Rezepterstellung abgebrochen.");
        await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return await rezepteBearbeitenMenue();
    }
    const schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    
    // Zeitaufwand abfragen
    let zeitaufwand = "";
    while (zeitaufwand === "") {
        zeitaufwand = (await question("\nGib den Zeitaufwand ein (z.B. '30 Minuten'): ")).trim();
        if (zeitaufwand.toLowerCase() === "abbrechen") {
            console.log("Rezepterstellung abgebrochen.");
            await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
            return await rezepteBearbeitenMenue();
        } else if (zeitaufwand === "") {
                console.log("Der Zeitaufwand darf nicht leer sein!");
        }
    }
    
    // Kategorien abfragen
    console.log("\nGib Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
    const kategorienInput = ((await question("Kategorien: "))).trim();
    
    if (kategorienInput.toLowerCase() === "abbrechen") {
        console.log("Rezepterstellung abgebrochen.");
        await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return await rezepteBearbeitenMenue();
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
            if (zutatName.toLowerCase() === "abbrechen") {
                console.log("Rezepterstellung abgebrochen.");
                await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
                return await rezepteBearbeitenMenue();
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
        
        let zutatMenge = "";
        while (zutatMenge === "") {
            zutatMenge = ((await question(`Zutat ${zutatIndex} Menge: `))).trim();
            if (zutatMenge.toLowerCase() === "abbrechen") {
                console.log("Rezepterstellung abgebrochen.");
                await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
                return await rezepteBearbeitenMenue();
            } else if (zutatMenge === "") {
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
            schritt = (await question(`\nSchritt ${schrittIndex} (oder 'fertig'): `)).trim();
            if (schritt.toLowerCase() === "abbrechen") {
                console.log("Rezepterstellung abgebrochen.");
                await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
                return await rezepteBearbeitenMenue();
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
    
    await question("\nDrücke Enter um zum Bearbeitungsmenü zurückzukehren");
    return await rezepteBearbeitenMenue();
}

async function rezeptVeraendernEinzelnMenue() {
    process.stdout.write('\x1Bc');
    console.log("===========Rezept Verändern===========");
    
    const rezepte = ladeRezepte();
    if (rezepte.length === 0) {
        console.log("Keine Rezepte zum Bearbeiten gefunden");
        await question("Drücke Enter um zum Bearbeitungsmenü zurückzukehren");
        return await rezepteBearbeitenMenue();
    }
    
    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);
    
    const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWelches Rezept möchtest du bearbeiten?\n");
    
    // Zurück-Option
    if (menueSteuerung === rezepte.length + 1) {
        return await rezepteBearbeitenMenue();
    }
    
    const rezept = rezepte[menueSteuerung - 1];
    return await rezeptEditierMenue(rezept, rezepte);
}

async function rezeptEditierMenue(rezept, rezepte) {
    while (true) {
        process.stdout.write('\x1Bc');
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
            return await rezeptVeraendernEinzelnMenue();
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
            
            await question("Drücke Enter um fortzufahren");
        }
    }
}

async function kiBeratungMenue() {
    console.log("Dummy: KI Beratung-Menü (noch nicht implementiert)");
}

// Funktionen für die Bearbeitung der Rezeptdetails (Logik wird gerade noch implementiert)
async function bearbeiteRezeptName(rezept, rezepte) {
    process.stdout.write('\x1Bc');
    console.log("===========Rezeptname ändern===========");
    console.log(`Aktueller Name: ${rezept.name}`);

    let neuerName = "";
    let nameIstEinzigartig = false;

    while (!nameIstEinzigartig) {
        neuerName = (await question("Gib den neuen Namen ein (oder 'abbrechen'): ")).trim();
        if (neuerName === "") {
            console.log("Der Name darf nicht leer sein!");
            continue;
        } else if (neuerName.toLowerCase() === "abbrechen") {
            console.log("Namensänderung abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
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
    process.stdout.write('\x1Bc');
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    rezept.schwierigkeitsgrad = schwierigkeitsgrade[schwierigkeitIndex - 1];
    return rezept;
}

async function bearbeiteZeitaufwand(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Zeitaufwand ändern===========");
    console.log(`Aktueller Zeitaufwand: ${rezept.zeitaufwand}`);

    let neuerZeitaufwand = "";

    while (neuerZeitaufwand === "") {
        neuerZeitaufwand = (await question("Gib den neuen Zeitaufwand ein (oder 'abbrechen'): ")).trim();
        if (neuerZeitaufwand.toLowerCase() === "abbrechen") {
            console.log("Zeitaufwandänderung abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        } else if (neuerZeitaufwand === "") {
            console.log("Der Zeitaufwand darf nicht leer sein!");
        }
    }

    rezept.zeitaufwand = neuerZeitaufwand;
    return rezept;
}

async function bearbeiteKategorien(rezept) {
    while (true) {
        process.stdout.write('\x1Bc');
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
    process.stdout.write('\x1Bc');
    console.log("===========Kategorie hinzufügen===========");
    console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);

    let neueKategorie = "";
    let kategorieIstEinzigartig = false;

    while (!kategorieIstEinzigartig) {
        neueKategorie = (await question("Gib die neue Kategorie ein (oder 'abbrechen'): ")).trim();
        if (neueKategorie === "") {
            console.log("Die Kategorie darf nicht leer sein!");
            continue;
        } else if (neueKategorie.toLowerCase() === "abbrechen") {
            console.log("Kategorie hinzufügen abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        // Prüfe, ob Kategorie bereits existiert
        const kategorieBereitsVorhanden = (rezept.kategorien || []).some(kategorie => kategorie.toLowerCase() === neueKategorie.toLowerCase());

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
    process.stdout.write('\x1Bc');
    console.log("===========Kategorie entfernen===========");
    
    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Entfernen vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    // Überprüfen, ob nur eine Kategorie vorhanden ist
    if (rezept.kategorien.length === 1) {
        console.log("Es muss mindestens eine Kategorie erhalten bleiben!");
        console.log(`Aktuelle Kategorie: ${rezept.kategorien[0]}`);
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    const entfernteKategorie = rezept.kategorien[menueSteuerung - 1];
    rezept.kategorien.splice(menueSteuerung - 1, 1);
    console.log(`Kategorie "${entfernteKategorie}" entfernt!`);
    return rezept;
}

async function kategorieUmbenennen(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Kategorie umbenennen===========");
    
    if (!rezept.kategorien || rezept.kategorien.length === 0) {
        console.log("Keine Kategorien zum Umbenennen vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    const alteKategorie = rezept.kategorien[menueSteuerung - 1];
    console.log(`\nAlte Kategorie: ${alteKategorie}`);
    
    let neueKategorie = "";
    let kategorieIstEinzigartig = false;
    
    while (!kategorieIstEinzigartig) {
        neueKategorie = (await question("Gib den neuen Namen ein (oder 'abbrechen'): ")).trim();
        if (neueKategorie === "") {
            console.log("Der Kategoriename darf nicht leer sein!");
            continue;
        } else if (neueKategorie.toLowerCase() === "abbrechen") {
            console.log("Kategorie umbenennen abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
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
    process.stdout.write('\x1Bc');
    console.log("===========Alle Kategorien ersetzen===========");
    console.log(`Aktuelle Kategorien: ${(rezept.kategorien || []).join(", ")}`);
    
    console.log("\nGib neue Kategorien ein (getrennt durch Kommas, z.B. 'Pasta, Italienisch, Vegetarisch')");
    const kategorienInput = (await question("Kategorien (oder 'abbrechen'): ")).trim();
    
    if (kategorienInput.toLowerCase() === "abbrechen") {
        console.log("Kategorien ersetzen abgebrochen.");
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }
    
    if (kategorienInput === "") {
        console.log("Mindestens eine Kategorie ist erforderlich!");
        await question("\nDrücke Enter um fortzufahren");
        return await kategorienErsetzen(rezept);
    }
    
    const neueKategorien = kategorienInput
        .split(",") //Eingabe aufteilen
        .map(kategorie => kategorie.trim()) //Leerzeichen entfernen
        .filter(kategorie => kategorie !== ""); //Leere Einträge entfernen
    
    rezept.kategorien = neueKategorien;
    console.log(`Kategorien erfolgreich aktualisiert: ${neueKategorien.join(", ")}`);
    return rezept;
}

async function bearbeiteZutaten(rezept) {
    while (true) {
        process.stdout.write('\x1Bc');
        console.log("===========Zutaten ändern===========");
        console.log("Aktuelle Zutaten:");
        (rezept.zutaten || []).forEach((zutat, index) => {
            console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
        });

        console.log(
            "\n[1] Zutat und Menge hinzufügen",
            "\n[2] Zutat löschen",
            "\n[3] Zutat verändern",
            "\n[4] Alle Zutaten neu schreiben",
            "\n[5] Zurück"
        );

        const menueSteuerung = await frageGanzzahl(1, 5, "\nWas möchtest du tun?\n");

        if (menueSteuerung === 1) {
            const bearbeitetesRezept = await zutatHinzufuegen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 2) {
            const bearbeitetesRezept = await zutatEntfernen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 3) {
            const bearbeitetesRezept = await zutatVeraendern(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 4) {
            const bearbeitetesRezept = await zutatenErsetzen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 5) {
            return null;
        }
    }
}

async function zutatHinzufuegen(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Zutat und Menge hinzufügen===========");
    console.log("Aktuelle Zutaten:");

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
        zutatName = (await question("\nName der neuen Zutat (oder 'abbrechen'): ")).trim();

        if (zutatName === "") {
            console.log("Der Name der Zutat darf nicht leer sein!");
            continue;
        }

        if (zutatName.toLowerCase() === "abbrechen") {
            console.log("Zutat hinzufügen abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        const zutatBereitsVorhanden = zutaten.some((zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase());
        if (zutatBereitsVorhanden) {
            console.log(`Die Zutat \"${zutatName}\" existiert bereits!`);
            continue;
        }

        nameIstEinzigartig = true;
    }

    let zutatMenge = "";
    while (zutatMenge === "") {
        zutatMenge = (await question("Menge der Zutat (oder 'abbrechen'): ")).trim();

        if (zutatMenge.toLowerCase() === "abbrechen") {
            console.log("Zutat hinzufügen abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        if (zutatMenge === "") {
            console.log("Die Menge darf nicht leer sein!");
        }
    }

    if (!Array.isArray(rezept.zutaten)) {
        rezept.zutaten = [];
    }

    rezept.zutaten.push({ name: zutatName, menge: zutatMenge });
    console.log(`Zutat \"${zutatName}\" hinzugefügt!`);
    return rezept;
}

async function zutatEntfernen(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Zutat löschen===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Löschen vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.zutaten.length === 1) {
        console.log("Es muss mindestens eine Zutat erhalten bleiben!");
        console.log(`Aktuelle Zutat: ${rezept.zutaten[0].name} (${rezept.zutaten[0].menge})`);
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.zutaten.splice(menueSteuerung - 1, 1);
    console.log(`Zutat \"${entfernteZutat.name}\" gelöscht!`);
    return rezept;
}

async function zutatVeraendern(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Zutat verändern===========");

    if (!Array.isArray(rezept.zutaten) || rezept.zutaten.length === 0) {
        console.log("Keine Zutaten zum Verändern vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alteZutat = rezept.zutaten[index];

    let neuerName = "";
    let nameIstEinzigartig = false;
    while (!nameIstEinzigartig) {
        neuerName = (await question(`\nNeuer Name für \"${alteZutat.name}\" (oder 'abbrechen'): `)).trim();

        if (neuerName === "") {
            console.log("Der Name der Zutat darf nicht leer sein!");
            continue;
        }

        if (neuerName.toLowerCase() === "abbrechen") {
            console.log("Zutat verändern abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
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

    let neueMenge = "";
    while (neueMenge === "") {
        neueMenge = ((await question(`Neue Menge für \"${neuerName}\" (oder 'abbrechen'): `))).trim();

        if (neueMenge.toLowerCase() === "abbrechen") {
            console.log("Zutat verändern abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        if (neueMenge === "") {
            console.log("Die Menge darf nicht leer sein!");
        }
    }

    rezept.zutaten[index] = { name: neuerName, menge: neueMenge };
    console.log(`Zutat erfolgreich geändert: ${neuerName} (${neueMenge})`);
    return rezept;
}

async function zutatenErsetzen(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Alle Zutaten neu schreiben===========");
    console.log("Aktuelle Zutaten:");
    (rezept.zutaten || []).forEach((zutat, index) => {
        console.log(`${index + 1}. ${zutat.name} (${zutat.menge})`);
    });

    console.log("\nGib neue Zutaten ein (Format: 'Name Menge, Name Menge', z.B. 'Spaghetti 400g, Knoblauch 4 Zehen')");
    const zutatenInput = (await question("Zutaten (oder 'abbrechen'): ")).trim();

    if (zutatenInput.toLowerCase() === "abbrechen") {
        console.log("Zutaten ersetzen abgebrochen.");
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (zutatenInput === "") {
        console.log("Mindestens eine Zutat ist erforderlich!");
        await question("\nDrücke Enter um fortzufahren");
        return await zutatenErsetzen(rezept);
    }

    const neueZutaten = zutatenInput
        .split(",")
        .map((zutatPaar) => {
            const parts = zutatPaar.trim().split(/\s+(.+)/);
            return {
                name: parts[0],
                menge: parts[1] || ""
            };
        })
        .filter((zutat) => zutat.name !== "" && zutat.menge !== "");

    if (neueZutaten.length === 0) {
        console.log("Keine gültigen Zutaten eingegeben!");
        await question("\nDrücke Enter um fortzufahren");
        return await zutatenErsetzen(rezept);
    }

    rezept.zutaten = neueZutaten;
    console.log(`Zutaten erfolgreich aktualisiert: ${neueZutaten.map((z) => `${z.name} (${z.menge})`).join(", ")}`);
    return rezept;
}

async function bearbeiteArbeitsschritte(rezept) {
    while (true) {
        process.stdout.write('\x1Bc');
        console.log("===========Arbeitsschritte ändern===========");
        console.log("Aktuelle Arbeitsschritte:");
        (rezept.arbeitsschritte || []).forEach((schritt, index) => {
            console.log(`${index + 1}. ${schritt}`);
        });

        console.log(
            "\n[1] Arbeitsschritt hinzufügen",
            "\n[2] Arbeitsschritt löschen",
            "\n[3] Arbeitsschritt verändern",
            "\n[4] Alle Arbeitsschritte neu schreiben",
            "\n[5] Zurück"
        );

        const menueSteuerung = await frageGanzzahl(1, 5, "\nWas möchtest du tun?\n");

        if (menueSteuerung === 1) {
            const bearbeitetesRezept = await arbeitsschrittHinzufuegen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 2) {
            const bearbeitetesRezept = await arbeitsschrittEntfernen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 3) {
            const bearbeitetesRezept = await arbeitsschrittVeraendern(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 4) {
            const bearbeitetesRezept = await arbeitsschritteErsetzen(rezept);
            if (bearbeitetesRezept !== null) {
                rezept = bearbeitetesRezept;
                return rezept;
            }
        } else if (menueSteuerung === 5) {
            return null;
        }
    }
}

async function arbeitsschrittHinzufuegen(rezept) {
    process.stdout.write('\x1Bc');
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    let neuerArbeitsschritt = "";
    while (neuerArbeitsschritt === "") {
        neuerArbeitsschritt = (await question("\nNeuen Arbeitsschritt eingeben (oder 'abbrechen'): ")).trim();

        if (neuerArbeitsschritt.toLowerCase() === "abbrechen") {
            console.log("Arbeitsschritt hinzufügen abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        if (neuerArbeitsschritt === "") {
            console.log("Der Arbeitsschritt darf nicht leer sein!");
        }
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
    process.stdout.write('\x1Bc');
    console.log("===========Arbeitsschritt löschen===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Löschen vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    if (rezept.arbeitsschritte.length === 1) {
        console.log("Es muss mindestens ein Arbeitsschritt erhalten bleiben!");
        console.log(`Aktueller Arbeitsschritt: ${rezept.arbeitsschritte[0]}`);
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    rezept.arbeitsschritte.splice(menueSteuerung - 1, 1);
    console.log(`Arbeitsschritt \"${entfernterSchritt}\" gelöscht!`);
    return rezept;
}

async function arbeitsschrittVeraendern(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Arbeitsschritt verändern===========");

    if (!Array.isArray(rezept.arbeitsschritte) || rezept.arbeitsschritte.length === 0) {
        console.log("Keine Arbeitsschritte zum Verändern vorhanden.");
        await question("\nDrücke Enter um fortzufahren");
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
        await question("\nDrücke Enter um fortzufahren");
        return null;
    }

    const index = menueSteuerung - 1;
    const alterSchritt = rezept.arbeitsschritte[index];
    console.log(`\nAlter Arbeitsschritt: ${alterSchritt}`);

    let neuerArbeitsschritt = "";
    while (neuerArbeitsschritt === "") {
        neuerArbeitsschritt = (await question("Neuer Arbeitsschritt (oder 'abbrechen'): ")).trim();

        if (neuerArbeitsschritt.toLowerCase() === "abbrechen") {
            console.log("Arbeitsschritt verändern abgebrochen.");
            await question("\nDrücke Enter um fortzufahren");
            return null;
        }

        if (neuerArbeitsschritt === "") {
            console.log("Der Arbeitsschritt darf nicht leer sein!");
        }
    }

    rezept.arbeitsschritte[index] = neuerArbeitsschritt;
    console.log(`Arbeitsschritt erfolgreich geändert zu: ${neuerArbeitsschritt}`);
    return rezept;
}

async function arbeitsschritteErsetzen(rezept) {
    process.stdout.write('\x1Bc');
    console.log("===========Alle Arbeitsschritte neu schreiben===========");
    console.log("Aktuelle Arbeitsschritte:");
    (rezept.arbeitsschritte || []).forEach((schritt, index) => {
        console.log(`${index + 1}. ${schritt}`);
    });

    console.log("\nGib neue Arbeitsschritte ein (gib 'fertig' ein, um zu stoppen):");
    const neueArbeitsschritte = [];
    let schrittIndex = 1;

    while (true) {
        let schritt = "";
        while (schritt === "") {
            schritt = (await question(`Schritt ${schrittIndex} (oder 'fertig'): `)).trim();
            if (schritt.toLowerCase() === "abbrechen") {
                console.log("Arbeitsschritte ersetzen abgebrochen.");
                await question("\nDrücke Enter um fortzufahren");
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
    process.stdout.write('\x1Bc');
    console.log(`===========${titel}===========`);

    // Kategorie ohne Treffer behandeln
    if (!rezepte || rezepte.length === 0) {
        console.log("Keine Rezepte in dieser Kategorie gefunden");
        await question("Drücke Enter um zur Kategorieauswahl zurückzukehren");
        return await rezeptAuswahlMenue();
    }

    rezepte.forEach((rezept, index) => {
        console.log(`[${index + 1}] ${rezept.name}`);
    });
    console.log(`[${rezepte.length + 1}] Zurück`);

    // Rezeptauswahl mit Rücksprung
    const menueSteuerung = await frageGanzzahl(1, rezepte.length + 1, "\nWähle ein Rezept:\n");
    if (menueSteuerung === rezepte.length + 1) {
        return await rezeptAuswahlMenue();
    }

    const rezept = rezepte[menueSteuerung - 1];
    zeigeRezeptDetails(rezept);
    await question("\nDrücke Enter um zur Rezeptliste zurückzukehren");
    return await rezeptListeMenue(rezepte, titel);
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








