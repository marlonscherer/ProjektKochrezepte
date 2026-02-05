import { question } from "readline-sync";


const recipeChoice = question("Möchtest du das Rezept für Sushi Maki Rollen sehen? (ja/nein): ");

if (recipeChoice.toLowerCase() === "ja") {
    console.log("Hier ist das Rezept für Sushi Maki Rollen:");
    console.log("Zutaten:");
    console.log("- 2 Tassen Sushi-Reis");
    console.log("- 2 1/2 Tassen Wasser");
    console.log("- 1/4 Tasse Reisessig");
    console.log("- 1 EL Zucker");
    console.log("- 1 TL Salz");
    console.log("- Nori-Blätter");
    console.log("- Füllungen nach Wahl (z.B. Gurke, Avocado, Lachs, Thunfisch)");
    console.log("- Sojasauce, Wasabi und eingelegter Ingwer zum Servieren");

    console.log("\nAnleitung:");
    console.log("\n1. Den Sushi-Reis gründlich waschen, bis das Wasser klar ist.");
    console.log("\n2. Den Reis mit Wasser in einem Topf zum Kochen bringen, dann die Hitze reduzieren und zugedeckt etwa 15 Minuten köcheln lassen, bis der Reis weich ist.");
    console.log("\n3. In einer kleinen Schüssel Reisessig, Zucker und Salz vermischen, bis sich der Zucker aufgelöst hat.");
    console.log("\n4. Den gekochten Reis in eine große Schüssel geben und die Essigmischung gleichmäßig darüber verteilen. Den Reis vorsichtig mit einem Holzlöffel mischen und abkühlen lassen.");
    console.log("\n5. Ein Nori-Blatt auf eine Bambusmatte legen, eine dünne Schicht Reis darauf verteilen, dabei am oberen Rand einen kleinen Rand frei lassen.");
    console.log("\n6. Die gewünschten Füllungen in einer Linie auf den Reis legen.");
    console.log("\n7. Mit Hilfe der Bambusmatte das Nori-Blatt fest aufrollen, dabei die Füllungen einschließen.");
    console.log("\n8. Die Rolle mit einem scharfen Messer in mundgerechte Stücke schneiden.");
    console.log("\n9. Mit Sojasauce, Wasabi und eingelegtem Ingwer servieren und genießen!");
}