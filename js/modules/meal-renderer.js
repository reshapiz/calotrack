const MEAL_ORDER = [
    { id: 'breakfast', name: 'Завтрак' },
    { id: 'lunch', name: 'Обед' },
    { id: 'snack', name: 'Перекус' },
    { id: 'dinner', name: 'Ужин' }
];

class MealRenderer {
    constructor() {
        this.currentMenu = null;
    }

    renderMenu(menuData) {
        this.currentMenu = menuData;

        const container = document.getElementById('meal-content');
        if (!container) return;

        if (!menuData?.meals) {
            container.innerHTML = '<p class="meal-empty">Не удалось составить меню. Попробуйте ещё раз.</p>';
            return;
        }

        this.updateTotals();

        container.innerHTML = `
            ${this.renderSummary()}
            <ol class="meal-day">
                ${MEAL_ORDER.map((slot) => this.renderSlot(slot)).join('')}
            </ol>
            ${this.renderAdvice()}
            <div class="meal-actions">
                <button class="button button-dark" type="button" id="save-menu">Сохранить меню</button>
            </div>
        `;

        this.setupListeners(container);
    }

    updateTotals() {
        const meals = Object.values(this.currentMenu.meals).filter(Boolean);
        this.currentMenu.generatedCalories = meals.reduce((sum, meal) => sum + meal.adjustedCalories, 0);
        this.currentMenu.calorieDifference = this.currentMenu.generatedCalories - this.currentMenu.totalCalories;
    }

    renderSummary() {
        const { generatedCalories, totalCalories, calorieDifference } = this.currentMenu;
        const differenceText = calorieDifference === 0
            ? 'точно по норме'
            : `на ${formatNumber(Math.abs(calorieDifference))} ккал ${calorieDifference > 0 ? 'больше' : 'меньше'} нормы`;

        return `
            <p class="meal-summary">
                <strong>${formatNumber(generatedCalories)} ккал</strong> из ${formatNumber(totalCalories)}, ${differenceText}
            </p>
        `;
    }

    renderAdvice() {
        const advice = this.currentMenu.advice || [];
        if (advice.length === 0) return '';

        return `
            <div class="meal-advice">
                <h3>Что ещё учесть</h3>
                <ul>${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            </div>
        `;
    }

    renderSlot(slot) {
        const meal = this.currentMenu.meals[slot.id];

        if (!meal) {
            return `
                <li class="meal-card meal-card-empty">
                    <p class="meal-slot-name">${slot.name}</p>
                    <p class="meal-empty">Нет подходящих блюд</p>
                </li>
            `;
        }

        const multiplier = meal.multiplier || 1;
        const portion = multiplier !== 1 ? `, порция ${Math.round(multiplier * 100)} %` : '';
        const ingredients = (meal.ingredients || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

        return `
            <li class="meal-card">
                ${this.renderMealImage(meal)}
                <div class="meal-card-body">
                    <p class="meal-slot-name">${slot.name}</p>
                    <h3>${escapeHtml(meal.name)}</h3>
                    <p class="meal-kcal"><strong>${formatNumber(meal.adjustedCalories)} ккал</strong>${portion}</p>
                    ${renderMacroPills({
                        protein: Math.round(meal.protein * multiplier),
                        fat: Math.round(meal.fat * multiplier),
                        carbs: Math.round(meal.carbs * multiplier)
                    }, 'macro-pills-small')}
                    <div class="meal-buttons">
                        <details class="meal-recipe">
                            <summary>Рецепт</summary>
                            <ul>${ingredients}</ul>
                            ${multiplier !== 1 ? `<p>Граммы указаны для обычной порции, ваша — ${Math.round(multiplier * 100)} % от неё.</p>` : ''}
                            ${meal.note ? `<p>${escapeHtml(meal.note)}</p>` : ''}
                            <p>${meal.preparationTime || 15} минут, ${(meal.difficulty || 'легко').toLowerCase()}</p>
                        </details>
                        <button class="meal-replace" type="button" data-category="${slot.id}">Заменить</button>
                    </div>
                </div>
            </li>
        `;
    }

    renderMealImage(meal) {
        if (meal.image) {
            return `<img src="${escapeHtml(meal.image)}" alt="" class="meal-image" loading="lazy">`;
        }
        return '<div class="meal-image meal-image-placeholder" aria-hidden="true"></div>';
    }

    setupListeners(container) {
        container.querySelectorAll('img.meal-image').forEach((image) => {
            image.addEventListener('error', () => {
                const placeholder = document.createElement('div');
                placeholder.className = 'meal-image meal-image-placeholder';
                image.replaceWith(placeholder);
            });
        });

        container.querySelectorAll('.meal-replace').forEach((button) => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                document.dispatchEvent(new CustomEvent('requestMealRefresh', {
                    detail: { category, currentMealId: this.currentMenu.meals[category]?.id }
                }));
            });
        });

        container.querySelector('#save-menu').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('saveMenu', { detail: { menu: this.currentMenu } }));
        });
    }

    updateCategory(category, newMeal) {
        if (!this.currentMenu?.meals) return;

        this.currentMenu.meals[category] = newMeal;
        this.renderMenu(this.currentMenu);
        document.querySelector(`.meal-replace[data-category="${category}"]`)?.focus();
    }
}
