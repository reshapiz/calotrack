document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('history-list');
    const historySummary = document.getElementById('history-summary');
    const clearBtn = document.getElementById('clear-history');
    const savedList = document.getElementById('saved-menus');
    const mascotElement = document.getElementById('history-mascot');
    const mascot = new Mascot(mascotElement);

    renderHistory();
    renderSavedMenus();

    function renderHistory() {
        const history = readStorage(STORAGE_KEYS.history, []);
        clearBtn.hidden = history.length === 0;

        mascotElement.hidden = history.length > 0;
        if (history.length === 0) {
            historySummary.textContent = '';
            historyList.innerHTML = '';
            mascot.say('Тут пока пусто. Посчитайте норму в калькуляторе — я запишу её сюда, и можно будет следить, как она меняется.', 'think');
            return;
        }

        historySummary.textContent = buildSummary(history);
        historyList.innerHTML = history.map(renderEntry).join('');
    }

    function buildSummary(history) {
        const latest = history[0];
        const oldest = history[history.length - 1];
        const count = countWithWord(history.length, ['расчёт', 'расчёта', 'расчётов']);

        if (history.length < 2 || latest.calories === oldest.calories) {
            return `${count}. Последняя норма — ${formatNumber(latest.calories)} ккал.`;
        }

        const difference = latest.calories - oldest.calories;
        const direction = difference > 0 ? 'выросла' : 'снизилась';
        return `${count}. С первого расчёта норма ${direction} на ${formatNumber(Math.abs(difference))} ккал — до ${formatNumber(latest.calories)} ккал.`;
    }

    function renderEntry(entry) {
        const goal = GOAL_NAMES[entry.goal];
        const details = [goal, entry.weight ? `${formatNumber(entry.weight, 1)} кг` : null].filter(Boolean).join(', ');

        return `
            <li class="history-entry">
                <p class="history-date">
                    ${formatDateTime(parseStoredDate(entry.date))}
                    ${details ? `<small>${details}</small>` : ''}
                </p>
                <p class="history-kcal">${formatNumber(entry.calories)} <small>ккал</small></p>
                <div class="history-macros">
                    ${renderMacroPills({ protein: entry.proteinGrams, fat: entry.fatGrams, carbs: entry.carbGrams }, 'macro-pills-small')}
                </div>
            </li>
        `;
    }

    function renderSavedMenus() {
        const savedMenus = readStorage(STORAGE_KEYS.savedMenus, []);

        if (savedMenus.length === 0) {
            savedList.innerHTML = `
                <li class="empty-state">
                    Сохранённых меню нет. Составьте меню в <a href="calculator.html">калькуляторе</a> и нажмите «Сохранить меню».
                </li>
            `;
            return;
        }

        const mealNames = (menu) => Object.values(menu.meals || {})
            .filter(Boolean)
            .map((meal) => `<li>${escapeHtml(meal.name)}</li>`)
            .join('');

        savedList.innerHTML = savedMenus.map((item) => `
            <li class="saved-menu">
                <div class="saved-menu-head">
                    <p class="saved-menu-kcal">${formatNumber(item.menu.generatedCalories || item.menu.totalCalories)} ккал</p>
                    <p class="saved-menu-date">${formatDateTime(parseStoredDate(item.date))}</p>
                </div>
                <ul class="saved-menu-meals">${mealNames(item.menu)}</ul>
                <div class="saved-menu-actions">
                    <a class="button button-dark" href="calculator.html?menu=${encodeURIComponent(item.id)}">Открыть</a>
                    <button class="button button-soft" type="button" data-delete="${escapeHtml(item.id)}">Удалить</button>
                </div>
            </li>
        `).join('');
    }

    savedList.addEventListener('click', (event) => {
        const button = event.target.closest('[data-delete]');
        if (!button) return;

        const savedMenus = readStorage(STORAGE_KEYS.savedMenus, []);
        writeStorage(STORAGE_KEYS.savedMenus, savedMenus.filter((item) => String(item.id) !== button.dataset.delete));
        renderSavedMenus();
        showToast('Меню удалено');
    });

    clearBtn.addEventListener('click', () => {
        if (!confirm('Удалить все расчёты из истории? Сохранённые меню останутся.')) return;

        try {
            localStorage.removeItem(STORAGE_KEYS.history);
        } catch {
            showToast('Не удалось очистить историю', 'error');
            return;
        }
        renderHistory();
        showToast('История очищена');
    });
});
