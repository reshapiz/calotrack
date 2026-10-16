const HEALTH_PROFILE_NAMES = {
    obesity: 'ожирение',
    overweight: 'избыточный вес',
    normal: 'нормальный вес',
    underweight: 'дефицит веса'
};

class MealMenu {
    constructor(renderer) {
        this.renderer = renderer;
        this.section = document.getElementById('menu-section');
        this.subtitle = document.getElementById('menu-subtitle');

        document.addEventListener('saveMenu', (event) => this.saveMenu(event.detail?.menu));
    }

    show(menuData, userData) {
        const profile = HEALTH_PROFILE_NAMES[menuData?.healthProfile] || HEALTH_PROFILE_NAMES.normal;
        const goal = GOAL_NAMES[userData?.goal] || GOAL_NAMES.maintain;
        const bmi = typeof userData?.bmi === 'number' ? `, ИМТ ${formatNumber(userData.bmi, 1)}` : '';
        this.subtitle.textContent = `${goal}, ${profile}${bmi}`;

        this.renderer.renderMenu(menuData);
        this.section.hidden = false;
        this.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    saveMenu(menu) {
        if (!menu) return;

        const savedMenus = readStorage(STORAGE_KEYS.savedMenus, []);
        if (savedMenus[0] && JSON.stringify(savedMenus[0].menu) === JSON.stringify(menu)) {
            showToast('Это меню уже сохранено');
            return;
        }

        savedMenus.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            menu
        });

        if (writeStorage(STORAGE_KEYS.savedMenus, savedMenus.slice(0, 10))) {
            showToast('Меню сохранено. Оно есть на странице «История»');
        } else {
            showToast('Не удалось сохранить меню', 'error');
        }
    }
}
