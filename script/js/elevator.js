"use strict";
(function () {
    const settings = {
        goToGroundFloorIfIdle: false,
    };
    let ElevatorStatus;
    (function (ElevatorStatus) {
        ElevatorStatus[ElevatorStatus["stop"] = 0] = "stop";
        ElevatorStatus[ElevatorStatus["move"] = 1] = "move";
        ElevatorStatus[ElevatorStatus["idle"] = 2] = "idle";
    })(ElevatorStatus || (ElevatorStatus = {}));
    let Direction;
    (function (Direction) {
        Direction[Direction["up"] = 1] = "up";
        Direction[Direction["down"] = -1] = "down";
    })(Direction || (Direction = {}));
    class Queue {
        _queue = [];
        get size() {
            return this._queue.length;
        }
        get values() {
            return [...this._queue];
        }
        lpush(values) {
            const _values = (Array.isArray(values)) ? values : [values];
            _values.forEach((val) => {
                if (!this.has(val)) {
                    this._queue.unshift(val);
                }
            });
            return this;
        }
        rpush(values) {
            const _values = (Array.isArray(values)) ? values : [values];
            _values.forEach((val) => {
                if (!this.has(val)) {
                    this._queue.push(val);
                }
            });
            return this;
        }
        lpop(count) {
            if (typeof (count) !== 'number') {
                return this._queue.shift() || null;
            }
            return this._queue.splice(0, count);
        }
        rpop(count) {
            if (typeof (count) !== 'number') {
                return this._queue.pop() || null;
            }
            return this._queue.splice(-count).reverse();
        }
        delete(value) {
            const size = this.size;
            this._queue = this._queue.filter((val) => val !== value);
            return size !== this.size;
        }
        has(value) {
            return this._queue.includes(value);
        }
        sort(compareFunc) {
            this._queue.sort(compareFunc);
            return this;
        }
    }
    class Queues {
        _queues = {
            [Direction.down]: new Queue(),
            [Direction.up]: new Queue(),
        };
        get(direction) {
            return this._queues[direction];
        }
    }
    class StatisticService {
    }
    class LogService {
        static _logService = new LogService();
        _log = [];
        constructor() { }
        static get log() {
            return this._logService._log;
        }
        static add(value) {
            this._logService._log.push(value);
        }
    }
    class Elevator {
        _index;
        _currentFloor;
        _direction = 0;
        _status = ElevatorStatus.idle;
        _queue = new Queue();
        _queueOpposite = new Queue();
        _floorsCount = 0;
        _elevator;
        _oldFloorNumber = 0;
        constructor(index, elevator) {
            this._index = index;
            this._elevator = elevator;
            this._elevator.goingUpIndicator(false);
            this._elevator.goingDownIndicator(false);
            this._currentFloor = elevator.currentFloor();
            this.init();
        }
        get _loadFactor() {
            return this._elevator.loadFactor();
        }
        alongTheWay(floorNum) {
            return (this._direction * (floorNum - this._currentFloor) > 0);
        }
        canQueue(floorNum, direction) {
            return (this._status !== ElevatorStatus.idle)
                && (this._direction === direction)
                && this.alongTheWay(floorNum);
        }
        addQueue(floorNum) {
            if (!this._direction) {
                this.setDirection((floorNum < this._currentFloor) ? Direction.down : Direction.up);
            }
            if (!this._queue.size || this.alongTheWay) {
                this._queue.rpush(this._direction * floorNum).sort((a, b) => a - b);
                this.setQueue();
            }
            else {
                this._queueOpposite.rpush(-1 * this._direction * floorNum).sort((a, b) => a - b);
            }
        }
        onIdle(func) {
            this._elevator.on('custom_idle', func);
        }
        init() {
            this._elevator
                .on('idle', this.idle.bind(this))
                .on('stopped_at_floor', this.stoppedAtFloor.bind(this))
                .on('floor_button_pressed', this.floorButtonPressed.bind(this))
                .on('passing_floor', (floorNum, direction) => {
                this.passingFloor(floorNum, Direction[direction]);
            });
        }
        setQueue() {
            const oldQueue = this._elevator.destinationQueue;
            const newQueue = this._queue.values.map((floorNum) => Math.abs(floorNum));
            LogService.add(`#${this._index} elevator changed queue from [${oldQueue}] to [${newQueue}]`);
            this._elevator.destinationQueue = newQueue;
            this._elevator.checkDestinationQueue();
        }
        setStatus(status) {
            LogService.add(`#${this._index} elevator changed status on '${ElevatorStatus[status]}'.`);
            this._status = status;
            if (status === ElevatorStatus.idle) {
                this._elevator.goingUpIndicator(true);
                this._elevator.goingDownIndicator(true);
            }
        }
        setDirection(value) {
            if (this._direction === value) {
                return;
            }
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
        changeDirection() {
            this.setDirection(this._direction * -1);
        }
        idle() {
            if (this._queueOpposite.size) {
                this.changeDirection();
                const newQueue = this._queueOpposite.values.filter((floorNum) => {
                    return true;
                });
                newQueue.forEach((floorNum) => {
                    this._queue.rpush(floorNum);
                    this._queueOpposite.delete(floorNum);
                });
            }
            else if (settings.goToGroundFloorIfIdle) {
                this.setDirection(Direction.down);
                this._queue.rpush([-this._currentFloor, 0]);
                this.setQueue();
            }
            else {
                this.setStatus(ElevatorStatus.idle);
                this._elevator.trigger('custom_idle');
            }
        }
        stoppedAtFloor(floorNum) {
            LogService.add(`#${this._index} elevator is stopped on #${floorNum} floor.`);
            this.setStatus(ElevatorStatus.stop);
            this._queue.lpop();
            this._floorsCount += Math.abs(this._oldFloorNumber - floorNum);
            this._oldFloorNumber = floorNum;
        }
        passingFloor(floorNum, direction) {
            this._currentFloor = floorNum;
        }
        floorButtonPressed(floorNum) {
            LogService.add(`Button #${floorNum} is pressed in #${this._index} elevator.`);
            this.addQueue(floorNum);
        }
    }
    class ElevatorsController {
        _singleMode;
        _elevators;
        _queues = new Queue();
        constructor(elevators) {
            this._singleMode = (elevators.length === 1);
            this._elevators = elevators.map((elevator, index) => {
                return new Elevator(index, elevator);
            });
            this.init();
        }
        queue(floorNum, direction) {
            const elevator = this.chooseElevator(floorNum, direction);
            if (!elevator) {
                this._queues.rpush(direction * floorNum);
            }
            else {
                elevator.addQueue(floorNum);
            }
        }
        init() {
            this._elevators.forEach((elevator) => {
                elevator.onIdle(() => {
                    this.onElevatorIdle(elevator);
                });
            });
        }
        chooseElevator(floorNum, direction) {
            if (this._singleMode) {
                const elevator = this._elevators[0];
                return elevator.canQueue(floorNum, direction) ? elevator : null;
            }
            return null;
        }
        onElevatorIdle(elevator) {
            if (!this._queues.size) {
                return;
            }
        }
    }
    let time = 0, status, oldStatus;
    const indicators = {
        timeMovingUpPerOneFloor: [],
        timeMovingDownPerOneFloor: [],
        timeOnFloorWhenMovingUp: [],
        timeOnFloorWhenMovingDown: [],
        timeOnFloorWhenChangeDirectionUp2Down: [],
        timeOnFloorWhenChangeDirectionDown2Up: [],
    };
    console.log('indicators', indicators);
    let controller;
    return {
        init: (elevators, floors) => {
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
        update: (dt, elevators, floors) => {
            const elevator = elevators[0], newStatus = elevator.destinationDirection();
            if (status === newStatus) {
                time += dt;
                return;
            }
            if (newStatus === 'stopped') {
                if (status === 'up') {
                    indicators.timeMovingUpPerOneFloor.push(time);
                }
                else if (status === 'down') {
                    indicators.timeMovingDownPerOneFloor.push(time);
                }
            }
            else if (newStatus === 'up') {
                if (oldStatus === 'up') {
                    indicators.timeOnFloorWhenMovingUp.push(time);
                }
                else if (oldStatus === 'down') {
                    indicators.timeOnFloorWhenChangeDirectionDown2Up.push(time);
                }
            }
            else if (newStatus === 'down') {
                if (oldStatus === 'down') {
                    indicators.timeOnFloorWhenMovingDown.push(time);
                }
                else if (oldStatus === 'up') {
                    indicators.timeOnFloorWhenChangeDirectionUp2Down.push(time);
                }
            }
            time = 0;
            oldStatus = status;
            status = newStatus;
        }
    };
})();
