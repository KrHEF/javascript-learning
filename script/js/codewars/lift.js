"use strict";
class Person {
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
    constructor(number) {
        this._queueUp = [];
        this._queueDown = [];
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
        lift.letOutPersons();
        lift.selectDirection();
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
    constructor(capacity) {
        this._currentFloor = 0;
        this._log = [];
        this._direction = 'up';
        this._persons = new Set();
        this._personsGoTo = new Map();
        this._queueUp = new Set();
        this._queueDown = new Set();
        this._iterationCount = 1e6;
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
    }
    clearQueue(direction) {
        if (direction === 'up') {
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
}
class Building {
    constructor(floorCount, liftCapacity) {
        this._floors = (new Array(floorCount)).fill(0).map((nothing, index) => new Floor(index));
        this._lift = new Lift(liftCapacity);
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