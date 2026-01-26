export const block3Data = [
    {
        id: 'adc',
        title: "3.1 Архитектура АЦП: Глубокое погружение",
        content: `
            <p>В профессиональном оборудовании используются <b>Sigma-Delta АЦП</b> (например, TI ADS1299). Два критических параметра определяют качество физики:</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <div style="background: #e7f5ff; padding: 10px; border-radius: 6px; font-size: 12px; border: 1px solid #b6d4fe;">
                    <b>1. Разрядность (Bit Depth)</b><br>
                    Определяет <b>LSB</b> (Least Significant Bit) — минимальное напряжение, которое различает прибор.<br>
                    <code>LSB = V_ref / (2^N * Gain)</code><br>
                    <span style="color: #0056b3;">Для 24 бит LSB ≈ 0.05 мкВ (нановольты!)</span>
                </div>
                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 12px; border: 1px solid #ffecb5;">
                    <b>2. Частота (Sampling Rate)</b><br>
                    Ограничена <b>Теоремой Котельникова (Найквиста)</b>.<br>
                    <code>F_sample > 2 * F_signal</code><br>
                    <span style="color: #856404;">Иначе возникает <b>Aliasing</b> (ложные частоты).</span>
                </div>
            </div>

            <div class="tech-container">
                <div class="tech-screen">
                    <canvas id="adcCanvas" width="600" height="250" style="width: 100%; display: block;"></canvas>

                    <!-- Инженерная телеметрия на экране -->
                    <div class="tech-overlay" style="text-align: left; left: 10px; top: 10px;">
                        <div>LSB RESOLUTION: <span id="osd-lsb" style="color: #0ff;">---</span></div>
                        <div>DYNAMIC RANGE: <span id="osd-dr" style="color: #0ff;">---</span></div>
                    </div>

                    <!-- Предупреждение об Алиасинге -->
                    <div id="aliasing-warning" style="position: absolute; bottom: 10px; right: 10px; color: #ff4757; font-weight: bold; display: none; background: rgba(0,0,0,0.8); padding: 5px;">
                        ⚠️ ALIASING DETECTED
                    </div>
                </div>

                <div class="tech-controls">
                    <!-- Частота -->
                    <div class="control-group">
                        <label>Sampling Rate (Частота)</label>
                        <input type="range" id="slider-rate" class="precision-slider" min="0" max="3" step="1" value="2">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666;">
                            <span>50 Hz</span><span>125 Hz</span><span>250 Hz</span><span>500 Hz</span>
                        </div>
                    </div>

                    <!-- Битность -->
                    <div class="control-group">
                        <label>Bit Depth (Разрядность)</label>
                        <input type="range" id="slider-bits" class="precision-slider" min="0" max="3" step="1" value="3">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666;">
                            <span>8 Bit</span><span>12 Bit</span><span>16 Bit</span><span>24 Bit</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                    <label style="font-size: 13px; display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="chk-aliasing-mode" style="margin-right: 10px;">
                        <b>🔥 Демонстрация Алиасинга (Nyquist Failure)</b>
                    </label>
                    <div style="font-size: 11px; color: #666; margin-left: 24px;">
                        Подадим сигнал 60 Гц. Попробуйте понизить частоту дискретизации до 50 Гц и посмотрите, как сигнал превратится в фантомную волну 10 Гц.
                    </div>
                </div>
            </div>
        `
    },

    {
        id: 'filters',
        title: "3.2 Цифровая фильтрация и Спектральный анализ",
        content: `
            <p>Инженер видит сигнал в двух измерениях: во времени и в частоте. Помехи имеют специфический "спектральный отпечаток".</p>

            <div style="background: #e7f5ff; padding: 10px; border-radius: 6px; border-left: 4px solid #0056b3; font-size: 12px; margin-bottom: 15px;">
                <b>Инженерная справка:</b><br>
                Мы используем цифровые фильтры (IIR/FIR). Важно не только убрать шум, но и не внести фазовых искажений в полезный сигнал.<br>
                • <b>HPF (ФВЧ):</b> Убирает дрейф изолинии (постоянную составляющую DC и сверхмедленные волны).<br>
                • <b>Notch:</b> "Хирургический" вырез узкой полосы (50/60 Гц).<br>
                • <b>LPF (ФНЧ):</b> Сглаживание, удаление электромиограммы (ЭМГ).
            </div>

            <div class="dual-screen-container">
                <!-- 1. Временная область -->
                <div class="scope-screen">
                    <span class="scope-label">TIME DOMAIN (ЭЭГ)</span>
                    <canvas id="timeCanvas" width="600" height="150" style="width: 100%; height: 100%;"></canvas>
                </div>

                <!-- 2. Частотная область -->
                <div class="spectrum-screen">
                    <span class="scope-label">FREQUENCY DOMAIN (FFT)</span>
                    <canvas id="freqCanvas" width="600" height="120" style="width: 100%; height: 100%;"></canvas>
                    <div class="spectrum-grid">
                        <span>0 Hz</span><span>10 Hz</span><span>30 Hz</span><span>50 Hz</span><span>100 Hz</span>
                    </div>
                </div>
            </div>

            <div class="filter-controls">

                <!-- HPF Control -->
                <div class="dsp-knob-container">
                    <div class="dsp-title">High Pass (ФВЧ)</div>
                    <select id="sel-hpf" class="btn btn-outline" style="width: 100%; padding: 5px;">
                        <option value="off">OFF (DC)</option>
                        <option value="0.5">0.5 Hz (Std)</option>
                        <option value="1.6">1.6 Hz (Fast)</option>
                    </select>
                    <div class="dsp-desc">Убирает дрейф от пота и движения.</div>
                </div>

                <!-- Notch Control -->
                <div class="dsp-knob-container">
                    <div class="dsp-title">Notch (Режектор)</div>
                    <label class="mixer-toggle" id="btn-notch" style="border: 1px solid #ccc; padding: 5px;">
                        <input type="checkbox">
                        <span style="font-size: 12px; font-weight: bold;">50 Hz Enable</span>
                    </label>
                    <div class="dsp-desc">Вырезает наводку электросети.</div>
                </div>

                <!-- LPF Control -->
                <div class="dsp-knob-container">
                    <div class="dsp-title">Low Pass (ФНЧ)</div>
                    <select id="sel-lpf" class="btn btn-outline" style="width: 100%; padding: 5px;">
                        <option value="off">OFF (Broad)</option>
                        <option value="70">70 Hz (Soft)</option>
                        <option value="30">30 Hz (Hard)</option>
                    </select>
                    <div class="dsp-desc">Режет ВЧ-шум и мышцы.</div>
                </div>
            </div>
        `
    },

    {
        id: 'cmrr',
        title: "3.3 КОСС (CMRR): Битва с сетевой наводкой",
        content: `
            <p>На входы усилителя приходит полезный сигнал (10 мкВ) и помеха от сети (1 Вольт). Помеха в 100 000 раз мощнее сигнала!</p>
            <p><b>CMRR (КОСС)</b> — это способность усилителя "вычесть" эту гигантскую помеху и оставить только маленький сигнал мозга.</p>

            <div class="tech-container">
                <!-- Увеличенный канвас -->
                <div class="tech-screen" style="height: 320px;">
                    <canvas id="cmrrCanvas" width="600" height="300" style="width: 100%; height: 100%; display: block;"></canvas>
                </div>

                <div class="tech-controls">
                    <div class="control-group" style="grid-column: span 2;">
                        <label>
                            Качество подавления (CMRR)
                            <span id="val-cmrr" class="control-value">100 dB</span>
                        </label>
                        <input type="range" id="slider-cmrr" class="precision-slider" min="50" max="130" step="10" value="100">

                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-top: 5px;">
                            <span>50dB (Плохо)</span>
                            <span>80dB (Средне)</span>
                            <span>100dB (BrainBit)</span>
                            <span>120dB+ (High-End)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="cmrr-status" style="padding: 12px; border-radius: 6px; text-align: center; font-weight: bold; background: #eee; font-size: 14px;">
                ---
            </div>
        `
    },
    {
        id: 'connection',
        title: "3.4 Передача данных: USB vs Bluetooth",
        content: `
            <p>Выбор протокола — это компромисс между мобильностью и надежностью. Главный враг инженера здесь — <b>Задержка</b> (Latency).</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="background: #e7f5ff; padding: 10px; border-radius: 6px; font-size: 12px; border: 1px solid #b6d4fe;">
                    <b>USB (Провод):</b><br>
                    • Задержка: < 5 ms (Мгновенно)<br>
                    • Потерь нет.<br>
                    • Питание от ПК (нет батареек).
                </div>
                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; font-size: 12px; border: 1px solid #ffecb5;">
                    <b>Bluetooth (BLE):</b><br>
                    • Задержка: 30-100 ms (Заметно)<br>
                    • Возможна потеря пакетов.<br>
                    • Гальваническая изоляция (Безопасно).
                </div>
            </div>

            <div class="conn-grid">
                <!-- Монитор графиков -->
                <div class="conn-monitor">
                    <canvas id="connCanvas" width="450" height="250" style="width: 100%; height: 100%; display: block;"></canvas>

                    <!-- Легенда -->
                    <div style="position: absolute; top: 10px; right: 10px; text-align: right; font-size: 11px; font-family: monospace; pointer-events: none; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 4px;">
                        <span style="color: #ccc;">⬛ Реальность (Источник)</span><br>
                        <span style="color: #ff4757;">🟥 Монитор (С задержкой)</span>
                    </div>
                </div>

                <!-- Метрики справа -->
                <div class="conn-metrics">
                    <div class="metric-box">
                        <div class="metric-label">Задержка</div>
                        <div class="metric-val" id="val-latency" style="color: #00ff00;">0 мс</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-label">Пакеты</div>
                        <div class="metric-val" id="val-loss">100%</div>
                        <div class="packet-status" id="packet-visual"></div>
                    </div>

                    <hr style="border-color: #333; width: 100%;">

                    <div style="font-size: 11px; color: #aaa; margin-bottom: 5px;">Помехи:</div>
                    <input type="range" id="slider-dist" class="precision-slider" min="0" max="100" value="0" style="margin-bottom: 20px;">

                    <div class="btn-group" style="flex-direction: column; gap: 5px;">
                        <button id="btn-usb" class="btn-toggle active" style="width: 100%; font-size: 12px;">USB 2.0</button>
                        <button id="btn-ble" class="btn-toggle" style="width: 100%; font-size: 12px;">Bluetooth 5.0</button>
                    </div>
                </div>
            </div>

            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                <i>Тест реакции: На верхнем графике возникает "Событие" (квадратный импульс). Заметьте, с каким опозданием оно появляется на нижнем графике в режиме Bluetooth.</i>
            </p>
        `
    },
    {
        id: 'quiz',
        title: "3.5 Сертификационный экзамен (Технический)",
        content: `
            <p>Это финальный тест технического блока. Вопросы требуют глубокого понимания физики процессов.</p>
            <p>Инженеры и старшие специалисты должны отвечать безошибочно.</p>

            <div id="quiz-container" style="margin-top: 25px;">
                <!-- Вопросы -->
            </div>

            <div id="quiz-result" style="text-align: center; margin-top: 30px; display: none;">
                <h3 style="color: var(--primary-color);">Блок 3 закончен!</h3>
                <p>Вы разобрались в области цифровой обработки сигналов ЭЭГ.</p>
            </div>
        `
    }

];