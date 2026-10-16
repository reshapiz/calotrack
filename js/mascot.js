const MASCOT_MOUTHS = {
    happy: '<path class="mascot-mouth" d="M51 61 Q60 72 69 61 Q60 64 51 61 Z"/>',
    think: '<path class="mascot-line" d="M53 64 Q59 61 67 63"/>',
    wow: '<ellipse class="mascot-mouth" cx="60" cy="64" rx="4.5" ry="5.5"/>'
};

function renderMascotSvg(mood = 'happy') {
    return `
        <svg class="mascot-svg" viewBox="0 0 120 112" aria-hidden="true">
            <path class="mascot-line" d="M15 66 C7 65 3 58 6 51"/>
            <path class="mascot-line mascot-wave" d="M105 63 C113 59 116 51 113 44"/>
            <path class="mascot-side" d="M14 55 C13 64 14 70 17 75 C25 90 44 95 61 95 C81 95 99 88 104 75 C107 68 106 61 106 55 C104 74 84 84 60 84 C36 85 15 74 14 55 Z"/>
            <path class="mascot-top" d="M14 55 C13 35 36 25 61 24 C86 24 107 34 106 55 C104 74 84 84 60 84 C36 85 15 74 14 55 Z"/>
            <path class="mascot-crust" d="M27 53 C26 39 42 33 60 32 C80 32 95 40 94 53 C93 66 78 74 60 74 C41 75 27 66 27 53 Z"/>
            <path class="mascot-cream" d="M64 30 C61 22 70 17 77 21 C85 18 91 26 86 31 C81 36 69 36 64 30 Z"/>
            <ellipse class="mascot-blush" cx="38" cy="60" rx="6" ry="3.5"/>
            <ellipse class="mascot-blush" cx="82" cy="60" rx="6" ry="3.5"/>
            <ellipse class="mascot-eye" cx="48" cy="50" rx="4.5" ry="6"/>
            <ellipse class="mascot-eye" cx="72" cy="50" rx="4.5" ry="6"/>
            <circle class="mascot-glint" cx="49.6" cy="47.6" r="1.6"/>
            <circle class="mascot-glint" cx="73.6" cy="47.6" r="1.6"/>
            ${MASCOT_MOUTHS[mood] || MASCOT_MOUTHS.happy}
        </svg>
    `;
}

class Mascot {
    constructor(element) {
        this.element = element;
        this.tips = [];
        this.index = 0;

        element.innerHTML = `
            <div class="mascot-figure">${renderMascotSvg()}</div>
            <div class="mascot-bubble">
                <p class="mascot-text" aria-live="polite"></p>
                <button class="mascot-next" type="button" hidden>Ещё совет</button>
            </div>
        `;

        this.figure = element.querySelector('.mascot-figure');
        this.text = element.querySelector('.mascot-text');
        this.nextButton = element.querySelector('.mascot-next');
        this.nextButton.addEventListener('click', () => this.showNext());
    }

    say(tips, mood = 'happy') {
        this.tips = Array.isArray(tips) ? tips : [tips];
        this.index = 0;
        this.figure.innerHTML = renderMascotSvg(mood);
        this.text.textContent = this.tips[0];
        this.nextButton.hidden = this.tips.length < 2;
    }

    showNext() {
        this.index = (this.index + 1) % this.tips.length;
        this.text.textContent = this.tips[this.index];
        this.figure.classList.remove('is-bouncing');
        void this.figure.offsetWidth;
        this.figure.classList.add('is-bouncing');
    }
}
