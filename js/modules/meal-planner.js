const MIN_PORTION = 0.7;
const MAX_PORTION = 1.5;
const PORTION_NOTE_PATTERN = /^(Уменьшить|Увеличить|Добавить|Ограничить|Использовать|Творог|Мед|На воде)/;

class MealPlanner {
    constructor(database) {
        this.database = database;
    }

    getHealthProfile(bmi) {
        if (bmi >= 30) return 'obesity';
        if (bmi >= 25) return 'overweight';
        if (bmi >= 18.5) return 'normal';
        return 'underweight';
    }

    getMealMultiplier(meal, targetCalories) {
        const exact = targetCalories / meal.calories;
        const clamped = Math.min(Math.max(exact, MIN_PORTION), MAX_PORTION);
        return Math.round(clamped * 20) / 20;
    }

    getProfileNote(meal, healthProfile) {
        const note = meal.healthProfiles?.[healthProfile]?.note;
        if (!note || PORTION_NOTE_PATTERN.test(note)) return null;
        return note;
    }

    selectBestMeal(meals, targetCalories, goal = 'maintain') {
        if (!meals || meals.length === 0) return null;
        
        if (goal === 'gain') {
            const reasonable = meals.filter(meal => meal.calories <= targetCalories * 1.3);
            
            if (reasonable.length > 0) {
                return reasonable.reduce((best, current) => {
                    const currentDiff = Math.abs(current.calories - targetCalories);
                    const bestDiff = Math.abs(best.calories - targetCalories);
                    return currentDiff < bestDiff ? current : best;
                });
            }
            
            return meals.reduce((best, current) => {
                const currentDiff = Math.abs(current.calories - targetCalories);
                const bestDiff = Math.abs(best.calories - targetCalories);
                return currentDiff < bestDiff ? current : best;
            });
        }
        
        return meals.reduce((best, current) => {
            const currentDiff = Math.abs(current.calories - targetCalories);
            const bestDiff = Math.abs(best.calories - targetCalories);
            return currentDiff < bestDiff ? current : best;
        });
    }

    generateDailyMenu(calories, bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        const categories = this.database.getAllCategories();
        const menu = {
            healthProfile,
            bmi,
            goal,
            totalCalories: calories,
            generatedAt: new Date().toISOString(),
            advice: this.getNutritionAdvice(bmi, goal),
            meals: {}
        };
        
        let totalGeneratedCalories = 0;
        
        for (const category of categories) {
            const categoryInfo = this.database.getCategoryInfo(category);
            const targetCategoryCalories = calories * (categoryInfo.caloriePercent / 100);
            
            const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
            
            if (meals && meals.length > 0) {
                const selectedMeal = this.selectBestMeal(meals, targetCategoryCalories, goal);
                
                if (selectedMeal) {
                    const multiplier = this.getMealMultiplier(selectedMeal, targetCategoryCalories);
                    const adjustedCalories = Math.round(selectedMeal.calories * multiplier);
                    
                    menu.meals[category] = {
                        ...selectedMeal,
                        originalCalories: selectedMeal.calories,
                        adjustedCalories,
                        multiplier,
                        note: this.getProfileNote(selectedMeal, healthProfile)
                    };
                    
                    totalGeneratedCalories += adjustedCalories;
                } else {
                    menu.meals[category] = null;
                }
            } else {
                menu.meals[category] = null;
            }
        }
        
        menu.generatedCalories = Math.round(totalGeneratedCalories);
        menu.calorieDifference = Math.round(menu.generatedCalories - calories);
        
        return menu;
    }

    generateAlternative(category, currentMealId, calories, bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
        const categoryInfo = this.database.getCategoryInfo(category);
        const targetCalories = calories * (categoryInfo.caloriePercent / 100);
        
        const alternativeMeals = meals.filter(meal => meal.id !== currentMealId);
        if (alternativeMeals.length === 0) return null;
        
        const closestMeals = [...alternativeMeals]
            .sort((a, b) => Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories))
            .slice(0, 3);
        const selectedMeal = closestMeals[Math.floor(Math.random() * closestMeals.length)];
        
        const multiplier = this.getMealMultiplier(selectedMeal, targetCalories);
        
        return {
            ...selectedMeal,
            originalCalories: selectedMeal.calories,
            adjustedCalories: Math.round(selectedMeal.calories * multiplier),
            multiplier,
            note: this.getProfileNote(selectedMeal, healthProfile)
        };
    }

    getNutritionAdvice(bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        
        const advice = {
            obesity: {
                lose: [
                    'Сократите порции на 20-30%',
                    'Увеличьте потребление белка (2-2.2г/кг веса)',
                    'Исключите простые углеводы и сахар',
                    'Ешьте больше клетчатки (овощи, зелень)'
                ],
                maintain: ['Для поддержания веса необходим строгий контроль калорий'],
                gain: ['Набор массы при ожирении не рекомендуется']
            },
            overweight: {
                lose: [
                    'Создайте дефицит калорий 300-500 ккал/день',
                    'Увеличьте физическую активность',
                    'Контролируйте размер порций'
                ],
                maintain: [
                    'Поддерживайте текущий уровень активности',
                    'Контролируйте калорийность рациона'
                ],
                gain: [
                    'Набор массы требует интенсивных тренировок',
                    'Увеличьте потребление белка до 2г/кг веса',
                    'Добавьте калорийные перекусы'
                ]
            },
            normal: {
                lose: [
                    'Небольшой дефицит 200-300 ккал',
                    'Увеличьте белковую составляющую'
                ],
                maintain: [
                    'Соблюдайте баланс БЖУ',
                    'Контролируйте калорийность'
                ],
                gain: [
                    'Профицит 300-400 ккал',
                    'Увеличьте порции сложных углеводов',
                    'Добавьте калорийные перекусы'
                ]
            },
            underweight: {
                lose: ['Похудение при дефиците веса не рекомендуется'],
                maintain: ['Требуется набор массы до нормальных показателей'],
                gain: [
                    'Увеличьте калорийность на 500-700 ккал',
                    'Ешьте чаще (5-6 раз в день)',
                    'Добавьте полезные жиры (орехи, авокадо)'
                ]
            }
        };
        
        return advice[healthProfile]?.[goal] || ['Следуйте сбалансированному питанию'];
    }
}
