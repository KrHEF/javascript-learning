interface IElevetorSaga {
    init: (elevators: IElevator[], floors: IFloor[]) => void;
    update: (dt: number, elevators: IElevator[], floors: IFloor[]) => void;
}

interface IElevator {

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
     * Subscribes to elevator events.
     */
    on(event: string, func: Function): this;
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
    off(event: string): this;

    /**
     * Removes func from subscribers for the event
     * @param event Custom or Elevator event
     * @param func Link to function
     */
    off(event: string, func: Function): this;

    /**
     * Triggers the event
     * @param event Custom or Elevator event
     */
    trigger(event: string): this;

}

interface IFloor {
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
    off(event: string): this;

    /**
     * Removes func from subscribers for the event
     * @param event Custom or Floor event
     * @param func Link to function
     */
    off(event: string, func: Function): this;

    /**
     * Triggers the event
     * @param event Custom or Floor event
     */
    trigger(event: string): this;
}

type TFloorEvent = 'up_button_pressed' | 'down_button_pressed';

type TDirection = 'up' | 'down';

type TDestDirection = TDirection | 'stopped';


const elevatorSaga: IElevetorSaga = {
    init: function(elevators: IElevator[], floors: IFloor[]) {
        const elevator: IElevator = elevators[0];
        // elevator.goingUpIndicator(false);
        // elevator.goingDownIndicator(false);

        // elevator.on('idle', () => {
        //     if (elevator.currentFloor() === 0) {
        //         elevator.goingUpIndicator(true);
        //         elevator.goingDownIndicator(false);
        //         elevator.goToFloor(1);
        //         elevator.goToFloor(2);
        //     } else if (elevator.currentFloor() === floors.length - 1) {
        //         elevator.goingDownIndicator(true);
        //         elevator.goingUpIndicator(false);
        //         elevator.goToFloor(1);
        //         elevator.goToFloor(0);
        //     }
        // });

        // elevator.on('floor_button_pressed', (floorNumber) => {
        //     console.log(`${floorNumber} was pressed`) ;
        // });

        // floors.forEach((floor) => {
        //     floor.on('up_button_pressed', () => {
        //         console.log(`On ${floor.floorNum()} floor is pressed UP button`);
        //     });

        //     floor.on('down_button_pressed', () => {
        //         console.log(`On ${floor.floorNum()} floor is pressed DOWN button`);
        //     });
        // });

    },
    update: function(dt, elevators, floors) {
    }
}
