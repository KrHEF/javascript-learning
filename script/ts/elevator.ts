namespace ElevatorSaga {
    export interface IObject {
        init: (elevators: IElevator[], floors: IFloor[]) => void;
        update: (dt: number, elevators: IElevator[], floors: IFloor[]) => void;
    }

    export interface IElevator {

        /**
         * Gets the floor number that the elevator currently is on.
         */
        currentFloor: () => number;

        /**
         * Gets the maximum number of passengers that can occupy the elevator at the same time.
         */
        maxPassengerCount: () => number;

        /**
         * Gets the load factor of the elevator.
         * `0` means empty, `1` means full.
         *
         * Varies with passenger weights, which vary - not an exact measure.
         */
        loadFactor: () => number;

        /**
         * Gets the direction the elevator is currently going to move toward.
         * @returns {TDestDirection} Can be `'up'`, `'down'` or `'stopped'`.
         */
        destinationDirection: () => TDestDirection;

        /**
         * The current destination queue, meaning the floor numbers the elevator is scheduled to go to.
         *
         * Can be modified and emptied if desired.
         * Note that you need to call `checkDestinationQueue()` for the change to take effect immediately.
         */
        destinationQueue: number[];

        /**
         * Queue the elevator to go to specified floor number.
         * @param {number} floorNum Add floor number in the queue
         */
        goToFloor(floorNum: number): void;
        /**
         * Queue the elevator to go to specified floor number.
         *
         * If you specify true as second argument, the elevator will go to that floor directly, and then go to any other queued floors.
         * @param {number} floorNum Add floor number in the queue
         * @param {boolean} forceNow If true the elevator will go to that floor directly
         */
        goToFloor(floorNum: number, forceNow: boolean): void;

        /**
         * Clear the destination queue and stop the elevator if it is moving.
         *
         * Note that you normally don't need to stop elevators - it is intended for advanced solutions
         * with in-transit rescheduling logic.
         *
         * Also, note that the elevator will probably not stop at a floor, so passengers will not get out.
         */
        stop(): void;

        /**
         * Gets the going up indicator.
         *
         * Note that this indicator will affect passenger behaviour when stopping at floors.
         * @return {boolean} If true the indicator is on.
         */
        goingUpIndicator(): boolean;

        /**
         * Sets the going up indicator.
         *
         * Note that this indicator will affect passenger behaviour when stopping at floors.
         * @param {boolean} value Turn the indicator on or off
         */
        goingUpIndicator(value: boolean): this;

        /**
         * Gets the going down indicator.
         *
         * Note that this indicator will affect passenger behaviour when stopping at floors.
         * @return {boolean} If true the indicator is on.
         */
        goingDownIndicator(): boolean;

         /**
          * Sets the going down indicator.
          *
          * Note that this indicator will affect passenger behaviour when stopping at floors.
          * @param {boolean} value Turn the indicator on or off
          */
        goingDownIndicator(value: boolean): this;

        /**
         * Checks the destination queue for any new destinations to go to.
         *
         * Note that you only need to call this if you modify the destination queue explicitly.
         */
        checkDestinationQueue(): void;

        /**
         * Gets the currently pressed floor numbers as an array.
         */
        getPressedFloors(): number[];

        /**
         * Triggered when the elevator has completed all its tasks and is not doing anything.
         */
        on(event: 'idle', func: () => void): this;
        /**
         * Triggered when a passenger has pressed a button inside the elevator.
         */
        on(event: 'floor_button_pressed', func: (floorNum: number) => void): this;
        /**
         * Triggered slightly before the elevator will pass a floor.
         * A good time to decide whether to stop at that floor.
         *
         * Note that this event is not triggered for the destination floor. Direction is either "up" or "down".
         */
        on(event: 'passing_floor', func: (floorNum: number, direction: TDirection) => void): this;

        /**
         * Triggered when the elevator has arrived at a floor.
         */
        on(event: 'stopped_at_floor', func: (floorNum: number) => void): this;
        // on(event: IElevator, func: Function): void;

        /**
         * Subscribes to custom events
         */
        on(event: string, func: Function): this;

        /**
         * Unsubscribes from the event
         */
        off(event: TElevatorEvent | string): this;

        /**
         * Removes func from subscribers for the event
         * @param event Custom or Elevator event
         * @param func Link to function
         */
        off(event: TElevatorEvent | string, func: Function): this;

        /**
         * Triggers the event
         * @param event Custom or Elevator event
         */
        trigger(event: TElevatorEvent | string): this;

    }

    export interface IFloor {
        /**
         * Gets the floor number of the floor object.
         */
        floorNum: () => number;

        /**
         * Triggered when someone has pressed the up or down button at a floor.
         *
         * Note that passengers will press the button again if they fail to enter an elevator.
         */
        on(event: TFloorEvent, func: () => void): void;

        /**
         * Subscribes to custom events
         */
        on(event: string, func: Function): this;

        /**
         * Unsubscribes from the event
         */
        off(event: TFloorEvent | string): this;

        /**
         * Removes func from subscribers for the event
         * @param event Custom or Floor event
         * @param func Link to function
         */
        off(event: TFloorEvent | string, func: Function): this;

        /**
         * Triggers the event
         * @param event Custom or Floor event
         */
        trigger(event: TFloorEvent | string): this;
    }

    export type TElevatorEvent = 'idle' | 'floor_button_pressed' | 'passing_floor' | 'stopped_at_floor';

    export type TFloorEvent = 'up_button_pressed' | 'down_button_pressed';

    export type TDirection = 'up' | 'down';

    export type TDestDirection = TDirection | 'stopped';

}

