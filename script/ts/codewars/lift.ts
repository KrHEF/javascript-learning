enum Direction {UP = 1, DOWN = -1}

type TPressButtonFunc = (floor: number, direction: Direction) => void;

class Person {

    constructor(
        public readonly floor: number,
        public readonly goTo: number,
    ) {
        if (floor === goTo) {
            throw new Error('This person go to hell');
        }
    }

    public get direction(): Direction {
        return (this.goTo > this.floor) ? Direction.UP : Direction.DOWN;
    }
}

class Floor {
    public readonly number: number;

    protected readonly _queue: Record<Direction, Person[]>;

    protected _pressButton: TPressButtonFunc;

    constructor(number: number, pressFloorButton: TPressButtonFunc) {
        this.number = number;
        this._pressButton = pressFloorButton;
        this._queue = {
            [Direction.DOWN]: [],
            [Direction.UP]: [],
        };
    }

    public addPerson(person: Person): void {
        if (person.goTo === this.number) { return; }

        if (this._queue[person.direction].includes(person)) { return; }
        this._queue[person.direction].push(person);

        this._pressButton(person.floor, person.direction);
    }

    public openDoors(): boolean {
        return true;
    }

    public closeDoors(): boolean {
        return true;
    }

    public letIn(direction: Direction, freeSpace: number): Person[] {
        const personsToLift: Person[] = this._queue[direction].splice(0, freeSpace);

        this._queue[direction].some((person: Person) => {
            this._pressButton(person.floor, person.direction);
            return true;
        });

        return personsToLift;
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
            this._personsGoTo.get(person.goTo).push(person);

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
                floor.addPerson(person);
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

    protected readonly _floorCount: number;

    protected _firstFloorNumber: number = 0;
    protected _currentFloor: number = 0;
    protected _direction: Direction = Direction.UP;
    protected _queue: Record<Direction, Set<number>>;

    private _iterationCount = 1e6;

    constructor(floorCount: number) {
        this._floorCount = floorCount;
        this._queue = {
            [Direction.DOWN]: new Set(),
            [Direction.UP]: new Set(),
        };
    }

    public get currentFloor(): number {
        return this._currentFloor;
    }

    public get direction(): number {
        return this._direction;
    }

    public get needToStop(): boolean {
        return this._queue[this._direction].has(this._currentFloor);
    }

    public get needToChangeDirection(): boolean {
        const queueUp: Set<number> = this._queue[Direction.UP];
        const queueDown: Set<number> = this._queue[Direction.DOWN];

        if (this._direction === Direction.UP) {
            if (queueUp.size && this._currentFloor <= Math.max(...queueUp.keys())) { return false; }

            if (queueDown.size && this._currentFloor < Math.max(...queueDown.keys())) { return false; }

            return true;
        } else {
            if (queueDown.size && this._currentFloor >= Math.min(...queueDown.keys())) { return false; }

            if (queueUp.size && this._currentFloor > Math.min(...queueUp.keys())) { return false; }

            return true;
        }
    }

    public pressFloorButton(floor: number, direction: Direction): void {
        this._queue[direction].add(floor);
    }

    public pressLiftButton(floor: number, direction: Direction): void {
        if (floor === this._currentFloor) { return; }

        this._queue[direction].add(floor);
    }

    public changeDirection(): void {
        this._direction *= -1;
        this.clearQueue();
    }

    public next(): boolean {
        while (true) {
            if (--this._iterationCount <= 0) {
                this.error();
            }

            // Go on the 1st floor
            if (!this._queue[Direction.DOWN].size && !this._queue[Direction.UP].size) {
                if (this._currentFloor > this._firstFloorNumber) {
                    this._queue[Direction.DOWN].add(this._firstFloorNumber);
                    this._direction = Direction.DOWN;
                } else {
                    return false;
                }
            }

            if (this._direction === Direction.UP) {
                if (this._currentFloor >= (this._floorCount - this._firstFloorNumber)) {
                    this.error();
                }
                this._currentFloor++;
            } else {    // Direction.DOWN
                if (this._currentFloor <= this._firstFloorNumber) {
                    this.error();
                }
                this._currentFloor--;
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
        this._queue[this._direction].delete(this._currentFloor);
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
