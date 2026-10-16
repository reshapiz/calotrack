document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quick-form');
    const summary = document.getElementById('home-summary');
    if (!form || !summary) return;

    const mascot = new Mascot(document.getElementById('home-mascot'));

    const update = () => {
        const input = readNormInput(form);
        if (!input) {
            mascot.say('Что-то не так с числами. Возраст — от 14 до 100 лет, рост — от 120 до 230 см, вес — от 35 до 250 кг.', 'think');
            return;
        }

        const norm = calculateNorm(input);
        summary.innerHTML = renderNormSummary(norm);
        mascot.say(['Поменяйте любое слово во фразе — я сразу пересчитаю.', ...buildNormTips(norm)]);
    };

    form.addEventListener('input', update);
    update();

    const lastEntry = readStorage(STORAGE_KEYS.history, [])[0];
    const lastNote = document.getElementById('last-calculation');
    if (lastEntry && lastNote) {
        lastNote.innerHTML = `Ваша прошлая норма — ${formatNumber(lastEntry.calories)} ккал, она в <a href="history.html">истории</a>.`;
        lastNote.hidden = false;
    }
});
