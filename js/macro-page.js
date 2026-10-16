const MACRO_HISTORY_FIELDS = {
    protein: { field: 'proteinGrams', name: 'белка' },
    fat: { field: 'fatGrams', name: 'жиров' },
    carbs: { field: 'carbGrams', name: 'углеводов' }
};

document.addEventListener('DOMContentLoaded', () => {
    const page = document.querySelector('[data-macro]');
    const mascotElement = document.getElementById('macro-mascot');
    if (!page || !mascotElement) return;

    const tips = JSON.parse(mascotElement.dataset.tips || '[]');
    const lastEntry = readStorage(STORAGE_KEYS.history, [])[0];
    if (lastEntry) {
        const macro = MACRO_HISTORY_FIELDS[page.dataset.macro];
        tips.unshift(`По вашему последнему расчёту нужно ${lastEntry[macro.field]} г ${macro.name} в день.`);
    }

    new Mascot(mascotElement).say(tips);
});
