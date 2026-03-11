describe('rezeptFelderBearbeitung - Validierungen', () => {
    describe('Rezept Name Validierung', () => {
        test('should detect duplicate recipe names (case-insensitive)', () => {
            const rezepte = [
                { id: 1, name: 'Spaghetti' },
                { id: 2, name: 'Salat' }
            ];
            const aktuellesRezept = rezepte[0];
            const neuerName = 'salat'; // Different case

            // Validierungslogik
            const nameBereitsVorhanden = rezepte.some((vorhandenesRezept) => {
                const istAktuellesRezept = vorhandenesRezept === aktuellesRezept || vorhandenesRezept.id === aktuellesRezept.id;
                return !istAktuellesRezept && vorhandenesRezept.name.toLowerCase() === neuerName.toLowerCase();
            });

            expect(nameBereitsVorhanden).toBe(true);
        });

        test('should not detect duplicate when renaming to own name', () => {
            const rezepte = [
                { id: 1, name: 'Spaghetti' },
                { id: 2, name: 'Salat' }
            ];
            const aktuellesRezept = rezepte[0];
            const neuerName = 'Spaghetti'; // Own name

            const nameBereitsVorhanden = rezepte.some((vorhandenesRezept) => {
                const istAktuellesRezept = vorhandenesRezept === aktuellesRezept || vorhandenesRezept.id === aktuellesRezept.id;
                return !istAktuellesRezept && vorhandenesRezept.name.toLowerCase() === neuerName.toLowerCase();
            });

            expect(nameBereitsVorhanden).toBe(false);
        });

        test('should allow new unique name', () => {
            const rezepte = [
                { id: 1, name: 'Spaghetti' },
                { id: 2, name: 'Salat' }
            ];
            const aktuellesRezept = rezepte[0];
            const neuerName = 'Pizza';

            const nameBereitsVorhanden = rezepte.some((vorhandenesRezept) => {
                const istAktuellesRezept = vorhandenesRezept === aktuellesRezept || vorhandenesRezept.id === aktuellesRezept.id;
                return !istAktuellesRezept && vorhandenesRezept.name.toLowerCase() === neuerName.toLowerCase();
            });

            expect(nameBereitsVorhanden).toBe(false);
        });
    });
});
