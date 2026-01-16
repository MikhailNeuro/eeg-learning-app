import Component from '../core/Component.js';

export default class Menu extends Component {
    constructor(container, onSelect) {
        super(container);
        this.onSelect = onSelect;

        // Список тем (можно вынести в отдельный конфиг)
        this.topics = [
            { id: 1, title: "1. Физические основы ЭЭГ" },
            { id: 2, title: "2. Техническая реализация (Общая)" },
            { id: 3, title: "3. Техническая реализация (Детальная)" },
            { id: 4, title: "4. Классы устройств" },
            { id: 5, title: "5. Медицинское применение" }
        ];
    }

    render() {
        this.clear();
        const wrapper = document.createElement('div');
        wrapper.className = 'fade-in';
        wrapper.innerHTML = `<h1>Обучение ЭЭГ</h1>`;

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '10px';

        this.topics.forEach(topic => {
            const btn = document.createElement('button');
            btn.className = 'card';
            btn.style.textAlign = 'left';
            btn.style.cursor = 'pointer';
            btn.textContent = topic.title;
            btn.onclick = () => this.onSelect(topic.id);
            list.appendChild(btn);
        });

        wrapper.appendChild(list);
        this.container.appendChild(wrapper);
    }
}