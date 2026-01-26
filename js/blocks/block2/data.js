export const block2Data = [
    {
        id: 'chain',
        title: "2.1 Путь сигнала: От мозга к цифре",
        content: `
            <p>Сигнал мозга — это аналоговая волна. Компьютер понимает только цифры. Чтобы мы увидели график, сигнал должен пройти через цепочку преобразований.</p>
            <p><b>Задание:</b> Соберите правильную последовательность устройств.</p>

            <!-- 1. Зона предметов -->
            <div class="inventory-area">
                <div class="draggable-item" draggable="true" data-type="amp" data-label="Усилитель" data-icon="⚡">
                    <span class="stage-icon">⚡</span>
                    <span class="stage-label">Усилитель</span>
                </div>
                <div class="draggable-item" draggable="true" data-type="adc" data-label="АЦП" data-icon="🔢">
                    <span class="stage-icon">🔢</span>
                    <span class="stage-label">АЦП</span>
                </div>
                <div class="draggable-item" draggable="true" data-type="electrode" data-label="Электрод" data-icon="🔌">
                    <span class="stage-icon">🔌</span>
                    <span class="stage-label">Электрод</span>
                </div>
            </div>

            <!-- 2. Конвейер (Слоты) -->
            <div class="pipeline-container">
                <!-- Старт -->
                <div class="pipeline-stage static">
                    <span class="stage-icon">🧠</span>
                    <span class="stage-label">Мозг<br>(Аналог)</span>
                </div>

                <!-- Слот 1 -->
                <div class="pipeline-stage slot" data-type="electrode" data-step="1">
                    <span class="stage-icon">❓</span>
                    <span class="stage-label">Шаг 1:<br>Съем</span>
                </div>

                <!-- Слот 2 -->
                <div class="pipeline-stage slot" data-type="amp" data-step="2">
                    <span class="stage-icon">❓</span>
                    <span class="stage-label">Шаг 2:<br>Мощь</span>
                </div>

                <!-- Слот 3 -->
                <div class="pipeline-stage slot" data-type="adc" data-step="3">
                    <span class="stage-icon">❓</span>
                    <span class="stage-label">Шаг 3:<br>Оцифровка</span>
                </div>

                <!-- Финиш -->
                <div class="pipeline-stage static">
                    <span class="stage-icon">💻</span>
                    <span class="stage-label">ПК<br>(График)</span>
                </div>
            </div>

            <!-- 3. Инфо-панель (Динамическая) -->
            <div id="chain-info" class="info-panel">
                Наведите курсор на деталь или перетащите её в слот, чтобы узнать, зачем она нужна.
            </div>
        `
    },
    {
        id: 'system1020',
        title: "2.2 Система «10-20» и зоны мозга",
        content: `
            <p>Международная система <b>«10-20»</b> гарантирует, что электроды накладываются на одни и те же зоны мозга у всех людей, независимо от размера головы.</p>

            <ul style="font-size: 14px; color: #555; margin-bottom: 20px;">
                <li><b>Название:</b> Расстояние между соседними электродами составляет 10% или 20% от полной длины дуги черепа (от переносицы до затылочного бугра).</li>
                <li><b>Буквы:</b> Указывают на долю мозга (<b>F</b>-Лоб, <b>C</b>-Центр, <b>T</b>-Висок, <b>P</b>-Темечко, <b>O</b>-Затылок).</li>
                <li><b>Цифры:</b> Нечетные = Слева, Четные = Справа, Z = Центр.</li>
            </ul>

            <div style="background: #e7f5ff; border-left: 4px solid #0056b3; padding: 10px; margin-bottom: 20px;">
                <b>Тренажер:</b> Система просит найти электрод. Нажмите на кружок на схеме. Если верно — вы узнаете, за что отвечает эта зона.
            </div>

            <div style="text-align: center; margin-bottom: 10px;">
                Найдите: <span id="target-electrode" style="font-size: 24px; font-weight: bold; color: var(--primary-color);">...</span>
            </div>

            <div id="head-container" style="position: relative;">
                <!-- SVG отрисуется здесь -->
            </div>

            <div id="zone-description" class="zone-info">
                Начните поиск электродов, чтобы увидеть описание функций мозга.
            </div>
        `
    },
    {
        id: 'differential',
        title: "2.3 Принцип дифференциального измерения",
        content: `
            <p>В физике невозможно измерить напряжение в одной точке. Напряжение — это всегда <b>разность потенциалов</b> между двумя точками.</p>

            <ul style="margin-bottom: 15px; font-size: 13px; color: #555; list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;">⚡ <b>Активный электрод:</b> Измеряет активность в нужной зоне мозга.</li>
                <li style="margin-bottom: 8px;">📏 <b>Референт (REF):</b> Опорный электрод. Это "ноль" на нашей линейке. Без него цепь разомкнута, и измерение невозможно.</li>
                <li>🔌 <b>Земля (GND):</b> Выравнивает заряды тела и прибора, предотвращая "плавание" сигнала (дрейф).</li>
            </ul>

            <div style="background: #e7f5ff; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 15px; border-left: 4px solid #0056b3;">
                <b>Формула ЭЭГ:</b> Результат = (Потенциал Активного) — (Потенциал Референта).
            </div>

            <!-- Панель управления -->
            <div class="connection-panel">
                <div class="cable-socket socket-gnd" id="btn-connect-gnd">
                    <div class="socket-hole"><div class="cable-plug"></div></div>
                    <span>1. Земля (GND)</span>
                </div>
                <div class="cable-socket socket-ref" id="btn-connect-ref">
                    <div class="socket-hole"><div class="cable-plug"></div></div>
                    <span>2. Референт (REF)</span>
                </div>
                <div class="cable-socket socket-act connected" style="cursor: default;">
                    <div class="socket-hole"><div class="cable-plug"></div></div>
                    <span>Активный (Вкл)</span>
                </div>
            </div>

            <div class="monitor-screen">
                <canvas id="diffCanvas" width="600" height="250" style="width: 100%; display: block;"></canvas>
                <div id="monitor-text" class="monitor-overlay">OPEN CIRCUIT</div>
            </div>

            <div id="diff-feedback" style="margin-top: 15px; font-weight: bold; text-align: center; color: var(--text-main); min-height: 40px;">
                Цепь разомкнута. Подключите Землю и Референт.
            </div>
        `
    },
    {
        id: 'impedance',
        title: "2.4 Импеданс: Борьба за качество",
        content: `
            <p><b>Импеданс</b> (Z) — это сопротивление в точке контакта электрода с кожей. Это критический параметр.</p>

            <div style="background: #e7f5ff; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 15px; border-left: 4px solid #0056b3;">
                <b>Почему это важно?</b><br>
                1. <b>Уровень шума:</b> Чем выше сопротивление, тем больше теплового шума и наводок ловит провод.<br>
                2. <b>Баланс:</b> Дифференциальный усилитель хорошо вычитает помехи, только если импеданс на обоих входах <b>низкий и одинаковый</b>. Если на одном 5 кОм, а на другом 50 кОм — шумы не сократятся.
            </div>

            <p>Нормы зависят от типа электродов. Выберите режим:</p>

            <div class="btn-group" style="justify-content: flex-start; margin-bottom: 20px;">
                <button id="mode-wet" class="btn-toggle active" style="font-size: 13px;">💧 Мокрые (Гель)</button>
                <button id="mode-dry" class="btn-toggle" style="font-size: 13px;">🌵 Сухие (BrainBit)</button>
            </div>

            <ul id="imp-legend" style="font-size: 13px; margin-bottom: 15px; color: #555; background: #f8f9fa; padding: 10px 20px; border-radius: 6px;">
                <!-- Легенда заполнится скриптом -->
            </ul>

            <div style="background: #e9ecef; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px;">
                <b>Задание:</b> "Потрите" красный электрод курсором (скрабирование), чтобы снизить импеданс.
            </div>

            <div class="impedance-container">
                <!-- Слева: Схема головы -->
                <div class="head-interactive cursor-gel">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Схема монтажа</div>
                    <div id="imp-head-svg"></div>
                </div>

                <!-- Справа: Монитор сигнала -->
                <div class="signal-monitor">
                    <div class="monitor-header">
                        <span>CH: <span id="monitor-channel">---</span></span>
                        <span>MODE: <span id="monitor-mode">WET</span></span>
                    </div>

                    <canvas id="impCanvas" width="300" height="150" style="width: 100%; height: 150px; display: block;"></canvas>

                    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;">
                        <span style="font-size: 11px; color: #888;">Z:</span>
                        <div id="monitor-value" class="monitor-value imp-bad">--- kΩ</div>
                    </div>
                </div>
            </div>
        `
    },
    {
        id: 'types',
        title: "2.5 Битва технологий: Мокрые vs Сухие",
        content: `
            <p>Выбор электрода определяет всё: от качества сигнала до комфорта пациента. В линейке нашей компании есть оба типа решений.</p>

            <div style="font-size: 14px; margin-bottom: 15px; color: #555;">
                Нажмите на карточку, чтобы изучить конструкцию:
            </div>

            <!-- 1. Карточки выбора -->
            <div class="electrodes-battle">

                <!-- MOIST / WET -->
                <div class="battle-card wet active" id="card-wet">
                    <div class="electrode-visual" id="visual-wet"></div>
                    <div class="battle-title">Мокрые (Ag/AgCl)</div>
                    <div class="battle-subtitle">Медицинский стандарт</div>

                    <div class="battle-details">
                        <ul>
                            <li><b>Материал:</b> Хлорсеребро (Ag/AgCl). Неполяризующийся металл.</li>
                            <li><b>Контакт:</b> Через токопроводящий гель или пасту.</li>
                            <li><b>Импеданс:</b> Очень низкий (< 5-10 кОм).</li>
                            <li><b>Приборы:</b> Компак-нейро, Нейрополиграф.</li>
                        </ul>
                    </div>
                </div>

                <!-- DRY -->
                <div class="battle-card dry" id="card-dry">
                    <div class="electrode-visual" id="visual-dry"></div>
                    <div class="battle-title">Сухие (Gold)</div>
                    <div class="battle-subtitle">Комфорт и скорость</div>

                    <div class="battle-details">
                        <ul>
                            <li><b>Материал:</b> Позолоченные пружинные пины (ножки).</li>
                            <li><b>Контакт:</b> Прямой (механический прижим).</li>
                            <li><b>Импеданс:</b> Высокий (> 100 кОм).</li>
                            <li><b>Приборы:</b> BrainBit, BrainBit Flex.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 2. Динамическая таблица сравнения -->
            <div id="comparison-table-container">
                <!-- Заполнится JS -->
            </div>

            <!-- 3. Кейс (Закрепление) -->
            <div class="scenario-box">
                <div style="font-weight: bold; margin-bottom: 10px;">🧠 Кейс для менеджера:</div>
                <div id="scenario-text" style="margin-bottom: 10px;">
                    Клиент: "Я врач-эпилептолог. Мне нужно записывать ЭЭГ во сне (8 часов). Что мне купить?"
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" id="btn-case-wet">Компак-нейро (Мокрые)</button>
                    <button class="btn btn-outline" id="btn-case-dry">BrainBit (Сухие)</button>
                </div>
                <div id="scenario-feedback" style="margin-top: 10px; font-size: 13px; font-weight: bold;"></div>
            </div>
        `
    },
    {
        id: 'quiz',
        title: "2.6 Итоговое тестирование",
        content: `
            <p>Вы прошли технический блок. Теперь проверим, готовы ли вы настраивать оборудование и объяснять клиентам принципы его работы.</p>

            <div id="quiz-container" style="margin-top: 25px;">
                <!-- Вопросы генерируются JS -->
            </div>

            <div id="quiz-result" style="text-align: center; margin-top: 30px; display: none;">
                <h3 style="color: var(--primary-color);">Технический блок закончен!</h3>
                <p>Вы разобрались с импедансом, монтажами и «землей».</p>
            </div>
        `
    }
];