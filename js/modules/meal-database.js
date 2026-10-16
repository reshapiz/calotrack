class MealDatabase {
    constructor() {
        this.loadingPromise = null;
        this.initDefaultData();
    }

    initDefaultData() {
        this.meals = {
            breakfast: [
                {
                    id: "breakfast_001",
                    name: "Овсянка с ягодами",
                    image: "img/meals/breakfast/oatmeal-berries.jpg",
                    calories: 350,
                    protein: 12,
                    fat: 8,
                    carbs: 58,
                    fiber: 6,
                    ingredients: ["овсяные хлопья 50г", "ягоды 100г", "мед 10г"],
                    preparationTime: 10,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "breakfast_002",
                    name: "Омлет с овощами",
                    image: "img/meals/breakfast/omelette-veggies.jpg",
                    calories: 420,
                    protein: 28,
                    fat: 24,
                    carbs: 12,
                    fiber: 3,
                    ingredients: ["яйца 3 шт", "помидор 1 шт", "перец 1/2 шт", "сыр 30г"],
                    preparationTime: 15,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                },
                {
                    id: "breakfast_003",
                    name: "Творог с ягодами",
                    image: "img/meals/breakfast/cottage-cheese-berries.jpg",
                    calories: 350,
                    protein: 32,
                    fat: 12,
                    carbs: 28,
                    fiber: 5,
                    ingredients: ["творог 5% 200г", "ягоды 100г", "грецкие орехи 15г"],
                    preparationTime: 5,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                }
            ],
            lunch: [
                {
                    id: "lunch_001",
                    name: "Куриная грудка с киноа",
                    image: "img/meals/lunch/chicken-broccoli-quinoa.jpg",
                    calories: 520,
                    protein: 45,
                    fat: 18,
                    carbs: 48,
                    fiber: 8,
                    ingredients: ["куриная грудка 150г", "киноа 80г", "брокколи 150г", "масло 10г"],
                    preparationTime: 35,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "lunch_002",
                    name: "Рыба с рисом",
                    image: "img/meals/lunch/fish-rice-veggies.jpg",
                    calories: 540,
                    protein: 38,
                    fat: 16,
                    carbs: 58,
                    fiber: 6,
                    ingredients: ["филе рыбы 150г", "рис бурый 70g", "овощи 200г"],
                    preparationTime: 40,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "lunch_003",
                    name: "Салат с тунцом",
                    image: "img/meals/lunch/tuna-avocado-salad.jpg",
                    calories: 450,
                    protein: 32,
                    fat: 28,
                    carbs: 18,
                    fiber: 9,
                    ingredients: ["тунец 100г", "авокадо 1/2 шт", "листья салата 100g", "помидоры 100g"],
                    preparationTime: 15,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                }
            ],
            dinner: [
                {
                    id: "dinner_001",
                    name: "Семга с овощами",
                    image: "img/meals/dinner/salmon-veggies.jpg",
                    calories: 460,
                    protein: 42,
                    fat: 28,
                    carbs: 14,
                    fiber: 5,
                    ingredients: ["семга 150г", "спаржа 100г", "брокколи 100г"],
                    preparationTime: 25,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                },
                {
                    id: "dinner_002",
                    name: "Куриный салат",
                    image: "img/meals/dinner/chicken-yogurt-salad.jpg",
                    calories: 380,
                    protein: 38,
                    fat: 16,
                    carbs: 18,
                    fiber: 6,
                    ingredients: ["куриная грудка 120г", "греческий йогурт 100г", "огурцы 100г", "помидоры 100г"],
                    preparationTime: 20,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                }
            ],
            snack: [
                {
                    id: "snack_001",
                    name: "Греческий йогурт",
                    image: "img/meals/snacks/greek-yogurt-berries.jpg",
                    calories: 150,
                    protein: 12,
                    fat: 5,
                    carbs: 14,
                    fiber: 2,
                    ingredients: ["греческий йогурт 120г", "ягоды 80г"],
                    preparationTime: 3,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 1.0 },
                        overweight: { recommended: true, portionMultiplier: 1.0 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "snack_002",
                    name: "Яблоко с миндалем",
                    image: "img/meals/snacks/apple-almonds.jpg",
                    calories: 180,
                    protein: 4,
                    fat: 12,
                    carbs: 18,
                    fiber: 4,
                    ingredients: ["яблоко 1 шт", "миндаль 20г"],
                    preparationTime: 2,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                }
            ]
        };
        
        this.categories = {
            categories: {
                breakfast: { name: 'Завтрак', caloriePercent: 30, icon: '' },
                lunch: { name: 'Обед', caloriePercent: 35, icon: '' },
                dinner: { name: 'Ужин', caloriePercent: 25, icon: '' },
                snack: { name: 'Перекус', caloriePercent: 10, icon: '' }
            }
        };
    }

    async init() {
        if (!this.loadingPromise) {
            this.loadingPromise = this.loadDatabase();
        }
        return this.loadingPromise;
    }

    async loadDatabase() {
        try {
            const response = await fetch('data/meals.json');
            if (response.ok) {
                const data = await response.json();
                for (const category of this.getAllCategories()) {
                    if (Array.isArray(data[category])) {
                        this.meals[category] = data[category];
                    }
                }
            }

            const categoriesResponse = await fetch('data/categories.json');
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                if (categoriesData.categories) {
                    this.categories = categoriesData;
                }
            }
        } catch (error) {
            console.warn('Не удалось загрузить базу блюд, используется встроенная', error);
        }
    }

    getMealsByCategoryWithGoal(category, healthProfile, goal) {
        const mealsArray = this.meals[category] || [];

        if (goal === 'gain') {
            return [...mealsArray].sort((a, b) => b.calories - a.calories);
        }

        return mealsArray.filter((meal) => {
            const profile = meal.healthProfiles?.[healthProfile];
            if (goal === 'lose') {
                return Boolean(profile) && profile.recommended !== false;
            }
            return profile ? profile.recommended !== false : true;
        });
    }

    getAllCategories() {
        return ['breakfast', 'lunch', 'dinner', 'snack'];
    }

    getCategoryInfo(category) {
        return this.categories.categories[category] || { name: category, caloriePercent: 25 };
    }
}
