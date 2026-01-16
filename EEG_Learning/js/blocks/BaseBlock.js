import Component from '../core/Component.js';

export default class BaseBlock extends Component {
    constructor(container, onBack, slidesData) {
        super(container);
        this.onBack = onBack;
        this.slides = slidesData || [];
        this.currentIndex = 0;
        this.activeInterval = null; // Для очистки анимаций при смене слайда
    }

    render() {
        this.clear();

        const wrapper = document.createElement('div');
        wrapper.className = 'fade-in';

        // Шапка
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '20px';
        header.innerHTML = `
            <button id="exit-btn" class="btn btn-outline">← Меню</button>
            <div style="font-size: 14px; color: #888;">${this.constructor.name}</div>
        `;

        // Контейнер слайда
        const slideContainer = document.createElement('div');
        slideContainer.className = 'card';
        slideContainer.id = 'slide-content';

        // Навигация
        const controls = document.createElement('div');
        controls.className = 'nav-controls';
        controls.innerHTML = `
            <button id="prev-btn" class="btn btn-outline">Назад</button>
            <span id="step-counter" style="align-self: center; font-weight: bold;"></span>
            <button id="next-btn" class="btn">Далее</button>
        `;

        wrapper.appendChild(header);
        wrapper.appendChild(slideContainer);
        wrapper.appendChild(controls);
        this.container.appendChild(wrapper);

        // События
        this.container.querySelector('#exit-btn').onclick = () => {
            this.stopAnimations();
            this.onBack();
        };
        this.container.querySelector('#prev-btn').onclick = () => this.changeSlide(-1);
        this.container.querySelector('#next-btn').onclick = () => this.changeSlide(1);

        this.renderCurrentSlide();
    }

    changeSlide(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.slides.length) {
            this.stopAnimations(); // Останавливаем старые анимации
            this.currentIndex = newIndex;
            this.renderCurrentSlide();
        } else if (newIndex >= this.slides.length) {
             this.stopAnimations();
             this.onBack(); // Завершение блока
        }
    }

    renderCurrentSlide() {
        const slide = this.slides[this.currentIndex];
        const container = this.container.querySelector('#slide-content');
        const prevBtn = this.container.querySelector('#prev-btn');
        const nextBtn = this.container.querySelector('#next-btn');

        // 1. Вставка HTML
        container.innerHTML = `
            <h2 style="color: var(--primary); margin-bottom: 15px;">${slide.title}</h2>
            <div class="slide-body" style="line-height: 1.6; color: #444;">${slide.content}</div>
        `;

        // 2. Обновление кнопок
        prevBtn.disabled = this.currentIndex === 0;
        nextBtn.textContent = this.currentIndex === this.slides.length - 1 ? 'Завершить' : 'Далее';
        this.container.querySelector('#step-counter').innerText = `${this.currentIndex + 1} / ${this.slides.length}`;

        // 3. Запуск логики слайда (если она есть в наследнике)
        if (typeof this.mountInteractive === 'function') {
            this.mountInteractive(this.currentIndex);
        }
    }

    stopAnimations() {
        if (this.activeInterval) {
            cancelAnimationFrame(this.activeInterval);
            clearInterval(this.activeInterval);
            this.activeInterval = null;
        }
    }
}