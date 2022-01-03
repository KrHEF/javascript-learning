"use strict";
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["DOWN"] = -1] = "DOWN";
})(Direction || (Direction = {}));
class Person {
    constructor(floor, goTo) {
        Object.defineProperty(this, "floor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: floor
        });
        Object.defineProperty(this, "goTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: goTo
        });
        if (floor === goTo) {
            throw new Error('This person go to hell');
        }
    }
    get direction() {
        return (this.goTo > this.floor) ? Direction.UP : Direction.DOWN;
    }
}
class Floor {
    constructor(number, pressFloorButton) {
        Object.defineProperty(this, "number", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_pressButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.number = number;
        this._pressButton = pressFloorButton;
        this._queue = {
            [Direction.DOWN]: [],
            [Direction.UP]: [],
        };
    }
    addPerson(person) {
        if (person.goTo === this.number) {
            return;
        }
        if (this._queue[person.direction].includes(person)) {
            return;
        }
        this._queue[person.direction].push(person);
        this._pressButton(person.floor, person.direction);
    }
    openDoors() {
        return true;
    }
    closeDoors() {
        return true;
    }
    letIn(direction, freeSpace) {
        const personsToLift = this._queue[direction].splice(0, freeSpace);
        this._queue[direction].some((person) => {
            this._pressButton(person.floor, person.direction);
            return true;
        });
        return personsToLift;
    }
    letOut(persons) {
        return;
    }
}
class Lift {
    constructor(capacity, pressLiftButton) {
        Object.defineProperty(this, "_capacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_persons", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "_personsGoTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_pressLiftButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    constructor(floorCount, liftCapacity) {
        Object.defineProperty(this, "_cpu", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_floors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lift", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_log", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
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
                floor.addPerson(person);
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
    constructor(floorCount) {
        Object.defineProperty(this, "_floorCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_firstFloorNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_currentFloor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_direction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Direction.UP
        });
        Object.defineProperty(this, "_queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_iterationCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1e6
        });
        this._floorCount = floorCount;
        this._queue = {
            [Direction.DOWN]: new Set(),
            [Direction.UP]: new Set(),
        };
    }
    get currentFloor() {
        return this._currentFloor;
    }
    get direction() {
        return this._direction;
    }
    get needToStop() {
        return this._queue[this._direction].has(this._currentFloor);
    }
    get needToChangeDirection() {
        const queueUp = this._queue[Direction.UP];
        const queueDown = this._queue[Direction.DOWN];
        if (this._direction === Direction.UP) {
            if (queueUp.size && this._currentFloor <= Math.max(...queueUp.keys())) {
                return false;
            }
            if (queueDown.size && this._currentFloor < Math.max(...queueDown.keys())) {
                return false;
            }
            return true;
        }
        else {
            if (queueDown.size && this._currentFloor >= Math.min(...queueDown.keys())) {
                return false;
            }
            if (queueUp.size && this._currentFloor > Math.min(...queueUp.keys())) {
                return false;
            }
            return true;
        }
    }
    pressFloorButton(floor, direction) {
        this._queue[direction].add(floor);
    }
    pressLiftButton(floor, direction) {
        if (floor === this._currentFloor) {
            return;
        }
        this._queue[direction].add(floor);
    }
    changeDirection() {
        this._direction *= -1;
        this.clearQueue();
    }
    next() {
        while (true) {
            if (--this._iterationCount <= 0) {
                this.error();
            }
            if (!this._queue[Direction.DOWN].size && !this._queue[Direction.UP].size) {
                if (this._currentFloor > this._firstFloorNumber) {
                    this._queue[Direction.DOWN].add(this._firstFloorNumber);
                    this._direction = Direction.DOWN;
                }
                else {
                    return false;
                }
            }
            if (this._direction === Direction.UP) {
                if (this._currentFloor >= (this._floorCount - this._firstFloorNumber)) {
                    this.error();
                }
                this._currentFloor++;
            }
            else {
                if (this._currentFloor <= this._firstFloorNumber) {
                    this.error();
                }
                this._currentFloor--;
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
        this._queue[this._direction].delete(this._currentFloor);
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
//# sourceMappingURL=lift.js.map