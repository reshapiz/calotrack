document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('calorie-form');
    if (!form) return;

    const resultEl = document.getElementById('result');
    const resultActions = document.getElementById('result-actions');
    const menuBtn = document.getElementById('show-menu-btn');
    const shareBtn = document.getElementById('share-btn');
    const forecastSection = document.getElementById('forecast');
    const forecastNote = document.getElementById('forecast-note');
    const weightChart = document.getElementById('weight-chart');

    let lastCalculation = null;

    const mascot = new Mascot(document.getElementById('calc-mascot'));
    const activityHint = document.getElementById('activity-hint');

    resultEl.innerHTML = renderNormSummary(null);
    mascot.say('Заполните возраст, рост и вес — и я покажу, сколько вам нужно есть в день.');

    form.addEventListener('change', (event) => {
        if (event.target.name === 'activity') {
            activityHint.textContent = event.target.dataset.hint;
        }
    });

    const mealDatabase = new MealDatabase();
    const mealPlanner = new MealPlanner(mealDatabase);
    const mealRenderer = new MealRenderer();
    const mealMenu = new MealMenu(mealRenderer);
    const databaseReady = mealDatabase.init();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const input = readNormInput(form);
        if (!input) return;

        lastCalculation = calculateNorm(input);
        showResult(lastCalculation);
        renderBreakdown(lastCalculation);
        renderForecast(lastCalculation);
        saveToHistory(lastCalculation);

        if (window.matchMedia('(max-width: 960px)').matches) {
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    function showResult(norm) {
        resultEl.innerHTML = renderNormSummary(norm);
        resultEl.classList.remove('is-revealed');
        void resultEl.offsetWidth;
        resultEl.classList.add('is-revealed');
        resultActions.hidden = false;
        mascot.say(buildNormTips(norm), 'wow');
    }

    function renderBreakdown(norm) {
        const mifflin = `10 × ${formatNumber(norm.weight, 1)} + 6,25 × ${norm.height} − 5 × ${norm.age} ${norm.gender === 'female' ? '− 161' : '+ 5'}`;
        const goalStep = {
            lose: `${formatNumber(norm.maintenanceCalories)} − 15 %`,
            maintain: `${formatNumber(norm.maintenanceCalories)}, без поправки`,
            gain: `${formatNumber(norm.maintenanceCalories)} + 15 %`
        }[norm.goal];
        const perKg = MACROS_PER_KG[norm.goal];
        const scale = norm.macroScale < 1 ? ` × ${formatNumber(norm.macroScale, 2)}` : '';

        const rows = [
            ['Базовый обмен', mifflin, `${formatNumber(norm.bmr)} ккал`],
            [`Активность: ${ACTIVITY_LEVELS[String(norm.activity)].toLowerCase()}`, `${formatNumber(norm.bmr)} × ${String(norm.activity).replace('.', ',')}`, `${formatNumber(norm.maintenanceCalories)} ккал`],
            [`Цель: ${GOAL_NAMES[norm.goal].toLowerCase()}`, goalStep, `${formatNumber(norm.calories)} ккал`],
            ['Белки', `${formatNumber(norm.weight, 1)} кг × ${formatNumber(perKg.protein, 1)} г${scale}`, `${norm.proteinGrams} г`],
            ['Жиры', `${formatNumber(norm.weight, 1)} кг × ${formatNumber(perKg.fat, 1)} г${scale}`, `${norm.fatGrams} г`],
            ['Углеводы', `(${formatNumber(norm.calories)} − ${norm.proteinGrams} × 4 − ${norm.fatGrams} × 9) ÷ 4`, `${norm.carbGrams} г`]
        ];

        const scaleNote = norm.macroScale < 1
            ? `<p class="breakdown-note">Белки и жиры по формуле заняли бы больше ${Math.round(MAX_PROTEIN_AND_FAT_SHARE * 100)} % калорий, поэтому обе величины уменьшены в одинаковой пропорции — так в рационе остаётся место для углеводов.</p>`
            : '';

        document.getElementById('breakdown').innerHTML = rows.map(([name, formula, value]) => `
            <div><dt>${name}</dt><dd><span class="breakdown-formula">${formula}</span><strong>${value}</strong></dd></div>
        `).join('');
        const section = document.getElementById('breakdown-section');
        section.querySelector('.breakdown-note')?.remove();
        section.insertAdjacentHTML('beforeend', scaleNote);
        section.hidden = false;
    }

    function renderForecast(norm) {
        const dailyDifference = norm.calories - norm.maintenanceCalories;
        const monthlyChange = (dailyDifference * 30.4) / 7700;

        forecastSection.hidden = false;

        if (norm.goal === 'maintain') {
            forecastNote.textContent = `При поддерживающей норме вес остаётся примерно на уровне ${formatNumber(norm.weight, 1)} кг.`;
            weightChart.hidden = true;
            return;
        }

        const weights = Array.from({ length: 13 }, (_, month) => norm.weight + monthlyChange * month);
        const finalWeight = weights[weights.length - 1];
        const direction = monthlyChange < 0 ? 'минус' : 'плюс';

        forecastNote.textContent =
            `Примерно ${direction} ${formatNumber(Math.abs(monthlyChange), 1)} кг в месяц, через год — около ${formatNumber(finalWeight, 1)} кг. ` +
            'Это линейная оценка: на деле темп со временем замедляется, поэтому пересчитывайте норму каждые 4–6 недель.';
        weightChart.hidden = false;
        weightChart.innerHTML = buildForecastSvg(weights);
    }

    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (!lastCalculation?.maintenanceCalories || forecastSection.hidden) return;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => renderForecast(lastCalculation));
    });

    function buildForecastSvg(weights) {
        const horizontalPadding = parseFloat(getComputedStyle(weightChart).paddingLeft) * 2;
        const width = Math.max(280, Math.round(weightChart.clientWidth - horizontalPadding));
        const height = width < 500 ? 220 : 260;
        const padding = { top: 28, right: 16, bottom: 32, left: 40 };
        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;

        const lowest = Math.min(...weights);
        const highest = Math.max(...weights);
        const step = [1, 2, 5, 10, 20].find((candidate) => (highest - lowest) / candidate <= 4) || 20;
        const minWeight = Math.floor(lowest / step) * step;
        const maxWeight = Math.max(Math.ceil(highest / step) * step, minWeight + step);
        const range = maxWeight - minWeight;

        const x = (month) => padding.left + (month / 12) * innerWidth;
        const y = (weight) => padding.top + (1 - (weight - minWeight) / range) * innerHeight;

        const gridLines = Array.from({ length: range / step + 1 }, (_, i) => {
            const value = minWeight + step * i;
            return `
                <line class="grid-line" x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}"></line>
                <text class="axis-text" x="${padding.left - 10}" y="${y(value) + 4}" text-anchor="end">${value}</text>
            `;
        }).join('');

        const markedMonths = [0, 3, 6, 9, 12];
        const monthLabels = markedMonths.map((month) => `
            <text class="axis-text" x="${x(month)}" y="${height - 8}" text-anchor="middle">${month === 0 ? 'сейчас' : `${month} мес`}</text>
        `).join('');

        const linePoints = weights.map((weight, month) => `${x(month)},${y(weight)}`).join(' ');
        const areaPoints = `${x(0)},${padding.top + innerHeight} ${linePoints} ${x(12)},${padding.top + innerHeight}`;

        const points = markedMonths.map((month) => `
            <circle class="point" cx="${x(month)}" cy="${y(weights[month])}" r="4.5"></circle>
        `).join('');

        const edgeLabels = [0, 12].map((month) => `
            <text class="point-label" x="${x(month)}" y="${y(weights[month]) - 12}" text-anchor="${month === 0 ? 'start' : 'end'}">${formatNumber(weights[month], 1)} кг</text>
        `).join('');

        return `
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Прогноз веса: с ${formatNumber(weights[0], 1)} до ${formatNumber(weights[12], 1)} кг за 12 месяцев">
                ${gridLines}
                ${monthLabels}
                <polygon class="trend-area" points="${areaPoints}"></polygon>
                <polyline class="trend" points="${linePoints}"></polyline>
                ${points}
                ${edgeLabels}
            </svg>
        `;
    }

    function saveToHistory(norm) {
        const history = readStorage(STORAGE_KEYS.history, []);
        history.unshift({
            date: new Date().toISOString(),
            calories: norm.calories,
            proteinGrams: norm.proteinGrams,
            fatGrams: norm.fatGrams,
            carbGrams: norm.carbGrams,
            goal: norm.goal,
            bmi: norm.bmi,
            weight: norm.weight
        });

        if (writeStorage(STORAGE_KEYS.history, history.slice(0, 20))) {
            showToast('Расчёт сохранён в историю');
        }
    }

    async function openMenu(menu, userData) {
        await databaseReady;
        mealMenu.show(menu, userData);
    }

    menuBtn.addEventListener('click', async () => {
        if (!lastCalculation) return;

        await databaseReady;
        const menu = mealPlanner.generateDailyMenu(lastCalculation.calories, lastCalculation.bmi, lastCalculation.goal);
        mealMenu.show(menu, lastCalculation);
    });

    shareBtn.addEventListener('click', async () => {
        if (!lastCalculation) return;

        const text =
            `Моя норма по CaloTrack: ${formatNumber(lastCalculation.calories)} ккал в день. ` +
            `Белки ${lastCalculation.proteinGrams} г, жиры ${lastCalculation.fatGrams} г, углеводы ${lastCalculation.carbGrams} г. ` +
            `Цель: ${GOAL_NAMES[lastCalculation.goal].toLowerCase()}.`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Моя норма калорий', text });
                return;
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast('Результат скопирован');
        } catch {
            showToast('Не удалось скопировать результат', 'error');
        }
    });

    document.addEventListener('requestMealRefresh', (event) => {
        const { category, currentMealId } = event.detail;
        if (!lastCalculation) return;

        const newMeal = mealPlanner.generateAlternative(
            category,
            currentMealId,
            lastCalculation.calories,
            lastCalculation.bmi,
            lastCalculation.goal
        );

        if (newMeal) {
            mealRenderer.updateCategory(category, newMeal);
        } else {
            showToast('Других подходящих блюд нет');
        }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.has('weight')) {
        for (const name of ['gender', 'age', 'height', 'weight', 'activity', 'goal']) {
            if (params.has(name)) form.elements[name].value = params.get(name);
        }
        activityHint.textContent = form.querySelector('input[name="activity"]:checked').dataset.hint;
        history.replaceState(null, '', window.location.pathname);
        form.requestSubmit();
    }

    const savedMenuId = params.get('menu');
    if (savedMenuId) {
        const saved = readStorage(STORAGE_KEYS.savedMenus, []).find((item) => String(item.id) === savedMenuId);
        history.replaceState(null, '', window.location.pathname);

        if (saved) {
            lastCalculation = {
                calories: saved.menu.totalCalories,
                bmi: saved.menu.bmi,
                goal: saved.menu.goal || 'maintain'
            };
            openMenu(saved.menu, lastCalculation);
        } else {
            showToast('Это меню не найдено', 'error');
        }
    }
});
