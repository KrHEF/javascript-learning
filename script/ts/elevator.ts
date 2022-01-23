namespace ElevatorSaga {
    export interface IReturnObject {
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

        /**
         * Unsubscribes from the event
         */
        off(event: TElevatorEvent | TElevatorCustomEvent): this;

        /**
         * Removes func from subscribers for the event
         * @param event Custom or Elevator event
         * @param func Link to function
         */
        off(event: TElevatorEvent | TElevatorCustomEvent, func: Function): this;

        /**
         * Triggers the event `idle`
         */
        trigger(event: 'idle'): this;
        /**
         * Triggers the event `floor_button_pressed` or `stopped_at_floor`
         */
        trigger(event: 'floor_button_pressed' | 'stopped_at_floor', floorNum: number): this;
        /**
         * Triggers the event `passing_floor`
         */
        trigger(event: 'passing_floor', floorNum: number, direction: TDirection): this;

        /* Custom events */

        on(event: 'ctm_update', func: (deltaTimer: number) => void): this;

        trigger(event: 'ctm_update', deltaTimer: number): this;

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
        on(event: TFloorEvent, func: () => void): this;

        /**
         * Unsubscribes from the event
         */
        off(event: TFloorEvent): this;

        /**
         * Triggers the event
         * @param event Custom or Floor event
         */
        trigger(event: TFloorEvent): this;
    }

    export type TElevatorEvent = 'idle' | 'floor_button_pressed' | 'passing_floor' | 'stopped_at_floor';

    export type TElevatorCustomEvent = 'ctm_update_stat';

    export type TFloorEvent = 'up_button_pressed' | 'down_button_pressed';

    export type TDirection = 'up' | 'down';

    export type TDestDirection = TDirection | 'stopped';

    export type TExDestDirection = TDestDirection | 'idle';

}

