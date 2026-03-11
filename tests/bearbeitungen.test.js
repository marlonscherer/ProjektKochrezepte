describe('zutatenBearbeitung - Validierungen', () => {
    describe('Zutat Duplikat Erkennung', () => {
        test('should detect duplicate ingredients (case-insensitive)', () => {
            const zutaten = [
                { name: 'Spaghetti', menge: '400g' },
                { name: 'Tomaten', menge: '500g' }
            ];
            const zutatName = 'tomaten';

            const zutatBereitsVorhanden = zutaten.some(
                (zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase()
            );

            expect(zutatBereitsVorhanden).toBe(true);
        });

        test('should allow new unique ingredient', () => {
            const zutaten = [
                { name: 'Spaghetti', menge: '400g' },
                { name: 'Tomaten', menge: '500g' }
            ];
            const zutatName = 'Basilikum';

            const zutatBereitsVorhanden = zutaten.some(
                (zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase()
            );

            expect(zutatBereitsVorhanden).toBe(false);
        });

        test('should handle empty ingredients list', () => {
            const zutaten = [];
            const zutatName = 'Spaghetti';

            const zutatBereitsVorhanden = zutaten.some(
                (zutat) => zutat.name.toLowerCase() === zutatName.toLowerCase()
            );

            expect(zutatBereitsVorhanden).toBe(false);
        });
    });

    describe('Zutat Array Initialisierung', () => {
        test('should initialize empty zutaten array if missing', () => {
            const rezept = {};

            if (!Array.isArray(rezept.zutaten)) {
                rezept.zutaten = [];
            }

            expect(Array.isArray(rezept.zutaten)).toBe(true);
            expect(rezept.zutaten).toHaveLength(0);
        });

        test('should preserve existing zutaten array', () => {
            const existingZutaten = [{ name: 'Spaghetti', menge: '400g' }];
            const rezept = { zutaten: existingZutaten };

            if (!Array.isArray(rezept.zutaten)) {
                rezept.zutaten = [];
            }

            expect(rezept.zutaten).toBe(existingZutaten);
        });
    });

    describe('Zutat Hinzufügen', () => {
        test('should add new ingredient with name and amount', () => {
            const rezept = { zutaten: [{ name: 'Spaghetti', menge: '400g' }] };
            const neueZutat = { name: 'Tomaten', menge: '500g' };

            rezept.zutaten.push(neueZutat);

            expect(rezept.zutaten).toHaveLength(2);
            expect(rezept.zutaten[1]).toEqual(neueZutat);
        });

        test('should handle adding to empty zutaten array', () => {
            const rezept = { zutaten: [] };
            const neueZutat = { name: 'Spaghetti', menge: '400g' };

            rezept.zutaten.push(neueZutat);

            expect(rezept.zutaten).toHaveLength(1);
            expect(rezept.zutaten[0]).toEqual(neueZutat);
        });
    });

    describe('Mindestanzahl Zutaten Validierung', () => {
        test('should prevent deletion when only one ingredient remains', () => {
            const rezept = { zutaten: [{ name: 'Spaghetti', menge: '400g' }] };

            const kangelöschenWerden = rezept.zutaten.length > 1;

            expect(kangelöschenWerden).toBe(false);
        });

        test('should allow deletion when multiple ingredients exist', () => {
            const rezept = {
                zutaten: [
                    { name: 'Spaghetti', menge: '400g' },
                    { name: 'Tomaten', menge: '500g' }
                ]
            };

            const kannGelöschenWerden = rezept.zutaten.length > 1;

            expect(kannGelöschenWerden).toBe(true);
        });
    });
});

describe('kategorienBearbeitung - Validierungen', () => {
    describe('Kategorie Duplikat Erkennung', () => {
        test('should detect duplicate categories (case-insensitive)', () => {
            const kategorien = ['Pasta', 'Vegetarisch', 'Salat'];
            const newKategorie = 'pasta';

            const kategorieBereitsVorhanden = kategorien.some(
                (kategorie) => kategorie.toLowerCase() === newKategorie.toLowerCase()
            );

            expect(kategorieBereitsVorhanden).toBe(true);
        });

        test('should allow new unique category', () => {
            const kategorien = ['Pasta', 'Vegetarisch'];
            const newKategorie = 'Vegan';

            const kategorieBereitsVorhanden = kategorien.some(
                (kategorie) => kategorie.toLowerCase() === newKategorie.toLowerCase()
            );

            expect(kategorieBereitsVorhanden).toBe(false);
        });
    });

    describe('Kategorie Array Initialisierung', () => {
        test('should initialize empty kategorien array if missing', () => {
            const rezept = {};

            if (!Array.isArray(rezept.kategorien)) {
                rezept.kategorien = [];
            }

            expect(Array.isArray(rezept.kategorien)).toBe(true);
            expect(rezept.kategorien).toHaveLength(0);
        });
    });

    describe('Mindestanzahl Kategorien Validierung', () => {
        test('should prevent deletion when only one category remains', () => {
            const rezept = { kategorien: ['Pasta'] };

            const kannGelöschenWerden = rezept.kategorien.length > 1;

            expect(kannGelöschenWerden).toBe(false);
        });

        test('should allow deletion when multiple categories exist', () => {
            const rezept = { kategorien: ['Pasta', 'Vegetarisch'] };

            const kannGelöschenWerden = rezept.kategorien.length > 1;

            expect(kannGelöschenWerden).toBe(true);
        });
    });
});

describe('arbeitsschritteBearbeitung - Validierungen', () => {
    describe('Arbeitsschritt Mindestanzahl', () => {
        test('should prevent deletion when only one step remains', () => {
            const rezept = { arbeitsschritte: ['Wasser kochen'] };

            const kannGelöschenWerden = rezept.arbeitsschritte.length > 1;

            expect(kannGelöschenWerden).toBe(false);
        });

        test('should allow deletion when multiple steps exist', () => {
            const rezept = {
                arbeitsschritte: ['Wasser kochen', 'Nudeln hinzufügen', 'Servieren']
            };

            const kannGelöschenWerden = rezept.arbeitsschritte.length > 1;

            expect(kannGelöschenWerden).toBe(true);
        });
    });

    describe('Arbeitsschritt Einfügen an Position', () => {
        test('should insert step at the beginning', () => {
            const arbeitsschritte = ['Schritt 2', 'Schritt 3'];
            const neuerSchritt = 'Schritt 1';
            const position = 0;

            arbeitsschritte.splice(position, 0, neuerSchritt);

            expect(arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2', 'Schritt 3']);
        });

        test('should insert step in the middle', () => {
            const arbeitsschritte = ['Schritt 1', 'Schritt 3'];
            const neuerSchritt = 'Schritt 2';
            const position = 1;

            arbeitsschritte.splice(position, 0, neuerSchritt);

            expect(arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2', 'Schritt 3']);
        });

        test('should append step at the end', () => {
            const arbeitsschritte = ['Schritt 1', 'Schritt 2'];
            const neuerSchritt = 'Schritt 3';
            const position = arbeitsschritte.length;

            arbeitsschritte.splice(position, 0, neuerSchritt);

            expect(arbeitsschritte).toEqual(['Schritt 1', 'Schritt 2', 'Schritt 3']);
        });
    });
});
