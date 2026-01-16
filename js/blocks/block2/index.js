import BaseBlock from '../BaseBlock.js';
import { block2Data } from './data.js';

export default class Block2 extends BaseBlock {
    constructor(container, onBack) {
        super(container, onBack, block2Data);
    }

    mountInteractive(index) {
        const slideId = this.slides[index].id;
        this.stopAnimations();

        switch (slideId) {
            case 'chain': this.initChainGame(); break;
            case 'system1020': this.init1020(); break;
            case 'differential': this.initDifferential(); break;
            case 'impedance': this.initImpedance(); break;
            case 'types': this.initTypes(); break;
            case 'quiz': this.initQuiz(); break;
        }
    }

    // --- 2.1 Drag & Drop Цепочка ---
    initChainGame() {
        const items = this.container.querySelectorAll('.draggable-item');
        const slots = this.container.querySelectorAll('.slot');
        const infoPanel = this.container.querySelector('#chain-info');

        let filledCount = 0;

        // База знаний о компонентах
        const descriptions = {
            electrode: "<b>Электрод (Датчик):</b> Превращает ионный ток (в теле) в электронный ток (в проводе). Без него сигнал останется внутри головы.",
            amp: "<b>Дифференциальный усилитель:</b> Увеличивает слабый сигнал (микровольты) в 10 000 раз, чтобы его можно было обработать. Также вычитает шумы.",
            adc: "<b>АЦП (Аналого-цифровой преобразователь):</b> Превращает непрерывную электрическую волну в последовательность нулей и единиц (биты).",
            success: "<b>Отлично! Цепь собрана.</b><br>Сигнал снят электродом -> Усилен -> Оцифрован -> Передан по Bluetooth/USB на компьютер."
        };

        // Логика перетаскивания
        items.forEach(item => {
            // Начало перетаскивания
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', item.dataset.type);
                e.dataTransfer.setData('label', item.dataset.label); // Передаем текст
                e.dataTransfer.setData('icon', item.dataset.icon);   // Передаем иконку

                // Подсветка описания при начале драга
                infoPanel.innerHTML = descriptions[item.dataset.type];
            });

            // Для десктопа: показать описание при наведении
            item.addEventListener('mouseenter', () => {
                if(item.style.visibility !== 'hidden') {
                    infoPanel.innerHTML = descriptions[item.dataset.type];
                }
            });
        });

        // Логика слотов
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault(); // Разрешаем сброс
                slot.style.borderColor = '#0056b3'; // Подсветка при наведении
            });

            slot.addEventListener('dragleave', () => {
                if (!slot.classList.contains('filled')) {
                    slot.style.borderColor = '#cbd5e0'; // Возврат цвета
                }
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('type');
                const label = e.dataTransfer.getData('label');
                const icon = e.dataTransfer.getData('icon');

                // ПРОВЕРКА ПРАВИЛЬНОСТИ
                if (type === slot.dataset.type) {
                    // 1. Меняем стиль слота
                    slot.classList.add('filled');
                    slot.style.borderColor = '#2ecc71';

                    // 2. ЯВНО ПРОПИСЫВАЕМ HTML ВНУТРИ СЛОТА (Исправление бага)
                    slot.innerHTML = `
                        <span class="stage-icon">${icon}</span>
                        <span class="stage-label">${label}</span>
                    `;

                    // 3. Скрываем исходный предмет
                    const originalItem = Array.from(items).find(i => i.dataset.type === type);
                    if(originalItem) originalItem.style.visibility = 'hidden';

                    // 4. Обновляем статус
                    filledCount++;
                    infoPanel.innerHTML = `<span style="color:green">✓ Верно!</span> ${descriptions[type]}`;
                    infoPanel.style.backgroundColor = "#d4edda";
                    infoPanel.style.borderColor = "#28a745";

                    if (filledCount === 3) {
                        setTimeout(() => {
                            infoPanel.innerHTML = descriptions.success;
                            infoPanel.style.backgroundColor = "#d1e7dd";
                            // Анимация успеха
                            this.container.querySelectorAll('.pipeline-stage').forEach(el => {
                                el.style.borderColor = '#2ecc71';
                            });
                        }, 1000);
                    }
                } else {
                    // Ошибка
                    slot.style.borderColor = 'red';
                    infoPanel.innerHTML = "<span style='color:red'>Ошибка!</span> Этот компонент должен стоять в другом месте цепи.";
                    infoPanel.style.backgroundColor = "#f8d7da";
                    infoPanel.style.borderColor = "#dc3545";

                    setTimeout(() => {
                        if (!slot.classList.contains('filled')) slot.style.borderColor = '#cbd5e0';
                    }, 1000);
                }
            });
        });
    }

    // --- 2.2 Система 10-20 (SVG Generator) ---
         init1020() {
        const container = this.container.querySelector('#head-container');
        const targetSpan = this.container.querySelector('#target-electrode');
        const descBox = this.container.querySelector('#zone-description');

        // База знаний
        const zoneInfo = {
            F: "<b>Лобная доля (Frontal):</b> Планирование, контроль, принятие решений.",
            C: "<b>Центральная зона (Central):</b> Моторная кора. Движение и чувствительность.",
            T: "<b>Височная доля (Temporal):</b> Слух, речь, память, эмоции.",
            P: "<b>Теменная доля (Parietal):</b> Ориентация в пространстве, счет, ассоциации.",
            O: "<b>Затылочная доля (Occipital):</b> Зрение."
        };

        // Координаты электродов (SVG 300x320)
        // Центр головы (Cz) = 150, 150
        const electrodes = [
            // --- ЛОБНАЯ ДОЛЯ (F) ---
            { id: 'Fpz', x: 150, y: 50,  zone: 'F' }, // Центр лба (НОВОЕ)
            { id: 'Fp1', x: 110, y: 50,  zone: 'F' },
            { id: 'Fp2', x: 190, y: 50,  zone: 'F' },

            { id: 'Fz',  x: 150, y: 100, zone: 'F' }, // Средне-лобный (НОВОЕ)
            { id: 'F3',  x: 100, y: 100, zone: 'F' },
            { id: 'F4',  x: 200, y: 100, zone: 'F' },
            { id: 'F7',  x: 50,  y: 90,  zone: 'F' },
            { id: 'F8',  x: 250, y: 90,  zone: 'F' },

            // --- ЦЕНТРАЛЬНАЯ (C) ---
            { id: 'C3',  x: 90,  y: 150, zone: 'C' },
            { id: 'Cz',  x: 150, y: 150, zone: 'C' },
            { id: 'C4',  x: 210, y: 150, zone: 'C' },

            // --- ВИСОЧНАЯ (T) ---
            { id: 'T3',  x: 30,  y: 150, zone: 'T' },
            { id: 'T4',  x: 270, y: 150, zone: 'T' },

            { id: 'T5',  x: 50,  y: 215, zone: 'T' }, // Задний висок слева (НОВОЕ)
            { id: 'T6',  x: 250, y: 215, zone: 'T' }, // Задний висок справа (НОВОЕ)

            // --- ТЕМЕННАЯ (P) ---
            { id: 'P3',  x: 100, y: 200, zone: 'P' },
            { id: 'Pz',  x: 150, y: 200, zone: 'P' },
            { id: 'P4',  x: 200, y: 200, zone: 'P' },

            // --- ЗАТЫЛОЧНАЯ (O) ---
            { id: 'Oz',  x: 150, y: 260, zone: 'O' }, // Центр затылка (НОВОЕ)
            { id: 'O1',  x: 110, y: 260, zone: 'O' },
            { id: 'O2',  x: 190, y: 260, zone: 'O' }
        ];

        // Генерируем SVG
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 300 320");
        svg.setAttribute("class", "head-map");

        // 1. Уши
        const leftEar = document.createElementNS(svgNS, "ellipse");
        leftEar.setAttribute("cx", "20"); leftEar.setAttribute("cy", "150");
        leftEar.setAttribute("rx", "15"); leftEar.setAttribute("ry", "25");
        leftEar.setAttribute("class", "head-feature");
        svg.appendChild(leftEar);

        const rightEar = document.createElementNS(svgNS, "ellipse");
        rightEar.setAttribute("cx", "280"); rightEar.setAttribute("cy", "150");
        rightEar.setAttribute("rx", "15"); rightEar.setAttribute("ry", "25");
        rightEar.setAttribute("class", "head-feature");
        svg.appendChild(rightEar);

        // 2. Нос
        const nose = document.createElementNS(svgNS, "path");
        nose.setAttribute("d", "M 135 25 L 150 5 L 165 25");
        nose.setAttribute("class", "head-feature");
        svg.appendChild(nose);

        // 3. Контур головы
        const head = document.createElementNS(svgNS, "circle");
        head.setAttribute("cx", "150"); head.setAttribute("cy", "150"); head.setAttribute("r", "125");
        head.setAttribute("class", "head-contour");
        svg.appendChild(head);

        // 4. Отрисовка Электродов
        electrodes.forEach(el => {
            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("class", "electrode-group");
            g.setAttribute("id", `group-${el.id}`);

            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", el.x); circle.setAttribute("cy", el.y); circle.setAttribute("r", "13");
            circle.setAttribute("class", "electrode-circle");
            circle.setAttribute("id", el.id);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", el.x); text.setAttribute("y", el.y + 4);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "10");
            text.setAttribute("fill", "#333");
            text.style.pointerEvents = "none";
            text.textContent = el.id;

            g.appendChild(circle);
            g.appendChild(text);
            svg.appendChild(g);

            g.onclick = () => checkElectrode(el.id);
        });

        container.appendChild(svg);

        // Игровая логика
        let currentTarget = '';

        const pickNewTarget = () => {
            let next;
            // Исключаем повторение
            do {
                next = electrodes[Math.floor(Math.random() * electrodes.length)];
            } while (next.id === currentTarget);

            currentTarget = next.id;
            targetSpan.innerText = currentTarget;

            // Сброс классов
            container.querySelectorAll('.electrode-circle').forEach(c => {
                c.classList.remove('correct', 'wrong');
            });
        };

        const checkElectrode = (clickedId) => {
            const circle = container.querySelector(`#${clickedId}`);
            const data = electrodes.find(e => e.id === clickedId);

            if (clickedId === currentTarget) {
                circle.classList.add('correct');
                descBox.innerHTML = `<span style="color:green">✓ Верно!</span> ${zoneInfo[data.zone]}`;
                descBox.style.borderColor = "#2ecc71";
                descBox.style.backgroundColor = "#d4edda";

                setTimeout(() => pickNewTarget(), 2000); // Пауза 2 сек, чтобы прочитать
            } else {
                circle.classList.add('wrong');
                descBox.innerHTML = `<span style="color:red">Ошибка.</span> Вы нажали <b>${clickedId}</b>. Ищите <b>${currentTarget}</b>.`;
                descBox.style.borderColor = "#ff7675";
                descBox.style.backgroundColor = "#ffeaa7";
            }
        };

        pickNewTarget();
    }

    // --- 2.3 Дифференциальный усилитель ---
    initDifferential() {
        const canvas = this.container.querySelector('#diffCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');

        const btnGnd = this.container.querySelector('#btn-connect-gnd');
        const btnRef = this.container.querySelector('#btn-connect-ref');
        const feedback = this.container.querySelector('#diff-feedback');
        const monitorText = this.container.querySelector('#monitor-text');

        const state = { gnd: false, ref: false };

        btnGnd.onclick = () => {
            state.gnd = !state.gnd;
            btnGnd.classList.toggle('connected', state.gnd);
            updateFeedback();
        };

        btnRef.onclick = () => {
            state.ref = !state.ref;
            btnRef.classList.toggle('connected', state.ref);
            updateFeedback();
        };

        const updateFeedback = () => {
            if (!state.gnd && !state.ref) {
                feedback.innerHTML = "⚠️ <b>Цепь разомкнута.</b> Нет ни опорной точки, ни заземления. Усилитель ловит «космический шум».";
                feedback.style.color = "#d63031";
                monitorText.innerText = "OPEN CIRCUIT (SATURATION)";
            }
            else if (state.gnd && !state.ref) {
                // Земля есть, Референта нет -> Измеряем относительно земли? Или вход висит?
                // В биопотенциальных усилителях без референта вход считается "floating" или измеряет относительно GND (монополярно),
                // но так как GND грязная, мы видим 50Гц.
                feedback.innerHTML = "⚠️ <b>Нет второй точки измерения (REF).</b> Вход «висит» в воздухе или измеряет относительно шумной Земли.";
                feedback.style.color = "#e67e22";
                monitorText.innerText = "NO REFERENCE (FLOATING)";
            }
            else if (!state.gnd && state.ref) {
                feedback.innerHTML = "⚠️ <b>Есть разность потенциалов, но нет Земли.</b> Потенциал тела «плавает» относительно прибора (дрейф).";
                feedback.style.color = "#e67e22";
                monitorText.innerText = "UNSTABLE (DRIFT)";
            }
            else {
                feedback.innerHTML = "✅ <b>Цепь замкнута!</b> Измеряем разницу: (Активный) — (Референт). Синфазный шум сократился.";
                feedback.style.color = "#2ecc71";
                monitorText.innerText = "SIGNAL LOCKED";
            }
        };

        // Данные графика
        const chartData = new Array(canvas.width).fill(0);
        let time = 0;
        let driftPhase = 0;

        const draw = () => {
            time += 0.1;
            driftPhase += 0.02;

            // СИМУЛЯЦИЯ ФИЗИКИ
            const brainSignal = Math.sin(time * 2.0) * ((Math.sin(time * 0.5) + 2) / 2) * 20; // Мозг
            const mainsNoise = Math.sin(time * 15.0) * 80; // Сеть 50Гц
            const drift = Math.sin(driftPhase) * 200; // Дрейф

            let output = 0;

            if (!state.ref && !state.gnd) {
                // Хаос
                output = drift + mainsNoise + (Math.random()-0.5)*100;
            }
            else if (state.gnd && !state.ref) {
                // Есть земля, но нет референта. Измеряем "Активный vs Земля".
                // Земля обычно "грязная" или вход ловит наводку как антенна.
                output = brainSignal + mainsNoise;
            }
            else if (!state.gnd && state.ref) {
                // Есть референт, но нет земли.
                // Дифференциальный усилитель работает (вычитает шум), но
                // общий потенциал тела плавает -> Дрейф изолинии.
                output = brainSignal + drift;
            }
            else {
                // Все подключено.
                // (Signal + Noise) - (Noise) = Signal
                output = brainSignal + (mainsNoise * 0.05); // Остаточный шум
            }

            // Отрисовка
            chartData.shift();
            chartData.push(output);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath();
            for(let i=0; i<canvas.height; i+=50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            for(let i=0; i<canvas.width; i+=50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            ctx.stroke();

            // Линия
            ctx.beginPath();
            ctx.lineWidth = 2;

            if (!state.ref || !state.gnd) ctx.strokeStyle = '#e74c3c'; // Плохо
            else ctx.strokeStyle = '#2ecc71'; // Хорошо

            const centerY = canvas.height / 2;
            for (let i = 0; i < chartData.length - 1; i++) {
                // Клиппинг
                let y = centerY + chartData[i];
                if (y < 0) y = 0; if (y > canvas.height) y = canvas.height;
                if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i + 1, y);
            }
            ctx.stroke();

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }

    // --- 2.4 Импеданс ---
    initImpedance() {
        const svgContainer = this.container.querySelector('#imp-head-svg');
        const canvas = this.container.querySelector('#impCanvas');
        const ctx = canvas.getContext('2d');

        const monitorChannel = this.container.querySelector('#monitor-channel');
        const monitorValue = this.container.querySelector('#monitor-value');
        const monitorMode = this.container.querySelector('#monitor-mode');
        const legend = this.container.querySelector('#imp-legend');

        const btnWet = this.container.querySelector('#mode-wet');
        const btnDry = this.container.querySelector('#mode-dry');

        // Настройки порогов
        const thresholds = {
            wet: {
                green: 75,
                orange: 200,
                maxStart: 250, // Стартовое "плохое" значение
                decay: 2, // Скорость улучшения при трении
                desc: `
                    <li>🟢 <b>< 75 кОм:</b> Отлично</li>
                    <li>🟡 <b>75-200 кОм:</b> Допустимо</li>
                    <li>🔴 <b>> 200 кОм:</b> Плохой контакт</li>
                `
            },
            dry: {
                green: 400,
                orange: 2000,
                maxStart: 3000, // Для сухих импеданс гораздо выше
                decay: 30, // Снижаем быстрее (так как числа больше)
                desc: `
                    <li>🟢 <b>< 400 кОм:</b> Отлично (для сухих)</li>
                    <li>🟡 <b>400-2000 кОм:</b> Допустимо</li>
                    <li>🔴 <b>> 2000 кОм:</b> Нет контакта</li>
                `
            }
        };

        let currentMode = 'wet'; // 'wet' or 'dry'

        // Координаты электродов (Поднял Y выше, было 80/130/180 -> стало 60/110/160)
        // val - текущее значение в кОм
        const electrodes = [
            { id: 'F3', x: 60, y: 60, val: 0 },
            { id: 'F4', x: 140, y: 60, val: 0 },
            { id: 'C3', x: 50, y: 110, val: 0 },
            { id: 'C4', x: 150, y: 110, val: 0 },
            { id: 'O1', x: 70, y: 160, val: 0 },
            { id: 'O2', x: 130, y: 160, val: 0 }
        ];

        let activeElectrode = electrodes[0];

        // Функция сброса значений
        const resetElectrodes = () => {
            const t = thresholds[currentMode];
            electrodes.forEach(el => {
                // Случайное "плохое" значение при старте
                el.val = t.maxStart - Math.random() * (t.maxStart * 0.2);
            });
            legend.innerHTML = t.desc;
            monitorMode.innerText = currentMode.toUpperCase();

            // Обновляем UI
            electrodes.forEach(updateColor);
            updateMonitorUI();
        };

        // Переключение режимов
        btnWet.onclick = () => {
            currentMode = 'wet';
            btnWet.classList.add('active');
            btnDry.classList.remove('active');
            resetElectrodes();
        };

        btnDry.onclick = () => {
            currentMode = 'dry';
            btnDry.classList.add('active');
            btnWet.classList.remove('active');
            resetElectrodes();
        };

        // Генерируем SVG
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "200"); svg.setAttribute("height", "220");

        // Голова
        const head = document.createElementNS(svgNS, "circle");
        head.setAttribute("cx", "100"); head.setAttribute("cy", "110"); head.setAttribute("r", "90");
        head.setAttribute("fill", "none"); head.setAttribute("stroke", "#ccc");
        svg.appendChild(head);

        // Нос
        const nose = document.createElementNS(svgNS, "path");
        nose.setAttribute("d", "M 90 20 L 100 5 L 110 20");
        nose.setAttribute("fill", "none"); nose.setAttribute("stroke", "#ccc");
        svg.appendChild(nose);

        // Рисуем электроды
        electrodes.forEach(el => {
            const g = document.createElementNS(svgNS, "g");

            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", el.x); circle.setAttribute("cy", el.y); circle.setAttribute("r", "18");
            circle.setAttribute("stroke", "#555");
            circle.setAttribute("stroke-width", "1");
            circle.setAttribute("id", `imp-circle-${el.id}`);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", el.x); text.setAttribute("y", el.y + 4);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "10");
            text.setAttribute("fill", "#333");
            text.style.pointerEvents = "none";
            text.textContent = el.id;

            g.appendChild(circle);
            g.appendChild(text);
            svg.appendChild(g);

            // Интерактив
            g.onmouseenter = () => {
                activeElectrode = el;
                updateMonitorUI();
            };

            // Скрабирование
            g.onmousemove = () => {
                const t = thresholds[currentMode];
                const minVal = currentMode === 'wet' ? 5 : 200; // Минимально достижимый импеданс

                if (el.val > minVal) {
                    el.val -= t.decay; // Уменьшаем значение
                    if (el.val < minVal) el.val = minVal;
                    updateColor(el);
                    updateMonitorUI();
                }
            };
        });

        svgContainer.appendChild(svg);

        // Определение цвета по текущим порогам
        const updateColor = (el) => {
            const circle = svgContainer.querySelector(`#imp-circle-${el.id}`);
            const t = thresholds[currentMode];

            let color = '#ff4d4d'; // Red
            if (el.val < t.orange) color = '#ffae00'; // Orange
            if (el.val < t.green) color = '#00ff00'; // Green

            circle.setAttribute("fill", color);
            circle.setAttribute("fill-opacity", "0.6");
        };

        const updateMonitorUI = () => {
            monitorChannel.innerText = activeElectrode.id;
            const val = Math.round(activeElectrode.val);
            monitorValue.innerText = `${val} kΩ`;

            const t = thresholds[currentMode];
            monitorValue.className = "monitor-value";

            if (activeElectrode.val < t.green) monitorValue.classList.add("imp-good");
            else if (activeElectrode.val < t.orange) monitorValue.classList.add("imp-warn");
            else monitorValue.classList.add("imp-bad");
        };

        // --- ГРАФИК ---
        const chartData = new Array(canvas.width).fill(0);
        let time = 0;

        const drawSignal = () => {
            time += 0.1;
            const t = thresholds[currentMode];

            // 1. Полезный сигнал
            const brain = Math.sin(time * 2.0) * 20;

            // 2. Расчет уровня шума
            // Мы нормализуем шум относительно "плохого" порога для текущего режима.
            // Иначе для сухих (3000 кОм) шум просто разорвет график.
            // 100% шума = когда значение на уровне Orange порога
            const noiseRatio = activeElectrode.val / t.orange;

            // Шум (50 Гц)
            // Если ratio > 1, шум доминирует. Если < 0.2, шум исчезает.
            const noise = Math.sin(time * 15.0) * (30 * noiseRatio);

            // Дрейф
            const drift = Math.sin(time * 0.1) * (10 * noiseRatio);

            let signal = brain + noise + drift;

            // Если совсем плохой контакт, добавляем хаос (неконтакт)
            if (activeElectrode.val > t.orange) {
                signal += (Math.random() - 0.5) * 50;
            }

            chartData.shift();
            chartData.push(signal);

            // Отрисовка
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;

            // Цвет линии графика совпадает с качеством
            if (activeElectrode.val < t.green) ctx.strokeStyle = '#00ff00';
            else if (activeElectrode.val < t.orange) ctx.strokeStyle = '#ffae00';
            else ctx.strokeStyle = '#ff4d4d';

            const centerY = canvas.height / 2;
            for (let i = 0; i < chartData.length - 1; i++) {
                let y = centerY + chartData[i];
                if(y < 0) y = 0; if(y > canvas.height) y = canvas.height;
                if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i + 1, y);
            }
            ctx.stroke();

            this.activeInterval = requestAnimationFrame(drawSignal);
        };

        // Старт
        resetElectrodes(); // Инициализация
        drawSignal();
    }

    // --- 2.5 Типы ---
    initTypes() {
        const cardWet = this.container.querySelector('#card-wet');
        const cardDry = this.container.querySelector('#card-dry');
        const tableContainer = this.container.querySelector('#comparison-table-container');

        // Кейс
        const btnCaseWet = this.container.querySelector('#btn-case-wet');
        const btnCaseDry = this.container.querySelector('#btn-case-dry');
        const feedback = this.container.querySelector('#scenario-feedback');

        // Отрисовка SVG для карточек
        this.renderElectrodeSVG('visual-wet', 'wet');
        this.renderElectrodeSVG('visual-dry', 'dry');

        // Данные для таблицы
        const tableData = {
            wet: `
                <table class="vs-table fade-in">
                    <tr><th>Параметр</th><th>Мокрые (Гель)</th></tr>
                    <tr><td>Подготовка</td><td class="vs-bad">Долго (15-40 мин). Нужен абразив, гель, мытье головы.</td></tr>
                    <tr><td>Качество сигнала</td><td class="vs-good">Идеальное. Минимум шумов и артефактов движения.</td></tr>
                    <tr><td>Длительность</td><td class="vs-good">До 24-48 часов (гель не высыхает долго).</td></tr>
                    <tr><td>Применение</td><td>Клиническая диагностика, Наука (ERP).</td></tr>
                </table>
            `,
            dry: `
                <table class="vs-table fade-in">
                    <tr><th>Параметр</th><th>Сухие (BrainBit)</th></tr>
                    <tr><td>Подготовка</td><td class="vs-good">Мгновенно (1 мин). Просто надеть ободок.</td></tr>
                    <tr><td>Качество сигнала</td><td class="vs-neutral">Хорошее в покое, но чувствительны к движению (артефакты).</td></tr>
                    <tr><td>Длительность</td><td class="vs-neutral">Комфортно до 1-2 часов (механическое давление пинов).</td></tr>
                    <tr><td>Применение</td><td>БОС-тренинги, Медитация, Нейромаркетинг, Игры.</td></tr>
                </table>
            `
        };

        // Инициализация (по умолчанию открыты Мокрые)
        tableContainer.innerHTML = tableData.wet;

        // Переключение табов
        const switchTab = (type) => {
            if (type === 'wet') {
                cardWet.classList.add('active');
                cardDry.classList.remove('active');
                tableContainer.innerHTML = tableData.wet;
            } else {
                cardDry.classList.add('active');
                cardWet.classList.remove('active');
                tableContainer.innerHTML = tableData.dry;
            }
        };

        cardWet.onclick = () => switchTab('wet');
        cardDry.onclick = () => switchTab('dry');

        // Логика Кейса
        btnCaseWet.onclick = () => {
            feedback.innerHTML = '<span style="color:green">✓ Абсолютно верно.</span> Для сна и диагностики нужны только мокрые электроды (стабильность контакта часами). Сухие сползут или будут давить.';
            btnCaseWet.style.background = '#d4edda';
        };
        btnCaseDry.onclick = () => {
            feedback.innerHTML = '<span style="color:red">✗ Ошибка.</span> Сухие электроды не подходят для сна (давят, смещаются на подушке). BrainBit — для бодрствования.';
            btnCaseDry.style.background = '#f8d7da';
        };
    }

    // Хелпер для рисования иконок электродов
    renderElectrodeSVG(containerId, type) {
        const container = this.container.querySelector(`#${containerId}`);
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100"); svg.setAttribute("height", "80");
        svg.setAttribute("viewBox", "0 0 100 80");

        if (type === 'wet') {
            // Чашечка + Гель
            // Кожа
            const skin = document.createElementNS(svgNS, "rect");
            skin.setAttribute("x", "10"); skin.setAttribute("y", "60");
            skin.setAttribute("width", "80"); skin.setAttribute("height", "10");
            skin.setAttribute("fill", "#e6d0b3");
            svg.appendChild(skin);

            // Гель (Капля)
            const gel = document.createElementNS(svgNS, "path");
            gel.setAttribute("d", "M 35 60 Q 50 40 65 60");
            gel.setAttribute("fill", "#81ecec"); // Cyan gel
            svg.appendChild(gel);

            // Чашечка электрода
            const cup = document.createElementNS(svgNS, "path");
            cup.setAttribute("d", "M 30 55 Q 50 10 70 55");
            cup.setAttribute("fill", "#95a5a6"); // Silver
            cup.setAttribute("stroke", "#7f8c8d");
            svg.appendChild(cup);

            // Провод
            const wire = document.createElementNS(svgNS, "path");
            wire.setAttribute("d", "M 50 32 L 50 0");
            wire.setAttribute("stroke", "#333"); wire.setAttribute("stroke-width", "2");
            svg.appendChild(wire);

        } else {
            // Сухой (BrainBit Pin)
            // Кожа
            const skin = document.createElementNS(svgNS, "rect");
            skin.setAttribute("x", "10"); skin.setAttribute("y", "60");
            skin.setAttribute("width", "80"); skin.setAttribute("height", "10");
            skin.setAttribute("fill", "#e6d0b3");
            svg.appendChild(skin);

            // Основание
            const base = document.createElementNS(svgNS, "rect");
            base.setAttribute("x", "30"); base.setAttribute("y", "20");
            base.setAttribute("width", "40"); base.setAttribute("height", "10");
            base.setAttribute("fill", "#f1c40f"); // Gold
            svg.appendChild(base);

            // Ножки (Пины)
            for(let i=0; i<3; i++) {
                const pin = document.createElementNS(svgNS, "line");
                pin.setAttribute("x1", 35 + i*15); pin.setAttribute("y1", "30");
                pin.setAttribute("x2", 35 + i*15); pin.setAttribute("y2", "60"); // Впиваются в кожу
                pin.setAttribute("stroke", "#f39c12");
                pin.setAttribute("stroke-width", "3");
                pin.setAttribute("stroke-linecap", "round");
                svg.appendChild(pin);
            }

            // Провод (внутри корпуса)
            const wire = document.createElementNS(svgNS, "path");
            wire.setAttribute("d", "M 50 20 L 50 0");
            wire.setAttribute("stroke", "#333"); wire.setAttribute("stroke-width", "2");
            svg.appendChild(wire);
        }

        container.appendChild(svg);
    }

    // --- 2.6 Квиз
