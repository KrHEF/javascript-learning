enum Direction {UP = 1, DOWN = -1}

type TPressButtonFunc = (floor: number, direction: Direction) => void;

class Queue<T> {

    protected _queue: T[] = [];

    public get size(): number {
        return this._queue.length;
    }

    public get values(): T[] {
        return [...this._queue];
    }

    public lpush(value: T): void {
        if (!this.has(value)) {
            this._queue.unshift(value);
        }
    }

    public rpush(value: T): void {
        if (!this.has(value)) {
            this._queue.push(value);
        }
    }

    public lpop(): T | null;
    public lpop(count: number): T[];
    public lpop(count?: number): null | T | T[] {
        if (typeof(count) !== 'number') {
            return this._queue.shift() || null;
        }
        return this._queue.splice(0, count);
    }

    public rpop(): T | null;
    public rpop(count: number): T[];
    public rpop(count?: number): null | T | T[] {
        if (typeof(count) !== 'number') {
            return this._queue.pop() || null;
        }

        return this._queue.splice(-count).reverse();
    }

    public delete(value: T): boolean {
        const size: number = this.size;
        this._queue = this._queue.filter((val: T) => val !== value);

        return size !== this.size;
    }

    public has(value: T): boolean {
        return this._queue.includes(value);
    }

}

class Queues<T> {

    protected _queues: Record<Direction, Queue<T>> = {
        [Direction.DOWN]: new Queue(),
        [Direction.UP]: new Queue(),
    };

    public get(direction: Direction): Queue<T> {
        return this._queues[direction];
    }

}

class Person {

    constructor(
        public readonly floor: number,
        public readonly goTo: number,
    ) {}

    public get direction(): Direction | 0 {
        if (this.goTo === this.floor) { return 0; }

        return (this.goTo > this.floor) ? Direction.UP : Direction.DOWN;
    }
}

class Floor {

    public readonly number: number;

    protected readonly _queues: Queues<Person> = new Queues();
    protected _pressButton: TPressButtonFunc;

    constructor(number: number, pressFloorButton: TPressButtonFunc) {
        this.number = number;
        this._pressButton = pressFloorButton;
    }

    public addPerson(person: Person): void {
        this._queues.get(person.direction).rpush(person);
        this._pressButton(person.floor, person.direction);
    }

    public openDoors(): boolean {
        return true;
    }

    public closeDoors(): boolean {
        return true;
    }

    public letIn(direction: Direction, freeSpace: number): Person[] {
        const result: Person[] = this._queues.get(direction).lpop(freeSpace);

        if (this._queues.get(direction).size) {
            this._pressButton(this.number, direction);
        }

        return result;
    }

    public letOut(persons: Person[]): void {
        return;
    }

}

class Lift { //implements TLiftOnTheFloor {

    protected readonly _capacity: number;

    protected readonly _persons: Set<Person> = new Set();
    protected readonly _personsGoTo: Map<number, Person[]> = new Map();

    protected _pressLiftButton: TPressButtonFunc;

    constructor(capacity: number, pressLiftButton: TPressButtonFunc) {
        this._capacity = capacity;
        this._pressLiftButton = pressLiftButton;
    }

    protected get freeSpace(): number {
        return this._capacity - this._persons.size;
    }

    public openDoors(): boolean {
        return true;
    }

    public closeDoors(): boolean {
        return true;
    }

    public actionWithFloor(floor: Floor, direction: Direction): void {
        floor.letOut(this.letOut(floor.number));
        this.letIn(floor.letIn(direction, this.freeSpace));
    }

    protected letIn(persons: Person[]): void {
        persons.forEach((person: Person) => {
            this._persons.add(person);

            if (!this._personsGoTo.has(person.goTo)) {
                this._personsGoTo.set(person.goTo, []);
            }
            this._personsGoTo.get(person.goTo)!.push(person);

            this._pressLiftButton(person.goTo, person.direction);
        });
    }

    protected letOut(floor: number): Person[] {
        const result: Person[] = this._personsGoTo.get(floor) || [];

        this._personsGoTo.delete(floor);
        result.forEach((person: Person) => this._persons.delete(person));

        return result;
    }
}

class Building {
    protected readonly _cpu: LiftController;

    protected readonly _floors: Floor[];
    protected readonly _lift: Lift;

    private _log: number[] = [];

    constructor(floorCount: number, liftCapacity: number) {
        this._cpu = new LiftController(floorCount);

        this._lift = new Lift(
            liftCapacity,
            (floor: number, direction: Direction) => {
                this._cpu.pressLiftButton(floor, direction);
            }
        );

        const floors: number[] = (new Array(floorCount)).fill(0).map((nothing: number, index: number) => index);
        this._floors = floors.map((index: number) => {
            return new Floor(
                index,
                (floor: number, direction: Direction) => {
                    this._cpu.pressFloorButton(floor, direction);
                });
            }
        );
    }

