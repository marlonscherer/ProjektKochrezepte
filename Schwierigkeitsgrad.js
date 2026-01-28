import { question } from "readline-sync";
const difficulty = question("Bitte wähle einen Schwierigkeitsgrad (leicht/mittel/schwer): ");

if (difficulty.toLowerCase() === "leicht") {
  console.log("Du hast den leichten Schwierigkeitsgrad gewählt.");
} else if (difficulty.toLowerCase() === "mittel") {
  console.log("Du hast den mittleren Schwierigkeitsgrad gewählt.");
} else if (difficulty.toLowerCase() === "schwer") {
  console.log("Du hast den schweren Schwierigkeitsgrad gewählt.");
} else {
  console.log("Ungültige Eingabe. Bitte wähle zwischen leicht, mittel oder schwer.");
}