(function(): ElevatorSaga.IReturnObject {

    interface ISetting {
        elevator: IElevatorSetting;
        statistics: IStatisticsSetting;
        logs: ILogSetting;
    }
    interface IElevatorSetting {
        goToGroundFloorIfIdle: boolean;
        maxLoadFactorForExtraStop: number;
    }

    interface IStatisticsSetting {
        depth: number;
    }

    interface ILogSetting {
        showLogInConsole: boolean;
    }

    let timer: number = 0;
    const settings: ISetting = {
        elevator: {
            goToGroundFloorIfIdle: false,
            maxLoadFactorForExtraStop: 0.7,
        },
        statistics: {
            depth: 50,
        },
        logs: {
            showLogInConsole: false,
        }
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

        public clear(): this {
            this._queue.length = 0;

            return this;
        }

        public has(value: T): boolean {
            return this._queue.includes(value);
        }

        public sort(compareFunc: (a: T, b: T) => number): this {
            this._queue.sort(compareFunc);

            return this;
        }

    }

    class StaticsticsObject {

        protected _length: number;
        protected _values: number[] = [];
        protected _full: boolean = false;

        constructor() {
            this._length = settings.statistics.depth;
        }

        public push(statisticsValue: number): void {
            if (this._full) {
                this._values.shift();
                this._values.push(statisticsValue);
            } else {
                this._values.push(statisticsValue);
                this._full = (this._length === this._values.length);
            }
        }

        public avg(): number {
            if (!this._values.length) { return 0; }

            return this._values.reduce((sum: number, value: number) => sum + value) / this._values.length;
        }
    }

    class ElevatorStatistics {
        protected _speed: Record<Direction, StaticsticsObject>;
        protected _timeOnFloorAlong: Record<Direction, StaticsticsObject>;
        protected _timeOnFloorReversal: Record<Direction, StaticsticsObject>;
        protected _timeOfIdle: StaticsticsObject = new StaticsticsObject();
        protected _floorsCount: number = 0;

        protected _status: ElevatorStatus = ElevatorStatus.idle;
        protected _floorNum: number = 0;
        protected _direction: Direction = Direction.up;

        protected _timer: number = 0;

        constructor() {
            this._speed = this.initStatistics();
            this._timeOnFloorAlong = this.initStatistics();
            this._timeOnFloorReversal = this.initStatistics();
        }

        public getSpeed(direction: Direction): number {
            return this._speed[direction].avg();
        }

        public getTimeOnFloorAlong(direction: Direction): number {
            return this._timeOnFloorAlong[direction].avg();
        }

        public getTimeOnFloorReversal(direction: Direction): number {
            return this._timeOnFloorReversal[direction].avg();
        }

        public updateTimer(deltaTimer: number): void {
            this._timer += deltaTimer;
        }

        public changeFloor(floorNum: number, direction: Direction): void {
            LogService.add(`The elevator is moving ${Direction[direction]} and change floor to ${floorNum}`);

            this._floorsCount++;
        }

        public idleOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();

            this._timeOnFloorAlong[this._direction].push(timer);
            LogService.add(`The elevator was on the floor for ${timer.toFixed(3)}`);
            LogService.add(`The elevator started to idle at floor ${floorNum}`);

            this._status = ElevatorStatus.idle;
            this._floorNum = floorNum;
        }

        public stopOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();
            const delta: number = Math.abs(floorNum - this._floorNum);

            if (delta) {
                const speed: number = timer / delta;
                this._speed[this._direction].push(speed);
                LogService.add(`The elevator was moving with a speed ${speed.toFixed(3)} sec per floor`);
            }

            LogService.add(`The elevator stopped at floor ${floorNum}`);

            this._status = ElevatorStatus.stop;
            this._floorNum = floorNum;
        }

        public startMoving(floorNum: Direction, direction: Direction) {
            const timer: number = this.getTimer();

            if (this._status === ElevatorStatus.idle) {
                this._timeOfIdle.push(timer);
                LogService.add(`The elevator was idling for ${timer.toFixed(3)}`);
            } else {    // ElevatorStatus.stop
                if (direction !== this._direction) {
                    this._timeOnFloorReversal[direction].push(timer);
                    LogService.add(`The elevator was on the floor (with change direction) for ${timer.toFixed(3)}`);
                } else {
                    this._timeOnFloorAlong[direction].push(timer);
                    LogService.add(`The elevator was on the floor for ${timer.toFixed(3)}`);
                }
            }

            if (direction !== this._direction) {
                LogService.add(`The elevator changes direction and starts moving ${Direction[direction]}`);
            } else {
                LogService.add(`The elevator starts moving ${Direction[direction]}`);
            }

            this._status = ElevatorStatus.move;
            this._floorNum = floorNum;
            this._direction = direction;
        }

        public letIn(): void {
            LogService.add(`Some people was let in the elevator`);
        };

        public letOut(): void {
            LogService.add(`Some people was let out the elevator`);
        }

        protected initStatistics(): Record<Direction, StaticsticsObject> {
            return {
                [Direction.up]: new StaticsticsObject(),
                [Direction.down]: new StaticsticsObject(),
            };
        }

        protected getTimer(): number {
            const value: number = this._timer;
            this._timer = 0;
            return value
        }

    }
    class LogService {

        protected static _instance: LogService = new LogService();

        protected _log: string[] = [];

        protected constructor() {
            if (settings.logs.showLogInConsole) {
                console.log('log:', this);
            }
        }

        public static get log(): string[] {
            // return this._instance._log;
            return [...this._instance._log];
        }

        public static add(value: string) {
            this._instance._log.push(timer.toFixed(3) + ': ' + value);
            if (settings.logs.showLogInConsole) {
                console.log(timer.toFixed(3), value);
            }
        }
    }

    abstract class ElevatorAbstract {

        protected _stats: ElevatorStatistics = new ElevatorStatistics();

        private readonly __index: number;
        private readonly __elevator: ElevatorSaga.IElevator;

        private __status: ElevatorStatus = ElevatorStatus.idle;
        private __floorNum: number;
        private __loadFactor: number;
        private __lastDestDirection: ElevatorSaga.TDestDirection;
        private __direction: Direction = Direction.up;

        constructor(index: number, elevatorSaga: ElevatorSaga.IElevator) {
            this.__index = index;
            this.__elevator = elevatorSaga;

            this.__floorNum = this.__elevator.currentFloor();
            this.__loadFactor = this.__elevator.loadFactor();
            this.__lastDestDirection = this.__elevator.destinationDirection();

            this.setIndicators();
            this.elevatorInit();
        }

        public get index(): number {
            return this.__index;
        }

        public get status(): ElevatorStatus {
            return this.__status;
        }

        public get currentFloor(): number {
            return this.__floorNum;
        }

        public get loadFactor(): number {
            return this.__elevator.loadFactor();
        }

        public get direction(): Direction {
            return this.__direction;
        }

        public stopOnFloor(floorNum: number): void {
            this.__elevator.goToFloor(floorNum, true);
        }

        protected onLetIn(oldLoadFactor: number, newLoadFactor: number): void { }

        protected onLetOut(oldLoadFactor: number, newLoadFactor: number): void { }

        protected onIdle(floorNum: number): void { }

        protected onStop(floorNum: number): void { }

        protected onMove(direction: Direction): void { }

        protected onChangeFloor(floorNum: number): void { }

        protected onPressButton(floorNum: number): void { }


        protected setDirection(direction: Direction): void {
            this.__direction = direction;
            this.setIndicators();
        }

        protected setIndicators(): void {
            if (this.__status === ElevatorStatus.idle) {
                this.__elevator.goingUpIndicator(false);
                this.__elevator.goingDownIndicator(false);
            } else {
                this.__elevator.goingUpIndicator(this.__direction === Direction.up);
                this.__elevator.goingDownIndicator(this.__direction === Direction.down);
            }
        }

        protected setQueue(newQueue: number[]) {
            const oldQueue: number[] = this.__elevator.destinationQueue;

            LogService.add(`Elevator #${this.index}: changed queue from [${oldQueue}] to [${newQueue}]`);

            this.__elevator.destinationQueue = newQueue;
            this.__elevator.checkDestinationQueue();
        }

        private elevatorInit(): void {
            this.__elevator.on('ctm_update', this.updateState.bind(this))
            .on('stopped_at_floor', (floorNum: number) => {
                this.__status = ElevatorStatus.stop;
                this.updateState(0);
                this.onStop(floorNum);
                this._stats.stopOnFloor(floorNum);
            })
            .on('idle', () => {
                this.__status = ElevatorStatus.idle;
                this.updateState(0);
                this.onIdle(this.__floorNum);
                this._stats.idleOnFloor(this.__floorNum);
            })
            .on('floor_button_pressed', (floorNum: number) => {
                this.onPressButton(floorNum);
            });
        }

        private updateState(deltaTimer: number): void {
            this._stats.updateTimer(deltaTimer);

            const newDestDirection: ElevatorSaga.TDestDirection = this.__elevator.destinationDirection();
            if (newDestDirection === 'stopped') {
                if (this.__status === ElevatorStatus.idle) { return; }

                const newLoadFactor: number = this.__elevator.loadFactor();
                if (newLoadFactor > this.__loadFactor) {
                    this.onLetIn(this.__loadFactor, newLoadFactor);
                    this._stats.letIn();
                } else if (newLoadFactor < this.__loadFactor) {
                    this.onLetOut(this.__loadFactor, newLoadFactor);
                    this._stats.letOut();
                }
                this.__loadFactor = newLoadFactor;
            } else {
                const floorNum: number = this.__elevator.currentFloor();
                const direction: Direction = Direction[newDestDirection];

                if (this.__lastDestDirection === 'stopped') {
                    this.__status = ElevatorStatus.move;
                    this.onMove(direction);
                    this._stats.startMoving(floorNum, direction)
                }

                if (floorNum !== this.__floorNum) {
                    this.onChangeFloor(floorNum);
                    this._stats.changeFloor(floorNum, direction);
                }
                this.__floorNum = floorNum;
            }
            this.__lastDestDirection = newDestDirection;
        }
    }

    class Elevator extends ElevatorAbstract {

        protected _queue: Queue<number> = new Queue();
        protected _backQueue: Queue<number> = new Queue();
        protected _nextDirection: Direction | 0 = 0;

        public get isIdle(): boolean {
            return this.status === ElevatorStatus.idle;
        }

        public get isEmpty(): boolean {
            return !this.loadFactor;
        }

        public canQueue(floorNum: number, direction: Direction): boolean {
            return this.isIdle;
            // return this.isIdle || this.alongTheWay(floorNum, direction));
        }

        public addFloorQueue(floorNum: number, direction: Direction): void {
            if (this.status !== ElevatorStatus.idle) {
                throw new Error('The elevator is not idle');
            }

            if (floorNum === this.currentFloor) {
                this.setDirection(direction);
            } else {
                const newDirection: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;
                this.setDirection(newDirection);

                if (direction !== newDirection) {
                    this._nextDirection = direction;
                }
            }

            this._queue.rpush(floorNum);
            this.setQueue();
        }

        public deleteFloorQueue(floorNum: number, direction: Direction): void {
            if (this._queue.has(floorNum) && this.isEmpty) {
                this._queue.delete(floorNum);
                this.setQueue();
            }
        }

        protected addQueue(floorNum: number): void {
            const direction: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;

            if (this.alongTheWay(floorNum, direction)) {
                this._queue.rpush(floorNum);
                this.setQueue();
            } else {
                this._backQueue.rpush(floorNum);
            }
        }

        protected override setQueue(): void {
            this._queue.sort((a: number, b: number) => this.direction * (a - b));
            this.setIndicators();
            super.setQueue(this._queue.values);
        }

        protected changeDirection(): void {
            this.setDirection(this.direction * -1);
        }

        protected override onIdle(floorNum: number): void {
            this._queue.clear();
        }

        protected override onStop(floorNum: number): void {
            this._queue.delete(floorNum);

            if (!this.currentFloor) {
                this.setDirection(Direction.up);
            }

            if (!this._queue.size) {
                if (this._nextDirection) {
                    this.setDirection(this._nextDirection);
                    this._nextDirection = 0;
                    return;
                }

                if (this._backQueue.size) {
                    if (this.currentFloor) {
                        this.changeDirection();
                    }
                    this._queue = this._backQueue;
                    this._backQueue = new Queue();
                    this.setQueue();
                    return;
                }

                this.setIndicators();
            }
        }

        protected override onMove(direction: Direction): void {
            this.setIndicators();
        }

        protected override onPressButton(floorNum: number): void {
            LogService.add(`Elevator #${this.index}: button #${floorNum} is pressed.`);
            this.addQueue(floorNum);
        }

        protected alongTheWay(floorNum: number, direction: Direction): boolean {
            return (direction === this.direction) && (direction * (floorNum - this.currentFloor) > 0);
        }
    }

    class ElevatorsController {

        protected _singleMode: boolean;
        protected _elevators: Elevator[];
        /**
         * Floors in call order\
         * `< 0` - call down\
         * `>= 0` - call up\
         * Possible values: `[-max, -(max-1), ..., -1, 0, 1, ..., (max-1)]`
         */
        protected _queues: Queue<number> = new Queue();

        constructor(elevators: ElevatorSaga.IElevator[]) {
            this._singleMode = (elevators.length === 1);

            this._elevators = elevators.map((elevatorSaga: ElevatorSaga.IElevator, index: number) => {
                const elevator = new Elevator(index, elevatorSaga);

                elevatorSaga.on('idle', () => { this.onElevatorIdle(elevator); })
                .on('stopped_at_floor', () => { this.onElevatorStop(elevator); })
                .on('passing_floor', (floorNum: number) => { this.onElevatorPreStop(floorNum, elevator); });

                return elevator;
            });

            if (settings.logs.showLogInConsole) {
                console.log('controller:', this);
            }
        }

        public queue(floorNum: number, direction: Direction): void {
            const elevator: Elevator = this.chooseElevator(floorNum, direction);

            if (elevator) {
                LogService.add(`Add queue to the Elevator #${elevator.index} (floorNum: ${floorNum}, direction: ${Direction[direction]})`);
                elevator.addFloorQueue(floorNum, direction);
            } else {
                LogService.add(`Add queue to the controller (floorNum: ${floorNum}, direction: ${Direction[direction]})`);
                this.addFloorQueue(floorNum, direction);
            }
        }

        protected addFloorQueue(floorNum: number, direction: Direction): void {
            this._queues.rpush(direction * floorNum);
        }

        protected chooseElevator(floorNum: number, direction: Direction): Elevator | null {
            if (this._singleMode) {
                if (this._elevators[0].canQueue(floorNum, direction)) {
                    return this._elevators[0];
                }
            }

            return null;
        }

        protected onElevatorIdle(elevator: Elevator): void {
            if (!this._queues.size) { return; }

            const waitingFloor: number = this._queues.lpop(),
                direction: Direction = (waitingFloor < 0) ? Direction.down : Direction.up;
            let nearestElevator: Elevator = this.chooseElevator(Math.abs(waitingFloor), direction) || elevator;

            nearestElevator.addFloorQueue(Math.abs(waitingFloor), direction);
        }

        protected onElevatorStop(elevator: Elevator): void {
            this._queues.delete(elevator.direction * elevator.currentFloor);
        }

        protected onElevatorPreStop(floorNum:number, elevator: Elevator): void {
            if (elevator.loadFactor > settings.elevator.maxLoadFactorForExtraStop) { return; }

            if (this._queues.delete(floorNum * elevator.direction)) {
                elevator.stopOnFloor(floorNum);
            }
        }
    }

    let controller: ElevatorsController;

    return {
        init: (elevatorsSaga: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            controller = new ElevatorsController(elevatorsSaga);

            floors.forEach((floor) => {
                floor.on('up_button_pressed', () => {
                    LogService.add(`Floor #${floor.floorNum()}: button UP is pressed.`);
                    controller.queue(floor.floorNum(), Direction.up);
                })
                .on('down_button_pressed', () => {
                    LogService.add(`Floor #${floor.floorNum()}: button DOWN is pressed.`);
                    controller.queue(floor.floorNum(), Direction.down);
                });
            });
        },
        update: (dt: number, elevatorsSaga: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            timer += dt;
            elevatorsSaga.forEach((elevatorSaga: ElevatorSaga.IElevator) => {
                elevatorSaga.trigger('ctm_update', dt);
            });
        }
    }
})();