    public get liftLog(): number[] {
        return [...this._log];
    }

    public init(queues: number[][]): void {
        queues.forEach((queue: number[], floorNumber: number) => {
            const floor: Floor = this._floors[floorNumber];

            queue.forEach((goTo: number) => {
                const person: Person = new Person(floorNumber, goTo);
                if (person.direction) {
                    floor.addPerson(person);
                }
            });
        });
    }

    public calc(): void {
        this.openLiftOnTheFloor();
        while (this._cpu.next()) {
            this.openLiftOnTheFloor();
        }
    }

    private openLiftOnTheFloor(): void {
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

    protected readonly _firstFloorNumber: number = 0;
    protected readonly _floorCount: number;

    protected _currentFloor: number = 0;
    protected _direction: Direction = Direction.UP;
    protected _queues: Queues<number> = new Queues();

    private _iterationCount = 1e6;

    constructor(floorCount: number) {
        this._floorCount = floorCount;
    }

    public get currentFloor(): number {
        return this._currentFloor;
    }

    public get direction(): number {
        return this._direction;
    }

    public get needToStop(): boolean {
        return this._queue.has(this._currentFloor);
    }

    public get needToChangeDirection(): boolean {
        if (this._direction === Direction.UP) {
            if (this._queueUp.size && this._currentFloor <= Math.max(...this._queueUp.values)) { return false; }
            if (this._queueDown.size && this._currentFloor < Math.max(...this._queueDown.values)) { return false; }
        } else {
            if (this._queueDown.size && this._currentFloor >= Math.min(...this._queueDown.values)) { return false; }
            if (this._queueUp.size && this._currentFloor > Math.min(...this._queueUp.values)) { return false; }
        }

        return true;
    }

    protected get _queue(): Queue<number> {
        return this._queues.get(this._direction);
    }

    protected get _queueUp(): Queue<number> {
        return this._queues.get(Direction.UP);
    }

    protected get _queueDown(): Queue<number> {
        return this._queues.get(Direction.DOWN);
    }


    public pressFloorButton(floor: number, direction: Direction): void {
        this._queues.get(direction).rpush(floor);
    }

    public pressLiftButton(floor: number, direction: Direction): void {
        if (floor === this._currentFloor) { return; }

        this._queues.get(direction).rpush(floor);
    }

    public changeDirection(): void {
        this._direction *= -1;
        this.clearQueue();
    }

    public next(): boolean {
        while (true) {
            // Go on the 1st floor
            if (!this._queueDown.size && !this._queueUp.size) {
                if (this._currentFloor > this._firstFloorNumber) {
                    this._direction = Direction.DOWN;
                    this._queue.rpush(this._firstFloorNumber);
                } else {
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
            } else if (this.needToChangeDirection) {
                this.changeDirection();
                this.clearQueue();
                return true;
            }
        }
    }

    public error(): never {
        throw new Error('The lift is broken');
    }

    protected clearQueue(): void {
        this._queue.delete(this._currentFloor);
    }

}

const theLift = (queues: number[][], capacity: number): number[] => {
    const building: Building = new Building(queues.length, capacity);

    building.init(queues);
    try {
        building.calc();
    } catch (error) {
        console.log(building);
        throw error;
    }

    return building.liftLog;
}

const it = (name: string, test: () => boolean): void => {
    console.log(`"${name}" => `, test());
};

it("up", function () {
    var queues = [
        [], // G
        [], // 1
        [5, 5, 5], // 2
        [], // 3
        [], // 4
        [], // 5
        [], // 6
    ];

    var result: number[] = theLift(queues, 5);
    console.log(result, [0, 2, 5, 0]);
    return result.join('') === [0, 2, 5, 0].join('');
});

it("down", function() {
    var queues = [
      [], // G
      [], // 1
      [1,1], // 2
      [], // 3
      [], // 4
      [], // 5
      [], // 6
    ];

    var result: number[] = theLift(queues, 5);
    console.log(result, [0,2,1,0]);
    return result.join('') === [0,2,1,0].join('');
});

it("up and up", function() {
var queues = [
    [], // G
    [3], // 1
    [4], // 2
    [], // 3
    [5], // 4
    [], // 5
    [], // 6
];
var result: number[] = theLift(queues, 5);
console.log(result, [0,1,2,3,4,5,0]);
return result.join('') === [0,1,2,3,4,5,0].join('');
});

it("down and down", function() {
var queues = [
    [], // G
    [0], // 1
    [], // 2
    [], // 3
    [2], // 4
    [3], // 5
    [], // 6
];
var result: number[] = theLift(queues, 5);
console.log(result, [0,5,4,3,2,1,0]);
return result.join('') === [0,5,4,3,2,1,0].join('');
});