initQuiz() {
        const container = this.container.querySelector('#quiz-container');
        const resultBox = this.container.querySelector('#quiz-result');
        const nextBtn = this.container.querySelector('#next-btn'); // Кнопка "Завершить"

        if (!container) return;

        // Блокируем выход, пока не ответит
        if (nextBtn) nextBtn.disabled = true;

        const questions = [
            {
                text: "1. Зачем нужен электрод Заземления (GND), если полезный сигнал мы получаем вычитанием Референта из Активного?",
                options: [
                    { text: "Он нужен только для безопасности, чтобы пациента не ударило током.", correct: false },
                    { text: "Он удерживает общий потенциал тела в рабочем диапазоне усилителя, предотвращая насыщение.", correct: true },
                    { text: "Он усиливает Альфа-ритм.", correct: false },
                    { text: "Земля не нужна, если используется Bluetooth-соединение.", correct: false }
                ],
                explanation: "Без заземления потенциалы входов 'улетают' в потолок (насыщение), и усилителю просто нечего вычитать. GND — это фундамент для измерений."
            },
            {
                text: "2. Вы видите на мониторе 'жирную' регулярную синусоиду частотой 50 Гц, которая полностью перекрывает сигнал мозга. О чем это говорит?",
                options: [
                    { text: "Пациент сильно напряг мышцы шеи.", correct: false }, // Это был бы хаос, а не синусоида
                    { text: "У пациента очень мощный Бета-ритм (высокий интеллект).", correct: false },
                    { text: "Высокий импеданс (плохой контакт) на одном из электродов.", correct: true },
                    { text: "Пациент моргнул.", correct: false }
                ],
                explanation: "Регулярная помеха 50 Гц — это всегда сетевая наводка. Она пролезает в сигнал, когда сопротивление кожи (импеданс) слишком велико."
            },
            {
                text: "3. В карточке пациента написано: «Эпилептиформная активность в отведении C4». Где находится проблема?",
                options: [
                    { text: "В левом полушарии, в зрительной коре.", correct: false },
                    { text: "В правом полушарии, в моторной (центральной) коре.", correct: true },
                    { text: "На макушке, ровно по центру.", correct: false }, // Это Cz
                    { text: "В правом виске.", correct: false } // Это T4
                ],
                explanation: "Разбираем 10-20: C = Central (Центр/Моторная), Четная цифра (4) = Правая сторона."
            },
            {
                text: "4. Почему сухие электроды (BrainBit) более чувствительны к артефактам движения, чем мокрые?",
                options: [
                    { text: "Потому что у них нет гелевой подушки, которая гасит механические вибрации.", correct: true },
                    { text: "Потому что золото проводит ток хуже, чем хлорсеребро.", correct: false }, // Золото проводит отлично
                    { text: "Потому что они используют Bluetooth, а он боится движения.", correct: false },
                    { text: "Это миф, сухие электроды работают стабильнее мокрых.", correct: false }
                ],
                explanation: "Гель — это вязкий буфер. Если провод дернется, гель сохранит контакт. Сухой электрод при малейшем сдвиге теряет контакт с кожей."
            },
            {
                text: "5. В какой последовательности обрабатывается сигнал?",
                options: [
                    { text: "Оцифровка (АЦП) -> Усиление -> Фильтрация на ПК.", correct: false }, // Нельзя оцифровать микровольты без усиления
                    { text: "Электрод -> Дифференциальное усиление -> АЦП -> Передача данных.", correct: true },
                    { text: "Электрод -> Передача по Bluetooth -> Усиление на компьютере.", correct: false },
                    { text: "Фильтрация 50Гц -> Электрод -> АЦП.", correct: false }
                ],
                explanation: "Сначала слабый сигнал нужно поймать (Электрод) и усилить/вычесть шум (Усилитель), и только потом мощный аналоговый сигнал можно превратить в цифру (АЦП)."
            }
        ];

        let answeredCount = 0;
        const totalQuestions = questions.length;

        // Рендер вопросов
        questions.forEach((q) => {
            const qBlock = document.createElement('div');
            qBlock.className = 'quiz-question';
            qBlock.dataset.answered = "false"; // Флаг для подсчета прогресса

            const title = document.createElement('h3');
            title.innerText = q.text;
            qBlock.appendChild(title);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';

            const explanation = document.createElement('div');
            explanation.className = 'quiz-explanation';
            explanation.innerText = q.explanation;

            // Перемешиваем ответы
            const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

            shuffledOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-btn';
                btn.innerText = opt.text;

                btn.onclick = () => {
                    // Блокируем повторное нажатие в этом вопросе
                    if (qBlock.dataset.answered === "true") return;
                    qBlock.dataset.answered = "true";
                    answeredCount++;

                    if (opt.correct) {
                        btn.classList.add('correct');
                    } else {
                        btn.classList.add('wrong');
                        // Подсвечиваем правильный для обучения
                        const correctBtn = Array.from(optionsDiv.children).find(b => {
                            // Ищем кнопку с текстом правильного ответа (немного костыльно, но работает без id)
                            return b.innerText === q.options.find(o => o.correct).text;
                        });
                        if (correctBtn) correctBtn.classList.add('correct');
                    }

                    explanation.style.display = 'block';

                    // Если ответили на все вопросы - открываем выход
                    if (answeredCount === totalQuestions) {
                        resultBox.style.display = 'block';
                        resultBox.classList.add('fade-in');
                        if (nextBtn) {
                            nextBtn.disabled = false;
                            nextBtn.innerText = "Завершить блок";
                        }
                    }
                };
                optionsDiv.appendChild(btn);
            });

            qBlock.appendChild(optionsDiv);
            qBlock.appendChild(explanation);
            container.appendChild(qBlock);
        });
    }
}