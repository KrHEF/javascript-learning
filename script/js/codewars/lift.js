"use strict";
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["DOWN"] = -1] = "DOWN";
})(Direction || (Direction = {}));
class Queue {
    _queue = [];
    get size() {
        return this._queue.length;
    }
    get values() {
        return [...this._queue];
    }
    lpush(value) {
        if (!this.has(value)) {
            this._queue.unshift(value);
        }
    }
    rpush(value) {
        if (!this.has(value)) {
            this._queue.push(value);
        }
    }
    lpop(count) {
        if (typeof (count) !== 'number') {
            return this._queue.shift() || null;
        }
        return this._queue.splice(0, count);
    }
    rpop(count) {
        if (typeof (count) !== 'number') {
            return this._queue.pop() || null;
        }
        return this._queue.splice(-count).reverse();
    }
    delete(value) {
        const size = this.size;
        this._queue = this._queue.filter((val) => val !== value);
        return size !== this.size;
    }
    has(value) {
        return this._queue.includes(value);
    }
}
class Queues {
    _queues = {
        [Direction.DOWN]: new Queue(),
        [Direction.UP]: new Queue(),
    };
    get(direction) {
        return this._queues[direction];
    }
}
class Person {
    floor;
    goTo;
    constructor(floor, goTo) {
        this.floor = floor;
        this.goTo = goTo;
    }
    get direction() {
        if (this.goTo === this.floor) {
            return 0;
        }
        return (this.goTo > this.floor) ? Direction.UP : Direction.DOWN;
    }
}
class Floor {
    number;
    _queues = new Queues();
    _pressButton;
    constructor(number, pressFloorButton) {
        this.number = number;
        this._pressButton = pressFloorButton;
    }
    addPerson(person) {
        this._queues.get(person.direction).rpush(person);
        this._pressButton(person.floor, person.direction);
    }
    openDoors() {
        return true;
    }
    closeDoors() {
        return true;
    }
    letIn(direction, freeSpace) {
        const result = this._queues.get(direction).lpop(freeSpace);
        if (this._queues.get(direction).size) {
            this._pressButton(this.number, direction);
        }
        return result;
    }
    letOut(persons) {
        return;
    }
}
class Lift {
    _capacity;
    _persons = new Set();
    _personsGoTo = new Map();
    _pressLiftButton;
    constructor(capacity, pressLiftButton) {
        this._capacity = capacity;
        this._pressLiftButton = pressLiftButton;
    }
    get freeSpace() {
        return this._capacity - this._persons.size;
    }
    openDoors() {
        return true;
    }
    closeDoors() {
        return true;
    }
    actionWithFloor(floor, direction) {
        floor.letOut(this.letOut(floor.number));
        this.letIn(floor.letIn(direction, this.freeSpace));
    }
    letIn(persons) {
        persons.forEach((person) => {
            this._persons.add(person);
            if (!this._personsGoTo.has(person.goTo)) {
                this._personsGoTo.set(person.goTo, []);
            }
            this._personsGoTo.get(person.goTo).push(person);
            this._pressLiftButton(person.goTo, person.direction);
        });
    }
    letOut(floor) {
        const result = this._personsGoTo.get(floor) || [];
        this._personsGoTo.delete(floor);
        result.forEach((person) => this._persons.delete(person));
        return result;
    }
}
class Building {
    _cpu;
    _floors;
    _lift;
    _log = [];
    constructor(floorCount, liftCapacity) {
        this._cpu = new LiftController(floorCount);
        this._lift = new Lift(liftCapacity, (floor, direction) => {
            this._cpu.pressLiftButton(floor, direction);
        });
        const floors = (new Array(floorCount)).fill(0).map((nothing, index) => index);
        this._floors = floors.map((index) => {
            return new Floor(index, (floor, direction) => {
                this._cpu.pressFloorButton(floor, direction);
            });
        });
    }
    get liftLog() {
        return [...this._log];
    }
    init(queues) {
        queues.forEach((queue, floorNumber) => {
            const floor = this._floors[floorNumber];
            queue.forEach((goTo) => {
                const person = new Person(floorNumber, goTo);
                if (person.direction) {
                    floor.addPerson(person);
                }
            });
        });
    }
    calc() {
        this.openLiftOnTheFloor();
        while (this._cpu.next()) {
            this.openLiftOnTheFloor();
        }
    }
    openLiftOnTheFloor() {
        this._log.push(this._cpu.currentFloor);
        const currentFloor = this._floors[this._cpu.currentFloor];
        this._lift.openDoors();
        currentFloor.openDoors();
        this._lift.actionWithFloor(currentFloor, this._cpu.direction);
        if (this._cpu.needToChangeDirection) {
            this._cpu.changeDirection();
            this._lift.actionWithFloor(currentFloor, this._cpu.direction);
        }
        this._lift.closeDoors();
        currentFloor.closeDoors();
    }
}
class LiftController {
    _firstFloorNumber = 0;
    _floorCount;
    _currentFloor = 0;
    _direction = Direction.UP;
    _queues = new Queues();
    _iterationCount = 1e6;
    constructor(floorCount) {
        this._floorCount = floorCount;
    }
    get currentFloor() {
        return this._currentFloor;
    }
    get direction() {
        return this._direction;
    }
    get needToStop() {
        return this._queue.has(this._currentFloor);
    }
    get needToChangeDirection() {
        if (this._direction === Direction.UP) {
            if (this._queueUp.size && this._currentFloor <= Math.max(...this._queueUp.values)) {
                return false;
            }
            if (this._queueDown.size && this._currentFloor < Math.max(...this._queueDown.values)) {
                return false;
            }
        }
        else {
            if (this._queueDown.size && this._currentFloor >= Math.min(...this._queueDown.values)) {
                return false;
            }
            if (this._queueUp.size && this._currentFloor > Math.min(...this._queueUp.values)) {
                return false;
            }
        }
        return true;
    }
    get _queue() {
        return this._queues.get(this._direction);
    }
    get _queueUp() {
        return this._queues.get(Direction.UP);
    }
    get _queueDown() {
        return this._queues.get(Direction.DOWN);
    }
    pressFloorButton(floor, direction) {
        this._queues.get(direction).rpush(floor);
    }
    pressLiftButton(floor, direction) {
        if (floor === this._currentFloor) {
            return;
        }
        this._queues.get(direction).rpush(floor);
    }
    changeDirection() {
        this._direction *= -1;
        this.clearQueue();
    }
    next() {
        while (true) {
            if (!this._queueDown.size && !this._queueUp.size) {
                if (this._currentFloor > this._firstFloorNumber) {
                    this._direction = Direction.DOWN;
                    this._queue.rpush(this._firstFloorNumber);
                }
                else {
                    return false;
                }
            }
            this._currentFloor += this._direction;
            if ((this._currentFloor >= (this._floorCount - this._firstFloorNumber))
                || (this._currentFloor < this._firstFloorNumber)
                || --this._iterationCount <= 0) {
                this.error();
            }
            if (this.needToStop) {
                this.clearQueue();
                return true;
            }
            else if (this.needToChangeDirection) {
                this.changeDirection();
                this.clearQueue();
                return true;
            }
        }
    }
    error() {
        throw new Error('The lift is broken');
    }
    clearQueue() {
        this._queue.delete(this._currentFloor);
    }
}
const theLift = (queues, capacity) => {
    const building = new Building(queues.length, capacity);
    building.init(queues);
    try {
        building.calc();
    }
    catch (error) {
        console.log(building);
        throw error;
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
