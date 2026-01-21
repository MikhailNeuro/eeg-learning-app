export const block5Data = [
    {
        id: 'epilepsy',
        title: "5.1 Клиническая ЭЭГ: Патология vs Артефакт",
        content: `
            <p>Врач должен отличать <b>Эпи-активность</b> (болезнь) от <b>Артефактов</b> (помех). Ошибка стоит дорого.</p>

            <!-- Переключатель режимов -->
            <div class="mode-switch-panel">
                <button id="mode-learn" class="btn-toggle active">🎓 Режим обучения</button>
                <button id="mode-test" class="btn-toggle">⚡ НАЧАТЬ ТЕСТ</button>
            </div>

            <!-- Блок Обучения (Кнопки) -->
            <div id="learn-controls">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                    <b>Патологии (Надо ловить):</b>
                </div>
                <div class="pathology-controls">
                    <button class="path-btn" id="btn-spike">
                        <svg class="path-icon" viewBox="0 0 50 30"><path d="M0,15 L15,15 L20,2 L25,15 L50,15" /></svg>
                        <b>Спайк</b>
                    </button>
                    <button class="path-btn" id="btn-sharp">
                        <svg class="path-icon" viewBox="0 0 50 30"><path d="M0,15 L15,15 L25,5 L35,15 L50,15" /></svg>
                        <b>Острая волна</b>
                    </button>
                    <button class="path-btn" id="btn-wave">
                        <svg class="path-icon" viewBox="0 0 50 30"><path d="M0,15 L10,15 L15,2 L20,15 Q35,35 50,15" /></svg>
                        <b>Пик-Волна</b>
                    </button>
                </div>

                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                    <b>Артефакты (Игнорировать!):</b>
                </div>
                <div class="pathology-controls">
                    <button class="path-btn artifact" id="btn-blink">
                        <svg class="path-icon" viewBox="0 0 50 30"><path d="M0,15 Q25,-15 50,15" /></svg>
                        <b>Моргание</b>
                    </button>
                    <button class="path-btn artifact" id="btn-emg">
                        <svg class="path-icon" viewBox="0 0 50 30"><path d="M0,15 L10,15 L12,10 L14,20 L16,5 L18,25 L20,15 L50,15" /></svg>
                        <b>Мышцы (ЭМГ)</b>
                    </button>
                </div>
            </div>

            <!-- Блок Теста (Инфо) -->
            <div id="test-info" class="hidden-controls" style="text-align: center; margin-bottom: 20px; padding: 15px; background: #e7f5ff; border-radius: 8px;">
                <div style="font-weight: bold; color: #0056b3;">⚠️ Идет мониторинг...</div>
                <div style="font-size: 13px;">Нажимайте "ЗАФИКСИРОВАТЬ", только когда <b>Патология</b> попадает в зеленую зону.<br>Игнорируйте моргания и мышцы!</div>
            </div>

            <!-- Монитор -->
            <div class="monitor-container">
                <div class="monitor-overlay-ui">MONITORING ACTIVE</div>
                <canvas id="epiCanvas" width="600" height="300" class="eeg-canvas"></canvas>

                <!-- Зона захвата -->
                <div class="capture-zone">
                    <div class="capture-label">ZONE</div>
                </div>
            </div>

            <!-- Панель игры -->
            <div class="game-score-panel">
                <div style="flex: 1;">
                    <div id="game-feedback" style="font-weight: bold; color: #fab1a0; min-height: 20px;">Ожидание...</div>
                    <div style="font-size: 12px; color: #ccc;">Счет: <span id="score-val" style="color: #fff; font-size: 14px;">0</span></div>
                </div>
                <button id="btn-catch" class="capture-btn">ЗАФИКСИРОВАТЬ!</button>
            </div>
        `
    },
    {
        id: 'bci',
        title: "5.2 Нейроинтерфейсы (BCI): Как это работает?",
        content: `
            <p>BCI ищет в шуме мозга специфические паттерны-отклики. Давайте посмотрим на "сырой" сигнал при разных командах.</p>

            <div class="bci-tabs">
                <button class="bci-tab-btn active" data-tab="mi">1. Motor Imagery</button>
                <button class="bci-tab-btn" data-tab="p300">2. P300 (Speller)</button>
                <button class="bci-tab-btn" data-tab="ssvep">3. SSVEP</button>
            </div>

            <!-- TAB 1: MOTOR IMAGERY -->
            <div id="tab-mi" class="bci-pane active">
                <div style="font-size: 13px; color: #555; margin-bottom: 15px;">
                    <b>Задача:</b> Управляйте дроном. Зажмите кнопку, чтобы активировать соответствующее полушарие.
                    <br><i>Заметьте: Левая кнопка активирует Правое полушарие (C4).</i>
                </div>

                <div class="bci-dashboard">
                    <div class="brain-heatmap-container">
                        <div id="head-heatmap"></div>
                        <div style="text-align: center; font-size: 11px; margin-top: 5px; color: #aaa;">Активность Сенсомоторной коры</div>
                    </div>
                    <div class="drone-game-container" id="drone-game">
                        <div id="player-drone" class="drone" style="font-size: 40px;">🚁</div>
                    </div>
                </div>
                <div class="bci-controls">
                    <button class="bci-btn" id="cmd-left">⬅️ Влево (Active: C4)</button>
                    <button class="bci-btn" id="cmd-right">Вправо ➡️ (Active: C3)</button>
                </div>
            </div>

            <!-- TAB 2: P300 -->
            <div id="tab-p300" class="bci-pane">
                <div style="font-size: 13px; color: #555; margin-bottom: 15px;">
                    <b>Суть метода:</b> Мы ищем "Удивление мозга". Когда загорается нужная буква, мозг реагирует всплеском (волной P300) через 300мс.
                    <br>👉 <b>Следите за графиком справа!</b> При вспышке целевой буквы там будет горб.
                </div>

                <div class="p300-layout">
                    <div class="p300-matrix-area">
                        <div style="text-align: center; color: #fff; margin-bottom: 10px;">Цель: <span id="p300-target" style="color: #0984e3; font-weight: bold; font-size: 20px;">B</span></div>
                        <div class="p300-grid" id="p300-matrix"></div>
                        <button class="action-btn" id="btn-p300-start" style="margin-top: 10px; width: 100%;">Начать поиск</button>
                    </div>

                    <div class="p300-monitor-area">
                        <div class="p300-monitor-label">EEG SIGNAL (Pz Channel)</div>
                        <canvas id="p300Canvas" width="300" height="220" style="width: 100%; height: 100%;"></canvas>
                    </div>
                </div>
                <div id="p300-result" style="text-align: center; margin-top: 10px; font-weight: bold; height: 20px;"></div>
            </div>

            <!-- TAB 3: SSVEP -->
            <div id="tab-ssvep" class="bci-pane">
                <div style="font-size: 13px; color: #555; margin-bottom: 15px;">
                    <b>Суть метода:</b> "Навязывание ритма". Зрительная кора (затылок) начинает пульсировать с той же частотой, что и объект, на который мы смотрим.
                </div>

                <div class="ssvep-container">
                    <div class="ssvep-box" id="box-12hz">
                        <div style="font-size: 24px;">⬅️</div>
                        12 Hz
                    </div>
                    <div class="ssvep-box" id="box-20hz">
                        <div style="font-size: 24px;">➡️</div>
                        20 Hz
                    </div>
                </div>

                <div style="margin-top: 15px; position: relative;">
                    <div style="font-size: 12px; color: #333; margin-bottom: 5px; font-weight: bold;">Спектр частот (FFT):</div>
                    <canvas id="ssvepCanvas" class="spectrum-canvas"></canvas>
                </div>
            </div>
        `
    },
    {
        id: 'nfb',
        title: "5.3 БОС-тренинги: Как это работает изнутри",
        content: `
            <p>Пациент видит машинку. Инженер видит <b>математику</b>. БОС — это цепочка преобразований: Сырой сигнал -> Спектр -> Вычисляемый параметр -> Игра.</p>

            <!-- Управление -->
            <div class="protocol-selector">
                <button id="proto-alpha" class="btn-toggle active" style="flex:1;">🧘 Протокол Альфа</button>
                <button id="proto-beta" class="btn-toggle" style="flex:1;">🎯 Протокол Бета/Тета</button>
            </div>

            <div class="nfb-layout">
                <!-- 1. Экран Пациента (Игра) -->
                <div class="nfb-game-screen" id="game-screen">
                    <div class="reward-overlay" id="reward-sign">🌟 SUCCESS!</div>
                    <div class="nfb-car" id="nfb-car">🏎️</div>
                    <div class="road-stripes" id="road-stripes"></div>
                </div>

                <!-- 2. Панель Инженера (3 графика) -->
                <div class="nfb-scopes-container">

                    <!-- A. Сырой сигнал -->
                    <div class="scope-box">
                        <div class="scope-label label-raw">1. RAW EEG (Сырой)</div>
                        <canvas id="rawCanvas" class="scope-canvas"></canvas>
                    </div>

                    <!-- B. Спектр -->
                    <div class="scope-box">
                        <div class="scope-label label-fft">2. SPECTRUM (Спектр)</div>
                        <canvas id="specCanvas" class="scope-canvas"></canvas>
                    </div>

                    <!-- C. Тренд (Результат) -->
                    <div class="scope-box">
                        <div class="scope-label label-trend">3. TREND (Параметр)</div>
                        <div id="trend-val" style="position:absolute; bottom:5px; right:5px; color:#0f0; font-size:12px; font-family:monospace;">0.0</div>
                        <canvas id="trendCanvas" class="scope-canvas"></canvas>
                    </div>
                </div>
            </div>

            <!-- Слайдер состояния -->
            <div style="background: #f1f3f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <label style="font-weight:bold; display:block;">Симулятор мозга пациента:</label>
                <input type="range" id="state-slider" class="brain-state-slider" min="0" max="100" value="10">
                <div class="state-labels">
                    <span id="label-left">Стресс / Шум</span>
                    <span id="label-right">Целевое состояние</span>
                </div>
            </div>
        `
    },
    {
        id: 'marketing',
        title: "5.4 Нейромаркетинг: Анализ реакций",
        content: `
            <p>Задача аналитика — сопоставить видеоряд с биосигналами и найти "узкие места".</p>

            <div class="nm-dashboard">

                <!-- 1. ВЕРХ: Видео и Голова -->
                <div class="nm-top-row">
                    <div class="ad-preview" id="ad-screen">
                        <div style="color:#aaa;">⏸️ Нажмите Play<br>или кликните на таймлайн</div>
                    </div>

                    <div class="topomap-container">
                        <div style="font-size: 10px; color: #555; margin-bottom:5px;">VALENCE (F3 vs F4)</div>
                        <div id="head-topo" style="width: 80px; height: 80px;"></div>

                        <div class="asym-bar-container">
                            <div style="display:flex; justify-content:space-between; font-size:9px; color:#666; margin-bottom:2px;">
                                <span>Негатив</span><span>Позитив</span>
                            </div>
                            <div class="asym-bar"><div class="asym-indicator" id="val-indicator"></div></div>
                        </div>
                    </div>
                </div>

                <!-- 2. СЕРЕДИНА: Таймлайн (Навигация) -->
                <div>
                    <div class="nm-timeline" id="nm-timeline">
                        <!-- Маркеры сцен (JS) -->
                        <div class="playhead" id="main-playhead"></div>
                    </div>
                    <div style="text-align: center; margin-top: 5px;">
                        <button class="action-btn" id="btn-play" style="width: auto; padding: 8px 20px; font-size: 14px;">▶️ Play / Pause</button>
                    </div>
                </div>

                <!-- 3. НИЗ: Графики -->
                <div class="nm-charts-grid">
                    <div class="nm-chart-box">
                        <div class="nm-chart-label" style="color:#e67e22;">ВОВЛЕЧЕННОСТЬ (Beta+Gamma)</div>
                        <canvas id="chart-eng" width="300" height="120" style="width:100%; height:100%; display:block;"></canvas>
                        <div class="playhead" id="cursor-eng" style="background:rgba(255,0,0,0.5);"></div>
                    </div>

                    <div class="nm-chart-box">
                        <div class="nm-chart-label" style="color:#00b894;">ЭМОЦИЯ (Valence)</div>
                        <canvas id="chart-val" width="300" height="120" style="width:100%; height:100%; display:block;"></canvas>
                        <div class="playhead" id="cursor-val" style="background:rgba(255,0,0,0.5);"></div>
                        <!-- Ноль -->
                        <div style="position:absolute; top:50%; left:0; width:100%; height:1px; background:#ccc; z-index:0;"></div>
                    </div>
                </div>
            </div>

            <!-- 4. Анализ (Квиз) -->
            <div class="quiz-question" id="nm-analysis" style="display:none; margin-top: 20px;">
                <h3>📊 Анализ кейса:</h3>
                <p>Посмотрите на график Валентности (справа). В момент появления <b>ЦЕНЫ</b> (6-я секунда) график резко ушел вниз (в негатив). При этом Вовлеченность (слева) была максимальной. О чем это говорит?</p>

                <div class="quiz-options" id="nm-quiz-options">
                    <button class="quiz-btn" data-correct="false">Клиент потерял интерес и отвлекся.</button>
                    <button class="quiz-btn" data-correct="true">Клиент внимательно изучил цену, но она вызвала "боль оплаты" (шок).</button>
                    <button class="quiz-btn" data-correct="false">Клиенту понравилась цена, он задумался о покупке.</button>
                </div>
                <div id="nm-quiz-feedback" class="quiz-feedback-text"></div>
            </div>
        `
    },
{
        id: 'quiz',
        title: "5.5 Итоговая аттестация",
        content: `
            <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <p>Вы прошли полный курс обучения по ЭЭГ.</p>
                <p>Этот тест содержит 20 сложных вопросов, охватывающих физику, схемотехнику, продуктовую линейку и методы применения.</p>

                <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeeba;">
                    <b>Критерий успеха:</b> 85% правильных ответов (17 из 20).
                </div>

                <div id="exam-container" style="text-align: left; margin-top: 30px;">
                    <!-- Сюда рендерится вопрос -->
                </div>

                <!-- Экран результата -->
                <div id="exam-result" style="display: none; animation: fadeIn 0.5s;">
                    <div id="result-icon" style="font-size: 60px; margin-bottom: 10px;"></div>
                    <h2 id="result-title"></h2>
                    <p id="result-desc"></p>
                    <div id="result-score" style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #333;"></div>

                    <button class="action-btn" id="btn-restart" style="display:none; background:#636e72;">Пересдать</button>
                    <button class="action-btn" id="btn-cert" style="display:none; background: linear-gradient(45deg, #00b894, #0984e3);">🎓 Получить сертификат</button>
                </div>
            </div>
        `
    }

];
