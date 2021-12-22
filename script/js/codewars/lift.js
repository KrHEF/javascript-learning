"use strict";
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["DOWN"] = -1] = "DOWN";
})(Direction || (Direction = {}));
class Person {
    floor;
    goTo;
    constructor(floor, goTo) {
        this.floor = floor;
        this.goTo = goTo;
        if (floor === goTo) {
            throw new Error('This person go to hell');
        }
    }
    get direction() {
        return (this.goTo > this.floor) ? 'up' : 'down';
    }
}
class Floor {
    number;
    _queueUp = [];
    _queueDown = [];
    constructor(number) {
        this.number = number;
    }
    get isUpPressed() {
        return this._queueUp.length > 0;
    }
    get isDownPressed() {
        return this._queueDown.length > 0;
    }
    get isPressed() {
        return this.isUpPressed || this.isDownPressed;
    }
    addPerson(person) {
        if (person.goTo === this.number) {
            return this.goToHell(person);
        }
        if (person.goTo > this.number) {
            this._queueUp.push(person);
        }
        else {
            this._queueDown.push(person);
        }
    }
    setLiftOnTheFloor(lift) {
        if (this.isPressed) {
        }
        else {
            lift.changeDirection();
        }
        if (lift.direction === 'up') {
            if (this._queueUp.length) {
                lift.letInPersons(this._queueUp.splice(0, lift.freeSpace));
            }
            lift.clearQueue('up');
            if (this._queueUp.length) {
                lift.wait(this.number, 'up');
            }
        }
        else {
            if (this._queueDown.length) {
                lift.letInPersons(this._queueDown.splice(0, lift.freeSpace));
            }
            lift.clearQueue('down');
            if (this._queueDown.length) {
                lift.wait(this.number, 'down');
            }
        }
    }
    goToHell(person) {
        return;
    }
    ;
}
class Lift {
    _capacity;
    _currentFloor = 0;
    _log = [];
    _direction = 'up';
    _persons = new Set();
    _personsGoTo = new Map();
    _queueUp = new Set();
    _queueDown = new Set();
    _iterationCount = 1e6;
    constructor(capacity) {
        this._capacity = capacity;
    }
    get direction() {
        return this._direction;
    }
    get freeSpace() {
        return this._capacity - this._persons.size;
    }
    get currentFloor() {
        return this._currentFloor;
    }
    get log() {
        return [...this._log];
    }
    get needToStop() {
        if (this._personsGoTo.has(this._currentFloor)) {
            return true;
        }
        if (this.direction === 'up') {
            return this._queueUp.has(this._currentFloor)
                || (this.needToChangeDirection && this._queueDown.has(this._currentFloor));
        }
        else {
            return this._queueDown.has(this._currentFloor)
                || (this.needToChangeDirection && this._queueUp.has(this._currentFloor));
        }
    }
    get needToChangeDirection() {
        if (!this._queueDown.size && !this._queueUp.size && !this._persons.size) {
            return (this._direction === 'up');
        }
        if (this._direction === 'up') {
            if (this._queueUp.size && this._currentFloor <= Math.max(...this._queueUp.keys())) {
                return false;
            }
            if (this._queueDown.size && this._currentFloor < Math.max(...this._queueDown.keys())) {
                return false;
            }
            if (this._currentFloor < Math.max(...this._personsGoTo.keys())) {
                return false;
            }
            return true;
        }
        else {
            if (this._queueDown.size && this._currentFloor >= Math.min(...this._queueDown.keys())) {
                return false;
            }
            if (this._queueUp.size && this._currentFloor > Math.min(...this._queueUp.keys())) {
                return false;
            }
            if (this._currentFloor > Math.min(...this._personsGoTo.keys())) {
                return false;
            }
            return true;
        }
    }
    up() {
        this._currentFloor++;
    }
    down() {
        this._currentFloor--;
    }
    next() {
        if (--this._iterationCount <= 0) {
            throw new Error('The lift is broken');
        }
        if (!this._queueDown.size && !this._queueUp.size && !this._persons.size && !this._currentFloor) {
            this._log.push(0);
            return false;
        }
        if (this.direction === 'up') {
            this._currentFloor++;
        }
        else {
            this._currentFloor--;
        }
        return true;
    }
    open() {
        this._log.push(this._currentFloor);
        this.clearQueue();
        this.letOutPersons();
    }
    clearQueue() {
        if (this.direction === 'up') {
            this._queueUp.delete(this._currentFloor);
        }
        else {
            this._queueDown.delete(this._currentFloor);
        }
    }
    wait(floor, direction) {
        if (direction === 'up') {
            this._queueUp.add(floor);
        }
        else {
            this._queueDown.add(floor);
        }
    }
    letInPersons(persons) {
        persons.forEach((person) => {
            this._persons.add(person);
            if (!this._personsGoTo.has(person.goTo)) {
                this._personsGoTo.set(person.goTo, []);
            }
            this._personsGoTo.get(person.goTo).push(person);
        });
    }
    letOutPersons() {
        const result = this._personsGoTo.get(this._currentFloor) || [];
        this._personsGoTo.delete(this._currentFloor);
        result.forEach((person) => this._persons.delete(person));
        return result;
    }
    selectDirection() {
        if (this.needToChangeDirection) {
            this._direction = (this._direction === 'up') ? 'down' : 'up';
        }
    }
    changeDirection() {
        return false;
    }
    error() {
        throw new Error('The lift is broken');
    }
}
class Building {
    _floors;
    _lift;
    _cpu;
    constructor(floorCount, liftCapacity) {
        this._floors = (new Array(floorCount)).fill(0).map((nothing, index) => new Floor(index));
        this._lift = new Lift(liftCapacity);
        this._cpu = new CPU(this._lift, floorCount, 0);
    }
    get liftLog() {
        return this._lift.log;
    }
    init(queues) {
        queues.forEach((queue, floorNumber) => {
            const floor = this._floors[floorNumber];
            queue.forEach((goTo) => {
                const person = new Person(floorNumber, goTo);
                floor.addPerson(person);
                this._lift.wait(person.floor, person.direction);
            });
        });
    }
    calc() {
        this.openLiftOnTheFloor();
        while (this._lift.next()) {
            if (this._lift.needToStop) {
                this.openLiftOnTheFloor();
            }
        }
    }
    openLiftOnTheFloor() {
        this._lift.open();
        this._floors[this._lift.currentFloor].setLiftOnTheFloor(this._lift);
    }
}
class CPU {
    _floorCount;
    _firstFloorNumber;
    _lift;
    _queue;
    _direction = Direction.UP;
    _iterationCount = 1e6;
    constructor(lift, floorCount, firstFloorNumber) {
        this._lift = lift;
        this._floorCount = floorCount;
        this._firstFloorNumber = firstFloorNumber;
        this._queue = {
            [Direction.DOWN]: new Set(),
            [Direction.UP]: new Set(),
        };
    }
    get needToStop() {
        return this._queue[this._direction].has(this._lift.currentFloor);
    }
    get needToChangeDirection() {
        const queueUp = this._queue[Direction.UP];
        const queueDown = this._queue[Direction.DOWN];
        if (this._direction === Direction.UP) {
            if (queueUp.size && this._lift.currentFloor <= Math.max(...queueUp.keys())) {
                return false;
            }
            if (queueDown.size && this._lift.currentFloor < Math.max(...queueDown.keys())) {
                return false;
            }
            return true;
        }
        else {
            if (queueDown.size && this._lift.currentFloor >= Math.min(...queueDown.keys())) {
                return false;
            }
            if (queueUp.size && this._lift.currentFloor > Math.min(...queueUp.keys())) {
                return false;
            }
            return true;
        }
    }
    pressFloorButton(floor, direction) {
        this._queue[direction].add(floor);
    }
    pressLiftButton(floor) {
        if (floor === this._lift.currentFloor) {
            return;
        }
        const direction = (floor > this._lift.currentFloor) ? Direction.UP : Direction.DOWN;
        this._queue[direction].add(floor);
    }
    next() {
        this.clearQueue();
        while (true) {
            if (--this._iterationCount <= 0) {
                this._lift.error();
            }
            if (!this._queue[Direction.DOWN].size && !this._queue[Direction.UP].size) {
                if (this._lift.currentFloor >= this._firstFloorNumber) {
                    this._queue[Direction.DOWN].add(this._firstFloorNumber);
                    this._direction = Direction.DOWN;
                }
                else {
                    return false;
                }
            }
            if (this._direction === Direction.UP) {
                if (this._lift.currentFloor >= (this._floorCount - this._firstFloorNumber)) {
                    this._lift.open();
                    this._lift.error();
                }
                this._lift.up();
            }
            else if (this._direction === Direction.DOWN) {
                if (this._lift.currentFloor <= this._firstFloorNumber) {
                    this._lift.open();
                    this._lift.error();
                }
                this._lift.down();
            }
            if (this.needToStop) {
                return true;
            }
        }
    }
    clearQueue() {
        this._queue[this._direction].delete(this._lift.currentFloor);
    }
}
const theLift = (queues, capacity) => {
    const building = new Building(queues.length, capacity);
    building.init(queues);
    try {
        building.calc();
    }
    finally {
        console.log(building);
    }
    return building.liftLog;
};
const it = (name, test) => {
    console.log(`"${name}" => `, test());
};
it("up", function () {
    var queues = [
        [],
        [],
        [5, 5, 5],
        [],
        [],
        [],
        [],
    ];
    var result = theLift(queues, 5);
    console.log(result, [0, 2, 5, 0]);
    return result.join('') === [0, 2, 5, 0].join('');
});
it("down", function () {
    var queues = [
        [],
        [],
        [1, 1],
        [],
        [],
        [],
        [],
    ];
    var result = theLift(queues, 5);
    console.log(result, [0, 2, 1, 0]);
    return result.join('') === [0, 2, 1, 0].join('');
});
it("up and up", function () {
    var queues = [
        [],
        [3],
        [4],
        [],
        [5],
        [],
        [],
    ];
    var result = theLift(queues, 5);
    console.log(result, [0, 1, 2, 3, 4, 5, 0]);
    return result.join('') === [0, 1, 2, 3, 4, 5, 0].join('');
});
it("down and down", function () {
    var queues = [
        [],
        [0],
        [],
        [],
        [2],
        [3],
        [],
    ];
    var result = theLift(queues, 5);
    console.log(result, [0, 5, 4, 3, 2, 1, 0]);
    return result.join('') === [0, 5, 4, 3, 2, 1, 0].join('');
});
//# sourceMappingURL=lift.js.map