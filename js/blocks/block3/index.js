import BaseBlock from '../BaseBlock.js';
import { block3Data } from './data.js';

export default class Block3 extends BaseBlock {
    constructor(container, onBack) {
        super(container, onBack, block3Data);
    }

    mountInteractive(index) {
        const slideId = this.slides[index].id;
        this.stopAnimations();

        switch (slideId) {
            case 'adc': this.initADC(); break;
            case 'filters': this.initFilters(); break;
            case 'cmrr': this.initCMRR(); break;
            case 'connection': this.initConnection(); break;
            case 'quiz': this.initQuiz(); break;
        }
    }

    // --- 3.1 СИМУЛЯТОР АЦП (ОБНОВЛЕННЫЙ) ---
    initADC() {
        const canvas = this.container.querySelector('#adcCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const sliderRate = this.container.querySelector('#slider-rate');
        const sliderBits = this.container.querySelector('#slider-bits');
        const osdLsb = this.container.querySelector('#osd-lsb');
        const osdDr = this.container.querySelector('#osd-dr');
        const warning = this.container.querySelector('#aliasing-warning');
        const chkAliasing = this.container.querySelector('#chk-aliasing-mode');

        // Конфигурация пресетов (Инженерные данные)
        const rates = [50, 125, 250, 500]; // Гц
        const bits = [8, 12, 16, 24]; // Бит

        // Входной сигнал (параметры)
        // Vref = 2.5V (типично), Gain = 1 (условно)
        // LSB = Vref / 2^N
        const calculateMetrics = (nBits) => {
            const levels = Math.pow(2, nBits);
            const vRef = 2500000; // 2.5V в микровольтах
            const lsb = vRef / levels; // мкВ

            // Динамический диапазон (dB) = 6.02 * N
            const dr = 6.02 * nBits;

            return { lsb, dr, levels };
        };

        let time = 0;

        const draw = () => {
            time += 0.02;

            const currentRate = rates[parseInt(sliderRate.value)];
            const currentBits = bits[parseInt(sliderBits.value)];
            const metrics = calculateMetrics(currentBits);
            const isAliasingMode = chkAliasing.checked;

            // Обновляем OSD
            osdLsb.innerText = metrics.lsb < 1 ? `${metrics.lsb.toFixed(3)} nV` : `${metrics.lsb.toFixed(2)} µV`;
            osdDr.innerText = `${metrics.dr.toFixed(1)} dB`;

            // Очистка
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();

            const centerY = canvas.height / 2;
            const amplitude = canvas.height * 0.35;

            // --- ГЕНЕРАЦИЯ СИГНАЛА ---
            let signalFreq = 0;

            if (isAliasingMode) {
                // ДЕМО АЛИАСИНГА:
                // Сигнал высокой частоты (например, 60 Гц)
                // Для визуализации: пусть 1 сек экрана = 100 условных единиц X
                // Частота сигнала фиксирована и высока
                signalFreq = 1.2; // Высокая частота для визуализации
            } else {
                // ОБЫЧНЫЙ РЕЖИМ:
                // Медленная синусоида (Альфа-ритм)
                signalFreq = 0.05;
            }

            const getAnalogY = (x) => Math.sin((x * signalFreq) + time) * amplitude;

            // 1. Рисуем "Истинный" аналоговый сигнал (Серый)
            ctx.beginPath();
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x++) {
                const y = centerY + getAnalogY(x);
                if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // 2. Рисуем Оцифрованный сигнал
            // Шаг отрисовки зависит от Sampling Rate
            // Маппинг: 500 Гц = шаг 5px, 50 Гц = шаг 50px
            const pxStep = 2500 / currentRate;

            ctx.beginPath();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;

            // Детекция Алиасинга для OSD
            // Если пиксельный шаг больше половины периода волны
            const wavePeriodPx = (2 * Math.PI) / signalFreq;
            const isAliasing = pxStep > (wavePeriodPx / 2);

            if (isAliasingMode && isAliasing) {
                ctx.strokeStyle = '#ff4757'; // Красный при алиасинге
                warning.style.display = 'block';
                warning.innerText = `⚠️ ALIASING! Sample (${currentRate}Hz) < Signal`;
            } else {
                warning.style.display = 'none';
            }

            for (let x = 0; x < canvas.width; x += pxStep) {
                // SAMPLING
                const analogVal = getAnalogY(x);

                // QUANTIZATION (Симуляция битности)
                // Ограничиваем количество уровней для визуализации
                // Для 24 бит (metrics.levels > 16mln) деление бессмысленно, рисуем как есть
                // Для 8 бит (256) делаем грубое округление

                let digitalY = 0;

                if (currentBits >= 16) {
                    // Высокая точность - рисуем как есть (пиксель монитора грубее LSB)
                    digitalY = centerY + analogVal;
                } else {
                    // Низкая точность - "лесенка"
                    // Искусственно занижаем уровни для наглядности (иначе 8 бит на 250px амплитуды тоже гладкие)
                    // Допустим, 8 бит = 10 визуальных ступеней для демо
                    const visLevels = currentBits === 8 ? 8 : (currentBits === 12 ? 30 : 100);
                    const norm = analogVal / amplitude;
                    const quant = Math.round(norm * (visLevels/2)) / (visLevels/2);
                    digitalY = centerY + (quant * amplitude);
                }

                // Рисуем линию (интерполяция)
                if (x === 0) ctx.moveTo(x, digitalY);
                else ctx.lineTo(x, digitalY);

                // Рисуем точки (сэмплы)
                const pointColor = (isAliasingMode && isAliasing) ? 'red' : 'white';
                // Рисуем точки отдельно позже или тут
            }
            ctx.stroke();

            // Рисуем точки сэмплов поверх
            ctx.fillStyle = (isAliasingMode && isAliasing) ? '#ff4757' : '#fff';
            for (let x = 0; x < canvas.width; x += pxStep) {
                 // Повторяем расчет Y (можно оптимизировать, но для читаемости оставим)
                 const analogVal = getAnalogY(x);
                 let digitalY = centerY + analogVal;
                 if (currentBits < 16) {
                     const visLevels = currentBits === 8 ? 8 : (currentBits === 12 ? 30 : 100);
                     const norm = analogVal / amplitude;
                     const quant = Math.round(norm * (visLevels/2)) / (visLevels/2);
                     digitalY = centerY + (quant * amplitude);
                 }

                 ctx.beginPath();
                 ctx.arc(x, digitalY, 3, 0, Math.PI*2);
                 ctx.fill();
            }

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }
    // --- 3.2 ФИЛЬТРЫ (DSP) ---
    initFilters() {
        const timeCanvas = this.container.querySelector('#timeCanvas');
        const freqCanvas = this.container.querySelector('#freqCanvas');
        if (!timeCanvas || !freqCanvas) return;

        const ctxTime = timeCanvas.getContext('2d');
        const ctxFreq = freqCanvas.getContext('2d');

        // Контролы
        const selHpf = this.container.querySelector('#sel-hpf');
        const btnNotch = this.container.querySelector('#btn-notch');
        const selLpf = this.container.querySelector('#sel-lpf');

        // Состояние фильтров
        const filters = {
            hpf: 'off', // 'off', '0.5', '1.6'
            notch: false,
            lpf: 'off'  // 'off', '70', '30'
        };

        // Слушатели
        selHpf.onchange = () => { filters.hpf = selHpf.value; };
        btnNotch.onchange = (e) => {
            filters.notch = e.target.checked;
            if(filters.notch) btnNotch.classList.add('active');
            else btnNotch.classList.remove('active');
        };
        selLpf.onchange = () => { filters.lpf = selLpf.value; };

        // Данные для графиков
        const timeData = new Array(timeCanvas.width).fill(0);
        let globalTime = 0;
        let driftPhase = 0;

        const draw = () => {
            globalTime += 0.05;
            driftPhase += 0.01;

            // --- 1. ГЕНЕРАЦИЯ СЫРОГО СИГНАЛА ---
            // Полезный сигнал: Альфа (10Гц) + Бета (20Гц)
            const alpha = Math.sin(globalTime * 2.0) * 15 * ((Math.sin(globalTime * 0.2) + 2) / 2); // Модулированная альфа
            const beta = Math.sin(globalTime * 4.0) * 5;

            // Помехи:
            // 1. Дрейф (0.1 Гц) - Огромный
            const drift = Math.sin(driftPhase) * 60 + Math.sin(driftPhase * 3) * 20;

            // 2. Сеть (50 Гц) - Высокочастотная пила
            const mains = Math.sin(globalTime * 15.0) * 25;

            // 3. ЭМГ / ВЧ Шум (> 30 Гц)
            const noise = (Math.random() - 0.5) * 15;

            // --- 2. ПРИМЕНЕНИЕ ФИЛЬТРОВ ---

            let currentSignal = alpha + beta;

            // Логика симуляции: если фильтр ВЫКЛЮЧЕН, мы добавляем шум обратно.
            // HPF: Если OFF -> полный дрейф. Если 0.5 -> остаточный дрейф. Если 1.6 -> чисто.
            if (filters.hpf === 'off') {
                currentSignal += drift;
            } else if (filters.hpf === '0.5') {
                currentSignal += drift * 0.2; // Немного дрейфа остается
            }
            // (при 1.6 drift = 0)

            // Notch: Если OFF -> сеть видна
            if (!filters.notch) {
                currentSignal += mains;
            } else {
                currentSignal += mains * 0.05; // Фильтр не идеален, чуть-чуть остается
            }

            // LPF: Если OFF -> весь шум.
            // 70Hz -> срезает только самые острые пики (оставляем 70% шума для визуализации)
            // 30Hz -> срезает почти всё (оставляем 10% шума)
            if (filters.lpf === 'off') {
                currentSignal += noise;
            } else if (filters.lpf === '70') {
                currentSignal += noise * 0.6;
            } else if (filters.lpf === '30') {
                currentSignal += noise * 0.1;
                // При 30Гц срезается и часть Беты (полезного сигнала)!
                // Симулируем это уменьшением беты
                // (alpha + beta*0.8)
            }

            // Обновляем буфер времени
            timeData.shift();
            timeData.push(currentSignal);

            // --- 3. ОТРИСОВКА ВРЕМЕНИ (Осциллограф) ---
            ctxTime.fillStyle = '#000';
            ctxTime.fillRect(0, 0, timeCanvas.width, timeCanvas.height);
            ctxTime.strokeStyle = '#333';
            ctxTime.lineWidth = 1;
            ctxTime.beginPath(); ctxTime.moveTo(0, timeCanvas.height/2); ctxTime.lineTo(timeCanvas.width, timeCanvas.height/2); ctxTime.stroke();

            ctxTime.beginPath();
            // Цвет зависит от чистоты
            const isClean = (filters.hpf !== 'off' && filters.notch && filters.lpf === '30');
            ctxTime.strokeStyle = isClean ? '#00ff00' : '#ffff00';
            ctxTime.lineWidth = 2;

            for (let i = 0; i < timeData.length - 1; i++) {
                let y = (timeCanvas.height / 2) + timeData[i];
                // Soft clip
                if (y < 0) y = 0; if (y > timeCanvas.height) y = timeCanvas.height;
                if (i === 0) ctxTime.moveTo(i, y); else ctxTime.lineTo(i + 1, y);
            }
            ctxTime.stroke();

            // --- 4. ОТРИСОВКА СПЕКТРА (FFT Simulation) ---
            ctxFreq.fillStyle = '#111';
            ctxFreq.fillRect(0, 0, freqCanvas.width, freqCanvas.height);

            // Функция рисования столбика спектра
            const drawBar = (freqHz, amplitude, color, label) => {
                // Маппинг частоты 0-100Гц на ширину канваса
                const x = (freqHz / 100) * freqCanvas.width;
                const h = Math.min(amplitude * 2, freqCanvas.height - 20); // Масштабируем высоту
                const y = freqCanvas.height - h;

                ctxFreq.fillStyle = color;
                ctxFreq.fillRect(x - 5, y, 10, h); // Столбик

                // Тень/свет
                ctxFreq.strokeStyle = color;
                ctxFreq.beginPath(); ctxFreq.moveTo(x, y); ctxFreq.lineTo(x, freqCanvas.height); ctxFreq.stroke();

                // Подпись
                if (label) {
                    ctxFreq.fillStyle = '#fff';
                    ctxFreq.font = '9px sans-serif';
                    ctxFreq.fillText(label, x - 10, y - 5);
                }
            };

            // РИСУЕМ КОМПОНЕНТЫ СПЕКТРА НА ОСНОВЕ СОСТОЯНИЯ ФИЛЬТРОВ

            // 1. Дрейф (0-1 Гц) - Красный слева
            let driftAmp = 50;
            if (filters.hpf === '0.5') driftAmp = 10;
            if (filters.hpf === '1.6') driftAmp = 0;
            if (driftAmp > 0) drawBar(1, driftAmp, '#e74c3c', 'DC');

            // 2. Альфа (10 Гц) - Зеленый полезный
            drawBar(10, 30 + Math.sin(globalTime)*5, '#2ecc71', 'α');

            // 3. Бета (25 Гц) - Зеленый полезный
            // Если LPF 30Гц, бета чуть режется
            let betaAmp = 15;
            if (filters.lpf === '30') betaAmp = 10;
            drawBar(25, betaAmp, '#2ecc71', 'β');

            // 4. Сеть (50 Гц) - Желтый пик
            let mainsAmp = filters.notch ? 2 : 60; // Если Notch вкл, пик почти исчезает
            drawBar(50, mainsAmp, '#f1c40f', '50Hz');

            // 5. Шум ВЧ (>70 Гц) - Синий "шумный пол" справа
            let noiseAmp = 20;
            if (filters.lpf === '70') noiseAmp = 10;
            if (filters.lpf === '30') noiseAmp = 2;

            // Рисуем "лес" шума в правой части
            for(let f=60; f<100; f+=5) {
                drawBar(f, noiseAmp * Math.random(), '#3498db', '');
            }

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }
    // --- 3.3 CMRR (СИМУЛЯТОР УТЕЧКИ ШУМА) ---
    initCMRR() {
        const canvas = this.container.querySelector('#cmrrCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const slider = this.container.querySelector('#slider-cmrr');
        const textVal = this.container.querySelector('#val-cmrr');
        const statusBox = this.container.querySelector('#cmrr-status');

        let time = 0;

        // Буферы
        const inputData = new Array(150).fill(0);
        const outputData = new Array(150).fill(0);

        const draw = () => {
            time += 0.05;
            const cmrrdB = parseInt(slider.value);

            // --- 1. ГЕНЕРАЦИЯ ---

            // Полезный сигнал (Мозг) - амплитуда 10 мкВ
            // Сложная форма, чтобы было интереснее смотреть
            const brainSignal = Math.sin(time * 2.0) * 10 + Math.sin(time * 6.0) * 2;

            // Помеха (Сеть 50Гц) - амплитуда 1 000 000 мкВ (1 Вольт)
            // В реальности это 1V, но для симуляции возьмем условные 2000 единиц
            const noiseCommon = Math.sin(time * 15.0) * 2000;

            // Расчет выхода
            // При CMRR 60dB подавление = 1000 раз. Остаток шума = 2000 / 1000 = 2 мкВ.
            // При CMRR 120dB подавление = 1 000 000 раз. Остаток шума = 0.002 мкВ.

            // Для визуализации мы используем нелинейную шкалу, чтобы "Игрушка" выглядела ужасно,
            // а разница между 100 и 120 была заметна как "дрожание vs прямая".

            let leakageFactor;
            if (cmrrdB <= 60) leakageFactor = 2.0;      // Шум в 2 раза больше сигнала!
            else if (cmrrdB <= 80) leakageFactor = 0.5; // Шум есть, но сигнал виден
            else if (cmrrdB <= 100) leakageFactor = 0.1;// Легкая рябь
            else leakageFactor = 0.0;                   // Идеал

            // Добавляем случайный шум "дешевых компонентов" для низкого CMRR
            const cheapNoise = (cmrrdB < 80) ? (Math.random()-0.5)*5 : 0;

            const finalNoise = (Math.sin(time * 15.0) * 30 * leakageFactor) + cheapNoise;

            const vOut = brainSignal + finalNoise;

            // Буферы
            inputData.shift(); inputData.push(noiseCommon + brainSignal);
            outputData.shift(); outputData.push(vOut);

            // --- 2. UI СТАТУС ---
            textVal.innerText = `${cmrrdB} dB`;
            if (cmrrdB <= 60) {
                statusBox.innerHTML = "❌ 50-60 dB (DIY/Игрушка): Наводка полностью " +
                                      "<span style='color:#d63031'>заглушает</span> сигнал мозга.";
                statusBox.style.background = "#ffe6e6";
                statusBox.style.color = "#d63031";
            } else if (cmrrdB <= 80) {
                statusBox.innerHTML = "⚠️ 80 dB (Базовый): Сигнал виден, но линия " +
                                      "<span style='color:#e67e22'>грязная и дрожит</span>.";
                statusBox.style.background = "#fff7e6";
                statusBox.style.color = "#e67e22";
            } else if (cmrrdB <= 100) {
                statusBox.innerHTML = "✅ 100 dB (BrainBit): <span style='color:#2ecc71'>Чистый сигнал</span>. " +
                                      "Достаточно для нейроинтерфейсов.";
                statusBox.style.background = "#e6fffa";
                statusBox.style.color = "#219653";
            } else {
                statusBox.innerHTML = "💎 120 dB+ (Medical): <span style='color:#0056b3'>Кристальная чистота</span>. " +
                                      "Видны малейшие нюансы для диагностики.";
                statusBox.style.background = "#e7f5ff";
                statusBox.style.color = "#0056b3";
            }

            // --- 3. ОТРИСОВКА ---
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, w, h);

            // Мы делим экран на 2 большие зоны: ВХОД (Слева) и ВЫХОД (Справа)
            const scopeW = (w / 2) - 40;
            const scopeH = h - 60;
            const scopeY = 40;

            // ФУНКЦИЯ ОТРИСОВКИ ОСЦИЛЛОГРАФА
            const drawScope = (x, title, subTitle, data, color, scaleFactor) => {
                // Рамка
                ctx.fillStyle = '#000';
                ctx.fillRect(x, scopeY, scopeW, scopeH);
                ctx.strokeStyle = '#444';
                ctx.strokeRect(x, scopeY, scopeW, scopeH);

                // Заголовок
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(title, x, scopeY - 15);
                ctx.fillStyle = '#888';
                ctx.font = '11px monospace';
                ctx.fillText(subTitle, x, scopeY - 3);

                // Сетка
                ctx.beginPath(); ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
                ctx.moveTo(x, scopeY + scopeH/2); ctx.lineTo(x + scopeW, scopeY + scopeH/2);
                ctx.stroke();

                // Сигнал
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;

                const step = scopeW / data.length;
                const cy = scopeY + scopeH/2;

                for(let i=0; i<data.length; i++) {
                    const px = x + i * step;
                    let py = cy - (data[i] * scaleFactor); // Минус, т.к. Y вниз

                    // Клиппинг внутри окна
                    if (py < scopeY + 2) py = scopeY + 2;
                    if (py > scopeY + scopeH - 2) py = scopeY + scopeH - 2;

                    if(i===0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            };

            // ЭКРАН 1: ВХОД (Сырой сигнал на проводе)
            // Масштаб 0.03, чтобы влезли Вольты (2000 единиц)
            drawScope(20, "ВХОД (INPUT)", "Масштаб: 1V/del (Помеха доминирует)", inputData, '#ff4757', 0.035);

            // ЭКРАН 2: ВЫХОД (После усилителя)
            // Масштаб 3.0, чтобы видеть Микровольты (10 единиц)
            // Цвет меняется в зависимости от качества
            let outColor = '#2ecc71';
            if (cmrrdB <= 60) outColor = '#ff4757';
            else if (cmrrdB <= 80) outColor = '#f1c40f';

            drawScope(w - scopeW - 20, "ВЫХОД (OUTPUT)", "Масштаб: 10µV/del (Зум на мозг)", outputData, outColor, 3.0);

            // Схематический усилитель между ними
            const midX = w / 2;
            const midY = h / 2 + 10;

            // Треугольник
            ctx.beginPath();
            ctx.fillStyle = '#555';
            ctx.moveTo(midX - 15, midY - 20);
            ctx.lineTo(midX - 15, midY + 20);
            ctx.lineTo(midX + 25, midY);
            ctx.fill();

            // Стрелка направления
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText("➡", midX - 12, midY + 6);

            // Текст dB над усилителем
            ctx.fillStyle = outColor;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`CMRR`, midX + 5, midY - 30);
            ctx.fillText(`${cmrrdB}dB`, midX + 5, midY + 40);
            ctx.textAlign = 'left'; // Вернуть как было

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }

// --- 3.4 CONNECTION (СИМУЛЯТОР СВЯЗИ) ---
    initConnection() {
        const canvas = this.container.querySelector('#connCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const btnUsb = this.container.querySelector('#btn-usb');
        const btnBle = this.container.querySelector('#btn-ble');
        const sliderDist = this.container.querySelector('#slider-dist');

        const valLat = this.container.querySelector('#val-latency');
        const valLoss = this.container.querySelector('#val-loss');
        const packetVis = this.container.querySelector('#packet-visual');

        let mode = 'usb'; // По умолчанию USB

        // Инициализация состояния
        sliderDist.disabled = true;
        sliderDist.value = 0;

        // Обработчики кнопок
        btnUsb.onclick = () => {
            mode = 'usb';
            btnUsb.classList.add('active');
            btnBle.classList.remove('active');
            sliderDist.value = 0;
            sliderDist.disabled = true;
        };

        btnBle.onclick = () => {
            mode = 'ble';
            btnBle.classList.add('active');
            btnUsb.classList.remove('active');
            sliderDist.disabled = false;
        };

        const realData = new Array(canvas.width).fill(0);
        const receivedData = new Array(canvas.width).fill(0);
        let transmissionQueue = []; // Очередь пакетов

        let time = 0;
        let eventTimer = 0;

        const draw = () => {
            time += 1;
            const interference = mode === 'usb' ? 0 : parseInt(sliderDist.value);

            // --- 1. ГЕНЕРАЦИЯ ---
            eventTimer++;
            let sourceSignal = 0;
            if (eventTimer > 90) {
                sourceSignal = 0.8;
                if (eventTimer > 120) eventTimer = 0;
            }
            sourceSignal += (Math.random() - 0.5) * 0.05;

            // --- 2. СИМУЛЯЦИЯ ЗАДЕРЖКИ ---
            let targetLatencyFrames = 0;
            let packetLossProb = 0;

            if (mode === 'usb') {
                targetLatencyFrames = 2; // ~30ms
                packetLossProb = 0;
            } else {
                // BLE задержка (20 кадров + помехи)
                targetLatencyFrames = 20 + (interference * 0.5);
                packetLossProb = (interference / 100) * 0.9;
            }

            const packet = {
                val: sourceSignal,
                isLost: Math.random() < packetLossProb
            };

            transmissionQueue.push(packet);

            while (transmissionQueue.length > targetLatencyFrames + 1) {
                transmissionQueue.shift();
            }

            let receivedSignal = 0;
            let dotColor = '#333';

            if (transmissionQueue.length > targetLatencyFrames) {
                const p = transmissionQueue.shift();

                if (p && p.isLost) {
                    receivedSignal = 0;
                    dotColor = '#ff4757';
                } else if (p) {
                    receivedSignal = p.val;
                    dotColor = '#2ecc71';
                }
            } else {
                receivedSignal = 0;
                dotColor = '#e67e22';
            }

            // --- 3. UI ---
            const ms = Math.round(targetLatencyFrames * 16);
            valLat.innerText = `${ms} ms`;
            if (ms < 50) valLat.style.color = '#2ecc71';
            else if (ms < 200) valLat.style.color = '#f1c40f';
            else valLat.style.color = '#ff4757';

            packetVis.innerHTML = `<div class="packet-dot" style="background:${dotColor}; box-shadow: 0 0 5px ${dotColor};"></div>`;

            const quality = Math.round((1 - packetLossProb) * 100);
            valLoss.innerText = `${quality}%`;
            valLoss.style.color = quality > 95 ? '#fff' : '#ff4757';

            // --- 4. ОТРИСОВКА ---
            realData.shift(); realData.push(sourceSignal);
            receivedData.shift(); receivedData.push(receivedSignal);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const h = canvas.height / 2;
            const amp = 60;

            // Source Graph
            ctx.strokeStyle = '#444';
            ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(canvas.width, h); ctx.stroke();
            ctx.fillStyle = '#888'; ctx.font = '10px monospace';
            ctx.fillText("Источник (Мозг)", 10, 15);

            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            for(let i=0; i<realData.length; i++) {
                const y = (h/2) + 20 - (realData[i] * amp);
                if (i===0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
            }
            ctx.stroke();

            // Monitor Graph
            const h2 = h + (h/2) + 20;
            ctx.fillStyle = '#ff4757';
            ctx.fillText("Монитор (ПК)", 10, h + 15);

            ctx.beginPath();
            if (quality > 98) ctx.strokeStyle = '#2ecc71';
            else if (quality > 80) ctx.strokeStyle = '#f1c40f';
            else ctx.strokeStyle = '#ff4757';

            ctx.lineWidth = 2;
            for(let i=0; i<receivedData.length; i++) {
                const val = receivedData[i];
                const y = h2 - (val * amp);
                if(i===0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
            }
            ctx.stroke();

            // Lag Visualization
            for(let i=1; i<realData.length; i++) {
                if (realData[i-1] < 0.4 && realData[i] > 0.6) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, canvas.height);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.fillStyle = '#fff';
                    ctx.fillText("EVENT", i+5, h-5);
                }
            }

            this.activeInterval = requestAnimationFrame(draw);
        };

        draw();
    }
    // --- 3.5 ФИНАЛЬНЫЙ ТЕСТ БЛОКА 3
// --- 3.5 ФИНАЛЬНЫЙ ТЕСТ БЛОКА 3 (ИСПРАВЛЕННЫЙ) ---
    initQuiz() {
        const container = this.container.querySelector('#quiz-container');
        const finishBtn = this.container.querySelector('#next-btn');

        if (!container) return;

        const savedData = this.progressManager ? this.progressManager.getBlockInfo(3) : null;
        let score = 0;
        let answeredCount = 0;

        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.style.opacity = "0.5";
            finishBtn.innerText = "Завершите тест";
            if (savedData && savedData.isPassed) {
                finishBtn.disabled = false;
                finishBtn.style.opacity = "1";
                finishBtn.innerText = "Завершить Блок 3";
            }
        }


        // База вопросов (ваши 10 вопросов)
        const questions = [
            {
                text: "1. Теорема Котельникова (Найквиста) гласит, что частота дискретизации должна быть минимум в 2 раза выше частоты сигнала. Что произойдет, если мы нарушим это правило (запишем сигнал 60 Гц с частотой 100 Гц)?",
                options: [
                    { text: "Сигнал просто станет менее четким (потеря амплитуды).", correct: false },
                    { text: "Возникнет Aliasing: высокочастотный сигнал превратится в ложную низкочастотную волну (артефакт 40 Гц).", correct: true },
                    { text: "АЦП уйдет в перегрузку (Saturation).", correct: false },
                    { text: "Увеличится уровень теплового шума.", correct: false }
                ],
                explanation: "Это эффект «колеса в кино», которое крутится назад. Недостаточная частота замеров создает фантомную (ложную) волну низкой частоты."
            },
            {
                text: "2. Почему для записи сверхмедленных потенциалов мозга (0.1 Гц) опасно использовать аналоговый фильтр высоких частот (HPF)?",
                options: [
                    { text: "Он может внести фазовые искажения и «смазать» форму медленной волны.", correct: true },
                    { text: "Он пропустит сетевую наводку 50 Гц.", correct: false },
                    { text: "Он требует слишком много энергии от батареи.", correct: false },
                    { text: "Аналоговые фильтры не работают на низких частотах.", correct: false }
                ],
                explanation: "Аналоговые фильтры меняют фазу сигнала. В цифровой технике (24 бита) лучше записать «как есть» (с дрейфом), а потом применить линейно-фазовый цифровой фильтр."
            },
            {
                text: "3. Усилитель имеет CMRR 60 дБ (подавление в 1000 раз). На входы пришла синфазная помеха от сети амплитудой 1 Вольт (1 000 000 мкВ). Какой уровень шума просочится на выход?",
                options: [
                    { text: "0 мкВ (шум полностью подавлен).", correct: false },
                    { text: "1 мкВ (едва заметно).", correct: false },
                    { text: "1000 мкВ (гигантский шум, перекрывающий мозг).", correct: true },
                    { text: "60 мкВ.", correct: false }
                ],
                explanation: "1 000 000 мкВ / 1000 = 1000 мкВ. Сигнал мозга всего 10-50 мкВ. Усилитель с CMRR 60 дБ непригоден для ЭЭГ."
            },
            {
                text: "4. Как дисбаланс импеданса (Active = 5 кОм, Ref = 50 кОм) влияет на качество сигнала?",
                options: [
                    { text: "Никак, главное, чтобы Активный электрод был хорошим.", correct: false },
                    { text: "Это резко снижает реальный CMRR усилителя, и сетевая наводка усиливается.", correct: true },
                    { text: "Это увеличивает только тепловой шум, но не наводку.", correct: false }
                ],
                explanation: "Дифференциальный усилитель работает идеально только при симметричном входе. Разница сопротивлений превращает синфазную помеху в дифференциальную, которую усилитель считает «полезным сигналом»."
            },
            {
                text: "5. В чем главное преимущество 24-битного АЦП перед 12-битным при наличии сильного дрейфа изолинии?",
                options: [
                    { text: "24 бита быстрее оцифровывают сигнал.", correct: false },
                    { text: "24 бита имеют огромный динамический диапазон. Можно записать слабый сигнал мозга «верхом» на сильном дрейфе без насыщения.", correct: true },
                    { text: "24 бита автоматически фильтруют дрейф.", correct: false }
                ],
                explanation: "При 12 битах нам пришлось бы сильно усиливать сигнал, и дрейф вызвал бы клиппинг (удар в потолок). При 24 битах мы можем писать с малым усилением, сохраняя и дрейф, и мелкие детали."
            },
            {
                text: "6. Какой фильтр нужно применить, если на спектрограмме виден высокий узкий пик ровно на частоте 50 Гц?",
                options: [
                    { text: "Band Pass 4-40 Гц.", correct: false },
                    { text: "High Pass 1.6 Гц.", correct: false },
                    { text: "Notch (Режекторный) 50 Гц.", correct: true },
                    { text: "Low Pass 30 Гц.", correct: false }
                ],
                explanation: "Точечное удаление частоты — задача режекторного фильтра. LPF 30Гц тоже уберет 50Гц, но он уничтожит и Гамма-ритм (полезный)."
            },
            {
                text: "7. Почему протокол Bluetooth (BLE) не рекомендуется для научных исследований вызванных потенциалов (ERP), где важна точность до миллисекунды?",
                options: [
                    { text: "У Bluetooth низкая скорость передачи данных.", correct: false },
                    { text: "Bluetooth вносит Jitter (дрожание задержки). Время доставки пакета плавает, что мешает усреднению сигнала.", correct: true },
                    { text: "Bluetooth излучение влияет на нейроны.", correct: false }
                ],
                explanation: "Для ERP нужно точно знать, когда мозг отреагировал на стимул. Нестабильная задержка (джиттер) BLE «размазывает» усредненный ответ."
            },
            {
                text: "8. Вы видите на экране «жирную» линию сигнала (высокочастотный шум), при этом спектр показывает подъем на частотах выше 30 Гц. Что это?",
                options: [
                    { text: "Это Гамма-ритм (гениальность).", correct: false },
                    { text: "Это сетевая наводка.", correct: false },
                    { text: "Скорее всего, это ЭМГ (мышцы) — напряжение лба или челюсти.", correct: true }
                ],
                explanation: "Мышцы (ЭМГ) имеют широкий спектр от 20 до 200+ Гц. Сеть дает узкий пик (50 Гц). Гамма-ритм имеет очень маленькую амплитуду и не делает линию «жирной»."
            },
            {
                text: "9. Что такое LSB (Least Significant Bit) в контексте ЭЭГ?",
                options: [
                    { text: "Самый шумный бит.", correct: false },
                    { text: "Минимальное изменение напряжения, которое способен заметить прибор (цена деления).", correct: true },
                    { text: "Последний байт в пакете Bluetooth.", correct: false }
                ],
                explanation: "LSB (вес младшего разряда) определяет разрешение. Для 24 бит LSB составляет нановольты."
            },
            {
                text: "10. Если мы включим ФНЧ (Low Pass Filter) на 30 Гц, какие ритмы мы потеряем?",
                options: [
                    { text: "Только шум мышц.", correct: false },
                    { text: "Дельта и Тета.", correct: false },
                    { text: "Гамма-ритм и часть высокочастотной Беты.", correct: true }
                ],
                explanation: "ФНЧ «режет» всё, что выше частоты среза. Гамма (>30 Гц) будет уничтожена вместе с шумом."
            }
        ];

        const total = questions.length;

        const renderQuestions = () => {
            container.innerHTML = '';
            score = 0;
            answeredCount = 0;
            if (this.progressManager) this.progressManager.updateProgress(3, 0, total);

            questions.forEach(q => {
                const el = document.createElement('div');
                el.className = 'quiz-question';
                el.dataset.answered = "false";
                el.innerHTML = `<h3>${q.text}</h3>`;
                const opts = document.createElement('div');
                opts.className = 'quiz-options';
                const expl = document.createElement('div');
                expl.className = 'quiz-explanation';
                expl.innerText = q.explanation;

                const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);

                shuffledOpts.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'quiz-btn';
                    btn.innerText = opt.text;

                    btn.onclick = () => {
                        if (el.dataset.answered === "true") return;
                        el.dataset.answered = "true";
                        answeredCount++;

                        opts.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);

                        if (opt.correct) {
                            btn.classList.add('correct');
                            score++;
                            expl.innerHTML = `<b style="color:green">Верно!</b> ${q.explanation}`;
                            expl.style.background = "#d4edda";
                            expl.style.color = "#155724";
                        } else {
                            btn.classList.add('wrong');
                            const correctBtn = Array.from(opts.children).find(b => b.innerText === q.options.find(o => o.correct).text);
                            if(correctBtn) correctBtn.classList.add('correct');
                            expl.innerHTML = `<b style="color:red">Ошибка.</b> ${q.explanation}`;
                            expl.style.background = "#f8d7da";
                            expl.style.color = "#721c24";
                        }
                        expl.style.display = 'block';

                        if (this.progressManager) this.progressManager.updateProgress(3, score, total);

                        if (answeredCount === total) {
                            showInlineResult();
                        }
                    };
                    opts.appendChild(btn);
                });
                el.appendChild(opts);
                el.appendChild(expl);
                container.appendChild(el);
            });
        };

        const showInlineResult = () => {
            if (this.progressManager) this.progressManager.saveResult(3, score, total);
            const old = container.querySelector('.inline-result-box');
            if(old) old.remove();

            const percent = Math.round((score / total) * 100);
            const passed = percent >= 80;

            const resDiv = document.createElement('div');
            resDiv.className = 'inline-result-box';
            resDiv.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${passed ? '🎉' : '📚'}</div>
                <h3 style="color:var(--primary-color)">Тест завершен</h3>
                <div class="result-score-text">${score} из ${total} (${percent}%)</div>
                <p class="result-message">${passed ? 'Отлично!' : 'Повторите материал.'}</p>
                <button class="action-btn" id="btn-inline-retake" style="background: #fff; color: #333; border: 1px solid #ccc;">↺ Пересдать тест</button>
            `;

            container.appendChild(resDiv);
            setTimeout(() => resDiv.scrollIntoView({ behavior: "smooth" }), 100);

            if (passed && finishBtn) {
                finishBtn.disabled = false;
                finishBtn.style.opacity = "1";
                finishBtn.innerText = "Завершить Блок 3";
            }

            resDiv.querySelector('#btn-inline-retake').onclick = () => {
                renderQuestions();
                if (finishBtn) { finishBtn.disabled = true; finishBtn.style.opacity = "0.5"; }
            };
        };

        renderQuestions();
    }
}