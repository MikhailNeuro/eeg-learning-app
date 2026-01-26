export default class ProgressManager {
    constructor() {
        this.STORAGE_KEY = 'eeg_course_progress_v2';
        this.data = this.loadData();
    }

    loadData() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error("Ошибка чтения сохранений", e);
                return { blocks: {} };
            }
        }
        return { blocks: {} };
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    _initBlock(blockId) {
        if (!this.data.blocks[blockId]) {
            this.data.blocks[blockId] = {
                bestPercent: 0,
                lastPercent: 0,
                isPassed: false,
                attempts: []
            };
        }
    }

    updateProgress(blockId, currentScore, totalQuestions) {
        this._initBlock(blockId);

        const percent = Math.round((currentScore / totalQuestions) * 100);

        this.data.blocks[blockId].lastPercent = percent;

        if (percent > this.data.blocks[blockId].bestPercent) {
            this.data.blocks[blockId].bestPercent = percent;
        }

        if (percent >= 80) {
            this.data.blocks[blockId].isPassed = true;
        }

        this.saveData();
    }

    saveResult(blockId, score, totalQuestions) {
        this.updateProgress(blockId, score, totalQuestions);

        const percent = Math.round((score / totalQuestions) * 100);

        this.data.blocks[blockId].attempts.push({
            date: new Date().toISOString(),
            score: score,
            total: totalQuestions,
            percent: percent
        });

        this.saveData();
    }

    getBlockInfo(blockId) {
        return this.data.blocks[blockId] || null;
    }

    resetAll() {
        this.data = { blocks: {} };
        localStorage.removeItem(this.STORAGE_KEY);
        this.saveData();
    }
}