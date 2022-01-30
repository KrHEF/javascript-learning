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
        logObjects: TLogKey[];

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
            showLogInConsole: false,
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
    enum ElevatorState { default, direct, return, delivery }
    enum Direction { up = 1, down = -1 }
    type TLogKey = 'floor' | 'elevator' | 'controller' | 'stats' | 'other';
    type TLog = Record<TLogKey, string[][]>;
    type TLiftEvent = 'create'
                    | 'stop'                // остановка на этаже
                        | 'pickup'          // остановка пустого лифта, для забора пассажиров
                        | 'demand'          // остановка с целью посадки / высадки пассажиров (не последняя)
                        | 'deliver'         // остановка с высадкой всех пассажиров
                    | 'passing'             // прохождение этажа, принятие решения для остановки
                    | 'idle';

    interface ILogObject {
        object?: TLogKey;
        index?: number;
    }

    class Subscription<TEventName extends string> {

        protected methods: Record<string, Function[]> = {};
        protected unsubscibeMethod: (subscription: Subscription<TEventName>) => void;

        constructor(unsubsctibeMethod: (subscription: Subscription<TEventName>) => void) {
            this.unsubscibeMethod = unsubsctibeMethod;
        }

        public unsubscribe(): void {
            this.methods = {};
            this.unsubscibeMethod(this);
        }

        public emit(eventName: TEventName, args: any[]): void {
            if (!this.methods[eventName]) { return; }

            this.methods[eventName].forEach((method: Function) => {
                method(...args);
            });
        }

        public on(eventName: TEventName, method: Function): this {
            if (!this.methods[eventName]) {
                this.methods[eventName] = [];
            }
            this.methods[eventName].push(method);

            return this;
        }

    }

    class Subscriber<TEventName extends string> {

        protected subscriptions: Set<Subscription<TEventName>> = new Set();

        public subscribe(): Subscription<TEventName> {
            const result: Subscription<TEventName> = new Subscription(this.unsubscribe.bind(this));
            this.subscriptions.add(result);
            return result;
        }

        public emit(eventName: TEventName, ...args: any[]) {
            this.subscriptions.forEach((subsciption: Subscription<TEventName>) => {
                subsciption.emit(eventName, args);
            });
        }

        protected unsubscribe(subsciption: Subscription<TEventName>): void {
            this.subscriptions.delete(subsciption);
        }
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

        public idleOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();

            this._timeOnFloorAlong[this._direction].push(timer);
            LogService.add('stats',
                `Elevator #${this._elevatorIndex} was on the floor for ${timer.toFixed(3)}`);

            this._status = ElevatorStatus.idle;
            this._floorNum = floorNum;
        }

        public stopOnFloor(floorNum: number): void {
            const timer: number = this.getTimer();
            const delta: number = Math.abs(floorNum - this._floorNum);
            this._floorsCount += delta;

            if (delta) {
                const speed: number = timer / delta;
                this._speed[this._direction].push(speed);
                LogService.add('stats',
                    `Elevator #${this._elevatorIndex} was moving with a speed ${speed.toFixed(3)} sec per floor`);
            }

            this._status = ElevatorStatus.stop;
            this._floorNum = floorNum;
        }

        public startMoving(floorNum: Direction, direction: Direction) {
            const timer: number = this.getTimer();

            if (this._status === ElevatorStatus.idle) {
                this._timeOfIdle.push(timer);
                LogService.add('stats',
                    `Elevator #${this._elevatorIndex} was idling for ${timer.toFixed(3)}`);
            } else {    // ElevatorStatus.stop
                if (direction !== this._direction) {
                    this._timeOnFloorReversal[direction].push(timer);
                    LogService.add('stats',
                        `Elevator #${this._elevatorIndex} was on the floor (with change direction) for ${timer.toFixed(3)}`);
                } else {
                    this._timeOnFloorAlong[direction].push(timer);
                    LogService.add('stats',
                        `Elevator #${this._elevatorIndex} was on the floor for ${timer.toFixed(3)}`);
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

        protected _log: TLog;

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

        public static getLog(logObj: TLogKey, index: number = 0): string[] {
            return [...this._instance._log[logObj][index]];
        }

        public static add(logObj: TLogKey, message: string): void;
        public static add(logObj: ILogObject, message: string): void;
        public static add(logObj: TLogKey | ILogObject, message: string): void {
            let index: number = 0;
            let key: TLogKey;
            if (typeof(logObj) === 'object') {
                index = logObj.index || 0;
                key = logObj.object || 'other';
                if (!this._instance._log[key][index]) {
                    this._instance._log[key][index] = [];
                }
            } else {
                key = logObj;
            }

            const logMessage: string = `${key} #${index}: ${message}`;
            const logCount: number = settings.logs.logCountForObject;
            const log: string[] = this._instance._log[key][index];

            if ( logCount > 0  &&  log.length >= logCount) {
                log.shift();
            }
            log.push(timer.toFixed(3) + ', ' + logMessage);

            this.showLog(key, index, logMessage);
        }

        protected static showLog(key: TLogKey, index: number, message: string): void {
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

        private __lastLoadFactor: number;
        private __lastDestDirection: ElevatorSaga.TDestDirection;

        constructor(index: number, elevatorSaga: ElevatorSaga.IElevator) {
            this.__index = index;
            this.__elevator = elevatorSaga;

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
                    `Changes direction [${Direction[direction]}]`);
            }

            this.__direction = direction;
            this.setIndicators();
        }

        public forceStop(floorNum: number): void {
            this.__elevator.goToFloor(floorNum, true);
        }

        protected onLetIn(oldLoadFactor: number, newLoadFactor: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Some people was let in`);
        }

        protected onLetOut(oldLoadFactor: number, newLoadFactor: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Some people was let out`);
        }

        protected onIdle(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Started to idle at floor ${floorNum}`);

            this.__status = ElevatorStatus.idle;
            this.updateStats(0);
            this._stats?.idleOnFloor(this.currentFloor);
            this.setIndicators(true);
        }

        protected onStop(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Stopped at floor ${floorNum}`);

            this.__status = ElevatorStatus.stop;
            this.updateStats(0);
            this._stats?.stopOnFloor(floorNum);
        }

        /**
         * Emitted only if statistics update is enabled
         */
        protected onMove(direction: Direction): void {
            LogService.add({object: 'elevator', index: this.index},
                `Starts moving ${Direction[direction]}`);

            this.__status = ElevatorStatus.move;
            this._stats?.startMoving(this.currentFloor, direction)
        }

        protected onPressButton(floorNum: number): void {
            LogService.add({object: 'elevator', index: this.index},
                `Button #${floorNum} is pressed.`);
        }

        protected onPassingFloor(floor: number): void {}

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
                `Changed queue from [${oldQueue}] to [${sortedQueue}]`);

            if (sortedQueue.length) {
                this.__elevator.destinationQueue = sortedQueue;
                this.__elevator.checkDestinationQueue();
            } else {
                this.__elevator.stop;
                this.__status = ElevatorStatus.idle;
                this.setIndicators(true);
                // this.__elevator.goToFloor(this.currentFloor, true);
            }
        }

        private elevatorInit(): void {
            this.__elevator.one('ctm_update', () => {
                this._stats = new ElevatorStatistics(this.index);
            })
            .on('ctm_update', (dt: number) => { this.updateStats(dt); })
            .on('passing_floor', (floor: number) => { this.onPassingFloor(floor); })
            .on('stopped_at_floor', (floor: number) => { this.onStop(floor); })
            .on('idle', () => { this.onIdle(this.currentFloor); })
            .on('floor_button_pressed', (floor: number) => { this.onPressButton(floor); });
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
                const newDirection: Direction = Direction[newDestDirection];

                if (this.__lastDestDirection === 'stopped') {
                    this.onMove(newDirection);
                }
            }
            this.__lastDestDirection = newDestDirection;
        }
    }

    class Elevator extends ElevatorAbstract {

        protected _queue: Queue<number> = new Queue();
        protected _backQueue: Queue<number> = new Queue();

        protected _state: ElevatorState = ElevatorState.default;
        protected _nextDirection: Direction | 0 = 0;

        protected _settings: IElevatorSettings;
        protected _penalties: IElevatorPenalties;
        protected _subscriber: Subscriber<TLiftEvent> = new Subscriber();

        constructor(index: number, elevatorSaga: ElevatorSaga.IElevator) {
            super(index, elevatorSaga);

            this._settings = settings.elevator;
            this._penalties = penalties.elevator;

            this._subscriber.emit('create');
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

        public subscribe(): Subscription<TLiftEvent> {
            return this._subscriber.subscribe();
        }

        public canQueue(floorNum: number, direction: Direction): boolean {
            return this.isIdle;
            // return this.isIdle || this.alongTheWay(floorNum, direction));
        }

        /**
         * Somebody pressed button on the floor
         * @param {number} floorNum floor number where button is pressed
         * @param {Direction} direction direction where button is pressed
         */
        public call(
            floorNum: number,
            direction: Direction
        ): void {
            if (this.status !== ElevatorStatus.idle) {
                throw new Error('The elevator is not idle');
            }

            if (floorNum === this.currentFloor) {
                this.setDirection(direction);
            } else {
                const newDirection: Direction = (floorNum > this.currentFloor) ? Direction.up : Direction.down;
                this.setDirection(newDirection);

                this._state = ElevatorState.direct;
                this._nextDirection = direction;
            }

            LogService.add({object: 'elevator', index: this.index},
                `Took the #${direction * floorNum} floor`);

            this._queue.rpush(floorNum);
            this.setQueue();
        }

        // public deleteFloorQueue(floorNum: number, direction: Direction): void {
        //     if (this._queue.has(floorNum) && this.isEmpty) {
        //         this._queue.delete(floorNum);
        //         this.setQueue();
        //     }
        // }

        public returnToGroundFloor(): void {
            this._state = ElevatorState.return;
            this._queue.rpush(0);
            this.setQueue();
        }

        protected changeDirection(): void {
            this.setDirection(this.direction * -1);
        }

        protected override setQueue(): void {
            this._queue.sort((a: number, b: number) => this.direction * (a - b));
            this.setIndicators();
            super.setQueue(this._queue.values);
        }

        protected override onIdle(floor: number): void {
            super.onIdle(floor);

            this._queue.clear();
            this._state = ElevatorState.default;
            this._subscriber.emit('idle');
        }

        protected override onStop(floor: number): void {
            super.onStop(floor);
            this._queue.delete(floor);
            this._subscriber.emit('stop');

            LogService.add({object: 'elevator', index: this.index},
                `queue [${this._queue.values}], backQueue [${this._backQueue.values}], direction [${this.direction}]`);

            if (!this._queue.size) {

                if (this._state === ElevatorState.direct) {
                    this.setDirection(this._nextDirection);
                    this._nextDirection = 0;
                    this._state = ElevatorState.delivery;
                    this._subscriber.emit('pickup');
                    return;
                }

                if (this._backQueue.size) {
                    this.changeDirection();
                    this._queue = this._backQueue;
                    this._backQueue = new Queue();
                    this.setQueue();
                    return;
                }

                this._state = ElevatorState.delivery;
                this._subscriber.emit('deliver');
            } else {
                this._state = ElevatorState.delivery;
                this._subscriber.emit('demand');
            }
        }

        protected override onPassingFloor(floor: number): void {
            super.onPassingFloor(floor);

            if (this.isEmpty && this._state !== ElevatorState.return
            || this.loadFactor > this._settings.maxLoadFactorForExtraStop) { return ; }

            this._subscriber.emit('passing', floor);
        }

        protected override onPressButton(floor: number): void {
            super.onPressButton(floor);

            const direction: Direction = (floor > this.currentFloor) ? Direction.up : Direction.down;

            if (this._state === ElevatorState.direct && this.direction != direction) {
                this._backQueue = this._queue;
                this._queue = new Queue();
            }

            if (this.alongTheWay(floor, direction)) {
                LogService.add({object: 'elevator', index: this.index},
                    `Added the #${floor} floor into queue`);

                this._queue.rpush(floor);
                this.setQueue();
            } else {
                LogService.add({object: 'elevator', index: this.index},
                    `Added the #${floor} floor into the back queue`);

                this._backQueue.rpush(floor);
            }
        }

        protected alongTheWay(floor: number, direction: Direction): boolean {
            return (direction === this.direction) && (direction * (floor - this.currentFloor) > 0);
        }
    }

    class ElevatorsController {

        /**
         * Floors in call order\
         * `< 0` - call down\
         * `>= 0` - call up\
         * Possible values: `[-max, -(max-1), ..., -1, 0, 1, ..., (max-1)]`
         */
        protected _queues: Queue<number> = new Queue();
        protected _borderFloors: [0, number];
        protected _elevators: Elevator[];
        protected _settings: IControllerSettings;
        protected _penalties: IControllerPenalties;

        constructor(
            elevators: ElevatorSaga.IElevator[],
            floors: ElevatorSaga.IFloor[],
        ) {
            this._borderFloors = [0, floors.length - 1]
            this._settings = settings.controller;
            this._penalties = penalties.controller;

            this.initElevators(elevators);
            this.initFloors(floors);

            console.log('controller:', this);
        }

        protected initElevators(elevators: ElevatorSaga.IElevator[]): void {
            this._elevators = elevators.map((elevatorSaga: ElevatorSaga.IElevator, index: number) => {
                const elevator = new Elevator(index, elevatorSaga);

                elevator.subscribe()
                .on('idle', () => { this.onElevatorIdle(elevator); })
                .on('passing', (floorNum: number) => { this.onElevatorPreStop(floorNum, elevator); })
                .on('stop', () => { this.onElevatorStop(elevator); })
                .on('deliver', () => { this.onElevatorDeliver(elevator); });

                return elevator;
            });
        }

        protected initFloors(floors: ElevatorSaga.IFloor[]): void {
            floors.forEach((floor) => {
                floor.on('up_button_pressed', () => {
                    LogService.add({object: 'floor', index: floor.floorNum()},
                        `Button UP is pressed.`);
                    this.callElevator(floor.floorNum(), Direction.up);
                })
                .on('down_button_pressed', () => {
                    LogService.add({object: 'floor', index: floor.floorNum()},
                        `Button DOWN is pressed.`);
                    this.callElevator(floor.floorNum(), Direction.down);
                });
            });
        }

        protected callElevator(floorNum: number, direction: Direction): void {
            const elevator: Elevator = this.chooseElevator(floorNum, direction);

            if (elevator) {
                LogService.add({object: 'elevator', index: elevator.index},
                    `Add queue (floorNum: ${floorNum}, direction: ${Direction[direction]})`);
                elevator.call(floorNum, direction);
            } else {
                LogService.add('controller',
                    `Add queue (floorNum: #${floorNum}, direction: ${Direction[direction]})`);
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
                direction: Direction = (nextQueue < 0) ? Direction.down : Direction.up,
                waitingFloor: number = Math.abs(nextQueue);
            let nearestElevator: Elevator = this.chooseElevator(waitingFloor, direction) || elevator;

            nearestElevator.call(waitingFloor, direction);
        }

        protected onElevatorStop(elevator: Elevator): void {
            // this._queues.delete(elevator.direction * elevator.currentFloor);

            LogService.add('controller', `queue [${this._queues.values}]`);

            // this._elevators.forEach((elevator: Elevator) => {
            //     elevator.deleteFloorQueue(elevator.currentFloor, elevator.direction);
            // });

            if (elevator.currentFloor === this._borderFloors[0]) {
                elevator.setDirection(Direction.up);
            } else if (elevator.currentFloor === this._borderFloors[1]) {
                elevator.setDirection(Direction.down);
            }
        }

        protected onElevatorDeliver(elevator: Elevator): void {
            if (this._borderFloors.includes(elevator.currentFloor)) { return; }

            if(!this._queues.has(elevator.direction * elevator.currentFloor)
            && this._queues.delete(-1 * elevator.direction * elevator.currentFloor)) {
                elevator.setDirection(-1 * elevator.direction);
            }
        }

        protected onElevatorPreStop(floorNum:number, elevator: Elevator): void {
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
