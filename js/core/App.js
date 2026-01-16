import Menu from '../components/Menu.js';
import Block1 from '../blocks/block1/index.js';
import Block2 from '../blocks/block2/index.js';
import Block3 from '../blocks/block3/index.js';
import Block4 from '../blocks/block4/index.js';
import Block5 from '../blocks/block5/index.js';

export default class App {
    constructor(rootSelector) {
        this.root = document.querySelector(rootSelector);
        this.currentView = null;

        // Реестр доступных блоков
        this.blocks = {
            1: Block1,
            2: Block2,
            3: Block3,
            4: Block4,
            5: Block5,
        };
    }

    init() {
        this.showMenu();
    }

    showMenu() {
        // Очищаем текущее представление
        if (this.currentView) this.root.innerHTML = '';

        this.currentView = new Menu(this.root, (blockId) => this.startBlock(blockId));
        this.currentView.render();
    }

    startBlock(blockId) {
        const BlockClass = this.blocks[blockId];

        if (!BlockClass) {
            alert('Блок находится в разработке');
            return;
        }

        if (this.currentView) this.root.innerHTML = '';

        // Инициализируем выбранный блок
        this.currentView = new BlockClass(this.root, () => this.showMenu());
        this.currentView.render();
    }
}