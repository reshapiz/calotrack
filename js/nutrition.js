const ACTIVITY_LEVELS = {
    '1.2': 'Минимальная',
    '1.375': 'Низкая',
    '1.55': 'Средняя',
    '1.725': 'Высокая',
    '1.9': 'Очень высокая'
};

const GOAL_NAMES = {
    lose: 'Похудение',
    maintain: 'Поддержание веса',
    gain: 'Набор массы'
};

const GOAL_CALORIE_FACTOR = {
    lose: 0.85,
    maintain: 1,
    gain: 1.15
};

const MACROS_PER_KG = {
    lose: { protein: 2.2, fat: 0.8 },
    maintain: { protein: 1.8, fat: 1.0 },
    gain: { protein: 2.0, fat: 1.2 }
};

const MAX_PROTEIN_AND_FAT_SHARE = 0.75;

const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 };

function calculateBmr({ gender, age, height, weight }) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'female' ? base - 161 : base + 5;
}

function describeBmi(bmi) {
    if (bmi < 16) return { text: 'Выраженный дефицит массы', status: 'bad' };
    if (bmi < 18.5) return { text: 'Недостаточный вес', status: 'warn' };
    if (bmi < 25) return { text: 'Нормальный вес', status: 'good' };
    if (bmi < 30) return { text: 'Избыточный вес', status: 'warn' };
    if (bmi < 35) return { text: 'Ожирение I степени', status: 'bad' };
    if (bmi < 40) return { text: 'Ожирение II степени', status: 'bad' };
    return { text: 'Ожирение III степени', status: 'bad' };
}

function calculateNorm(input) {
    const { weight, height, activity, goal } = input;
    const bmr = Math.round(calculateBmr(input));
    const maintenanceCalories = Math.round(bmr * activity);
    const calories = Math.round(maintenanceCalories * GOAL_CALORIE_FACTOR[goal]);

    const perKg = MACROS_PER_KG[goal];
    let protein = weight * perKg.protein;
    let fat = weight * perKg.fat;

    const proteinAndFatCalories = protein * KCAL_PER_GRAM.protein + fat * KCAL_PER_GRAM.fat;
    const limit = calories * MAX_PROTEIN_AND_FAT_SHARE;
    const macroScale = proteinAndFatCalories > limit ? limit / proteinAndFatCalories : 1;
    protein *= macroScale;
    fat *= macroScale;

    const proteinGrams = Math.round(protein);
    const fatGrams = Math.round(fat);
    const carbGrams = Math.round(
        (calories - proteinGrams * KCAL_PER_GRAM.protein - fatGrams * KCAL_PER_GRAM.fat) / KCAL_PER_GRAM.carbs
    );

    const heightInMeters = height / 100;
    const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;

    return {
        ...input,
        bmr,
        maintenanceCalories,
        calories,
        proteinGrams,
        fatGrams,
        carbGrams,
        bmi,
        macroScale
    };
}

function readNormInput(form) {
    const input = {
        gender: form.elements.gender.value,
        age: Number(form.elements.age.value),
        height: Number(form.elements.height.value),
        weight: Number(form.elements.weight.value),
        activity: Number(form.elements.activity.value),
        goal: form.elements.goal.value
    };

    const fieldsValid = ['age', 'height', 'weight'].every((name) => form.elements[name].checkValidity());
    return fieldsValid ? input : null;
}

function formatNumber(value, fractionDigits = 0) {
    return Number(value).toLocaleString('ru-RU', {
        maximumFractionDigits: fractionDigits
    });
}

function macroShares(norm) {
    const proteinCalories = norm.proteinGrams * KCAL_PER_GRAM.protein;
    const fatCalories = norm.fatGrams * KCAL_PER_GRAM.fat;
    const carbCalories = norm.carbGrams * KCAL_PER_GRAM.carbs;
    const total = proteinCalories + fatCalories + carbCalories || 1;

    return {
        protein: Math.round((proteinCalories / total) * 100),
        fat: Math.round((fatCalories / total) * 100),
        carbs: Math.round((carbCalories / total) * 100)
    };
}

