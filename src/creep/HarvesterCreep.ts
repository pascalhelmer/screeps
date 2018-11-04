import { BaseCreep } from './BaseCreep';

enum CREEP_STATE {
    STOP = 0,
    PAUSE = 1, // Moves to pause point
    WORK = 2
}

export class HarvesterCreep extends BaseCreep {

    public static pauseRange: number = 3;
    public static body: string[] = [WORK, CARRY, MOVE, MOVE];

    private _mine: Mineral;
    private _depot: Structure;
    private _state: CREEP_STATE;
    private _pause: RoomPosition;

    constructor(mine: Mineral, depot: Structure) {
        super();

        this._mine = mine;
        this._depot = depot;
        this._pause = new RoomPosition(0, 0, '');
        this._state = CREEP_STATE.WORK;
    }

    public update(): void {
        switch (this._state) {
            case CREEP_STATE.WORK:
                this.onWork();
                break;

            case CREEP_STATE.PAUSE:
                this.onPause();
                break;
        }
    }

    public work(): void {
        this._state = CREEP_STATE.WORK;
    }

    private onWork(): void {
        if (this.carry.energy >= this.carryCapacity) {
            if (!this.pos.isNearTo(this._depot.pos)) {
                this.moveTo(this._depot.pos);
            } else {
                this.transfer(this._depot, this._mine.mineralType);
            }
        } else {
            if (!this.pos.isNearTo(this._mine.pos)) {
                this.moveTo(this._mine.pos);
            } else {
                this.harvest(this._mine);
            }
        }
    }

    public pause(position: RoomPosition): void {
        this._state = CREEP_STATE.PAUSE;
        this._pause = position;
    }

    private onPause(): void {
        if (!this.pos.inRangeTo(this._pause, HarvesterCreep.pauseRange)) {
            this.moveTo(this._pause);
        } else {
            this.stop();
        }
    }

    public stop(): void {
        this._state = CREEP_STATE.STOP;
    }
}
