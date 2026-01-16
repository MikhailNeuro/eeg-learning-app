import BaseBlock from '../BaseBlock.js';
import { block1Data } from './data.js';

export default class Block1 extends BaseBlock {
    constructor(container, onBack) {
        super(container, onBack, block1Data);
    }

    // Этот метод вызывается автоматически из BaseBlock после отрисовки HTML
    mountInteractive(index) {
        const slideId = this.slides[index].id;
        this.stopAnimations(); // Важно останавливать предыдущие

        switch (slideId) {
            case 'neurons': this.initNeurons(); break;
            case 'skull': this.initSkullDemo(); break;
            case 'rhythms': this.initRhythmGenerator(); break;
            case 'artifacts': this.initArtifacts(); break; // <--- НОВОЕ
            case 'quiz': this.initQuiz(); break;
        }
    }

    // --- СЛАЙД 1: НЕЙРОНЫ ---
    initNeurons() {
        const canvas = this.container.querySelector('#neuronCanvas');
        const ctx = canvas.getContext('2d');
        const btnSync = this.container.querySelector('#btn-sync');
        const btnAsync = this.container.querySelector('#btn-async');
        const statusText = this.container.querySelector('#neuron-status');

        let isSync = false;
        let time = 0;

        // Настройки зон
        const splitX = canvas.width * 0.65; // Граница разделения экрана (65% под нейроны)
        const chartHeight = canvas.height;

        // Массив точек графика (для бегущей строки)
        const chartData = new Array(Math.floor(canvas.width - splitX)).fill(0);

        // Генерация нейронов (только в левой части)
        const neurons = Array.from({length: 60}, () => ({
            x: Math.random() * (splitX - 40) + 20, // Отступ от краев
            y: Math.random() * (canvas.height - 40) + 20,
            phase: Math.random() * Math.PI * 2 // Индивидуальная фаза мерцания
        }));

        const draw = () => {
            // 1. Очистка и фон
            ctx.fillStyle = '#000000'; // Черный фон как у приборов
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.08; // Скорость анимации

            // 2. Отрисовка разделителя (как будто это стенка черепа)
            ctx.fillStyle = '#333';
            ctx.fillRect(splitX - 2, 0, 4, canvas.height);

            // 3. Рисуем нейроны (Слева)
            let currentTotalSignal = 0;

            neurons.forEach(n => {
                let activityLevel;

                if (isSync) {
                    // При синхронизации все зависят от общего времени
                    // Используем Math.pow для более резких вспышек (как импульсы)
                    activityLevel = Math.pow((Math.sin(time) + 1) / 2, 3);
                } else {
                    // Асинхронно: каждый в своей фазе
                    activityLevel = Math.pow((Math.sin(time + n.phase) + 1) / 2, 3);
                }

                // Накапливаем общий сигнал.
                // Если асинхронно - сигналы (синусы) будут гасить друг друга.
                // Но для визуала мы сделаем хитрее: просто посчитаем мгновенное значение
                let signalContribution = isSync ? Math.sin(time) : Math.sin(time + n.phase);
                currentTotalSignal += signalContribution;

                // Рисуем точку нейрона
                const brightness = Math.floor(activityLevel * 255);
                ctx.fillStyle = `rgba(255, 215, 0, ${activityLevel})`; // Золотой цвет
                ctx.beginPath();
                ctx.arc(n.x, n.y, 4 + activityLevel * 3, 0, Math.PI * 2); // Пульсация размера
                ctx.fill();
            });

            // 4. Расчет результирующего сигнала для графика
            // Нормализуем значение, чтобы влезло в график
            let finalValue = 0;
            if (isSync) {
                // Большая красивая волна
                finalValue = Math.sin(time) * 40;
            } else {
                // Шум (случайные колебания около нуля)
                finalValue = (Math.random() - 0.5) * 5 + (currentTotalSignal / neurons.length) * 5;
            }

            // Сдвигаем массив данных графика (эффект бегущей строки)
            chartData.shift();
            chartData.push(finalValue);

            // 5. Отрисовка Графика (Справа)
            ctx.beginPath();
            ctx.strokeStyle = '#00ff00'; // Ядовито-зеленый цвет осциллографа
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';

            const chartCenterX = splitX + (canvas.width - splitX) / 2;
            const chartCenterY = canvas.height / 2;

            for (let i = 0; i < chartData.length; i++) {
                const px = splitX + i;
                const py = chartCenterY + chartData[i];
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // 6. Подписи и сетка на графике
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(splitX, chartCenterY);
            ctx.lineTo(canvas.width, chartCenterY); // Ноль-линия
            ctx.stroke();

            this.activeInterval = requestAnimationFrame(draw);
        };

        // Обработчики кнопок с переключением классов
        const toggleState = (syncState) => {
            isSync = syncState;

            if (isSync) {
                btnSync.classList.add('active');
                btnAsync.classList.remove('active');
                statusText.innerText = "Синхронизация! Потенциалы складываются в мощный ритм.";
                statusText.style.color = "#0056b3"; // Синий текст
            } else {
                btnAsync.classList.add('active');
                btnSync.classList.remove('active');
                statusText.innerText = "Десинхронизация. Нейроны активны, но суммарный сигнал гасится.";
                statusText.style.color = "#666";
            }
        };

        btnSync.onclick = () => toggleState(true);
        btnAsync.onclick = () => toggleState(false);

        draw();
    }

    // --- СЛАЙД 2: ЧЕРЕП ---
    initSkullDemo() {
        const canvas = this.container.querySelector('#attenuationCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const slider = this.container.querySelector('#skullSlider');
        const textVal = this.container.querySelector('#skullValue');

        // Массив для хранения точек графика (бегущая строка)
        const chartData = new Array(canvas.width).fill(0);
        let time = 0;

        const draw = () => {
            // 0. Подготовка данных
            const sliderVal = parseInt(slider.value); // от 1 до 100

            // Расчет толщины слоев (визуально)
            // Чем больше слайдер, тем толще слой кости (желтый)
            const boneThickness = 20 + sliderVal * 0.8;
            const brainY = 20; // Верхняя граница
            const boneY = brainY + 30; // Начало кости
            const skinY = boneY + boneThickness; // Начало кожи
            const electrodeY = skinY + 20; // Конец кожи / Электрод
            const chartAreaY = electrodeY + 10; // Где начинается график

            // Расчет амплитуды сигнала (Физика)
            // Амплитуда обратно пропорциональна квадрату расстояния (условно) + сопротивление
            const attenuationFactor = 1 + (sliderVal / 10);
            const baseAmplitude = 40; // Исходная сила сигнала
            const currentAmplitude = baseAmplitude / attenuationFactor;

            // Обновление текста
            if(sliderVal < 20) textVal.innerText = "Тонкий (Ребенок / Висок)";
            else if(sliderVal > 70) textVal.innerText = "Толстый (Затылок / Взрослый)";
            else textVal.innerText = "Средний";

            // 1. Очистка
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 2. Отрисовка Слоев (Схематичный разрез)
            // Мозг (Серый)
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(0, 0, canvas.width, boneY);
            ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.fillText("МОЗГ (ИСТОЧНИК)", 10, 15);

            // Кость (Желтый - меняется высота)
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(0, boneY, canvas.width, boneThickness);
            ctx.fillStyle = '#7f6000'; ctx.fillText("ЧЕРЕП (БАРЬЕР)", 10, boneY + 12);

            // Кожа (Бежевый)
            ctx.fillStyle = '#e6d0b3';
            ctx.fillRect(0, skinY, canvas.width, 20);
            ctx.fillStyle = '#8d6e63'; ctx.fillText("КОЖА", 10, skinY + 14);

            // 3. Генерация реалистичного ЭЭГ сигнала
            time += 0.1;

            // Формула ЭЭГ: Смесь Дельта (медленная) + Альфа (средняя) + Бета (быстрая) + Шум
            // Это создает характерную "зубчатость" реального сигнала
            const rawSignal =
                Math.sin(time * 0.5) * 1.5 +  // Дельта
                Math.sin(time * 2.0) * 1.0 +  // Альфа
                Math.sin(time * 5.0) * 0.5 +  // Бета
                (Math.random() - 0.5) * 0.5;  // Шум

            // Применяем затухание
            const processedSignal = rawSignal * currentAmplitude;

            // Сдвиг массива
            chartData.shift();
            chartData.push(processedSignal);

            // 4. Отрисовка Графика (Осциллограф внизу)
            // Фон графика
            const chartHeight = canvas.height - chartAreaY;
            ctx.fillStyle = '#222';
            ctx.fillRect(0, chartAreaY, canvas.width, chartHeight);

            // Сетка
            ctx.strokeStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(0, chartAreaY + chartHeight/2);
            ctx.lineTo(canvas.width, chartAreaY + chartHeight/2);
            ctx.stroke();

            // Линия сигнала
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00ff00'; // Зеленый люминофор

            // Рисуем
            for(let i=0; i < chartData.length; i++) {
                const x = i;
                const y = (chartAreaY + chartHeight/2) + chartData[i];
                if(i===0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Подпись амплитуды (виртуальная линейка)
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px monospace';
            const uV = Math.round(100 / attenuationFactor); // Условные микровольты
            ctx.fillText(`Amp: ~${uV} мкВ`, canvas.width - 100, chartAreaY + 20);

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }

    // --- СЛАЙД 3: ГЕНЕРАТОР РИТМОВ ---
    initRhythmGenerator() {
        const canvas = this.container.querySelector('#rhythmCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const infoBox = this.container.querySelector('#rhythm-info');

        // Ссылки на элементы
        const toggles = {
            delta: this.container.querySelector('#toggle-delta'),
            theta: this.container.querySelector('#toggle-theta'), // New
            alpha: this.container.querySelector('#toggle-alpha'),
            beta:  this.container.querySelector('#toggle-beta'),
            mains: this.container.querySelector('#toggle-mains'), // New
            emg:   this.container.querySelector('#toggle-emg')
        };

        const state = {
            delta: false, theta: false, alpha: true,
            beta: false, mains: false, emg: false
        };

        const chartData = new Array(canvas.width).fill(0);
        let time = 0;

        // Описания
        const descriptions = {
            delta: "<b>Дельта (0.5-4 Гц):</b> Самые медленные волны. Доминируют в глубоком сне. В бодрствовании — признак патологии или сонливости.",
            theta: "<b>Тета (4-8 Гц):</b> Состояние между сном и явью. Характерен для глубокой медитации, гипноза, а также при решении сложных творческих задач. У детей — норма.",
            alpha: "<b>Альфа (8-13 Гц):</b> Базовый ритм. Виден, когда мы спокойны и закрываем глаза. Имеет красивую веретенообразную форму (то громче, то тише).",
            beta: "<b>Бета (13-30 Гц):</b> Ритм активного интеллекта. Низкая амплитуда, высокая скорость. Появляется при разговоре, счете, тревоге.",
            mains: "<b>Сетевая наводка (50/60 Гц):</b> Технический артефакт от розеток и проводов. Выглядит как «жирная» регулярная пила. Убирается режекторным (Notch) фильтром.",
            emg: "<b>Мышечный артефакт (ЭМГ):</b> Хаотичный высокочастотный шум. Возникает, если пациент напряг лоб или сжал зубы. Полностью заглушает полезный сигнал.",
            mix: "<b>Суперпозиция волн:</b> Реальная картина ЭЭГ. Обратите внимание: сетевая наводка делает линию толстой, а мышцы добавляют хаотичные иглы."
        };

        const updateUI = () => {
            let activeCount = 0;
            let lastActive = '';

            for (const [key, el] of Object.entries(toggles)) {
                if(!el) continue; // Защита
                const checkbox = el.querySelector('input');
                state[key] = checkbox.checked;

                if (state[key]) {
                    el.classList.add('active');
                    activeCount++;
                    lastActive = key;
                } else {
                    el.classList.remove('active');
                }
            }

            if (activeCount === 0) infoBox.innerHTML = "Выберите ритм на пульте.";
            else if (activeCount === 1) infoBox.innerHTML = descriptions[lastActive];
            else infoBox.innerHTML = descriptions['mix'];
        };

        Object.values(toggles).forEach(el => {
            if(el) el.onchange = updateUI;
        });

        const draw = () => {
            time += 0.05;
            let signal = 0;

            // 1. Дельта (Медленная, ~2 Гц)
            if (state.delta) signal += Math.sin(time * 0.8) * 35;

            // 2. Тета (Средне-медленная, ~6 Гц)
            // Добавляем небольшую модуляцию, чтобы отличалась от синусоиды
            if (state.theta) signal += Math.sin(time * 1.5) * 25 + Math.sin(time * 1.6) * 5;

            // 3. Альфа (Веретена, ~10 Гц)
            if (state.alpha) {
                const carrier = Math.sin(time * 3.0);
                const envelope = (Math.sin(time * 0.5) + 1.5) / 2.5;
                signal += carrier * envelope * 20;
            }

            // 4. Бета (Быстрая, ~20 Гц)
            if (state.beta) signal += Math.sin(time * 6.0) * 8 + Math.sin(time * 7.0) * 4;

            // 5. Сеть 50Гц (Очень быстрая, регулярная)
            // Коэффициент времени высокий (15.0), чтобы создать эффект частой гребенки
            if (state.mains) {
                signal += Math.sin(time * 20.0) * 18;
            }

            // 6. ЭМГ (Случайный шум + спайки)
            if (state.emg) {
                const noise = (Math.random() - 0.5) * 30;
                const spike = (Math.random() > 0.96) ? (Math.random() - 0.5) * 80 : 0;
                signal += noise + spike;
            }

            chartData.shift();
            chartData.push(signal);

            // Отрисовка
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.strokeStyle = '#e9ecef'; ctx.lineWidth = 1; ctx.beginPath();
            for(let i=0; i<canvas.height; i+=40) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            ctx.stroke();

            // Ноль
            const centerY = canvas.height / 2;
            ctx.strokeStyle = '#adb5bd'; ctx.beginPath();
            ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.stroke();

            // График
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#212529'; // Черный по умолчанию

            // Если включена только наводка или только ЭМГ - красим в "опасный" цвет
            const isSignal = state.delta || state.theta || state.alpha || state.beta;
            const isArtifact = state.mains || state.emg;

            if (isArtifact && !isSignal) {
                ctx.strokeStyle = '#d63031'; // Красный (Тревога)
            } else if (state.mains && isSignal) {
                // Если сигнал смешан с наводкой, делаем линию чуть толще визуально (эффект размытия)
                ctx.lineWidth = 2;
            }

            for (let i = 0; i < chartData.length - 1; i++) {
                if (i === 0) ctx.moveTo(i, centerY + chartData[i]);
                else ctx.lineTo(i + 1, centerY + chartData[i+1]);
            }
            ctx.stroke();

            this.activeInterval = requestAnimationFrame(draw);
        };

        updateUI();
        draw();
    }

    // --- СЛАЙД 1.4: АРТЕФАКТЫ ---
    initArtifacts() {
        const canvas = this.container.querySelector('#artifactCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const infoBox = this.container.querySelector('#artifact-info');

        // Элементы управления
        const toggles = {
            clean: this.container.querySelector('#toggle-clean'),
            blink: this.container.querySelector('#toggle-blink'),
            muscle: this.container.querySelector('#toggle-muscle'),
            network: this.container.querySelector('#toggle-network')
        };

        const state = { clean: true, blink: false, muscle: false, network: false };

        // Параметры для симуляции моргания
        let blinkTimer = 0;       // Счетик времени до следующего моргания
        let isBlinking = false;   // Флаг: происходит ли моргание прямо сейчас
        let blinkPhase = 0;       // Фаза синусоиды для отрисовки холма моргания
        const blinkDuration = 60; // Длительность моргания (в кадрах) ~1 сек

        const chartData = new Array(canvas.width).fill(0);
        let time = 0;

        // Описания
        const messages = {
            clean: "<b>Чистый сигнал:</b> Нормальный Альфа-ритм покоя. Амплитуда около 30-40 мкВ. Выглядит аккуратно.",
            blink: "<b>Моргание (ЭОГ):</b> Глаз — это мощная батарейка (диполь). При движении века возникает гигантский всплеск (до 500-1000 мкВ), который полностью перекрывает сигнал мозга.",
            muscle: "<b>Мышцы (ЭМГ):</b> Высокочастотный шум. Если спектр мозга до 30 Гц, то мышцы могут давать 100-200 Гц. График становится «жирным» и нечитаемым.",
            network: "<b>Сеть 50Гц:</b> Регулярная помеха. Если у прибора плохой контакт (высокий импеданс) или нет заземления, провода ловят наводку от розеток.",
            combo: "<b>Каша:</b> Типичная картина новичка. Плохой контакт + пациент напряжен + моргает. Врач не сможет поставить диагноз по такой записи."
        };

        // Логика UI
        const updateUI = () => {
            let activeCount = 0;
            let lastKey = '';

            for (const [key, el] of Object.entries(toggles)) {
                if(!el) continue;
                state[key] = el.querySelector('input').checked;
                if (state[key]) {
                    el.classList.add('active');
                    activeCount++;
                    lastKey = key;
                } else {
                    el.classList.remove('active');
                }
            }

            // Текст подсказки
            if (activeCount === 0) infoBox.innerHTML = "Включите что-нибудь.";
            else if (activeCount > 1) infoBox.innerHTML = messages.combo;
            else infoBox.innerHTML = messages[lastKey];
        };

        Object.values(toggles).forEach(el => el.onchange = updateUI);

        const draw = () => {
            time += 0.05;
            let signal = 0;

            // 1. Базовый сигнал (Мозг)
            if (state.clean) {
                // Альфа-ритм с модуляцией
                signal += Math.sin(time * 3.0) * ((Math.sin(time * 0.5) + 1.5) / 2) * 20;
            }

            // 2. Моргание (Периодическое событие)
            if (state.blink) {
                if (!isBlinking) {
                    // Если не моргаем, уменьшаем таймер
                    blinkTimer--;
                    if (blinkTimer <= 0) {
                        // Запускаем моргание!
                        isBlinking = true;
                        blinkPhase = 0;
                        // Следующее моргание через случайное время (100-300 кадров)
                        blinkTimer = 100 + Math.random() * 200;
                    }
                } else {
                    // Процесс моргания
                    blinkPhase += Math.PI / blinkDuration; // Шаг фазы

                    // Форма моргания: Половина синусоиды (холм)
                    // Амплитуда 200 (в 10 раз больше мозга!)
                    const blinkValue = Math.sin(blinkPhase) * 200;

                    signal += blinkValue;

                    if (blinkPhase >= Math.PI) {
                        isBlinking = false; // Закончили моргать
                    }
                }
            }

            // 3. Мышцы (Хаос)
            if (state.muscle) {
                // Высокочастотный шум + случайные выстрелы
                signal += (Math.random() - 0.5) * 40;
                if (Math.random() > 0.95) signal += (Math.random() - 0.5) * 80;
            }

            // 4. Сеть (Регулярная пила)
            if (state.network) {
                signal += Math.sin(time * 25.0) * 15;
            }

            chartData.shift();
            chartData.push(signal);

            // ОТРИСОВКА
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.strokeStyle = '#e9ecef'; ctx.lineWidth = 1; ctx.beginPath();
            for(let i=0; i<canvas.height; i+=50) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); } // Горизонтали реже
            for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            ctx.stroke();

            // Ноль
            const centerY = canvas.height / 2 + 50; // Чуть сместим центр вниз, чтобы моргание (оно идет вверх) влезало
            ctx.strokeStyle = '#adb5bd'; ctx.beginPath();
            ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.stroke();

            // График
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#212529'; // Черный

            // Если включен любой артефакт, меняем цвет на красный/оранжевый для наглядности?
            // Лучше оставить черным как в софте, но если идет моргание - можно подсветить
            if (isBlinking) ctx.strokeStyle = '#6c5ce7'; // Фиолетовый во время моргания
            else if (state.muscle && !state.clean) ctx.strokeStyle = '#d63031'; // Красный

            for (let i = 0; i < chartData.length - 1; i++) {
                if (i === 0) ctx.moveTo(i, centerY - chartData[i]); // Минус, чтобы "+" шел вверх
                else ctx.lineTo(i + 1, centerY - chartData[i+1]);
            }
            ctx.stroke();

            // Подпись статуса моргания
            if (state.blink) {
                ctx.fillStyle = isBlinking ? '#6c5ce7' : '#ccc';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(isBlinking ? "👁 МОРГАНИЕ" : "👁 Глаз открыт...", 10, 20);
            }

            this.activeInterval = requestAnimationFrame(draw);
        };

        updateUI();
        draw();
    }

    // --- СЛАЙД 1.5: КВИЗ (СЛОЖНЫЙ) ---
    initQuiz() {
        const container = this.container.querySelector('#quiz-container');
        const resultBox = this.container.querySelector('#quiz-result');
        const nextBtn = this.container.querySelector('#next-btn'); // Кнопка "Завершить"

        if (!container) return;

        // Блокируем кнопку "Завершить", пока тест не пройден
        if (nextBtn) nextBtn.disabled = true;

        // База вопросов
        const questions = [
            {
                text: "1. Что физически регистрирует электрод ЭЭГ на поверхности скальпа?",
                options: [
                    { text: "Потенциалы действия (спайки) отдельных нейронов.", correct: false },
                    { text: "Суммарные постсинаптические потенциалы тысяч нейронов.", correct: true },
                    { text: "Движение крови по сосудам коры (гемодинамический ответ).", correct: false }, // Это fMRI
                    { text: "Электрическое сопротивление кожи.", correct: false } // Это КГР
                ],
                explanation: "ЭЭГ не видит одиночные нейроны (слишком слабые). Мы видим только результат синхронной работы тысяч клеток — постсинаптические потенциалы."
            },
            {
                text: "2. Почему амплитуда сигнала на скальпе в десятки раз меньше, чем на коре мозга?",
                options: [
                    { text: "Потому что нейроны работают в противофазе.", correct: false },
                    { text: "Из-за высокого электрического сопротивления костей черепа.", correct: true },
                    { text: "Потому что мозговая жидкость (ликвор) усиливает шум.", correct: false },
                    { text: "Сигнал теряется в проводах электрода.", correct: false }
                ],
                explanation: "Главный барьер — это череп. Кость работает как мощный резистор, гасящий амплитуду сигнала."
            },
            {
                text: "3. Пациент сидит расслабленно с закрытыми глазами. Вы видите ритмичные волны 10 Гц. Он открывает глаза, и ритм исчезает. Что это?",
                options: [
                    { text: "Это патология: исчезновение ритма говорит о нарушении работы коры.", correct: false },
                    { text: "Это артефакт моргания, который перекрыл сигнал.", correct: false },
                    { text: "Это нормальная «Реакция активации» (депрессия Альфа-ритма).", correct: true },
                    { text: "Это переход из Дельта-ритма в Бета-ритм.", correct: false }
                ],
                explanation: "Альфа-ритм — ритм покоя и закрытых глаз. При открытии глаз мозг начинает обрабатывать зрительную информацию, и Альфа сменяется быстрой Бетой (десинхронизация)."
            },
            {
                text: "4. Вы видите на записи «жирную», очень частую и регулярную волну, которая окрашивает весь график в черный цвет. Что нужно проверить в первую очередь?",
                options: [
                    { text: "Попросить пациента расслабить челюсть (это мышечный спазм).", correct: false }, // Мышцы хаотичны
                    { text: "Качество заземления и контакт электродов (это сетевая наводка 50 Гц).", correct: true },
                    { text: "Не начался ли у пациента эпилептический приступ.", correct: false },
                    { text: "Уровень заряда батареи усилителя.", correct: false }
                ],
                explanation: "Регулярная, частая помеха — это почти всегда электросеть (50 Гц). Мышцы дают хаотичный «рваный» сигнал."
            },
            {
                text: "5. Сравните амплитуду полезного сигнала мозга (Альфа) и артефакта моргания. Какое утверждение верно?",
                options: [
                    { text: "Они примерно одинаковы (около 50 мкВ).", correct: false },
                    { text: "Сигнал мозга мощнее, так как нейронов миллиарды.", correct: false },
                    { text: "Артефакт моргания может быть в 10 раз мощнее сигнала мозга.", correct: true },
                    { text: "Глаза не создают электрических полей, только механические помехи.", correct: false }
                ],
                explanation: "Глаз — мощный диполь. Моргание создает всплеск в 200-500 мкВ и выше, тогда как мозг дает всего 20-50 мкВ."
            }
        ];

        // Счетчик правильных ответов
        let correctAnswersCount = 0;
        const totalQuestions = questions.length;

        // Рендер вопросов
        questions.forEach((q, index) => {
            const qBlock = document.createElement('div');
            qBlock.className = 'quiz-question';

            const title = document.createElement('h3');
            title.innerText = q.text;
            qBlock.appendChild(title);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-options';

            const explanation = document.createElement('div');
            explanation.className = 'quiz-explanation';
            explanation.innerText = q.explanation;

            let isAnswered = false;

            // Перемешиваем варианты ответов (Fisher-Yates shuffle), чтобы нельзя было запомнить позицию
            const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

            shuffledOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-btn';
                btn.innerText = opt.text;

                btn.onclick = () => {
                    if (isAnswered) return; // Запрет повторного клика
                    isAnswered = true;

                    if (opt.correct) {
                        btn.classList.add('correct');
                        correctAnswersCount++;
                        // Если это был последний вопрос и все верно - разблокируем выход
                        checkCompletion();
                    } else {
                        btn.classList.add('wrong');
                        // Подсветить правильный ответ, чтобы обучить пользователя
                        const correctBtn = Array.from(optionsDiv.children).find(b => b.innerText === q.options.find(o => o.correct).text);
                        if (correctBtn) correctBtn.classList.add('correct');
                    }

                    // Показать объяснение
                    explanation.style.display = 'block';
                };

                optionsDiv.appendChild(btn);
            });

            qBlock.appendChild(optionsDiv);
            qBlock.appendChild(explanation);
            container.appendChild(qBlock);
        });

        const checkCompletion = () => {
            // Если ответил на все вопросы (даже с ошибками - мы показываем объяснение, так что обучение пройдено)
            // Но для строгости можно требовать correctAnswersCount === totalQuestions
            // Давайте сделаем мягко: просто покажем итог
            if (correctAnswersCount === totalQuestions) {
                resultBox.style.display = 'block';
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.innerText = "Завершить урок";
                    nextBtn.classList.add('fade-in'); // Привлечь внимание
                }
            }
        };

        // Разрешаем пройти дальше, даже если ошибся (в обучающем режиме),
        // но лучше заставить ответить на все.
        // В текущей логике `nextBtn` разблокируется ТОЛЬКО если на все вопросы дан ВЕРНЫЙ ответ с первого раза.
        // Давайте смягчим: разблокируем, если пользователь кликнул на любой вариант во всех 5 вопросах.

        // Переписываем логику checkCompletion для режима обучения (Learning Mode):
        // Пользователь должен просто попробовать ответить на все вопросы.
        let answeredQuestions = 0;
        const allButtons = container.querySelectorAll('.quiz-btn');
        allButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Подсчитываем количество блоков, в которых есть нажатая кнопка
                const parent = btn.closest('.quiz-question');
                if (!parent.dataset.answered) {
                    parent.dataset.answered = "true";
                    answeredQuestions++;
                    if (answeredQuestions === totalQuestions) {
                        if (nextBtn) nextBtn.disabled = false;
                        resultBox.style.display = 'block';
                        resultBox.innerHTML = `
                            <h3 style="color: var(--primary-color);">Тест завершен!</h3>
                            <p>Ваш результат: ${correctAnswersCount} из ${totalQuestions}</p>
                            <p style="font-size: 14px; color: #666;">Нажмите "Завершить", чтобы вернуться в меню.</p>
                        `;
                    }
                }
            });
        });
    }
}