import BaseBlock from '../BaseBlock.js';
import { block5Data } from './data.js';

export default class Block5 extends BaseBlock {
    constructor(container, onBack) {
        super(container, onBack, block5Data);
    }

    mountInteractive(index) {
        const slideId = this.slides[index].id;
        this.stopAnimations();

        switch (slideId) {
            case 'epilepsy': this.initEpilepsy(); break;
            case 'bci': this.initBCI(); break;
            case 'nfb': this.initNFB(); break;
            case 'marketing': this.initMarketing(); break;
            case 'quiz': this.initQuiz(); break;
        }
    }

    // --- 5.1 КЛИНИЧЕСКАЯ ЭЭГ (СИМУЛЯТОР) ---
    initEpilepsy() {
        const canvas = this.container.querySelector('#epiCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // UI Элементы
        const controlsLearn = this.container.querySelector('#learn-controls');
        const controlsTest = this.container.querySelector('#test-info');
        const btnModeLearn = this.container.querySelector('#mode-learn');
        const btnModeTest = this.container.querySelector('#mode-test');

        const btnCatch = this.container.querySelector('#btn-catch');
        const feedbackEl = this.container.querySelector('#game-feedback');
        const scoreEl = this.container.querySelector('#score-val');

        // Кнопки генерации (только для обучения)
        const btns = {
            spike: this.container.querySelector('#btn-spike'),
            sharp: this.container.querySelector('#btn-sharp'),
            wave: this.container.querySelector('#btn-wave'),
            blink: this.container.querySelector('#btn-blink'),
            emg: this.container.querySelector('#btn-emg')
        };

        // Состояние игры
        let isTestRunning = false;
        let score = 0;
        let globalTime = 0;
        const speed = 3; // Скорость ленты (пикселей/кадр)

        // Очередь событий
        // Структура: { type: 'spike', x: 700, width: 30, isTarget: true, active: true }
        let events = [];
        const bufferLength = canvas.width + 200; // Запас справа для генерации
        const data = new Array(bufferLength).fill(0);

        // --- УПРАВЛЕНИЕ РЕЖИМАМИ ---
        const setMode = (mode) => {
            if (mode === 'test') {
                isTestRunning = true;
                score = 0;
                scoreEl.innerText = '0';
                controlsLearn.style.display = 'none';
                controlsTest.style.display = 'block';
                btnModeTest.classList.add('active');
                btnModeLearn.classList.remove('active');
                feedbackEl.innerText = "Тест начат. Ждите патологию...";
                feedbackEl.style.color = "#fff";
            } else {
                isTestRunning = false;
                controlsLearn.style.display = 'block';
                controlsTest.style.display = 'none';
                btnModeLearn.classList.add('active');
                btnModeTest.classList.remove('active');
                feedbackEl.innerText = "Режим обучения. Нажимайте кнопки сверху.";
                feedbackEl.style.color = "#fab1a0";
            }
        };

        btnModeLearn.onclick = () => setMode('learn');
        btnModeTest.onclick = () => setMode('test');

        // --- ГЕНЕРАТОРЫ СОБЫТИЙ ---

        const spawnEvent = (type) => {
            const startX = bufferLength;
            let width = 0;
            let isTarget = false;
            let name = "";

            switch(type) {
                case 'spike':
                    width = 30; isTarget = true; name = "Спайк"; break;
                case 'sharp':
                    width = 60; isTarget = true; name = "Острая волна"; break;
                case 'wave':
                    width = 100; isTarget = true; name = "Пик-Волна"; break;
                case 'blink':
                    width = 120; isTarget = false; name = "Артефакт: Моргание"; break;
                case 'emg':
                    width = 80; isTarget = false; name = "Артефакт: Мышцы"; break;
            }

            events.push({ type, x: startX, width, isTarget, name, active: true });
        };

        // Привязка кнопок обучения
        Object.keys(btns).forEach(key => {
            if(btns[key]) btns[key].onclick = () => {
                spawnEvent(key);
                feedbackEl.innerText = `Генерация: ${key.toUpperCase()}`;
                feedbackEl.style.color = "#ccc";
            };
        });

        // --- ИГРОВАЯ МЕХАНИКА (Catch) ---
        btnCatch.onclick = () => {
            // Зона захвата: Правые 50px ... 170px от края (120px ширина)
            const zoneEnd = canvas.width - 200;
            const zoneStart = canvas.width - 320;

            // Ищем события, центры которых внутри зоны
            const hits = events.filter(e => e.x > zoneStart && e.x < zoneEnd && e.active);

            // Приоритет: Если в зоне есть Патология - мы её поймали.
            // Если только Артефакт - ошибка.

            const targetHit = hits.find(e => e.isTarget);
            const artifactHit = hits.find(e => !e.isTarget);

            if (targetHit) {
                // УСПЕХ
                score += 100;
                feedbackEl.innerHTML = `✅ ПОЙМАНО: <b>${targetHit.name}</b>!`;
                feedbackEl.style.color = "#00ff00";
                targetHit.active = false; // "Съели" событие

                // Вспышка экрана
                canvas.style.boxShadow = "0 0 30px #00ff00";
                setTimeout(() => canvas.style.boxShadow = "none", 300);
            }
            else if (artifactHit) {
                // ОШИБКА (Поймал мусор)
                score -= 50;
                feedbackEl.innerHTML = `❌ ОШИБКА! Это <b>${artifactHit.name}</b>, а не болезнь.`;
                feedbackEl.style.color = "#ff4757";

                canvas.style.boxShadow = "0 0 30px #ff4757";
                setTimeout(() => canvas.style.boxShadow = "none", 300);
            }
            else {
                // ПРОМАХ (Пусто)
                score -= 10;
                feedbackEl.innerText = "⚠️ Пусто. Не торопитесь.";
                feedbackEl.style.color = "#e67e22";
            }
            scoreEl.innerText = score;
        };

        // --- ЦИКЛ ОТРИСОВКИ ---
        const draw = () => {
            globalTime += 0.1;

            // 1. АВТО-ГЕНЕРАЦИЯ (Только в режиме теста)
            if (isTestRunning && Math.random() < 0.015) { // ~1 раз в секунду шанс
                const r = Math.random();
                // 40% Артефакты, 60% Патологии
                if (r < 0.2) spawnEvent('blink');
                else if (r < 0.4) spawnEvent('emg');
                else if (r < 0.6) spawnEvent('spike');
                else if (r < 0.8) spawnEvent('sharp');
                else spawnEvent('wave');
            }

            // 2. ДВИЖЕНИЕ ЛЕНТЫ
            // Сдвигаем массив данных
            data.splice(0, speed);

            // Генерируем фон (хвост)
            for (let i = 0; i < speed; i++) {
                const t = globalTime + (i * 0.05);
                // Альфа-ритм + Бета
                const val = Math.sin(t * 2.0) * 8 * ((Math.sin(t*0.3)+2)/2)
                          + Math.sin(t * 5.0) * 3
                          + (Math.random()-0.5) * 3;
                data.push(val);
            }

            // 3. ОТРИСОВКА
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.lineWidth = 1; ctx.strokeStyle = '#003300'; ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
            for (let y = 0; y < canvas.height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
            ctx.stroke();

            // Рисуем сигнал + События
            ctx.beginPath();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < data.length; i++) {
                let yVal = data[i];

                // Накладываем события
                // (Это можно оптимизировать, но для <10 событий норм)
                events.forEach(e => {
                    const dist = i - e.x;
                    if (Math.abs(dist) < e.width) {
                        let shape = 0;

                        // ФОРМУЛЫ ПАТТЕРНОВ
                        if (e.type === 'spike') {
                            shape = -120 * Math.exp(-(dist*dist)/30); // Очень узкий пик вниз
                        }
                        else if (e.type === 'sharp') {
                            shape = -90 * Math.exp(-(dist*dist)/200); // Треугольник
                        }
                        else if (e.type === 'wave') {
                            // Пик-Волна
                            const sp = -130 * Math.exp(-((dist+20)*(dist+20))/20);
                            const wv = 70 * Math.exp(-((dist-20)*(dist-20))/1000) * Math.sin(dist*0.05);
                            shape = sp + wv;
                        }
                        else if (e.type === 'blink') {
                            // Моргание: Огромный медленный холм
                            shape = 150 * Math.exp(-(dist*dist)/2000);
                        }
                        else if (e.type === 'emg') {
                            // ЭМГ: Высокочастотный шум
                            if (Math.abs(dist) < 60) {
                                shape = (Math.random()-0.5) * 80;
                            }
                        }

                        yVal += shape;
                    }
                });

                // Рисуем только то, что влазит в канвас
                if (i < canvas.width) {
                    const y = centerY + yVal;
                    if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
                }
            }
            ctx.stroke();

            // 4. ОБНОВЛЕНИЕ СОБЫТИЙ
            // Двигаем события влево
            events.forEach(e => e.x -= speed);
            // Удаляем ушедшие за левый край
            events = events.filter(e => e.x > -200);

            this.activeInterval = requestAnimationFrame(draw);
        };

        // Старт (Режим обучения по умолчанию)
        setMode('learn');
        draw();
    }

    // --- 5.2 BCI ЛАБОРАТОРИЯ ---
    initBCI() {
        // Логика табов
        const tabs = this.container.querySelectorAll('.bci-tab-btn');
        const panes = this.container.querySelectorAll('.bci-pane');
        let currentLoop = null; // Для остановки анимации при смене таба

        const stopAll = () => {
            if (this.miInterval) cancelAnimationFrame(this.miInterval);
            if (this.p300Interval) cancelAnimationFrame(this.p300Interval);
            if (this.ssvepInterval) cancelAnimationFrame(this.ssvepInterval);
        };

        tabs.forEach(tab => {
            tab.onclick = () => {
                stopAll();
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const targetId = `tab-${tab.dataset.tab}`;
                this.container.querySelector(`#${targetId}`).classList.add('active');

                // Запуск логики конкретного таба
                if (tab.dataset.tab === 'mi') this.runMotorImagery();
                if (tab.dataset.tab === 'p300') this.runP300();
                if (tab.dataset.tab === 'ssvep') this.runSSVEP();
            };
        });

        // Запуск первого таба по умолчанию
        this.runMotorImagery();
    }

    // === 1. MOTOR IMAGERY (Исправлено управление) ===
    runMotorImagery() {
        const headContainer = this.container.querySelector('#head-heatmap');
        const droneEl = this.container.querySelector('#player-drone');
        const btnLeft = this.container.querySelector('#cmd-left');
        const btnRight = this.container.querySelector('#cmd-right');

        if (!droneEl || !btnLeft) return;

        // 1. Рисуем голову (SVG) - без изменений
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 200 200");
        svg.style.width = "100%"; svg.style.height = "160px";

        svg.innerHTML = `
            <circle cx="100" cy="100" r="80" fill="none" stroke="#ccc" stroke-width="2" />
            <path d="M 90,20 L 100,5 L 110,20" fill="none" stroke="#ccc" />
            <g id="zone-c3">
                <circle cx="60" cy="100" r="25" fill="#333" class="heatmap-zone" />
                <text x="60" y="105" text-anchor="middle" fill="white" font-size="12">C3</text>
            </g>
            <g id="zone-c4">
                <circle cx="140" cy="100" r="25" fill="#333" class="heatmap-zone" />
                <text x="140" y="105" text-anchor="middle" fill="white" font-size="12">C4</text>
            </g>
        `;
        headContainer.innerHTML = '';
        headContainer.appendChild(svg);

        const c3 = svg.querySelector('#zone-c3 circle');
        const c4 = svg.querySelector('#zone-c4 circle');

        // 2. Логика управления
        // Используем числа с плавающей точкой для точности
        let targetPos = 50.0;
        let currentPos = 50.0;

        // Команды
        const setLeft = () => {
            targetPos = 5.0; // Цель - левый край (с отступом)
            c4.style.fill = '#ff7675'; // Активно Правое (C4)
            c3.style.fill = '#333';
            btnLeft.classList.add('pressed');
        };

        const setRight = () => {
            targetPos = 95.0; // Цель - правый край
            c3.style.fill = '#ff7675'; // Активно Левое (C3)
            c4.style.fill = '#333';
            btnRight.classList.add('pressed');
        };

        const setIdle = () => {
            // ИЗМЕНЕНИЕ: Не сбрасываем в 50, а фиксируем текущую позицию
            targetPos = currentPos;

            // Визуально сбрасываем активность мозга (мы перестали "думать")
            c3.style.fill = '#333';
            c4.style.fill = '#333';
            btnLeft.classList.remove('pressed');
            btnRight.classList.remove('pressed');
        };

        // Привязываем события
        btnLeft.onmousedown = (e) => { e.preventDefault(); setLeft(); };
        btnRight.onmousedown = (e) => { e.preventDefault(); setRight(); };

        // Глобальный сброс (используем именованную функцию для удаления слушателя при желании)
        const onRelease = () => setIdle();
        document.addEventListener('mouseup', onRelease);

        // Touch события
        btnLeft.ontouchstart = (e) => { e.preventDefault(); setLeft(); };
        btnRight.ontouchstart = (e) => { e.preventDefault(); setRight(); };
        document.addEventListener('touchend', onRelease);

        // 3. Анимационный цикл
        const animate = () => {
            // ИЗМЕНЕНИЕ: Уменьшил коэффициент с 0.1 до 0.03 для плавности
            const lerpFactor = 0.03;
            const diff = targetPos - currentPos;

            // Двигаем, если есть разница (с защитой от микро-дрожания)
            if (Math.abs(diff) > 0.1) {
                currentPos += diff * lerpFactor;

                // Обновляем позицию
                droneEl.style.left = `${currentPos}%`;

                // Наклон дрона зависит от скорости (diff)
                // Ограничиваем угол наклона, чтобы не переворачивался (макс 25 градусов)
                let tilt = diff * 0.8;
                if (tilt > 25) tilt = 25;
                if (tilt < -25) tilt = -25;

                droneEl.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
            } else {
                // Когда остановились - выравниваем наклон
                // Плавный возврат в 0 градусов
                const currentRotation = parseFloat(droneEl.style.transform.replace(/[^0-9\-.,]/g, '').split(',')[2] || 0); // грубый парсинг или просто сброс
                // Проще просто сбросить:
                droneEl.style.transform = `translate(-50%, -50%) rotate(0deg)`;
            }

            this.miInterval = requestAnimationFrame(animate);
        };

        animate();
    }

    // === 2. P300 (Визуализация сигнала) ===
    runP300() {
        const grid = this.container.querySelector('#p300-matrix');
        const canvas = this.container.querySelector('#p300Canvas');
        const ctx = canvas.getContext('2d');
        const btnStart = this.container.querySelector('#btn-p300-start');
        const resultEl = this.container.querySelector('#p300-result');
        const targetEl = this.container.querySelector('#p300-target');

        // High DPI Canvas Fix
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const letters = ['A','B','C','D','E','F','G','H','I'];
        let targetLetter = 'B';
        let dataBuffer = new Array(200).fill(0); // График
        let p300Queue = []; // Очередь анимаций "всплеска"

        // Рендер сетки
        grid.innerHTML = '';
        letters.forEach(l => {
            const cell = document.createElement('div');
            cell.className = 'p300-cell';
            cell.id = `p300-${l}`;
            cell.innerText = l;
            grid.appendChild(cell);
        });

        const setTarget = (l) => {
            targetLetter = l;
            targetEl.innerText = l;
            grid.querySelectorAll('.p300-cell').forEach(c => c.classList.remove('target'));
            grid.querySelector(`#p300-${l}`).classList.add('target');
        };
        setTarget('B');

        // Анимация графика
        let time = 0;
        const drawSignal = () => {
            time += 0.1;

            // Базовый шум ЭЭГ
            let val = (Math.random() - 0.5) * 5 + Math.sin(time)*2;

            // Добавляем P300 волну, если она есть в очереди
            // (простая симуляция: если очередь не пуста, берем значение из синусоиды)
            if (p300Queue.length > 0) {
                const phase = p300Queue[0];
                // Рисуем холм (0 to PI)
                val += Math.sin(phase) * 40; // Амплитуда P300 (большая!)

                p300Queue[0] += 0.1; // Шаг фазы
                if (p300Queue[0] > Math.PI) p300Queue.shift(); // Волна закончилась
            }

            dataBuffer.shift();
            dataBuffer.push(val);

            // Отрисовка
            const w = rect.width;
            const h = rect.height;
            const cy = h / 2;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            // Сетка
            ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

            // Линия
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let i=0; i<dataBuffer.length; i++) {
                const x = (i / dataBuffer.length) * w;
                const y = cy - dataBuffer[i];
                if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            this.p300Interval = requestAnimationFrame(drawSignal);
        };
        drawSignal();

        // Логика сканирования
        btnStart.onclick = async () => {
            btnStart.disabled = true;
            resultEl.innerText = "";

            const rows = [['A','B','C'], ['D','E','F'], ['G','H','I']];

            // Проходим по рядам
            for (let row of rows) {
                // Вспышка
                row.forEach(id => document.getElementById(`p300-${id}`).classList.add('flash'));

                // Если в ряду есть ЦЕЛЬ -> Запускаем волну на графике
                if (row.includes(targetLetter)) {
                    // P300 возникает через 300мс после стимула. Симулируем задержку.
                    setTimeout(() => {
                        p300Queue.push(0); // Старт волны
                        // Рисуем маркер на графике
                        ctx.fillStyle = 'yellow';
                        ctx.fillText("P300!", rect.width - 50, 20);
                    }, 300);
                }

                await new Promise(r => setTimeout(r, 150)); // Время вспышки
                row.forEach(id => document.getElementById(`p300-${id}`).classList.remove('flash'));
                await new Promise(r => setTimeout(r, 300)); // Пауза
            }

            resultEl.innerText = `Распознано: ${targetLetter}`;
            resultEl.style.color = 'green';
            btnStart.disabled = false;

            // Новый таргет
            const next = letters[Math.floor(Math.random()*letters.length)];
            setTarget(next);
        };
    }

    // === 3. SSVEP (Четкий спектр) ===
    runSSVEP() {
        const canvas = this.container.querySelector('#ssvepCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const box12 = this.container.querySelector('#box-12hz');
        const box20 = this.container.querySelector('#box-20hz');

        // High DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        let activeFreq = 0;

        box12.onmouseenter = () => { box12.classList.add('active-15hz'); activeFreq = 12; }; // Используем анимацию 15hz css для 12
        box12.onmouseleave = () => { box12.classList.remove('active-15hz'); activeFreq = 0; };

        box20.onmouseenter = () => { box20.classList.add('active-10hz'); activeFreq = 20; }; // CSS класс не важен, важен freq
        box20.onmouseleave = () => { box20.classList.remove('active-10hz'); activeFreq = 0; };

        const drawSpectrum = () => {
            // Очистка
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, rect.width, rect.height);

            const w = rect.width;
            const h = rect.height;
            const maxFreq = 30; // График до 30 Гц

            // Функция столбика
            const bar = (hz, amp, color) => {
                const x = (hz / maxFreq) * w;
                const bh = amp * (h - 20);
                const y = h - bh;

                ctx.fillStyle = color;
                ctx.fillRect(x - 3, y, 6, bh);

                // Подпись
                ctx.fillStyle = '#aaa';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                if (amp > 0.3) ctx.fillText(`${hz}`, x, y - 5);
            };

            // Рисуем шумовой пол (альфа, бета)
            for(let f=1; f<30; f++) {
                // Альфа пик всегда есть немного на 10Гц
                let amp = (f === 10) ? 0.3 : 0.05;
                amp += Math.random() * 0.05;
                bar(f, amp, '#333');
            }

            // РЕАКЦИЯ SSVEP
            if (activeFreq > 0) {
                // Основной пик
                const flicker = 0.8 + Math.random()*0.1;
                bar(activeFreq, flicker, '#f1c40f');

                // Гармоника (2x частоты) - тоже частый эффект
                if (activeFreq * 2 < maxFreq) {
                    bar(activeFreq * 2, 0.4, '#f39c12');
                }
            }

            // Ось
            ctx.fillStyle = '#666';
            ctx.fillRect(0, h-1, w, 1);

            this.ssvepInterval = requestAnimationFrame(drawSpectrum);
        };
        drawSpectrum();
    }
    // --- 5.3 NEUROFEEDBACK (СИМУЛЯТОР ТРЕНИНГА) ---
    initNFB() {
        const rawCanvas = this.container.querySelector('#rawCanvas');
        const specCanvas = this.container.querySelector('#specCanvas');
        const trendCanvas = this.container.querySelector('#trendCanvas');

        if(!rawCanvas || !specCanvas || !trendCanvas) return;

        const ctxRaw = rawCanvas.getContext('2d');
        const ctxSpec = specCanvas.getContext('2d');
        const ctxTrend = trendCanvas.getContext('2d');

        // UI
        const btnAlpha = this.container.querySelector('#proto-alpha');
        const btnBeta = this.container.querySelector('#proto-beta');
        const slider = this.container.querySelector('#state-slider');
        const labelLeft = this.container.querySelector('#label-left');
        const labelRight = this.container.querySelector('#label-right');
        const trendValDisplay = this.container.querySelector('#trend-val');

        const gameScreen = this.container.querySelector('#game-screen');
        const car = this.container.querySelector('#nfb-car');
        const stripes = this.container.querySelector('#road-stripes');
        const rewardSign = this.container.querySelector('#reward-sign');

        // Отключаем CSS анимацию, так как будем двигать JS-ом
        stripes.style.animation = 'none';

        let protocol = 'alpha';
        let carPosition = 5;

        // Переменные для плавной анимации дороги
        let stripeOffset = 0;
        let currentSpeed = 0; // Текущая сглаженная скорость

        const rawData = new Array(150).fill(0);
        const trendData = new Array(100).fill(0);

        const setupProtocol = (p) => {
            protocol = p;
            if (p === 'alpha') {
                btnAlpha.classList.add('active');
                btnBeta.classList.remove('active');
                labelLeft.innerText = "Стресс (Низкая Альфа)";
                labelRight.innerText = "Релаксация (Высокая Альфа)";
            } else {
                btnBeta.classList.add('active');
                btnAlpha.classList.remove('active');
                labelLeft.innerText = "Рассеянность (Много Теты)";
                labelRight.innerText = "Концентрация (Много Беты)";
            }
            slider.value = 0;
            carPosition = 5;
            currentSpeed = 0;

            // Сброс визуала
            gameScreen.style.filter = 'grayscale(0.8) brightness(0.6)';
            rewardSign.style.opacity = 0;
        };

        btnAlpha.onclick = () => setupProtocol('alpha');
        btnBeta.onclick = () => setupProtocol('beta');

        let time = 0;

        const draw = () => {
            time += 0.1;
            const state = parseInt(slider.value) / 100;

            // --- 1. ГЕНЕРАЦИЯ ---
            let alphaAmp, betaAmp, thetaAmp;

            if (protocol === 'alpha') {
                alphaAmp = 10 + (state * 70);
                betaAmp = 15 - (state * 10);
                thetaAmp = 5;
            } else {
                betaAmp = 5 + (state * 35);
                thetaAmp = 30 - (state * 20);
            }

            const noise = (Math.random() - 0.5) * 2;
            const modAlpha = alphaAmp + Math.sin(time * 0.5) * 5 + noise;
            const modBeta = betaAmp + Math.sin(time * 2.0) * 2 + noise;
            const modTheta = thetaAmp + Math.sin(time * 0.2) * 3 + noise;

            const rawPoint =
                Math.sin(time * 2.0) * modAlpha +
                Math.sin(time * 5.0) * modBeta +
                Math.sin(time * 1.0) * modTheta;

            rawData.shift(); rawData.push(rawPoint);

            // --- 2. РАСЧЕТ ТРЕНДА ---
            let feedbackValue = 0;
            let threshold = 0;
            let maxGraphVal = 100;

            if (protocol === 'alpha') {
                feedbackValue = modAlpha;
                threshold = 45;
                maxGraphVal = 100;
            } else {
                feedbackValue = modBeta / (modTheta + 1);
                threshold = 1.0;
                maxGraphVal = 5.0;
            }

            trendData.shift(); trendData.push(feedbackValue);
            trendValDisplay.innerText = feedbackValue.toFixed(2);

            // --- 3. ФИЗИКА (СГЛАЖИВАНИЕ) ---
            const diff = feedbackValue - threshold;
            let targetSpeed = 0;

            if (diff > 0) {
                const speedFactor = protocol === 'alpha' ? 0.02 : 0.8;
                targetSpeed = diff * speedFactor;
                if (targetSpeed > 1.5) targetSpeed = 1.5;
            } else {
                targetSpeed = -0.1;
            }

            // Плавное изменение скорости (Lerp) - убирает рывки
            currentSpeed += (targetSpeed - currentSpeed) * 0.05;

            // Движение машинки
            carPosition += currentSpeed;
            if (carPosition > 85) carPosition = 85;
            if (carPosition < 5) carPosition = 5;
            car.style.left = `${carPosition}%`;

            // --- 4. АНИМАЦИЯ ДОРОГИ (JS) ---
            if (currentSpeed > 0) {
                // Двигаем полоски
                stripeOffset -= currentSpeed * 15; // Множитель визуальной скорости
                // Зацикливание паттерна (80px - ширина повтора градиента в CSS)
                if (stripeOffset < -80) stripeOffset += 80;

                stripes.style.transform = `translateX(${stripeOffset}px)`;

                // Яркость и награда
                const brightness = 1 + (currentSpeed * 0.5);
                gameScreen.style.filter = `brightness(${brightness})`;
                rewardSign.style.opacity = currentSpeed > 0.2 ? 1 : 0;
            } else {
                gameScreen.style.filter = 'grayscale(0.8) brightness(0.6)';
                rewardSign.style.opacity = 0;
                // Дорога стоит (не обновляем transform)
            }

            // --- 5. ОТРИСОВКА ГРАФИКОВ ---

            // Raw
            ctxRaw.fillStyle = '#000'; ctxRaw.fillRect(0, 0, rawCanvas.width, rawCanvas.height);
            ctxRaw.beginPath(); ctxRaw.strokeStyle = '#fff'; ctxRaw.lineWidth = 1;
            const cy = rawCanvas.height / 2;
            for(let i=0; i<rawData.length; i++) {
                const x = (i/rawData.length) * rawCanvas.width;
                const y = cy - (rawData[i] / 1.5);
                if(i===0) ctxRaw.moveTo(x, y); else ctxRaw.lineTo(x, y);
            }
            ctxRaw.stroke();

            // Spectrum
            ctxSpec.fillStyle = '#000'; ctxSpec.fillRect(0, 0, specCanvas.width, specCanvas.height);
            const w = specCanvas.width;
            const h = specCanvas.height;
            const drawBar = (hz, val, color, label) => {
                const x = (hz / 30) * w;
                const barH = Math.min(val * 1.5, h - 15);
                ctxSpec.fillStyle = color;
                ctxSpec.fillRect(x, h - barH, 15, barH);
                ctxSpec.fillStyle = '#aaa'; ctxSpec.font = '10px Arial';
                ctxSpec.fillText(label, x + 2, h - barH - 3);
            };
            drawBar(5, thetaAmp, '#3498db', 'θ');
            drawBar(10, alphaAmp, '#2ecc71', 'α');
            drawBar(20, betaAmp, '#e74c3c', 'β');

            // Trend
            ctxTrend.fillStyle = '#000'; ctxTrend.fillRect(0, 0, trendCanvas.width, trendCanvas.height);
            const thY = h - (threshold / maxGraphVal * h);
            ctxTrend.strokeStyle = '#555'; ctxTrend.setLineDash([4,4]);
            ctxTrend.beginPath(); ctxTrend.moveTo(0, thY); ctxTrend.lineTo(w, thY); ctxTrend.stroke();
            ctxTrend.setLineDash([]);
            ctxTrend.beginPath(); ctxTrend.lineWidth = 2;
            ctxTrend.strokeStyle = feedbackValue > threshold ? '#00ff00' : '#ff4757';

            for(let i=0; i<trendData.length; i++) {
                const x = (i/trendData.length) * w;
                const val = trendData[i];
                let y = h - (val / maxGraphVal * h);
                if(y > h) y = h; if(y < 0) y = 0;

                if(i===0) ctxTrend.moveTo(x, y); else ctxTrend.lineTo(x, y);
            }
            ctxTrend.stroke();

            this.activeInterval = requestAnimationFrame(draw);
        };

        setupProtocol('alpha');
        draw();
    }

    // --- 5.4 NEUROMARKETING (СИМУЛЯТОР АНАЛИТИКА) ---
    initMarketing() {
        const chartEng = this.container.querySelector('#chart-eng');
        const chartVal = this.container.querySelector('#chart-val');
        const timeline = this.container.querySelector('#nm-timeline');
        const adScreen = this.container.querySelector('#ad-screen');
        const topoContainer = this.container.querySelector('#head-topo');
        const valIndicator = this.container.querySelector('#val-indicator');
        const btnPlay = this.container.querySelector('#btn-play');

        // Курсоры
        const mainCursor = this.container.querySelector('#main-playhead');
        const cursorEng = this.container.querySelector('#cursor-eng');
        const cursorVal = this.container.querySelector('#cursor-val');

        const quizBlock = this.container.querySelector('#nm-analysis');
        const quizOptions = this.container.querySelector('#nm-quiz-options');
        const quizFeedback = this.container.querySelector('#nm-quiz-feedback');

        if(!chartEng) return;

        const ctxEng = chartEng.getContext('2d');
        const ctxVal = chartVal.getContext('2d');

        // 1. ДАННЫЕ (Сценарий)
        const scenario = [
            { t: 0, text: "Intro<br>(Природа)", eng: 0.3, val: 0.2 },
            { t: 2, text: "Девушка<br>улыбается", eng: 0.8, val: 0.7 },
            { t: 4, text: "Крупный план<br>Товара", eng: 0.9, val: 0.5 },
            { t: 6, text: "ЦЕНА:<br>99 000₽", eng: 1.0, val: -0.9 }, // Pain of Paying
            { t: 8, text: "Логотип<br>Бренда", eng: 0.4, val: -0.2 },
            { t: 10, text: "Конец", eng: 0.1, val: 0.0 }
        ];

        const totalDuration = 10; // сек
        const fps = 30;
        const totalFrames = totalDuration * fps;

        // 2. ОТРИСОВКА ГОЛОВЫ
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.style.width = "100%"; svg.style.height = "100%";
        svg.innerHTML = `
            <circle cx="50" cy="50" r="45" fill="none" stroke="#ccc" />
            <path d="M 45,5 L 50,0 L 55,5" fill="none" stroke="#ccc" />
            <circle id="topo-f3" cx="35" cy="35" r="13" fill="#333" />
            <circle id="topo-f4" cx="65" cy="35" r="13" fill="#333" />
        `;
        topoContainer.appendChild(svg);
        const f3 = svg.querySelector('#topo-f3');
        const f4 = svg.querySelector('#topo-f4');

        // 3. ГЕНЕРАЦИЯ ДАННЫХ (Предрасчет графиков)
        const engData = [];
        const valData = [];

        for(let f=0; f<=totalFrames; f++) {
            const time = f / fps;
            // Интерполяция
            const p1 = scenario.find(s => s.t <= time && (scenario[scenario.indexOf(s)+1]?.t > time || !scenario[scenario.indexOf(s)+1]));
            const p2 = scenario[scenario.indexOf(p1) + 1] || p1;
            const ratio = (time - p1.t) / (p2.t - p1.t || 1);

            // Данные с шумом
            engData.push(p1.eng + (p2.eng - p1.eng) * ratio + (Math.random()-0.5)*0.05);
            valData.push(p1.val + (p2.val - p1.val) * ratio + (Math.random()-0.5)*0.05);
        }

        // Рендер маркеров таймлайна
        scenario.forEach(s => {
            const m = document.createElement('div');
            m.className = 'timeline-marker';
            m.style.left = `${(s.t / totalDuration) * 100}%`;
            m.innerText = s.t + 's';
            timeline.appendChild(m);
        });

        // 4. ОТРИСОВКА ГРАФИКОВ (Статичная подложка)
        // Мы рисуем графики один раз полностью, а "Playhead" бежит поверх
        const drawFullChart = (ctx, data, color, isCenterZero) => {
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            ctx.clearRect(0,0, w, h);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            for(let i=0; i<data.length; i++) {
                const x = (i/totalFrames) * w;
                let y;
                if (isCenterZero) {
                    // -1..1 -> 0..h
                    y = (h/2) - (data[i] * (h/2) * 0.9); // 0.9 отступ
                } else {
                    // 0..1 -> h..0
                    y = h - (data[i] * h * 0.9);
                }
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.stroke();
        };

        // Рисуем графики сразу
        drawFullChart(ctxEng, engData, '#e67e22', false);
        // Valence красим градиентом в функции обновления или просто серым,
        // но лучше нарисовать сегментами
        const drawValChart = () => {
            const w = ctxVal.canvas.width;
            const h = ctxVal.canvas.height;
            ctxVal.clearRect(0,0,w,h);
            ctxVal.lineWidth = 2;
            for(let i=1; i<valData.length; i++) {
                const x1 = ((i-1)/totalFrames) * w;
                const y1 = (h/2) - (valData[i-1] * (h/2) * 0.9);
                const x2 = (i/totalFrames) * w;
                const y2 = (h/2) - (valData[i] * (h/2) * 0.9);

                ctxVal.beginPath();
                ctxVal.strokeStyle = valData[i] >= 0 ? '#2ecc71' : '#ff7675';
                ctxVal.moveTo(x1,y1); ctxVal.lineTo(x2,y2);
                ctxVal.stroke();
            }
        };
        drawValChart();


        // 5. ЛОГИКА ОБНОВЛЕНИЯ СОСТОЯНИЯ (Скраббинг и Плей)
        let currentFrame = 0;
        let isPlaying = false;

        const updateVisuals = (frameIndex) => {
            // Ограничения
            if (frameIndex < 0) frameIndex = 0;
            if (frameIndex >= totalFrames) frameIndex = totalFrames - 1;

            const progressPct = (frameIndex / totalFrames) * 100;
            const eng = engData[frameIndex];
            const val = valData[frameIndex];
            const time = frameIndex / fps;

            // A. Двигаем курсоры
            mainCursor.style.left = `${progressPct}%`;
            cursorEng.style.left = `${progressPct}%`;
            cursorVal.style.left = `${progressPct}%`;

            // B. Обновляем Видео
            // Находим сцену
            const scene = scenario.slice().reverse().find(s => s.t <= time);
            if (scene) {
                // Цвет текста
                const color = val > 0.2 ? '#2ecc71' : (val < -0.2 ? '#ff7675' : '#fff');
                adScreen.innerHTML = `
                    <div style="color:${color}; font-weight:bold;">${scene.text}</div>
                    <div style="font-size:12px; margin-top:10px; color:#888;">${time.toFixed(1)}s</div>
                `;
            }

            // C. Топограмма (Асимметрия)
            // Визуализируем активацию
            if (val > 0.15) {
                // POSITIVE: Левое полушарие (F3) активно (красное), Правое (F4) спокойно
                f3.style.fill = `rgba(255, 80, 80, ${Math.min(1, val*1.5)})`;
                f4.style.fill = '#333';
            } else if (val < -0.15) {
                // NEGATIVE: Правое полушарие (F4) активно
                f3.style.fill = '#333';
                f4.style.fill = `rgba(255, 80, 80, ${Math.min(1, Math.abs(val)*1.5)})`;
            } else {
                f3.style.fill = '#333';
                f4.style.fill = '#333';
            }

            // Полоска индикатор
            valIndicator.style.left = `${((val + 1) / 2) * 100}%`;
        };

        // 6. УПРАВЛЕНИЕ (Клик по таймлайну)
        timeline.onclick = (e) => {
            // Если играет - пауза
            if(isPlaying) {
                isPlaying = false;
                cancelAnimationFrame(this.marketingAnim);
                btnPlay.innerText = "▶️ Play";
            }

            const rect = timeline.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;

            currentFrame = Math.floor(pct * totalFrames);
            updateVisuals(currentFrame);
        };

        // 7. ВОСПРОИЗВЕДЕНИЕ
        const playLoop = () => {
            if (!isPlaying) return;

            if (currentFrame >= totalFrames - 1) {
                isPlaying = false;
                btnPlay.innerText = "↺ Повторить";
                quizBlock.style.display = 'block'; // Показать квиз в конце
                return;
            }

            currentFrame++;
            updateVisuals(currentFrame);
            this.marketingAnim = requestAnimationFrame(playLoop);
        };

        btnPlay.onclick = () => {
            if (isPlaying) {
                isPlaying = false;
                cancelAnimationFrame(this.marketingAnim);
                btnPlay.innerText = "▶️ Play";
            } else {
                if (currentFrame >= totalFrames - 1) currentFrame = 0; // Рестарт
                isPlaying = true;
                btnPlay.innerText = "⏸️ Pause";
                playLoop();
            }
        };

        // 8. КВИЗ (Логика)
        const quizBtns = quizOptions.querySelectorAll('.quiz-btn');
        quizBtns.forEach(btn => {
            btn.onclick = () => {
                // Сброс стилей
                quizBtns.forEach(b => {
                    b.classList.remove('correct', 'wrong');
                    b.disabled = true; // Блокируем после ответа
                });

                const isCorrect = btn.dataset.correct === "true";
                quizFeedback.style.display = 'block';

                if (isCorrect) {
                    btn.classList.add('correct');
                    quizFeedback.innerHTML = `
                        <div style="color:#155724; font-weight:bold; margin-bottom:5px;">✅ Верно!</div>
                        Это эффект <b>"Pain of Paying"</b>. Мозг воспринимает высокую цену как физическую боль (активация Островка). Высокое внимание + Негатив = Шок от цены.
                    `;
                    quizFeedback.style.background = "#d4edda";
                    quizFeedback.style.border = "1px solid #c3e6cb";
                } else {
                    btn.classList.add('wrong');
                    quizFeedback.innerHTML = `
                        <div style="color:#721c24; font-weight:bold; margin-bottom:5px;">❌ Не совсем так.</div>
                        Обратите внимание: уровень <b>Вовлеченности</b> (оранжевый график) был высоким. Значит, клиент смотрел внимательно, ему не было скучно. Проблема именно в эмоции (Валентности), которая упала в момент цены.
                    `;
                    quizFeedback.style.background = "#f8d7da";
                    quizFeedback.style.border = "1px solid #f5c6cb";
                }
            };
        });

        // Инициализация (1 кадр)
        updateVisuals(0);
    }
    initQuiz() {
        const container = this.container.querySelector('#exam-container');
        const resultScreen = this.container.querySelector('#exam-result');

        // Элементы результата
        const resIcon = this.container.querySelector('#result-icon');
        const resTitle = this.container.querySelector('#result-title');
        const resDesc = this.container.querySelector('#result-desc');
        const resScore = this.container.querySelector('#result-score');
        const btnRestart = this.container.querySelector('#btn-restart');
        const btnCert = this.container.querySelector('#btn-cert');

        if (!container) return;

        const questions = [
            {
                text: "1. Врач жалуется на сильную наводку 50 Гц. Импеданс идеальный (<5 кОм). В чем наиболее вероятная причина?",
                options: [
                    { text: "Врач забыл нанести гель.", correct: false },
                    { text: "В кабинете неисправно заземление розетки или прибор не заземлен.", correct: true },
                    { text: "Нужно включить фильтр низких частот (LPF).", correct: false },
                    { text: "Это мышечный артефакт пациента.", correct: false }
                ],
                explanation: "Если импеданс в норме, но наводка есть — значит, помехе 'некуда стекать'. Проблема в заземлении оборудования."
            },
            {
                text: "2. Исследователь хочет изучать Гамма-ритм (40 Гц). Частота дискретизации прибора — 50 Гц. Почему эксперимент провалится?",
                options: [
                    { text: "Возникнет Aliasing. Для 40 Гц нужна частота дискретизации минимум 80 Гц (Теорема Найквиста).", correct: true },
                    { text: "Гамма-ритм слишком слабый, его не видно.", correct: false },
                    { text: "50 Гц — это частота сети, она перекроет сигнал.", correct: false },
                    { text: "Прибор сгорит от перегрузки.", correct: false }
                ],
                explanation: "Чтобы записать волну, нужно минимум 2 точки на период. 50 Гц недостаточно для записи 40 Гц (нужно >80)."
            },
            {
                text: "3. Клиент выбирает оборудование для Нейромаркетинга (реакция на рекламу). Бюджет есть. Что технически лучше?",
                options: [
                    { text: "Нейрополиграф (Стационарный).", correct: false },
                    { text: "BrainBit Flex (Гибкое расположение).", correct: true },
                    { text: "Обычный BrainBit (Ободок).", correct: false },
                    { text: "Callibri (1 канал).", correct: false }
                ],
                explanation: "В маркетинге важны лобные доли (эмоции). Ободок BrainBit туда не достает. Полиграф пугает респондентов. Flex — идеальный баланс."
            },
            {
                text: "4. Резкий всплеск 200 мкВ в лобных отведениях (Fp1, Fp2), совпадающий со взглядом вниз. Что это?",
                options: [
                    { text: "Эпилептический спайк.", correct: false },
                    { text: "Артефакт окулограммы (ЭОГ).", correct: true },
                    { text: "Альфа-ритм.", correct: false },
                    { text: "Наводка от телефона.", correct: false }
                ],
                explanation: "Глаза — это мощные электрические диполи. Движение глаз создает огромный потенциал в лобной части."
            },
            {
                text: "5. В BCI (Motor Imagery) пользователь представляет движение ПРАВОЙ рукой. Где будет десинхронизация ритма?",
                options: [
                    { text: "В правом полушарии (C4).", correct: false },
                    { text: "В левом полушарии (C3) — контралатерально.", correct: true },
                    { text: "В затылочной доле (O1/O2).", correct: false },
                    { text: "В лобной доле (Fz).", correct: false }
                ],
                explanation: "Моторный контроль перекрестный: левое полушарие управляет правой стороной тела."
            },
            {
                text: "6. Зачем нужны раздельные фильтры HPF (ФВЧ) и LPF (ФНЧ)?",
                options: [
                    { text: "Чтобы инженер выбирал, какие данные сохранить (например, не срезать полезную Гамму).", correct: true },
                    { text: "Это просто для красоты интерфейса.", correct: false },
                    { text: "Фильтры всегда должны быть включены все сразу.", correct: false },
                    { text: "Они дублируют друг друга для надежности.", correct: false }
                ],
                explanation: "Автоматическая фильтрация может удалить важные данные. Инженер должен иметь контроль."
            },
            {
                text: "7. Почему сухие электроды имеют ножки (пины)?",
                options: [
                    { text: "Для красоты.", correct: false },
                    { text: "Чтобы проходить сквозь волосы к коже головы.", correct: true },
                    { text: "Чтобы увеличить площадь контакта.", correct: false },
                    { text: "Чтобы царапать кожу для лучшего контакта.", correct: false }
                ],
                explanation: "Волосы — изолятор. Пины позволяют раздвинуть их и коснуться кожи."
            },
            {
                text: "8. Какой параметр отвечает за динамический диапазон (запись слабого сигнала на фоне сильного дрейфа)?",
                options: [
                    { text: "Частота дискретизации (Гц).", correct: false },
                    { text: "Разрядность АЦП (24 бита).", correct: true },
                    { text: "Входное сопротивление.", correct: false },
                    { text: "Версия Bluetooth.", correct: false }
                ],
                explanation: "24 бита дают 16 млн градаций, позволяя оцифровать и огромный дрейф, и микроскопический сигнал мозга одновременно."
            },
            {
                text: "9. Протокол БОС 'Релаксация'. Какой ритм мы тренируем (повышаем)?",
                options: [
                    { text: "Бета-ритм (напряжение).", correct: false },
                    { text: "Тета-ритм (дремота).", correct: false },
                    { text: "Альфа-ритм (спокойствие).", correct: true },
                    { text: "Дельта-ритм (сон).", correct: false }
                ],
                explanation: "Альфа-тренинг — классика релаксации. Тета — это уже сонливость, а не расслабленное бодрствование."
            },
            {
                text: "10. Какое утверждение про датчик Callibri верно?",
                options: [
                    { text: "Это 24-канальный усилитель.", correct: false },
                    { text: "Это универсальный мини-датчик (ЭЭГ/ЭМГ/ЭКГ) на 1 канал.", correct: true },
                    { text: "Он работает только по USB.", correct: false },
                    { text: "Он требует шапочку с гелем.", correct: false }
                ],
                explanation: "Callibri — это датчик для одного отведения, который крепится на клейкие электроды."
            },
            {
                text: "11. Что такое 'Монополярный монтаж'?",
                options: [
                    { text: "Когда все электроды сравниваются с одним общим Референтом (например, ушным).", correct: true },
                    { text: "Когда измеряется разница между двумя соседними активными электродами (F3-C3).", correct: false },
                    { text: "Когда используется только один электрод без земли.", correct: false },
                    { text: "Запись с одной батарейкой.", correct: false }
                ],
                explanation: "Монополярный (референциальный) монтаж показывает абсолютную активность под электродом относительно нейтральной точки (уха)."
            },
            {
                text: "12. Вы видите на ЭЭГ ритмичные острые пики, которые совпадают с пульсом пациента (видно на ЭКГ канале). Что это?",
                options: [
                    { text: "Эпилептическая активность.", correct: false },
                    { text: "Кардиобаллистический артефакт (пульсация сосуда под электродом).", correct: true },
                    { text: "Альфа-ритм.", correct: false },
                    { text: "Наводка от Bluetooth.", correct: false }
                ],
                explanation: "Если электрод стоит на кровеносном сосуде, он может писать механическую пульсацию. Это артефакт."
            },
            {
                text: "13. Что делает преобразование Фурье (FFT)?",
                options: [
                    { text: "Очищает сигнал от шума.", correct: false },
                    { text: "Переводит сигнал из Временной области (волна) в Частотную (спектр/столбики).", correct: true },
                    { text: "Увеличивает амплитуду сигнала.", correct: false },
                    { text: "Передает данные на сервер.", correct: false }
                ],
                explanation: "FFT раскладывает сложную кривую на сумму простых синусоид, показывая, сколько энергии в какой частоте (спектр)."
            },
            {
                text: "14. У бодрствующего взрослого человека доминирует Дельта-ритм (1-3 Гц) высокой амплитуды. О чем это говорит?",
                options: [
                    { text: "Он очень расслаблен.", correct: false },
                    { text: "Это норма.", correct: false },
                    { text: "Это признак патологии (опухоль, повреждение) или очень глубокого сна (кома).", correct: true },
                    { text: "Он гений.", correct: false }
                ],
                explanation: "Дельта-ритм нормален только для младенцев и глубокого сна. В бодрствовании это серьезный «красный флаг»."
            },
            {
                text: "15. Почему при использовании сухих электродов (BrainBit) сигнал часто «плавает» первые 1-2 минуты после надевания?",
                options: [
                    { text: "Прибор прогревается.", correct: false },
                    { text: "Устанавливается емкостный контакт и происходит увлажнение кожи естественным потом.", correct: true },
                    { text: "Bluetooth ищет свободный канал.", correct: false },
                    { text: "Это баг прошивки.", correct: false }
                ],
                explanation: "Сухим электродам нужно время, чтобы микро-пот создал минимальный проводящий слой между металлом и кожей (снижение импеданса)."
            },
            {
                text: "16. Что означает термин P300 в нейроинтерфейсах?",
                options: [
                    { text: "Модель усилителя.", correct: false },
                    { text: "Положительная волна (Positive), возникающая через 300 мс после значимого стимула.", correct: true },
                    { text: "Частота процессора 300 МГц.", correct: false },
                    { text: "Пароль доступа к SDK.", correct: false }
                ],
                explanation: "P300 — это Вызванный Потенциал (ERP), маркер внимания. Используется в буквопечатающих интерфейсах."
            },
            {
                text: "17. Где находится электрод T4 по системе 10-20?",
                options: [
                    { text: "На затылке.", correct: false },
                    { text: "В правой височной области (Temporal).", correct: true },
                    { text: "В левой височной области.", correct: false }, // Это T3
                    { text: "На макушке.", correct: false }
                ],
                explanation: "T = Temporal (Висок). Четные цифры (4) = Правая сторона."
            },
            {
                text: "18. Зачем усилителю нужно высокое входное сопротивление (Input Impedance > 200 МОм)?",
                options: [
                    { text: "Чтобы не ударить пациента током.", correct: false },
                    { text: "Чтобы минимизировать потерю сигнала при высоком сопротивлении кожи (правило делителя напряжения).", correct: true },
                    { text: "Чтобы греться меньше.", correct: false },
                    { text: "Это маркетинговый ход.", correct: false }
                ],
                explanation: "Если сопротивление усилителя низкое, сигнал «потеряется» на сопротивлении кожи. Для сухих электродов это критически важно."
            },
            {
                text: "19. Какой артефакт сложнее всего отфильтровать, так как его частота совпадает с Бета/Гамма ритмами?",
                options: [
                    { text: "Дыхание.", correct: false },
                    { text: "ЭМГ (Мышечный шум).", correct: true },
                    { text: "Сетевая наводка 50 Гц (она узкая).", correct: false },
                    { text: "Моргание (оно медленное).", correct: false }
                ],
                explanation: "Спектр мышц (20-200 Гц) полностью перекрывает полезные высокочастотные ритмы мозга. Математически разделить их очень сложно."
            },
            {
                text: "20. Что такое «Гальваническая развязка» и зачем она нужна?",
                options: [
                    { text: "Это разделение электрических цепей пациента и сети 220В для безопасности (чтобы не ударило током при пробое).", correct: true },
                    { text: "Это способ передачи данных без проводов.", correct: false },
                    { text: "Это тип аккумулятора.", correct: false },
                    { text: "Это метод очистки электродов.", correct: false }
                ],
                explanation: "Медицинский стандарт безопасности. Пациент не должен иметь прямого электрического контакта с питающей сетью компьютера."
            }
        ];

        let currentQIndex = 0;
        let score = 0;

        // Рендер вопроса
        const renderQuestion = () => {
            container.innerHTML = '';

            if (currentQIndex >= questions.length) {
                showResults();
                return;
            }

            const q = questions[currentQIndex];

            const card = document.createElement('div');
            card.className = 'quiz-question fade-in';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; color:#888; font-size:12px; margin-bottom:10px;">
                    <span>ВОПРОС ${currentQIndex + 1} из ${questions.length}</span>
                    <span>Сложность: ⭐⭐</span>
                </div>
                <h3>${q.text}</h3>
                <div class="quiz-options" id="opts-container"></div>
                <div class="quiz-explanation" id="expl-container"></div>
            `;

            const optsContainer = card.querySelector('#opts-container');
            const explContainer = card.querySelector('#expl-container');

            // Перемешиваем ответы
            const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);

            shuffledOpts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-btn';
                btn.innerText = opt.text;

                btn.onclick = () => {
                    // Блокировка кнопок
                    const allBtns = optsContainer.querySelectorAll('.quiz-btn');
                    allBtns.forEach(b => b.disabled = true);

                    if (opt.correct) {
                        btn.classList.add('correct');
                        score++;
                        explContainer.innerHTML = `<b style="color:green">Верно!</b> ${q.explanation}`;
                        explContainer.style.background = "#d4edda";
                        explContainer.style.color = "#155724";
                    } else {
                        btn.classList.add('wrong');
                        // Показать правильный
                        const correctBtn = Array.from(allBtns).find(b => b.innerText === q.options.find(o=>o.correct).text);
                        if(correctBtn) correctBtn.classList.add('correct');

                        explContainer.innerHTML = `<b style="color:red">Ошибка.</b> ${q.explanation}`;
                        explContainer.style.background = "#f8d7da";
                        explContainer.style.color = "#721c24";
                    }

                    explContainer.style.display = 'block';

                    // Кнопка Далее
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'action-btn';
                    nextBtn.style.marginTop = '15px';
                    nextBtn.innerText = currentQIndex === questions.length - 1 ? "Завершить экзамен" : "Следующий вопрос";
                    nextBtn.onclick = () => {
                        currentQIndex++;
                        renderQuestion();
                    };
                    card.appendChild(nextBtn);
                };
                optsContainer.appendChild(btn);
            });

            container.appendChild(card);
        };

        const showResults = () => {
            container.style.display = 'none';
            resultScreen.style.display = 'block';

            const percent = (score / questions.length) * 100;
            const passed = score >= 8;

            if (passed) {
                resIcon.innerText = "🌳"; // Эмодзи дерева или кубка
                resTitle.innerText = "Курс успешно пройден!";
                resTitle.style.color = "#27ae60";

                // ЗАБАВНО-СЕРЬЕЗНОЕ СООБЩЕНИЕ
                resDesc.innerHTML = `
                    Курс пройден! Уровень синхронизации: 100%. <br><br>
                    Бумажного диплома не будет. Зачем вам лишняя макулатура, когда у вас теперь есть Знание? <br>
                    Мы сэкономили немного электричества и бумаги, а вы получили +10 к профессиональной карме и +50 к авторитету на совещаниях. <br>
                    Идите и несите свет просвещения (и низкий импеданс) в этот мир!
                `;

                // Убираем кнопку сертификата, оставляем только текст
                btnCert.style.display = 'none';
                btnRestart.style.display = 'none';

                // Добавляем кнопку "В меню"
                const btnExit = document.createElement('button');
                btnExit.className = 'action-btn';
                btnExit.innerText = "Вернуться в меню";
                btnExit.onclick = () => this.onBack(); // Возврат в главное меню
                resultScreen.appendChild(btnExit);

                resIcon.style.animation = "pulse 1s infinite";
            } else {
                resIcon.innerText = "📚";
                resTitle.innerText = "Почти получилось";
                resTitle.style.color = "#e67e22";
                resDesc.innerText = `Вы набрали ${score} из 20. Чтобы заслужить респект инженеров, нужно минимум 17.`;
                btnCert.style.display = 'none';
                btnRestart.style.display = 'inline-block';
            }

            resScore.innerText = `Результат: ${percent}%`;
        };

        // Запуск
        renderQuestion();
    }

}
