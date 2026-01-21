export const block1Data = [
    {
        id: 'neurons',
        title: "1.1 Биоэлектрическая активность",
        content: `
            <p>Чтобы понять ЭЭГ, нужно представить работу мозга на микроуровне. Отдельный нейрон генерирует очень слабый электрический заряд. Если бы мы слушали только одну клетку, нам пришлось бы вживлять электрод прямо в мозг.</p>

            <p>ЭЭГ-электрод находится на поверхности головы, далеко от источника. Между ним и мозгом — кость и кожа. Чтобы сигнал преодолел этот барьер, необходима <b>синхронизация</b>.</p>

            <p><b>Правило суммации:</b> Сигнал виден только тогда, когда тысячи пирамидных нейронов активируются одновременно. Их заряды складываются, образуя мощную волну.</p>

            <div style="margin-top: 25px; padding: 0; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <!-- Легенда -->
                <div style="display: flex; background: #2c3e50; color: #fff; font-size: 12px; padding: 5px 10px;">
                    <div style="width: 65%;">Активность нейронов (Кора)</div>
                    <div style="width: 35%; border-left: 1px solid #555; padding-left: 10px;">Экран прибора (Сигнал)</div>
                </div>

                <canvas id="neuronCanvas" width="600" height="250" style="width: 100%; display: block;"></canvas>

                <div style="background: #fff; padding: 15px;">
                    <div class="btn-group">
                        <button id="btn-async" class="btn-toggle active">Асинхронно (Десинхронизация)</button>
                        <button id="btn-sync" class="btn-toggle">Синхронно (Ритм)</button>
                    </div>
                    <p id="neuron-status" style="text-align: center; margin-top: 10px; font-size: 14px; color: #666; min-height: 20px;">
                        Нейроны работают вразнобой. Суммарный сигнал около нуля.
                    </p>
                </div>
            </div>
        `
    },
    {
        id: 'skull',
        title: "1.2 Объемная проводимость и барьеры",
        content: `
            <p>Электрическое поле от нейронов распространяется во все стороны, но на его пути стоят разные среды. Этот процесс называется <b>объемной проводимостью</b>.</p>

            <ul style="margin: 10px 0 10px 20px; font-size: 14px; color: #555;">
                <li><b>Ликвор:</b> Отличный проводник, но он "размазывает" сигнал.</li>
                <li><b>Череп (Кость):</b> Главный барьер. Кость имеет гигантское сопротивление, работая как резистор.</li>
                <li><b>Кожа:</b> Последний рубеж перед электродом.</li>
            </ul>

            <p>Из амплитуды в 1000-2000 мкВ на коре до скальпа доходит лишь <b>10-100 мкВ</b>. Любое утолщение кости или плохой контакт снижают амплитуду и ухудшают качество сигнала.</p>

            <div style="margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                <label style="font-weight: bold; display: block; margin-bottom: 10px;">
                    Симуляция толщины черепа: <span id="skullValue" style="color: var(--primary-color);">Средняя</span>
                </label>

                <input type="range" id="skullSlider" min="1" max="100" value="30" style="width: 100%; cursor: pointer;">

                <!-- Канвас будет рисовать и слои, и график -->
                <canvas id="attenuationCanvas" width="600" height="250" style="width: 100%; display: block; margin-top: 15px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);"></canvas>
            </div>
        `
    },
    {
        id: 'rhythms',
        title: "1.3 Частотный спектр и ритмы",
        content: `
            <p>ЭЭГ сигнал — это "слоеный пирог". Врач или алгоритм должен уметь видеть отдельные ингредиенты в этой смеси.</p>

            <div style="background: #f1f3f5; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px;">
                <strong>Задание:</strong> Включите "Альфа-ритм". Затем добавьте "Сеть 50Гц". Обратите внимание, как чистый сигнал становится "жирным" и нечетким.
            </div>

            <!-- Микшер -->
            <div class="rhythm-mixer">
                <!-- 1. Дельта -->
                <label class="mixer-toggle" id="toggle-delta">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Дельта (δ)</span>
                    <span class="mixer-desc">0.5-4 Гц<br>Сон</span>
                </label>

                <!-- 2. Тета (НОВОЕ) -->
                <label class="mixer-toggle" id="toggle-theta">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Тета (θ)</span>
                    <span class="mixer-desc">4-8 Гц<br>Транс / Дремота</span>
                </label>

                <!-- 3. Альфа -->
                <label class="mixer-toggle active" id="toggle-alpha">
                    <input type="checkbox" checked>
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Альфа (α)</span>
                    <span class="mixer-desc">8-13 Гц<br>Релакс</span>
                </label>

                <!-- 4. Бета -->
                <label class="mixer-toggle" id="toggle-beta">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Бета (β)</span>
                    <span class="mixer-desc">13-30 Гц<br>Ум / Стресс</span>
                </label>

                <!-- 5. Сеть (НОВОЕ) -->
                <label class="mixer-toggle" id="toggle-mains">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Сеть 50Гц</span>
                    <span class="mixer-desc">Наводка<br>(Тех. шум)</span>
                </label>

                <!-- 6. ЭМГ -->
                <label class="mixer-toggle" id="toggle-emg">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Мышцы</span>
                    <span class="mixer-desc">Артефакт<br>(Био шум)</span>
                </label>
            </div>

            <canvas id="rhythmCanvas" width="600" height="220" style="width: 100%; border: 1px solid #ccc; background: #fff; border-radius: 4px;"></canvas>

            <div id="rhythm-info" style="margin-top: 15px; padding: 10px; border-left: 4px solid var(--primary-color); background: #fff; min-height: 60px;">
                Включите ритм, чтобы прочитать описание.
            </div>
        `
    },
    {
        id: 'artifacts',
        title: "1.4 Артефакты vs Сигнал",
        content: `
            <p>ЭЭГ-усилитель очень чувствителен. Он усиливает всё подряд: и нейроны, и движения глаз, и электричество в розетках. Помехи называются <b>артефактами</b>.</p>

            <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 15px; border: 1px solid #ffeeba;">
                <strong>Внимание:</strong> Реальный сигнал мозга (Альфа) очень маленький (~30-50 мкВ). Артефакты могут быть в 10 раз мощнее!
            </div>

            <div class="rhythm-mixer">
                <!-- 1. Чистый мозг -->
                <label class="mixer-toggle active" id="toggle-clean">
                    <input type="checkbox" checked>
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Мозг (Альфа)</span>
                    <span class="mixer-desc">Полезный сигнал</span>
                </label>

                <!-- 2. Моргание -->
                <label class="mixer-toggle" id="toggle-blink">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Моргание (ЭОГ)</span>
                    <span class="mixer-desc">Периодический<br>всплеск</span>
                </label>

                <!-- 3. Мышцы -->
                <label class="mixer-toggle" id="toggle-muscle">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Мышцы (ЭМГ)</span>
                    <span class="mixer-desc">Сжатие зубов<br>или лба</span>
                </label>

                <!-- 4. Сеть -->
                <label class="mixer-toggle" id="toggle-network">
                    <input type="checkbox">
                    <div class="toggle-indicator"></div>
                    <span class="mixer-label">Сеть 50Гц</span>
                    <span class="mixer-desc">Плохое<br>заземление</span>
                </label>
            </div>

            <!-- Канвас повыше, чтобы вместить амплитуду моргания -->
            <canvas id="artifactCanvas" width="600" height="250" style="width: 100%; border: 1px solid #ccc; background: #fff; border-radius: 4px; display: block;"></canvas>

            <div id="artifact-info" style="margin-top: 15px; padding: 10px; border-left: 4px solid #6c757d; background: #f8f9fa; font-size: 14px;">
                Включите артефакт, чтобы увидеть его влияние.
            </div>
        `
    },
    // Квиз сдвигаем на 1.5

    {
        id: 'quiz',
        title: "1.5 Итоговое тестирование",
        content: `
            <p>Вы прошли первый блок. Теперь проверим, как вы усвоили физику процесса. Чтобы завершить урок, нужно правильно ответить на вопросы.</p>

            <div id="quiz-container" style="margin-top: 25px;">
                <!-- Вопросы будут сгенерированы здесь через JS -->
            </div>

            <div id="quiz-result" style="text-align: center; margin-top: 30px; display: none;">
                <h3 style="color: var(--primary-color);">Поздравляем!</h3>
                <p>Вы закончили блок по физическим основам ЭЭГ.</p>
            </div>
        `
    }

];
