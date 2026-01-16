export default class Component {
    constructor(container) {
        this.container = container;
    }

    // Очистка контейнера перед новой отрисовкой
    clear() {
        this.container.innerHTML = '';
    }

    // Метод, который обязан реализовать наследник
    render(props) {
        throw new Error(`Component ${this.constructor.name} must implement render()`);
    }
}