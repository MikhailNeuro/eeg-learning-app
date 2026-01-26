import Component from '../core/Component.js';

export default class Menu extends Component {
    constructor(container, onSelect, progressManager) {
        super(container);
        this.onSelect = onSelect;
        this.progressManager = progressManager;

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

        // --- ШАПКА ---
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';

        const title = document.createElement('h1');
        title.innerText = 'Обучение ЭЭГ';
        title.style.margin = '0';

        const resetBtn = document.createElement('button');
        resetBtn.innerText = "Сброс прогресса";
        resetBtn.style.cssText = "padding: 5px 10px; font-size: 12px; cursor: pointer; background: #fff; border: 1px solid #ccc; border-radius: 4px; color: #666;";

        // ЛОГИКА СБРОСА
        resetBtn.onclick = () => {
            if(confirm("Вы уверены? Весь прогресс будет удален.")) {
                if (this.progressManager) {
                    this.progressManager.resetAll();
                    // Важно: перерисовываем меню, чтобы увидеть изменения
                    this.render();
                }
            }
        };

        header.appendChild(title);
        header.appendChild(resetBtn);
        wrapper.appendChild(header);

        // --- СПИСОК ---
        const list = document.createElement('div');
        list.className = 'menu-grid';

        this.topics.forEach(topic => {
            const btn = document.createElement('button');
            btn.className = 'menu-btn';

            const info = this.progressManager ? this.progressManager.getBlockInfo(topic.id) : null;
            let badgeHTML = '';

            if (info) {
                const pct = info.lastPercent; // Берем ПОСЛЕДНИЙ результат

                if (pct >= 80) {
                    badgeHTML = `<span class="badge-pass">✅ ${pct}%</span>`;
                    if (info.isPassed) btn.classList.add('menu-btn-passed');
                } else if (pct > 0) {
                    badgeHTML = `<span class="badge-fail">⚠️ ${pct}%</span>`;
                } else {
                    // Если есть запись, но 0% (начал и не ответил верно)
                    badgeHTML = `<span class="badge-fail">⭕ 0%</span>`;
                }
            } else {
                badgeHTML = `<span class="badge-new">NEW</span>`;
            }

            btn.innerHTML = `
                <div>
                    <span class="menu-btn__title">${topic.title}</span>
                    <div style="margin-top:5px;">${badgeHTML}</div>
                </div>
                <div style="font-size:20px; color:#ccc;">➔</div>
            `;

            btn.onclick = () => this.onSelect(topic.id);
            list.appendChild(btn);
        });

        wrapper.appendChild(list);
        this.container.appendChild(wrapper);
    }
}