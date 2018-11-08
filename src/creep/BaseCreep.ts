import { CREEP_STATE } from "./CreepState.enum";
import { HarvesterCreep } from "./HarvesterCreep";


export class BaseCreep {

    public static pauseRange: number = 3;

    protected _creep: Creep;
    protected _state: CREEP_STATE;
    protected _pause: RoomPosition;

    constructor(creep: Creep) {
        super(creep.name);

        this._creep = creep;
        this._pause = new RoomPosition(0, 0, '');
        this._state = CREEP_STATE.WORK;
    }

    protected load(): void {
        this._state = this._creep.memory._state;
        this._pause = Object.assign(new RoomPosition(0, 0, ''), this._creep.memory._pause);
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

    protected onWork(): void {};

    protected onPause(): void {
        if (!this._creep.pos.inRangeTo(this._pause, HarvesterCreep.pauseRange)) {
            this._creep.moveTo(this._pause);
        } else {
            this.stop();
        }
    }

    public work(): void {
        this._state = CREEP_STATE.WORK;
    }

    public pause(position: RoomPosition): void {
        this._state = CREEP_STATE.PAUSE;
        this._pause = position;
    }

    public stop(): void {
        this._state = CREEP_STATE.STOP;
    }
}
