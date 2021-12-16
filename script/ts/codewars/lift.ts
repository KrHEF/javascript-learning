type TDirection = 'up' | 'down';

enum Direction {UP = 1, DOWN = -1}

type TLiftOnTheFloor = Pick<Lift,
    'direction'
    | 'freeSpace'
    | 'letInPersons'
    | 'letOutPersons'
    | 'selectDirection'
    | 'clearQueue'
    | 'changeDirection'
    | 'wait'
    >;

class Person {

    constructor(
        public readonly floor: number,
        public readonly goTo: number,
    ) {
        if (floor === goTo) {
            throw new Error('This person go to hell');
        }
    }

    public get direction(): TDirection {
        return (this.goTo > this.floor) ? 'up' : 'down';
    }
}

class Floor {
    public readonly number: number;

    private _queueUp: Person[] = [];
    private _queueDown: Person[] = [];

    constructor(number: number) {
        this.number = number;
    }

    public get isUpPressed(): boolean {
        return this._queueUp.length > 0;
    }

    public get isDownPressed(): boolean {
        return this._queueDown.length > 0;
    }

    public get isPressed(): boolean {
        return this.isUpPressed || this.isDownPressed;
    }

    public addPerson(person: Person): void {
        if (person.goTo === this.number) { return this.goToHell(person); }

        if (person.goTo > this.number) {
            this._queueUp.push(person);
        } else {
            this._queueDown.push(person);
        }
    }

    public setLiftOnTheFloor(lift: TLiftOnTheFloor): void {
        if (this.isPressed) {

        } else {
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
        } else {
            if (this._queueDown.length) {
                lift.letInPersons(this._queueDown.splice(0, lift.freeSpace));
            }

            lift.clearQueue('down');
            if (this._queueDown.length) {
                lift.wait(this.number, 'down');
            }
        }
    }

    private goToHell(person: Person): void {
        return;
    };

}

class Lift implements TLiftOnTheFloor {

    private readonly _capacity: number;
    private _currentFloor: number = 0;
    private _log: number[] = [];
    private _direction: TDirection = 'up';
    private _persons: Set<Person> = new Set();
    private _personsGoTo: Map<number, Person[]> = new Map();

    private _queueUp: Set<number> = new Set();
    private _queueDown: Set<number>  = new Set();

    private _iterationCount = 1e6;

    constructor(capacity: number) {
        this._capacity = capacity;
    }

    public get direction(): TDirection {
        return this._direction;
    }

    public get freeSpace(): number {
        return this._capacity - this._persons.size;
    }

    public get currentFloor(): number {
        return this._currentFloor;
    }

    public get log(): number[] {
        return [...this._log];
    }

    public get needToStop(): boolean {
        if (this._personsGoTo.has(this._currentFloor)) { return true; }

        if (this.direction === 'up') {
            return this._queueUp.has(this._currentFloor)
            || (this.needToChangeDirection && this._queueDown.has(this._currentFloor));
        } else {
            return this._queueDown.has(this._currentFloor)
            || (this.needToChangeDirection && this._queueUp.has(this._currentFloor));
        }

    }

    private get needToChangeDirection(): boolean {
        if (!this._queueDown.size && !this._queueUp.size && !this._persons.size) {
            return (this._direction === 'up');
        }

        if (this._direction === 'up') {
            if (this._queueUp.size && this._currentFloor <= Math.max(...this._queueUp.keys())) { return false; }

            if (this._queueDown.size && this._currentFloor < Math.max(...this._queueDown.keys())) { return false; }

            if (this._currentFloor < Math.max(...this._personsGoTo.keys())) { return false; }

            return true;
        } else {
            if (this._queueDown.size && this._currentFloor >= Math.min(...this._queueDown.keys())) { return false; }

            if (this._queueUp.size && this._currentFloor > Math.min(...this._queueUp.keys())) { return false; }

            if (this._currentFloor > Math.min(...this._personsGoTo.keys())) { return false; }

            return true;
        }
    }


    public next(): boolean {
        if (--this._iterationCount <= 0) {
            throw new Error('The lift is broken');
        }

        if (!this._queueDown.size && !this._queueUp.size && !this._persons.size && !this._currentFloor) {
            this._log.push(0);
            return false;
        }

        if (this.direction === 'up') {
            this._currentFloor++;
        } else {
            this._currentFloor--;
        }

        return true;
    }

    public open(): void {
        this._log.push(this._currentFloor);

        this.clearQueue();
        this.letOutPersons();
    }

    public clearQueue(): void {
        if (this.direction === 'up') {
            this._queueUp.delete(this._currentFloor);
        } else {
            this._queueDown.delete(this._currentFloor);
        }
    }

    public wait(floor: number, direction: TDirection): void {
        if (direction === 'up') {
            this._queueUp.add(floor);
        } else {
            this._queueDown.add(floor);
        }
    }

    public letInPersons(persons: Person[]): void {
        persons.forEach((person: Person) => {
            this._persons.add(person);
            if (!this._personsGoTo.has(person.goTo)) {
                this._personsGoTo.set(person.goTo, []);
            }
            this._personsGoTo.get(person.goTo)!.push(person);

            // this.wait(person.goTo, person.direction);
        });
    }

    public letOutPersons(): Person[] {
        const result: Person[] = this._personsGoTo.get(this._currentFloor) || [];

        this._personsGoTo.delete(this._currentFloor);
        result.forEach((person: Person) => this._persons.delete(person));

        return result;
    }

    public selectDirection(): void {
        if (this.needToChangeDirection) {
            this._direction = (this._direction === 'up') ? 'down' : 'up';
        }
    }

    public changeDirection(): boolean {
        return false;
    }

}

class Building {
    private _floors: Floor[];
    private _lift: Lift;

    constructor(floorCount: number, liftCapacity: number) {
        this._floors = (new Array(floorCount)).fill(0).map((nothing: unknown, index: number) => new Floor(index));
        this._lift = new Lift(liftCapacity);
    }

    public get liftLog(): number[] {
        return this._lift.log;
    }

    public init(queues: number[][]): void {
        queues.forEach((queue: number[], floorNumber: number) => {
            const floor: Floor = this._floors[floorNumber];

            queue.forEach((goTo: number) => {
                const person: Person = new Person(floorNumber, goTo);
                floor.addPerson(person);

                this._lift.wait(person.floor, person.direction);
            });
        });
    }

    public calc(): void {
        this.openLiftOnTheFloor();
        while (this._lift.next()) {
            if (this._lift.needToStop) {
                this.openLiftOnTheFloor();
            }
        }
    }

    private openLiftOnTheFloor(): void {
        this._lift.open();
        this._floors[this._lift.currentFloor].setLiftOnTheFloor(this._lift);
    }
}


const theLift = (queues: number[][], capacity: number): number[] => {
    const building: Building = new Building(queues.length, capacity);

    building.init(queues);
    try {
        building.calc();
    } finally {
        console.log(building);
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