const MACRO_NAMES = { protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы' };

function renderMacroBar(norm) {
    if (!norm) {
        return '<div class="macro-bar is-empty" aria-hidden="true"><span></span></div>';
    }

    const shares = macroShares(norm);
    return `
        <div class="macro-bar" aria-hidden="true">
            <span class="macro--protein" style="flex-grow: ${shares.protein}"></span>
            <span class="macro--fat" style="flex-grow: ${shares.fat}"></span>
            <span class="macro--carbs" style="flex-grow: ${shares.carbs}"></span>
        </div>
    `;
}

function renderMacroPills(grams, size = '') {
    return `
        <ul class="macro-pills ${size}">
            ${Object.keys(MACRO_NAMES).map((macro) => `
                <li class="macro-pill macro--${macro}">${MACRO_NAMES[macro]} <strong>${grams[macro] ?? '—'} г</strong></li>
            `).join('')}
        </ul>
    `;
}

function renderNormSummary(norm) {
    if (!norm) {
        return `
            <div class="norm-summary is-empty">
                <p class="norm-kcal"><span>—</span> ккал в день</p>
                ${renderMacroBar(null)}
                ${renderMacroPills({})}
            </div>
        `;
    }

    const bmiInfo = describeBmi(norm.bmi);
    return `
        <div class="norm-summary">
            <p class="norm-kcal"><span>${formatNumber(norm.calories)}</span> ккал в день</p>
            ${renderMacroBar(norm)}
            ${renderMacroPills({ protein: norm.proteinGrams, fat: norm.fatGrams, carbs: norm.carbGrams })}
            <p class="norm-meta">
                ${GOAL_NAMES[norm.goal]}. Базовый обмен ${formatNumber(norm.bmr)} ккал.
                ИМТ ${formatNumber(norm.bmi, 1)} — <span class="status-${bmiInfo.status}">${bmiInfo.text.toLowerCase()}</span>.
            </p>
        </div>
    `;
}

const CHICKEN_PROTEIN_PER_100G = 25;
const OIL_FAT_PER_SPOON = 15;
const RICE_CARBS_PER_PLATE = 56;

function roundTo(value, step) {
    return Math.max(step, Math.round(value / step) * step);
}

function buildNormTips(norm) {
    const tips = [
        `${norm.proteinGrams} г белка — это примерно ${formatNumber(roundTo((norm.proteinGrams / CHICKEN_PROTEIN_PER_100G) * 100, 10))} г куриной грудки. Удобнее набирать понемногу в каждый приём пищи.`,
        `${norm.fatGrams} г жиров — как ${countWithWord(Math.max(1, Math.round(norm.fatGrams / OIL_FAT_PER_SPOON)), ['столовая ложка', 'столовые ложки', 'столовых ложек'])} масла. Но лучше брать их из рыбы, орехов и сыра.`,
        `${norm.carbGrams} г углеводов — это около ${countWithWord(Math.max(1, Math.round(norm.carbGrams / RICE_CARBS_PER_PLATE)), ['тарелки', 'тарелок', 'тарелок'])} варёного риса по 200 г.`
    ];

    if (norm.goal === 'lose' && norm.bmi < 18.5) {
        tips.unshift('С таким ИМТ худеть не стоит. Лучше обсудить питание с врачом.');
    } else if (norm.goal === 'lose') {
        tips.push('Минус 15 % — мягкий дефицит. С ним проще не сорваться, чем с жёсткой диетой.');
    } else if (norm.goal === 'gain' && norm.bmi >= 30) {
        tips.unshift('С таким ИМТ набирать вес не стоит. Лучше обсудить питание с врачом.');
    } else if (norm.goal === 'gain') {
        tips.push('Плюс 15 % к норме. Без силовых тренировок лишнее уйдёт в жир, а не в мышцы.');
    }

    return tips;
}
