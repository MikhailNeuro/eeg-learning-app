import Menu from '../components/Menu.js';
import ProgressManager from './ProgressManager.js';
import Block1 from '../blocks/block1/index.js';
import Block2 from '../blocks/block2/index.js';
import Block3 from '../blocks/block3/index.js';
import Block4 from '../blocks/block4/index.js';
import Block5 from '../blocks/block5/index.js';

export default class App {
    constructor(rootSelector) {
        this.root = document.querySelector(rootSelector);
        this.currentView = null;
        this.progressManager = new ProgressManager();

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
        if (this.currentView) this.root.innerHTML = '';

        this.currentView = new Menu(
            this.root,
            (blockId) => this.startBlock(blockId),
            this.progressManager
        );
        this.currentView.render();
    }

    startBlock(blockId) {
        const BlockClass = this.blocks[blockId];
        if (!BlockClass) return;

        if (this.currentView) this.root.innerHTML = '';

        this.currentView = new BlockClass(
            this.root,
            () => this.showMenu(),
            null,
            this.progressManager
        );

        this.currentView.progressManager = this.progressManager;

        this.currentView.blockId = blockId;
        this.currentView.render();
    }
}