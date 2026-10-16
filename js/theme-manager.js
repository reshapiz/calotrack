class ThemeManager {
    constructor() {
        this.storageKey = 'theme';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.applyTheme(this.getSavedTheme() || this.getSystemTheme());

        this.mediaQuery.addEventListener('change', () => {
            if (!this.getSavedTheme()) {
                this.applyTheme(this.getSystemTheme());
            }
        });

        document.addEventListener('DOMContentLoaded', () => this.initToggle());
    }

    getSavedTheme() {
        try {
            const theme = localStorage.getItem(this.storageKey);
            return theme === 'dark' || theme === 'light' ? theme : null;
        } catch {
            return null;
        }
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    get currentTheme() {
        return document.documentElement.dataset.theme;
    }

    applyTheme(theme) {
        document.documentElement.dataset.theme = theme;

        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1d1916' : '#f1ebe2');
        }

        this.updateToggle();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        try {
            localStorage.setItem(this.storageKey, newTheme);
        } catch {
        }
        this.applyTheme(newTheme);
    }

    initToggle() {
        this.toggle = document.querySelector('.theme-toggle');
        if (!this.toggle) return;

        this.toggle.hidden = false;
        this.toggle.addEventListener('click', () => this.toggleTheme());
        this.updateToggle();
    }

    updateToggle() {
        if (!this.toggle) return;

        this.toggle.textContent = this.currentTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    }
}

new ThemeManager();
