const nodes = document.querySelectorAll('li.dir');
// const directions  = { 0: 'top', 1: 'right', 2: 'bottom', 3: 'left' };
const directions = ['top', 'right', 'bottom', 'left'];
const classNames = ['in', 'out'].map((inOrOut) => directions.map((direction) => `${inOrOut}-${direction}`)).reduce((a, b) => a.concat(b));
class Item {
    constructor(element) {
        this.element = element;
        this.element.addEventListener('mouseover', (ev) => this.update(ev, 'in'));
        this.element.addEventListener('mouseout', (ev) => this.update(ev, 'out'));
    }
    getDirectionKey(ev, node) {
        const { width, height, top, left } = node.getBoundingClientRect();
        const l = ev.pageX - (left + window.pageXOffset);
        const t = ev.pageY - (top + window.pageYOffset);
        const x = (l - (width / 2) * (width > height ? (height / width) : 1));
        const y = (t - (height / 2) * (height > width ? (width / height) : 1));
        const directionValue = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
        return directions[directionValue];
    }
    update(ev, prefix) {
        this.element.classList.remove(...classNames);
        this.element.classList.add(`${prefix}-${this.getDirectionKey(ev, this.element)}`);
    }
}
nodes.forEach(node => new Item(node));
//# sourceMappingURL=direction.js.map