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
    }
    interface IElevatorSetting {
        goToGroundFloorIfIdle: boolean,
    }

    interface IStatisticsSetting {
        depth: number;
    }

    const settings: ISetting = {
        elevator: {
            goToGroundFloorIfIdle: false,
        },
        statistics: {
            depth: 50,
        },
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

    class Queues<T> {

        protected _queues: Record<Direction, Queue<T>> = {
            [Direction.down]: new Queue(),
            [Direction.up]: new Queue(),
        };

        public get isEmpty(): boolean {
            return !this._queues[Direction.down].size && !this._queues[Direction.up].size;
        }

        public get(direction: Direction): Queue<T> {
            return this._queues[direction];
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
        protected _allTimer: number = 0;

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
            this._allTimer += deltaTimer;
        }

        public changeFloor(floorNum: number, direction: Direction): void {
            LogService.add(`The elevator is moving ${Direction[direction]} and change floor to ${floorNum}`,
                this._allTimer);

            this._floorsCount++;
        }

        public idleOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();

            this._timeOnFloorAlong[this._direction].push(timer);
            LogService.add(`The elevator was on the floor for ${timer.toFixed(3)}`, this._allTimer);
            LogService.add(`The elevator started to idle at floor ${floorNum}`, this._allTimer);

            this._status = ElevatorStatus.idle;
            this._floorNum = floorNum;
        }

        public stopOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();
            const delta: number = Math.abs(floorNum - this._floorNum);

            if (!delta) { return; }

            const speed: number = timer / delta;

            this._speed[this._direction].push(speed);
            LogService.add(`The elevator was moving with a speed ${speed.toFixed(3)} sec per floor`, this._allTimer);
            LogService.add(`The elevator stopped at floor ${floorNum}`, this._allTimer);

            this._status = ElevatorStatus.stop;
            this._floorNum = floorNum;
        }

        public startMoving(floorNum: Direction, direction: Direction) {
            const timer: number = this.getTimer();

            if (this._status === ElevatorStatus.idle) {
                this._timeOfIdle.push(timer);
                LogService.add(`The elevator was idling for ${timer.toFixed(3)}`, this._allTimer);
            } else {    // ElevatorStatus.stop
                if (direction !== this._direction) {
                    this._timeOnFloorReversal[direction].push(timer);
                    LogService.add(`The elevator was on the floor (with change direction) for ${timer.toFixed(3)}`,
                        this._allTimer);
                } else {
                    this._timeOnFloorAlong[direction].push(timer);
                    LogService.add(`The elevator was on the floor for ${timer.toFixed(3)}`, this._allTimer);
                }
            }

            if (direction !== this._direction) {
                LogService.add(`The elevator changes direction and starts moving ${Direction[direction]}`,
                    this._allTimer);
            } else {
                LogService.add(`The elevator starts moving ${Direction[direction]}`, this._allTimer);
            }

            this._status = ElevatorStatus.move;
            this._floorNum = floorNum;
            this._direction = direction;
        }

        public letIn(): void {
            LogService.add(`Some people was let in the elevator`, this._allTimer);
        };

        public letOut(): void {
            LogService.add(`Some people was let out the elevator`, this._allTimer);
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

        protected constructor() { }

        public static get log(): string[] {
            // return this._instance._log;
            return [...this._instance._log];
        }

        public static add(value: string, timer?: number) {
            if (timer) {
                this._instance._log.push(timer.toFixed(3) + ': ' + value);
                // console.log(timer.toFixed(3), value);
            } else {
                this._instance._log.push(value);
                // console.log(value);
            }
        }
    }

    abstract class ElevatorAbstract {

        protected _stats: ElevatorStatistics = new ElevatorStatistics();

        private readonly __elevator: ElevatorSaga.IElevator;

        private __status: ElevatorStatus = ElevatorStatus.idle;
        private __floorNum: number;
        private __loadFactor: number;
        private __lastDestDirection: ElevatorSaga.TDestDirection;
        private __direction: Direction = Direction.up;

        constructor(elevatorSaga: ElevatorSaga.IElevator) {
            this.__elevator = elevatorSaga;

            this.__floorNum = this.__elevator.currentFloor();
            this.__loadFactor = this.__elevator.loadFactor();
            this.__lastDestDirection = this.__elevator.destinationDirection();

            this.setIndicators();
            this.elevatorInit();
        }

        public get status(): ElevatorStatus {
            return this.__status;
        }

        public get currentFloor(): number {
            return this.__floorNum;
        }

        public get loadFactor(): number {
            return this.__loadFactor;
        }

        public get direction(): Direction {
            return this.__direction;
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
                this.__elevator.goingDownIndicator(true);
            } else {
                this.__elevator.goingUpIndicator(this.__direction === Direction.up);
                this.__elevator.goingDownIndicator(this.__direction === Direction.down);
            }
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

        protected readonly _index: number;

        protected _queue: Queue<number> = new Queue();
        protected _queueOpposite: Queue<number> = new Queue();

        public constructor(
            index: number,
            elevatorSaga: ElevatorSaga.IElevator
        ) {
            super(elevatorSaga);
            this._index = index;
        }

        public get isIdle(): boolean {
            return this.status === ElevatorStatus.idle;
        }


        public canQueue(floorNum: number, direction: Direction): boolean {
            return this.isIdle
                && (this.direction === direction)
                && this.alongTheWay(floorNum);
        }

        public addQueue(floorNum: number): void;
        public addQueue(floorNum: number, direction: Direction): void;
        public addQueue(floorNum: number, direction?: Direction): void {
            const _direction: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;

            if (floorNum === this.currentFloor) {
                this.setDirection(direction);
            } else {
                this.setDirection(_direction);
            }

            this._queue.rpush(_direction * floorNum);
            this.setQueue();

            // if (!this.__direction) {
                // this.setDirection((floorNum < this.currentFloor) ? Direction.down : Direction.up);
            // }

            // if (!this._queue.size || this.alongTheWay(floorNum)) {
            //     this._queue.rpush(this.direction * floorNum).sort((a: number, b: number) => a - b);
            //     this.setQueue();
            // } else {
            //     this._queueOpposite.rpush(-1 * this.direction * floorNum).sort((a: number, b: number) => a - b);
            // }
        }

        protected setQueue() {
            // const oldQueue: number[] = this._elevatorSaga.destinationQueue;
            // const newQueue: number[] = this._queue.values.map((floorNum: number) => Math.abs(floorNum));

            // LogService.add(`Elevator #${this._index}: changed queue from [${oldQueue}] to [${newQueue}]`);

            // this._elevatorSaga.destinationQueue = newQueue;
            // this._elevatorSaga.checkDestinationQueue();
        }

        // LogService.add(`Elevator #${this._index}: changed status on '${ElevatorStatus[status]}'.`);

        protected setDirection(direction: Direction): void {
            switch (direction) {
                case Direction.up:
                    LogService.add(`Elevator #${this._index} set direction to UP`);
                    // this._elevatorSaga.goingUpIndicator(true);
                    // this._elevatorSaga.goingDownIndicator(false);
                    break;

                case Direction.down:
                    LogService.add(`Elevator #${this._index} set direction to DOWN`);
                    // this._elevatorSaga.goingUpIndicator(false);
                    // this._elevatorSaga.goingDownIndicator(true);
                    break;
            }
        //     if (this._direction === value) { return; }

        //     LogService.add(`Elevator #${this._index}: set direction on '${Direction[value]}'.`);

        //     this._direction = value;

        //     switch (value) {
        //         case Direction.up:
        //             this._elevatorSaga.goingUpIndicator(true);
        //             this._elevatorSaga.goingDownIndicator(false);
        //             break;
        //         case Direction.down:
        //             this._elevatorSaga.goingDownIndicator(true);
        //             this._elevatorSaga.goingUpIndicator(false);
        //             break;
        //     }
        }

        protected changeDirection(): void {
            // this.setDirection(this.direction * -1);
        }

        protected checkIdle(): void {
            LogService.add(`Elevator #${this._index} check for idle`);
            if (this._queueOpposite.size) {
                this.changeDirection();

                const newQueue: number[] = this._queueOpposite.values.filter((floorNum: number) => {
                    return true;
                });

                newQueue.forEach((floorNum: number) => {
                    this._queue.rpush(floorNum);
                    this._queueOpposite.delete(floorNum);
                });
                this.setQueue();
            } else if (settings.elevator.goToGroundFloorIfIdle && this.currentFloor) {
                // this.setDirection(Direction.down);
                this._queue.rpush([-this.currentFloor, 0]);
                this.setQueue();
            } else {
                this.idle();
            }
        }

        protected idle(): void {
            LogService.add(`Elevator #${this._index} is idle`);
            // this._isIdle = true;
            // this._queue.clear();
            // this._elevatorSaga.goingUpIndicator(false);
            // this._elevatorSaga.goingDownIndicator(false);
            // this._elevatorSaga.trigger('custom_idle');
        }

        protected move(): void {

        }

        protected stoppedAtFloor(floorNum: number): void {
            // this._isIdle = false;

            // this._stats.changeFloor(floorNum);
            // LogService.add(`Elevator #${this._index}: is stopped on #${floorNum} floor.`);

            // this._queue.lpop();
        }

        protected passingFloor(floorNum: number, direction: Direction): void {
            // this._stats.changeFloor(floorNum);
        }

        protected floorButtonPressed(floorNum: number): void {
            LogService.add(`Elevator #${this._index}: button #${floorNum} is pressed.`);

            this.addQueue(floorNum);
        }

        protected alongTheWay(floorNum: number): boolean {
            return true;
            // return (this.direction * (floorNum - this.currentFloor) > 0);
        }
    }

    class ElevatorsController {

        protected _singleMode: boolean;
        protected _elevators: Elevator[];
        protected _queues: Queues<number> = new Queues();

        constructor(elevators: ElevatorSaga.IElevator[]) {
            this._singleMode = (elevators.length === 1);

            this._elevators = elevators.map((elevatorSaga: ElevatorSaga.IElevator, index: number) => {
                const elevator = new Elevator(index, elevatorSaga);

                elevatorSaga.on('idle', () => { this.onElevatorIdle(elevator); })
                .on('stopped_at_floor', () => { this.onElevatorStop(elevator); });

                return elevator;
            });
        }

        public queue(floorNum: number, direction: Direction): void {
            const elevator: Elevator = this.chooseElevator(floorNum, direction);

            if (!elevator) {
                this._queues.get(direction).rpush(floorNum);
            } else {
                elevator.addQueue(floorNum, direction);
            }
        }

        protected chooseElevator(floorNum: number, direction: Direction): Elevator | null {
            if (this._singleMode) {
                return this._elevators[0];
                // const elevator: Elevator = this._elevators[0];
                // return elevator.canQueue(floorNum, direction) ? elevator : null;
            }

            return null;
        }

        protected onElevatorIdle(elevator: Elevator): void {
            if (this._queues.isEmpty) { return; }
        }

        protected onElevatorStop(elevator: Elevator): void {
            this._queues.get(elevator.direction).delete(elevator.currentFloor);
        }
    }

    let controller: ElevatorsController;

    return {
        init: (elevatorsSaga: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            controller = new ElevatorsController(elevatorsSaga);

            console.log(controller);
            console.log('floors', floors);
            console.log('Log', LogService.log);

            floors.forEach((floor) => {
                floor.on('up_button_pressed', () => {
                    LogService.add(`Floor #${floor.floorNum()}: button UP is pressed.`);
                    controller.queue(floor.floorNum(), Direction.up);
                });

                floor.on('down_button_pressed', () => {
                    LogService.add(`Floor #${floor.floorNum()}: button DOWN is pressed.`);
                    controller.queue(floor.floorNum(), Direction.down);
                });
            });

            // let init: boolean = true;
            // elevatorsSaga[0].on('idle', () => {
            //     if (init) {
            //         elevatorsSaga[0].goToFloor(2);
            //         init = false;
            //     } else {
            //         elevatorsSaga[0].goToFloor(1);
            //         elevatorsSaga[0].goToFloor(0);
            //         elevatorsSaga[0].goToFloor(1);
            //         elevatorsSaga[0].goToFloor(2);
            //     }
            // })
        },
        update: (dt: number, elevatorsSaga: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            elevatorsSaga.forEach((elevatorSaga: ElevatorSaga.IElevator) => {
                elevatorSaga.trigger('ctm_update', dt);
            });
        }
    }
})();
