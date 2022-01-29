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

        one(event: 'ctm_update', func: (deltaTimer: number) => void): this;

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

}

(function(): ElevatorSaga.IReturnObject {

    interface ISetting {
        controller: IControllerSettings
        elevator: IElevatorSettings;
        statistics: IStatisticsSettings;
        logs: ILogSettings;
    }

    interface IControllerSettings {
        /**
         * При простое возвращаться на 0 этаж.
         */
        returnToGroundFloorIfIdle: boolean;
    }
    interface IElevatorSettings {
        /**
         * Максимально значение загрузки лифта для дополнительной остановки\
         * Значение от 0,5 до 1. Ниже 0,5 смысла ставить нет.
         */
        maxLoadFactorForExtraStop: number;
    }

    interface IStatisticsSettings {
        /**
         * Глубина накопления статистики
         */
        depth: number;
    }

    interface ILogSettings {
        /**
         * Выводить расширенные логи в консоли
         */
        showLogInConsole: boolean;

        /**
         * Показывать логи для выбранных объектов,
         * иначе для всех
         */
        logObjects: LogKey[];

        /**
         * Для лифтов и этажей показывать логи только по указанным  индексам,
         * иначе для всех.
         */
        logObjectIndex: number[];

        /**
         * Ограничение по количеству логов по каждому объекту.
         * < 0 - без ограничения.
         * = 0 - логи не ведутся
         */
        logCountForObject: number;
    }

    interface IPenalties {
        controller: IControllerPenalties;
        elevator: IElevatorPenalties;
    }

    interface IControllerPenalties {
        /**
         * Штраф за отсутсвие лифта на 1 этаже.\
         * Не считается, в случае вызова на первом этаже.
         */
        noElevatorOnTheGroudFloor: number;
    }

    interface IElevatorPenalties {
        /**
         * Штраф за использование лифта большей вместимости.\
         * Считается на каждого пассажира.
         */
        byElevatorCapacity: number;

        /**
         * Штраф за количество перемещений до этажа
         * Считается за каждый этаж
         */
        byElevatorsMove: number;

        /**
         * Штраф за расчетное количество секунд до этажа
         * Ссчитается за каждую секунду
         */
        byElevatorsTime: number;


        /**
         * Штраф за пробег.
         * Считается за уже пройденные этажи.
         */
        byPassedFloors: number;

        /**
         * Штраф за кол-во остановок в очереди лифта.
         * За каждую остановку.
         */
        byStopsCount: number;
    }

    let timer: number = 0;
    const settings: ISetting = {
        controller: {
            returnToGroundFloorIfIdle: false,
        },
        elevator: {
            maxLoadFactorForExtraStop: 0.7,
        },
        statistics: {
            depth: 10,
        },
        logs: {
            showLogInConsole: true,
            logCountForObject: 1000,
            logObjects: ['controller'],
            logObjectIndex: [],
        }
    }

    const penalties: IPenalties = {
        controller: {
            noElevatorOnTheGroudFloor: 10,
        },
        elevator: {
            byElevatorCapacity: 10,
            byElevatorsMove: 1,
            byElevatorsTime: 0.1,
            byPassedFloors: 0,
            byStopsCount: 1,
        }
    }

    enum ElevatorStatus { stop, move, idle }
    enum Direction { up = 1, down = -1 }
    type LogKey = 'floor' | 'elevator' | 'controller' | 'stats' | 'other';
    type ILog = Record<LogKey, string[][]>;

    interface ILogObject {
        object?: LogKey;
        index?: number;
    }

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
        protected _elevatorIndex: number;

        protected _speed: Record<Direction, StaticsticsObject>;
        protected _timeOnFloorAlong: Record<Direction, StaticsticsObject>;
        protected _timeOnFloorReversal: Record<Direction, StaticsticsObject>;
        protected _timeOfIdle: StaticsticsObject = new StaticsticsObject();
        protected _floorsCount: number = 0;

        protected _status: ElevatorStatus = ElevatorStatus.idle;
        protected _floorNum: number = 0;
        protected _direction: Direction = Direction.up;

        protected _timer: number = 0;

        constructor(elevatorIndex: number) {
            this._elevatorIndex = elevatorIndex;
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
            this._floorsCount++;
        }

        public idleOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();

            this._timeOnFloorAlong[this._direction].push(timer);
            LogService.add('stats',
                `Elevator #${this._elevatorIndex}: was on the floor for ${timer.toFixed(3)}`);

            this._status = ElevatorStatus.idle;
            this._floorNum = floorNum;
        }

        public stopOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();
            const delta: number = Math.abs(floorNum - this._floorNum);

            if (delta) {
                const speed: number = timer / delta;
                this._speed[this._direction].push(speed);
                LogService.add('stats',
                    `Elevator #${this._elevatorIndex}: was moving with a speed ${speed.toFixed(3)} sec per floor`);
            }

            this._status = ElevatorStatus.stop;
            this._floorNum = floorNum;
        }

        public startMoving(floorNum: Direction, direction: Direction) {
            const timer: number = this.getTimer();

            if (this._status === ElevatorStatus.idle) {
                this._timeOfIdle.push(timer);
                LogService.add('stats',
                    `Elevator #${this._elevatorIndex}: was idling for ${timer.toFixed(3)}`);
            } else {    // ElevatorStatus.stop
                if (direction !== this._direction) {
                    this._timeOnFloorReversal[direction].push(timer);
                    LogService.add('stats',
                        `Elevator #${this._elevatorIndex}: was on the floor (with change direction) for ${timer.toFixed(3)}`);
                } else {
                    this._timeOnFloorAlong[direction].push(timer);
                    LogService.add('stats',
                        `Elevator #${this._elevatorIndex}: was on the floor for ${timer.toFixed(3)}`);
                }
            }

            this._status = ElevatorStatus.move;
            this._floorNum = floorNum;
            this._direction = direction;
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

        protected _log: ILog;

        protected constructor() {
            this._log = {
                controller: [[]],
                elevator: [[]],
                floor: [[]],
                stats: [[]],
                other: [[]],
            }

            console.log('log:', this);
        }

        public static getLog(logObj: LogKey, index: number = 0): string[] {
            return [...this._instance._log[logObj][index]];
        }

        public static add(logObj: LogKey, message: string): void;
        public static add(logObj: ILogObject, message: string): void;
        public static add(logObj: LogKey | ILogObject, message: string): void {
            let index: number = 0;
            let key: LogKey;
            if (typeof(logObj) === 'object') {
                index = logObj.index || 0;
                key = logObj.object || 'other';
                if (!this._instance._log[key][index]) {
                    this._instance._log[key][index] = [];
                }
            } else {
                key = logObj;
            }

            const logCount: number = settings.logs.logCountForObject;
            const log: string[] = this._instance._log[key][index];

            if ( logCount > 0  &&  log.length >= logCount) {
                log.shift();
            }
            log.push(timer.toFixed(3) + ': ' + message);

            this.showLog(key, index, message);
        }

        protected static showLog(key: LogKey, index: number, message: string): void {
            if (!settings.logs.showLogInConsole) { return; }

            if (settings.logs.logObjects.length
                && !settings.logs.logObjects.includes(key)) { return; }

            if((key === 'elevator' || key === 'floor')
                && settings.logs.logObjectIndex.length
                && !settings.logs.logObjectIndex.includes(index)) { return; }

            console.log(timer.toFixed(3), message);
        }
    }

    abstract class ElevatorAbstract {

        protected _stats?: ElevatorStatistics;

        private readonly __index: number;
        private readonly __elevator: ElevatorSaga.IElevator;

        private __status: ElevatorStatus = ElevatorStatus.idle;
        private __direction: Direction = Direction.up;

        private __lastFloorNum: number;
        private __lastLoadFactor: number;
        private __lastDestDirection: ElevatorSaga.TDestDirection;

        constructor(index: number, elevatorSaga: ElevatorSaga.IElevator) {
            this.__index = index;
            this.__elevator = elevatorSaga;

            this.__lastFloorNum = this.__elevator.currentFloor();
            this.__lastLoadFactor = this.__elevator.loadFactor();
            this.__lastDestDirection = this.__elevator.destinationDirection();

            this.setIndicators(true);
            this.elevatorInit();
        }

        public get index(): number {
            return this.__index;
        }

        public get status(): ElevatorStatus {
            const direction: ElevatorSaga.TDestDirection = this.__elevator.destinationDirection();
            return (direction === 'stopped') ? this.__status : ElevatorStatus.move;
        }

        public get currentFloor(): number {
            return this.__elevator.currentFloor();
        }

        public get loadFactor(): number {
            return this.__elevator.loadFactor();
        }

        public get maxCapacity(): number {
            return this.__elevator.maxPassengerCount();
        }

        public get direction(): Direction {
            return this.__direction;
        }

        public setDirection(direction: Direction): void {
            if (direction !== this.__direction) {
                LogService.add({object: 'elevator', index: this.index},
                    `Elevator #${this.index}: changes direction [${Direction[direction]}]`);
            }

            this.__direction = direction;
            this.setIndicators();
        }

        public forceStop(floorNum: number): void {
            this.__elevator.goToFloor(floorNum, true);
        }

        protected onLetIn(oldLoadFactor: number, newLoadFactor: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: some people was let in`);
        }

        protected onLetOut(oldLoadFactor: number, newLoadFactor: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: some people was let out`);
        }

        protected onIdle(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: started to idle at floor ${floorNum}`);

            this.__status = ElevatorStatus.idle;
            this.updateStats(0);
            this._stats?.idleOnFloor(this.currentFloor);
            this.setIndicators(true);
        }

        protected onStop(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: stopped at floor ${floorNum}`);

            this.__status = ElevatorStatus.stop;
            this.updateStats(0);
            this._stats?.stopOnFloor(floorNum);
        }

        /**
         * Emitted only if statistics update is enabled
         */
        protected onMove(direction: Direction): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: starts moving ${Direction[direction]}`);

            this.__status = ElevatorStatus.move;
            this._stats?.startMoving(this.currentFloor, direction)
        }

        /**
         * Emitted only if statistics update is enabled
         */
        protected onChangeFloor(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: is moving ${Direction[this.direction]} and change floor to ${floorNum}`);

            this._stats?.changeFloor(floorNum, this.direction);
        }

        protected onPressButton(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: button #${floorNum} is pressed.`);
        }

        protected setIndicators(idle: boolean = false): void {
            if (idle) {
                this.__elevator.goingUpIndicator(false);
                this.__elevator.goingDownIndicator(false);
            } else {
                this.__elevator.goingUpIndicator(this.__direction === Direction.up);
                this.__elevator.goingDownIndicator(this.__direction === Direction.down);
            }
        }

        protected setQueue(sortedQueue: number[]) {
            const oldQueue: number[] = this.__elevator.destinationQueue;
            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: changed queue from [${oldQueue}] to [${sortedQueue}]`);

            if (sortedQueue.length) {
                this.__elevator.destinationQueue = sortedQueue;
                this.__elevator.checkDestinationQueue();
            } else {
                this.__elevator.goToFloor(this.currentFloor, true);
            }
        }

        private elevatorInit(): void {
            this.__elevator.one('ctm_update', () => {
                this._stats = new ElevatorStatistics(this.index);
            })
            .on('ctm_update', (dt: number) => { this.updateStats(dt); })
            .on('stopped_at_floor', (floorNum: number) => { this.onStop(floorNum); })
            .on('idle', () => { this.onIdle(this.currentFloor); })
            .on('floor_button_pressed', (floorNum: number) => { this.onPressButton(floorNum); });
        }

        private updateStats(deltaTimer: number): void {
            this._stats?.updateTimer(deltaTimer);

            const newDestDirection: ElevatorSaga.TDestDirection = this.__elevator.destinationDirection();
            if (newDestDirection === 'stopped') {
                if (this.__status === ElevatorStatus.idle) { return; }

                const newLoadFactor: number = this.loadFactor;
                if (newLoadFactor > this.__lastLoadFactor) {
                    this.onLetIn(this.__lastLoadFactor, newLoadFactor);
                } else if (newLoadFactor < this.__lastLoadFactor) {
                    this.onLetOut(this.__lastLoadFactor, newLoadFactor);
                }
                this.__lastLoadFactor = newLoadFactor;
            } else {
                const newFloorNum: number = this.currentFloor;
                const newDirection: Direction = Direction[newDestDirection];

                if (this.__lastDestDirection === 'stopped') {
                    this.onMove(newDirection);
                }

                if (newFloorNum !== this.__lastFloorNum) {
                    this.onChangeFloor(newFloorNum);
                }
                this.__lastFloorNum = newFloorNum;
            }
            this.__lastDestDirection = newDestDirection;
        }
    }

    class Elevator extends ElevatorAbstract {

        protected _queue: Queue<number> = new Queue();
        protected _backQueue: Queue<number> = new Queue();
        protected _nextDirection: Direction | 0 = 0;
        protected _isReturn: boolean = false;

        protected _settings: IElevatorSettings;
        protected _penalties: IElevatorPenalties;

        constructor(index: number, elevatorSaga: ElevatorSaga.IElevator) {
            super(index, elevatorSaga);

            this._settings = settings.elevator;
            this._penalties = penalties.elevator;
        }

        public get isIdle(): boolean {
            return this.status === ElevatorStatus.idle;
        }

        public get isEmpty(): boolean {
            return !this.loadFactor;
        }

        public get noQueue(): boolean {
            return !this._queue.size && !this._backQueue.size
        }

        public canQueue(floorNum: number, direction: Direction): boolean {
            return this.isIdle;
            // return this.isIdle || this.alongTheWay(floorNum, direction));
        }

        public canExtraStop(floorNum: number): boolean {
            return this._isReturn
            || (!this.isEmpty && (this.loadFactor <= this._settings.maxLoadFactorForExtraStop));
        }

        /**
         * Somebody pressed button on the floor
         * @param {number} floorNum floor number where button is pressed
         * @param {Direction} direction direction where button is pressed
         * @param {boolean} [stopNow=false] stop on the current floor before moving
         */
        public callOnFloor(
            floorNum: number,
            direction: Direction,
            stopNow: boolean = false,
        ): void {
            if (this.status !== ElevatorStatus.idle) {
                throw new Error('The elevator is not idle');
            }

            if (floorNum === this.currentFloor) {
                this.setDirection(direction);
            } else {
                const newDirection: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;
                this.setDirection(newDirection);

                if (stopNow) {
                    this._queue.rpush(this.currentFloor);
                }

                if (direction !== newDirection) {
                    this._nextDirection = direction;
                }
            }

            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: took the #${direction * floorNum} floor`);
            this._queue.rpush(floorNum);
            this.setQueue();
        }

        public deleteFloorQueue(floorNum: number, direction: Direction): void {
            if (this._queue.has(floorNum) && this.isEmpty) {
                this._queue.delete(floorNum);
                this.setQueue();
            }
        }

        public returnToGroundFloor(): void {
            this._isReturn = true;
            this.callOnFloor(0, Direction.up);
        }

        protected changeDirection(): void {
            this.setDirection(this.direction * -1);
        }

        protected addQueue(floorNum: number): void {
            const direction: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;

            if (this.alongTheWay(floorNum, direction)) {
                LogService.add({object: 'elevator', index: this.index},
                    `Elevator #${this.index}: went to the #${floorNum} floor`);
                this._queue.rpush(floorNum);
                this.setQueue();
            } else {
                LogService.add({object: 'elevator', index: this.index},
                    `Elevator #${this.index}: added the #${floorNum} floor into the back queue`);
                this._backQueue.rpush(floorNum);
            }
        }

        protected override setQueue(): void {
            if (this._isReturn && this._queue.size) {
                this._isReturn = false;
            }

            this._queue.sort((a: number, b: number) => this.direction * (a - b));
            this.setIndicators();
            super.setQueue(this._queue.values);
        }

        protected override onIdle(floorNum: number): void {
            super.onIdle(floorNum);

            this._queue.clear();
        }

        protected override onStop(floorNum: number): void {
            super.onStop(floorNum);

            this._queue.delete(floorNum);

            LogService.add({object: 'elevator', index: this.index},
                `Elevator #${this.index}: queue [${this._queue.values}], backQueue [${this._backQueue.values}], direction [${this.direction}]`);

            if (!this._queue.size) {
                if (this._nextDirection) {
                    this.setDirection(this._nextDirection);
                    this._nextDirection = 0;
                    return;
                }

                if (this._backQueue.size) {
                    this.changeDirection();
                    this._queue = this._backQueue;
                    this._backQueue = new Queue();
                    this.setQueue();
                    return;
                }
            }
        }

        protected override onPressButton(floorNum: number): void {
            super.onPressButton(floorNum);

            this.addQueue(floorNum);
        }

        protected alongTheWay(floorNum: number, direction: Direction): boolean {
            return (direction === this.direction) && (direction * (floorNum - this.currentFloor) > 0);
        }
    }

    class ElevatorsController {

        protected _singleMode: boolean;
        protected _maxFloor: number;
        protected _elevators: Elevator[];
        protected _settings: IControllerSettings;
        protected _penalties: IControllerPenalties;

        /**
         * Floors in call order\
         * `< 0` - call down\
         * `>= 0` - call up\
         * Possible values: `[-max, -(max-1), ..., -1, 0, 1, ..., (max-1)]`
         */
        protected _queues: Queue<number> = new Queue();

        constructor(
            elevators: ElevatorSaga.IElevator[],
            floors: ElevatorSaga.IFloor[],
        ) {
            this._singleMode = (elevators.length === 1);
            this._maxFloor = floors.length - 1;
            this._settings = settings.controller;
            this._penalties = penalties.controller;

            this.initElevators(elevators);
            this.initFloors(floors);

            console.log('controller:', this);
        }

        protected initElevators(elevators: ElevatorSaga.IElevator[]): void {
            this._elevators = elevators.map((elevatorSaga: ElevatorSaga.IElevator, index: number) => {
                const elevator = new Elevator(index, elevatorSaga);

                elevatorSaga.on('idle', () => { this.onElevatorIdle(elevator); })
                .on('stopped_at_floor', () => { this.onElevatorStop(elevator); })
                .on('passing_floor', (floorNum: number) => { this.onElevatorPreStop(floorNum, elevator); });

                return elevator;
            });
        }

        protected initFloors(floors: ElevatorSaga.IFloor[]): void {
            floors.forEach((floor) => {
                floor.on('up_button_pressed', () => {
                    LogService.add({object: 'floor', index: floor.floorNum()},
                        `Floor #${floor.floorNum()}: button UP is pressed.`);
                    this.callOnFloor(floor.floorNum(), Direction.up);
                })
                .on('down_button_pressed', () => {
                    LogService.add({object: 'floor', index: floor.floorNum()},
                        `Floor #${floor.floorNum()}: button DOWN is pressed.`);
                    this.callOnFloor(floor.floorNum(), Direction.down);
                });
            });
        }

        protected callOnFloor(floorNum: number, direction: Direction): void {
            const elevator: Elevator = this.chooseElevator(floorNum, direction);

            if (elevator) {
                LogService.add({object: 'elevator', index: elevator.index},
                    `Elevator #${elevator.index}: Add queue (floorNum: ${floorNum}, direction: ${Direction[direction]})`);
                elevator.callOnFloor(floorNum, direction);
            } else {
                LogService.add('controller',
                    `Controller: Add queue (floorNum: #${floorNum}, direction: ${Direction[direction]})`);
                this.addCallQueue(floorNum, direction);
            }
        }

        protected addCallQueue(floorNum: number, direction: Direction): void {
            this._queues.rpush(direction * floorNum);
        }

        protected chooseElevator(floorNum: number, direction: Direction): Elevator | null {
            // if (this._singleMode) {
            //     if (this._elevators[0].canQueue(floorNum, direction)) {
            //         return this._elevators[0];
            //     }
            // } else {
            const elevators: Elevator[] = this._elevators.filter((el: Elevator) => el.canQueue(floorNum, direction));

            if (elevators.length) {
                return elevators[0];
            }
            // }

            return null;
        }

        protected onElevatorIdle(elevator: Elevator): void {
            if (!this._queues.size) {
                if (!elevator.currentFloor && this._settings.returnToGroundFloorIfIdle) {
                    elevator.returnToGroundFloor();
                }
                return;
            }

            const nextQueue: number = this._queues.lpop(),
            // const nextQueue: number = this._queues.values[0],
                direction: Direction = (nextQueue < 0) ? Direction.down : Direction.up,
                waitingFloor: number = Math.abs(nextQueue);
            let nearestElevator: Elevator = this.chooseElevator(waitingFloor, direction) || elevator;

            // let nextDirection: Direction = direction;
            // let stopNow: boolean = false;
            // if (waitingFloor !== nearestElevator.currentFloor) {
            //     nextDirection = (waitingFloor < nearestElevator.currentFloor) ? Direction.down : Direction.up;
            //     stopNow = this._queues.has(nextDirection * nearestElevator.currentFloor);
            // }

            // nearestElevator.callOnFloor(waitingFloor, direction, stopNow);
            nearestElevator.callOnFloor(waitingFloor, direction);
        }

        protected onElevatorStop(elevator: Elevator): void {
            this._queues.delete(elevator.direction * elevator.currentFloor);

            LogService.add('controller', `Controller: queue [${this._queues.values}]`);

            this._elevators.forEach((elevator: Elevator) => {
                elevator.deleteFloorQueue(elevator.currentFloor, elevator.direction);
            });

            if (!elevator.currentFloor) {
                elevator.setDirection(Direction.up);
            } else if (elevator.currentFloor === this._maxFloor) {
                elevator.setDirection(Direction.down);
            // } else if (elevator.noQueue
            //     && this._queues.delete(-1 * elevator.direction * elevator.currentFloor)) {
            //         elevator.setDirection(-1 * elevator.direction);
            }
        }

        protected onElevatorPreStop(floorNum:number, elevator: Elevator): void {
            if (!elevator.canExtraStop(floorNum)) { return; }

            if (this._queues.delete(floorNum * elevator.direction)) {
                elevator.forceStop(floorNum);
            }
        }
    }

    return {
        init: (elevatorsSaga: ElevatorSaga.IElevator[], floors: ElevatorSaga.IFloor[]) => {
            new ElevatorsController(elevatorsSaga, floors);
        },
        update: (dt: number, elevatorsSaga: ElevatorSaga.IElevator[]) => {
            timer += dt;
            elevatorsSaga.forEach((elevatorSaga: ElevatorSaga.IElevator) => {
                elevatorSaga.trigger('ctm_update', dt);
            });
        }
    }
})();