interface IElevatorSetting {
    goToGroundFloorIfIdle: boolean,
}

(function(): ElevatorSaga.IObject {

    type TIdleFunction = () => void;

    const settings: IElevatorSetting = {
        goToGroundFloorIfIdle: false,
    }

    enum ElevatorStatus { stop, move, idle }
    enum Direction { up = 1, down = -1 }

    class Queue<T> {

        protected _queue: T[] = [];

        public get size(): number {
            return this._queue.length;
        }

        public get values(): T[] {
            return [...this._queue];
        }

        public lpush(values: T | T[]): this {
            const _values: T[] = (Array.isArray(values)) ? values : [values];

            _values.forEach((val: T) => {
                if (!this.has(val)) {
                    this._queue.unshift(val);
                }
            });

            return this;
        }

        public rpush(values: T | T[]): this {
            const _values: T[] = (Array.isArray(values)) ? values : [values];

            _values.forEach((val: T) => {
                if (!this.has(val)) {
                    this._queue.push(val);
                }
            });

            return this;
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

        public sort(compareFunc: (a: T, b: T) => number): this {
            this._queue.sort(compareFunc);

            return this;
        }

    }

    class Queues<T> {

        protected _queues: Record<Direction, Queue<T>> = {
            [Direction.down]: new Queue(),
            [Direction.up]: new Queue(),
        };

        public get(direction: Direction): Queue<T> {
            return this._queues[direction];
        }

    }

    class StatisticService {

    }
    class LogService {

        protected static _logService: LogService = new LogService();

        protected _log: string[] = [];

        protected constructor() { }

        public static get log(): string[] {
            return this._logService._log;
            // return [...this._logService._log];
        }

        public static add(value: string) {
            this._logService._log.push(value);
        }
    }

    class Elevator {

        protected readonly _index: number;
        protected _currentFloor: number;
        protected _direction: Direction = 0;

        protected _status: ElevatorStatus = ElevatorStatus.idle;
        protected _queue: Queue<number> = new Queue();
        protected _queueOpposite: Queue<number> = new Queue();
        // protected _loadFactor: number = 0;
        protected _floorsCount: number = 0;

        protected _elevator: ElevatorSaga.IElevator;

        private _oldFloorNumber: number = 0;

        constructor(
            index: number,
            elevator: ElevatorSaga.IElevator
        ) {
            this._index = index;
            this._elevator = elevator;
            this._elevator.goingUpIndicator(false);
            this._elevator.goingDownIndicator(false);
            this._currentFloor = elevator.currentFloor();
            // this._loadFactor = elevator.loadFactor();
            // this.setDirection(Direction.up);

            this.init();
        }

        protected get _loadFactor(): number {
            return this._elevator.loadFactor();
        }

        protected alongTheWay(floorNum: number): boolean {
            return (this._direction * (floorNum - this._currentFloor) > 0);
        }

        public canQueue(floorNum: number, direction: Direction): boolean {
            return  (this._status !== ElevatorStatus.idle)
                && (this._direction === direction)
                && this.alongTheWay(floorNum);
        }

        public addQueue(floorNum: number): void {
            if (!this._direction) {
                this.setDirection((floorNum < this._currentFloor) ? Direction.down : Direction.up);
            }

            if (!this._queue.size || this.alongTheWay) {
                this._queue.rpush(this._direction * floorNum).sort((a: number, b: number) => a - b);
                this.setQueue();
            } else {
                this._queueOpposite.rpush(-1 * this._direction * floorNum).sort((a: number, b: number) => a - b);
            }
        }

        public onIdle(func: TIdleFunction): void {
            this._elevator.on('custom_idle', func);
        }

        protected init(): void {
            this._elevator
                .on('idle', this.idle.bind(this))
                .on('stopped_at_floor', this.stoppedAtFloor.bind(this))
                .on('floor_button_pressed', this.floorButtonPressed.bind(this))
                .on('passing_floor', (floorNum: number, direction: ElevatorSaga.TDirection) => {
                    this.passingFloor(floorNum, Direction[direction]);
                });
        }

        protected setQueue() {
            const oldQueue: number[] = this._elevator.destinationQueue;
            const newQueue: number[] = this._queue.values.map((floorNum: number) => Math.abs(floorNum));

            LogService.add(`#${this._index} elevator changed queue from [${oldQueue}] to [${newQueue}]`);

            this._elevator.destinationQueue = newQueue;
            this._elevator.checkDestinationQueue();
        }

        protected setStatus(status: ElevatorStatus): void {
            LogService.add(`#${this._index} elevator changed status on '${ElevatorStatus[status]}'.`);

            this._status = status;

            if (status === ElevatorStatus.idle) {
                this._elevator.goingUpIndicator(true);
                this._elevator.goingDownIndicator(true);
            }
        }

        protected setDirection(value: Direction): void {
            if (this._direction === value) { return; }

            LogService.add(`#${this._index} elevator set direction on '${Direction[value]}'.`);

            this._direction = value;

            switch (value) {
                case Direction.up:
                    this._elevator.goingUpIndicator(true);
                    this._elevator.goingDownIndicator(false);
                    break;
                case Direction.down:
                    this._elevator.goingDownIndicator(true);
                    this._elevator.goingUpIndicator(false);
                    break;
            }
        }

        protected changeDirection(): void {
            this.setDirection(this._direction * -1);
        }

        protected idle(): void {
            if (this._queueOpposite.size) {
                this.changeDirection();

                const newQueue: number[] = this._queueOpposite.values.filter((floorNum: number) => {
                    return true;
                });

                newQueue.forEach((floorNum: number) => {
                    this._queue.rpush(floorNum);
                    this._queueOpposite.delete(floorNum);
                });
            } else if (settings.goToGroundFloorIfIdle) {
                this.setDirection(Direction.down);
                this._queue.rpush([-this._currentFloor, 0]);
                this.setQueue();
            } else {
                this.setStatus(ElevatorStatus.idle);
                this._elevator.trigger('custom_idle');
            }
        }

        protected stoppedAtFloor(floorNum: number): void {
            LogService.add(`#${this._index} elevator is stopped on #${floorNum} floor.`);

            this.setStatus(ElevatorStatus.stop);

            this._queue.lpop();

            this._floorsCount += Math.abs(this._oldFloorNumber - floorNum);
            this._oldFloorNumber = floorNum;
        }

        protected passingFloor(floorNum: number, direction: Direction): void {
            this._currentFloor = floorNum;
        }

        protected floorButtonPressed(floorNum: number): void {
            LogService.add(`Button #${floorNum} is pressed in #${this._index} elevator.`);

            this.addQueue(floorNum);
        }

    }

    class ElevatorsController {

        protected _singleMode: boolean;
        protected _elevators: Elevator[];
        protected _queues: Queue<number> = new Queue();

        constructor(elevators: ElevatorSaga.IElevator[]) {
            this._singleMode = (elevators.length === 1);
            this._elevators = elevators.map((elevator: ElevatorSaga.IElevator, index: number) => {
                return new Elevator(index, elevator);
            });
            this.init();
        }

        public queue(floorNum: number, direction: Direction): void {
            const elevator: Elevator = this.chooseElevator(floorNum, direction);

            if (!elevator) {
                this._queues.rpush(direction * floorNum);
            } else {
                elevator.addQueue(floorNum);
            }
        }

        protected init(): void {
            this._elevators.forEach((elevator: Elevator) => {
                elevator.onIdle(() => {
                    this.onElevatorIdle(elevator);
                });

            });
        }

        protected chooseElevator(floorNum: number, direction: Direction): Elevator | null {
            if (this._singleMode) {
                const elevator: Elevator = this._elevators[0];
                return elevator.canQueue(floorNum, direction) ? elevator : null;
            }

            return null;
        }

        protected onElevatorIdle(elevator: Elevator): void {
            if (!this._queues.size) { return; }
        }
    }

    let time: number = 0,
        status: ElevatorSaga.TDestDirection,
        oldStatus: ElevatorSaga.TDestDirection;

    const indicators: Record<string, number[]> = {
        timeMovingUpPerOneFloor: [],
        timeMovingDownPerOneFloor: [],
        timeOnFloorWhenMovingUp: [],
        timeOnFloorWhenMovingDown: [],
        timeOnFloorWhenChangeDirectionUp2Down: [],
        timeOnFloorWhenChangeDirectionDown2Up: [],
    }
    console.log('indicators', indicators);

    let controller: ElevatorsController;


    return {
        init: (elevators: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            controller = new ElevatorsController(elevators);
            oldStatus = status = 'stopped';

            console.log(controller);
            console.log('floors', floors);
            console.log('Log', LogService.log);

            floors.forEach((floor) => {
                floor.on('up_button_pressed', () => {
                    LogService.add(`Button UP is pressed on ${floor.floorNum()} floor.`);
                    controller.queue(floor.floorNum(), Direction.up);
                });

                floor.on('down_button_pressed', () => {
                    LogService.add(`Button DOWN is pressed on ${floor.floorNum()} floor.`);
                    controller.queue(floor.floorNum(), Direction.down);
                });
            });

        },
        update: (dt: number, elevators: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            const elevator: ElevatorSaga.IElevator = elevators[0],
                newStatus: ElevatorSaga.TDestDirection = elevator.destinationDirection();

            if (status === newStatus) {
                time += dt;
                return;
            }

            if (newStatus === 'stopped') {
                if (status === 'up') {
                    indicators.timeMovingUpPerOneFloor.push(time);
                } else if (status === 'down') {
                    indicators.timeMovingDownPerOneFloor.push(time);
                }
            } else if (newStatus === 'up') {
                if (oldStatus === 'up') {
                    indicators.timeOnFloorWhenMovingUp.push(time);
                } else if (oldStatus === 'down') {
                    indicators.timeOnFloorWhenChangeDirectionDown2Up.push(time);
                }
            } else if (newStatus === 'down') {
                if (oldStatus === 'down') {
                    indicators.timeOnFloorWhenMovingDown.push(time);
                } else if (oldStatus === 'up') {
                    indicators.timeOnFloorWhenChangeDirectionUp2Down.push(time);
                }
            }

            time = 0;
            oldStatus = status;
            status = newStatus;
        }
    }
})();
